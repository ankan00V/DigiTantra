import { request as httpsRequest } from "node:https";
import { revalidateTag, unstable_cache } from "next/cache";

import {
  COURSE_REFRESH_INTERVAL_MINUTES,
  createEmptyCategories,
} from "@/lib/course-marketplace/catalog";
import { getMongoDb } from "@/lib/mongodb";
import type {
  CourseListing,
  CourseMarketplaceCatalog,
  ProviderStatus,
} from "@/lib/course-marketplace/types";

type ProviderScrapeResult = {
  provider: ProviderStatus;
  listings: CourseListing[];
};

type StoredCatalog = CourseMarketplaceCatalog & {
  _id: string;
  updatedAt: string;
};

const CATALOG_COLLECTION = "courseMarketplace";
const LATEST_CATALOG_ID = "latest";
const COURSE_MARKETPLACE_CATALOG_TAG = "course-marketplace-catalog";

const requestHeaders = {
  "User-Agent": "Mozilla/5.0 (compatible; DigiTantraCatalogBot/1.0; +https://digitantra.local)",
  Accept: "text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8",
};

function isoFromNow(minutesToAdd = 0) {
  return new Date(Date.now() + minutesToAdd * 60 * 1000).toISOString();
}

function unique<T>(values: T[]) {
  return Array.from(new Set(values));
}

function formatInrPrice(price: number) {
  return new Intl.NumberFormat("en-IN", {
    style: "currency",
    currency: "INR",
    maximumFractionDigits: 0,
  }).format(price);
}

function htmlDecode(value: string) {
  return value
    .replace(/&amp;/g, "&")
    .replace(/&#x27;/g, "'")
    .replace(/&quot;/g, '"')
    .replace(/&nbsp;/g, " ")
    .replace(/&rsquo;/g, "'")
    .replace(/&ndash;/g, "-")
    .replace(/&mdash;/g, "-")
    .replace(/&#39;/g, "'");
}

function normalizeWhitespace(value: string) {
  return htmlDecode(value.replace(/\s+/g, " ").trim());
}

function stripHtml(value: string) {
  return normalizeWhitespace(value.replace(/<[^>]+>/g, " "));
}

function decodeJsonStringValue(value: string | null | undefined) {
  if (!value) {
    return null;
  }

  try {
    return normalizeWhitespace(JSON.parse(`"${value}"`) as string);
  } catch {
    return normalizeWhitespace(value.replace(/\\u0026/g, "&").replace(/\\"/g, '"'));
  }
}

function titleFromSlug(slug: string) {
  return slug
    .split("/")
    .at(-1)
    ?.replace(/-/g, " ")
    .replace(/\b\w/g, (match) => match.toUpperCase())
    ?? slug;
}

function buildListingId(providerId: string, url: string) {
  const pathname = url.replace(/^https?:\/\/[^/]+\//, "").replace(/[?#].*$/, "");
  return `${providerId}-${pathname.replace(/[^a-z0-9-]/gi, "-").replace(/-+/g, "-").toLowerCase()}`;
}

function toAbsoluteUrl(baseUrl: string, value: string) {
  return new URL(value, baseUrl).toString();
}

function formatIsoDurationLabel(value: string | null | undefined) {
  if (!value) {
    return null;
  }

  const hoursMatch = value.match(/^PT(\d+)H$/);
  if (hoursMatch) {
    return `${hoursMatch[1]} Hours`;
  }

  const daysMatch = value.match(/^P(\d+)D$/);
  if (daysMatch) {
    return `${daysMatch[1]} Days`;
  }

  return value;
}

function formatCourseraDurationLabel(value: string | null | undefined) {
  if (!value) {
    return null;
  }

  const durationMap: Record<string, string> = {
    ONE_TO_FOUR_WEEKS: "1 - 4 Weeks",
    ONE_TO_THREE_MONTHS: "1 - 3 Months",
    THREE_TO_SIX_MONTHS: "3 - 6 Months",
    SIX_TO_TWELVE_MONTHS: "6 - 12 Months",
    LESS_THAN_TWO_HOURS: "< 2 Hours",
  };

  return durationMap[value] ?? titleFromSlug(value.toLowerCase());
}

function formatDurationLabelFromText(value: string | null | undefined) {
  if (!value) {
    return null;
  }

  return normalizeWhitespace(value.replace(/^Duration:\s*/i, ""))
    .replace(/\bmins?\b/gi, "Minutes")
    .replace(/\bhours?\b/gi, (match) => (match.toLowerCase() === "hour" ? "Hour" : "Hours"));
}

function extractTitleTag(html: string) {
  return normalizeWhitespace(html.match(/<title>([^<]+)<\/title>/i)?.[1] ?? "");
}

function extractMetaContent(html: string, key: string) {
  const patterns = [
    new RegExp(`<meta[^>]+name="${key}"[^>]+content="([^"]+)"`, "i"),
    new RegExp(`<meta[^>]+property="${key}"[^>]+content="([^"]+)"`, "i"),
    new RegExp(`<meta[^>]+content="([^"]+)"[^>]+name="${key}"`, "i"),
    new RegExp(`<meta[^>]+content="([^"]+)"[^>]+property="${key}"`, "i"),
  ];

  for (const pattern of patterns) {
    const value = pattern.exec(html)?.[1];

    if (value) {
      return normalizeWhitespace(value);
    }
  }

  return null;
}

function sanitizeForageCategoryIds(categoryIds: string[], title: string, summary: string) {
  const text = `${title} ${summary}`.toLowerCase();
  const sanitizedCategoryIds = new Set(categoryIds);

  if (/(resume writing|career readiness|personal brand|professional interview|hiring manager)/.test(text)) {
    return [];
  }

  if (/(digital assurance|technology risk|data privacy|cyber)/.test(text)) {
    sanitizedCategoryIds.add("cyber-security");
  }

  if (/(ux design|user experience|front-end|frontend|backend|mobile|software engineering|software development|technology engineering)/.test(text)) {
    sanitizedCategoryIds.add("full-stack-development");
  }

  if (
    sanitizedCategoryIds.has("full-stack-development") &&
    !/(data science|data analytics|data analyst|data visualization|data visualisation|statistical)/.test(title.toLowerCase())
  ) {
    sanitizedCategoryIds.delete("data-science");
  }

  return [...sanitizedCategoryIds];
}

const CATEGORY_SIGNAL_RULES: Record<string, Array<{ pattern: RegExp; weight: number }>> = {
  "gen-ai": [
    { pattern: /(generative ai|genai|agentic ai|prompt engineering|foundation models?|llm|chatgpt|copilot|ai in action)/i, weight: 4 },
    { pattern: /\b(prompting|prompt)\b/i, weight: 2 },
  ],
  "ai-ml": [
    { pattern: /(artificial intelligence|machine learning|deep learning|neural|transformers?)/i, weight: 4 },
    { pattern: /\b(ai|ml)\b/i, weight: 2 },
  ],
  "data-science": [
    { pattern: /(data science|data analytics|data analysis|business intelligence|data visuali[sz]ation|statistical|power bi|tableau)/i, weight: 4 },
    { pattern: /\b(sql|analytics|analyst)\b/i, weight: 2 },
  ],
  "full-stack-development": [
    { pattern: /(software engineering|software development|software developer|full stack|fullstack|web development|frontend|front-end|backend|back-end|mobile engineering|product engineering)/i, weight: 4 },
    { pattern: /\b(javascript|typescript|css|html|react|node|api|programming)\b/i, weight: 2 },
  ],
  "cloud-computing": [
    { pattern: /(cloud computing|cloud architecture|google cloud|aws|azure|gcp|ec2|serverless|solution architect)/i, weight: 4 },
    { pattern: /\bcloud\b/i, weight: 2 },
  ],
  "cyber-security": [
    { pattern: /(cyber ?security|threat management|endpoint security|network security|digital assurance|technology risk|data privacy|forensics|security operations center|\bsoc\b)/i, weight: 4 },
    { pattern: /\b(privacy|identity|iam|authentication|authorization|access management)\b/i, weight: 2 },
  ],
  "web3-blockchain": [
    { pattern: /(blockchain|web3|smart contracts?|solidity|crypto|dapp)/i, weight: 4 },
  ],
  "devops-engineering": [
    { pattern: /(devops|site reliability|platform engineering|infrastructure as code|ci\/cd|observability)/i, weight: 4 },
    { pattern: /\b(docker|kubernetes|terraform|jenkins|ansible|sre)\b/i, weight: 3 },
  ],
};

function getCategorySignalScores(value: string) {
  return Object.fromEntries(
    Object.entries(CATEGORY_SIGNAL_RULES).map(([categoryId, rules]) => [
      categoryId,
      rules.reduce((score, rule) => score + (rule.pattern.test(value) ? rule.weight : 0), 0),
    ])
  ) as Record<string, number>;
}

function sanitizeCategoryIds(categoryIds: string[], title: string, summary: string) {
  const text = `${title} ${summary}`;
  const scores = getCategorySignalScores(text);
  const sanitizedCategoryIds = new Set(categoryIds);
  const strongMatches = Object.entries(scores)
    .filter(([, score]) => score >= 4)
    .map(([categoryId]) => categoryId);

  if (strongMatches.length) {
    strongMatches.forEach((categoryId) => sanitizedCategoryIds.add(categoryId));

    [...sanitizedCategoryIds].forEach((categoryId) => {
      if (scores[categoryId] === 0 && strongMatches.some((matchedId) => matchedId !== categoryId)) {
        sanitizedCategoryIds.delete(categoryId);
      }
    });
  }

  if (scores["cyber-security"] === 0) {
    sanitizedCategoryIds.delete("cyber-security");
  }

  if (scores["cyber-security"] < 4 && Math.max(scores["cloud-computing"], scores["devops-engineering"], scores["full-stack-development"]) >= 4) {
    sanitizedCategoryIds.delete("cyber-security");
  }

  if (scores["devops-engineering"] === 0) {
    sanitizedCategoryIds.delete("devops-engineering");
  }

  if (scores["cloud-computing"] === 0 && scores["devops-engineering"] < 4) {
    sanitizedCategoryIds.delete("cloud-computing");
  }

  if (scores["data-science"] < 4 && scores["full-stack-development"] >= 4) {
    sanitizedCategoryIds.delete("data-science");
  }

  if (scores["data-science"] < 4 && scores["ai-ml"] >= 4) {
    sanitizedCategoryIds.delete("data-science");
  }

  if (
    scores["full-stack-development"] < 4 &&
    Math.max(
      scores["cloud-computing"],
      scores["cyber-security"],
      scores["data-science"],
      scores["devops-engineering"]
    ) >= 4
  ) {
    sanitizedCategoryIds.delete("full-stack-development");
  }

  if (scores["full-stack-development"] < 4 && scores["devops-engineering"] >= 4) {
    sanitizedCategoryIds.delete("full-stack-development");
  }

  if (scores["gen-ai"] >= 4) {
    sanitizedCategoryIds.add("gen-ai");
    if (scores["ai-ml"] >= 2) {
      sanitizedCategoryIds.add("ai-ml");
    }
  }

  if (!sanitizedCategoryIds.size) {
    const highestScoringCategory = Object.entries(scores)
      .sort((left, right) => right[1] - left[1])
      .find(([, score]) => score > 0)?.[0];

    if (highestScoringCategory) {
      return [highestScoringCategory];
    }

    return categoryIds;
  }

  return [...sanitizedCategoryIds];
}

function dedupeListingsByUrl(listings: CourseListing[]) {
  const listingMap = new Map<string, CourseListing>();

  listings.forEach((listing) => {
    const existing = listingMap.get(listing.url);

    if (!existing) {
      listingMap.set(listing.url, listing);
      return;
    }

    existing.categoryIds = unique([...existing.categoryIds, ...listing.categoryIds]);
  });

  return [...listingMap.values()];
}

function inferCategoryIds(value: string) {
  const text = value.toLowerCase();
  const categoryIds = new Set<string>();

  if (/(generative ai|agentic ai|chatgpt|\bllm\b|\brag\b|prompt engineering|\bprompting\b|\bprompt\b)/.test(text)) {
    categoryIds.add("gen-ai");
  }

  if (/(artificial intelligence|machine learning|ai\b|deep learning|neural|transformers)/.test(text)) {
    categoryIds.add("ai-ml");
  }

  if (/(data science|data analytics|data analysis|analytics|power bi|tableau|sql|excel)/.test(text)) {
    categoryIds.add("data-science");
  }

  if (
    /(full stack|web development|backend|mern|java backend|software development|software engineering|programming|developer|javascript|typescript|python|css|html|dsa|system design)/.test(
      text
    )
  ) {
    categoryIds.add("full-stack-development");
  }

  if (/(cloud|aws|azure|gcp|google cloud)/.test(text)) {
    categoryIds.add("cloud-computing");
  }

  if (/(cyber|security|ceh|cissp|comptia)/.test(text)) {
    categoryIds.add("cyber-security");
  }

  if (/(web3|blockchain|crypto|solidity|dapp)/.test(text)) {
    categoryIds.add("web3-blockchain");
  }

  if (/(devops|docker|kubernetes|ci\/cd|sre)/.test(text)) {
    categoryIds.add("devops-engineering");
  }

  return [...categoryIds];
}

function extractJsonLdBlocks(html: string) {
  return [...html.matchAll(/<script type="application\/ld\+json">([\s\S]*?)<\/script>/g)].map((match) => match[1]);
}

function flattenGraphEntries(value: unknown): Array<Record<string, unknown>> {
  if (Array.isArray(value)) {
    return value.flatMap((entry) => flattenGraphEntries(entry));
  }

  if (value && typeof value === "object") {
    return [value as Record<string, unknown>];
  }

  return [];
}

async function getCatalogCollection() {
  const db = await getMongoDb();
  return db.collection<StoredCatalog>(CATALOG_COLLECTION);
}

async function fetchText(url: string) {
  const response = await fetch(url, {
    headers: requestHeaders,
    cache: "no-store",
  });

  if (!response.ok) {
    throw new Error(`Request failed with status ${response.status}`);
  }

  return response.text();
}

async function fetchTextWithLargeHeaders(url: string): Promise<string> {
  return new Promise((resolve, reject) => {
    const request = httpsRequest(
      url,
      {
        method: "GET",
        headers: {
          ...requestHeaders,
          "Accept-Encoding": "identity",
        },
        maxHeaderSize: 1024 * 512,
      },
      (response) => {
        const statusCode = response.statusCode ?? 0;
        const location = response.headers.location;

        if (statusCode >= 300 && statusCode < 400 && location) {
          response.resume();
          resolve(fetchTextWithLargeHeaders(new URL(location, url).toString()));
          return;
        }

        if (statusCode < 200 || statusCode >= 300) {
          response.resume();
          reject(new Error(`Request failed with status ${statusCode}`));
          return;
        }

        const chunks: Buffer[] = [];

        response.on("data", (chunk) => {
          chunks.push(Buffer.isBuffer(chunk) ? chunk : Buffer.from(chunk));
        });

        response.on("end", () => {
          resolve(Buffer.concat(chunks).toString("utf-8"));
        });
      }
    );

    request.on("error", reject);
    request.end();
  });
}

async function scrapeIbmSkillsBuild(capturedAt: string): Promise<ProviderScrapeResult> {
  const providerBase = {
    id: "ibm-skillsbuild",
    name: "IBM SkillsBuild",
    homepage: "https://skillsbuild.org/students/try-it-before-you-register",
    lastAttemptedAt: capturedAt,
  } as const;

  try {
    const html = await fetchText(providerBase.homepage);
    const listings = dedupeListingsByUrl(
      [...html.matchAll(/"linkUrl":"(https:[^"]*strategy=guest[^"]*)"[^]{0,1000}?"helperText1":"([^"]+)"[^]{0,1000}?"heading":"([^"]+)"(?:[^]{0,1000}?"eyebrow":"([^"]+)")?/g)]
        .map(([, rawUrl, rawDuration, rawTitle, rawEyebrow]) => {
          const url = decodeJsonStringValue(rawUrl);
          const title = decodeJsonStringValue(rawTitle);
          const eyebrow = decodeJsonStringValue(rawEyebrow);

          if (!url || !title) {
            return null;
          }

          const categoryIds = inferCategoryIds(`${title} ${eyebrow ?? ""}`);
          if (!categoryIds.length) {
            return null;
          }

          return {
            id: buildListingId(providerBase.id, url),
            title,
            providerId: providerBase.id,
            providerName: providerBase.name,
            url,
            categoryIds,
            summary: eyebrow || "Free guest-access course discovered from the IBM SkillsBuild try-before-you-register catalog.",
            priceLabel: "Free",
            priceStatus: "available" as const,
            durationLabel: formatDurationLabelFromText(decodeJsonStringValue(rawDuration)),
            capturedAt,
            confidence: "high" as const,
            sourceNote: "Captured from IBM SkillsBuild public guest-access cards.",
          } satisfies CourseListing;
        })
        .reduce<CourseListing[]>((accumulator, listing) => {
          if (listing) {
            accumulator.push(listing);
          }

          return accumulator;
        }, [])
    );

    return {
      provider: {
        ...providerBase,
        mode: listings.length ? "partial" : "planned",
        note: listings.length
          ? "Public guest-access cards expose free course titles, durations, and launch links."
          : "No relevant IBM SkillsBuild guest-access cards were extracted from the public page.",
        listingCount: listings.length,
      },
      listings,
    };
  } catch (error) {
    return {
      provider: {
        ...providerBase,
        mode: "planned",
        note: `Refresh failed: ${error instanceof Error ? error.message : "unknown error"}`,
        listingCount: 0,
      },
      listings: [],
    };
  }
}

async function scrapeForageFeaturedSimulations(capturedAt: string): Promise<ProviderScrapeResult> {
  const providerBase = {
    id: "forage",
    name: "Forage",
    homepage: "https://www.theforage.com",
    lastAttemptedAt: capturedAt,
  } as const;

  try {
    const sitemapXml = await fetchTextWithLargeHeaders("https://www.theforage.com/sitemap.xml");
    const techSimulationUrls = unique(
      [...sitemapXml.matchAll(/<loc>(https:\/\/www\.theforage\.com\/simulations\/[^<]+)<\/loc>/g)]
        .map(([, url]) => url)
        .filter((url) =>
          /(software|development|engineering|front-end|frontend|backend|data|analytics|visualisation|cyber|security|gen-ai|ai-|artificial-intelligence|cloud|python|javascript|css|automation|technology|digital|dev)/i.test(
            url
          )
        )
        .slice(0, 28)
    );

    const listings = dedupeListingsByUrl(
      (
        await Promise.all(
          techSimulationUrls.map(async (url) => {
            try {
              const html = await fetchText(url);
              const titleTag = extractTitleTag(html);
              const description = extractMetaContent(html, "description");
              const durationMatch = html.match(/(\d+\s*(?:hours?|minutes?))\s+and\s+self-paced/i);
              const titleParts = titleTag
                .split("|")
                .map((part) => normalizeWhitespace(part))
                .filter(Boolean);
              const companyName = titleParts[0] ?? "Featured Partner";
              const roleName = titleParts[1] ?? titleTag.replace(/\|\s*Forage$/i, "");
              const title = normalizeWhitespace(`${companyName} ${roleName}`.trim());
              const categoryIds = sanitizeForageCategoryIds(
                inferCategoryIds(`${title} ${description ?? ""}`),
                title,
                description ?? ""
              );

              if (!title || !categoryIds.length) {
                return null;
              }

              return {
                id: buildListingId(providerBase.id, url),
                title,
                providerId: providerBase.id,
                providerName: providerBase.name,
                url,
                categoryIds,
                summary: description ?? `Featured free job simulation from ${companyName} on Forage.`,
                priceLabel: "Free",
                priceStatus: "available" as const,
                durationLabel: formatDurationLabelFromText(durationMatch?.[1] ?? null),
                capturedAt,
                confidence: "high" as const,
                sourceNote: "Captured from Forage featured simulation pages.",
              } satisfies CourseListing;
            } catch {
              return null;
            }
          })
        )
      ).reduce<CourseListing[]>((accumulator, listing) => {
        if (listing) {
          accumulator.push(listing);
        }

        return accumulator;
      }, [])
    );

    return {
      provider: {
        ...providerBase,
        mode: listings.length ? "partial" : "planned",
        note: listings.length
          ? "Public sitemap entries and simulation pages expose free tech-focused job simulations with company, role, and self-paced duration details."
          : "No relevant tech-focused Forage simulations were extracted from the public sitemap.",
        listingCount: listings.length,
      },
      listings,
    };
  } catch (error) {
    return {
      provider: {
        ...providerBase,
        mode: "planned",
        note: `Refresh failed: ${error instanceof Error ? error.message : "unknown error"}`,
        listingCount: 0,
      },
      listings: [],
    };
  }
}

async function scrapeCiscoNetworkingAcademy(capturedAt: string): Promise<ProviderScrapeResult> {
  const providerBase = {
    id: "cisco-networking-academy",
    name: "Cisco Networking Academy",
    homepage: "https://www.netacad.com/catalogs/learn",
    lastAttemptedAt: capturedAt,
  } as const;

  try {
    const sitemapXml = await fetchText("https://skillsforall.com/sitemap.xml");
    const curatedSlugs = new Set([
      "ai-ibm-skillsbuild",
      "apply-ai-analyze-customer-reviews",
      "data-analytics-essentials",
      "data-science-essentials-with-python",
      "introduction-data-science",
      "introduction-to-modern-ai",
      "introduction-to-cybersecurity",
      "cybersecurity-essentials",
      "endpoint-security",
      "cyber-threat-management",
      "devnet-associate",
      "javascript-essentials-1",
      "javascript-essentials-2",
      "python-essentials-1",
      "python-essentials-2",
      "css-essentials",
    ]);
    const candidateUrls = unique(
      [...sitemapXml.matchAll(/<loc>(https:\/\/www\.netacad\.com\/courses\/[^<]+)<\/loc>/g)]
        .map(([, url]) => url.replace(/\?courseLang=.*$/, ""))
        .filter((url) => curatedSlugs.has(url.split("/courses/")[1] ?? ""))
    );

    const listings = dedupeListingsByUrl(
      (
        await Promise.all(
          candidateUrls.map(async (url) => {
            const html = await fetchText(url);
            const title = extractTitleTag(html);
            const description = extractMetaContent(html, "description");
            const categoryIds = inferCategoryIds(`${title} ${description ?? ""} ${url}`);

            if (!title || !categoryIds.length) {
              return null;
            }

            const isExplicitlyFree = /\bfree\b/i.test(`${title} ${description ?? ""}`);

            return {
              id: buildListingId(providerBase.id, url),
              title,
              providerId: providerBase.id,
              providerName: providerBase.name,
              url,
              categoryIds,
              summary: description ?? "Course discovered from the Cisco Networking Academy public sitemap.",
              priceLabel: isExplicitlyFree ? "Free" : null,
              priceStatus: isExplicitlyFree ? ("available" as const) : ("unlisted" as const),
              durationLabel: null,
              capturedAt,
              confidence: "high" as const,
              sourceNote: "Captured from Cisco Networking Academy public sitemap and course pages.",
            } satisfies CourseListing;
          })
        )
      ).reduce<CourseListing[]>((accumulator, listing) => {
        if (listing) {
          accumulator.push(listing);
        }

        return accumulator;
      }, [])
    );

    return {
      provider: {
        ...providerBase,
        mode: listings.length ? "partial" : "planned",
        note: listings.length
          ? "Public sitemap and course pages expose course titles and descriptions; some pages explicitly label courses as free."
          : "No relevant Cisco Networking Academy course pages were extracted from the public sitemap.",
        listingCount: listings.length,
      },
      listings,
    };
  } catch (error) {
    return {
      provider: {
        ...providerBase,
        mode: "planned",
        note: `Refresh failed: ${error instanceof Error ? error.message : "unknown error"}`,
        listingCount: 0,
      },
      listings: [],
    };
  }
}

async function scrapeApnaCollege(capturedAt: string): Promise<ProviderScrapeResult> {
  const providerBase = {
    id: "apna-college",
    name: "Apna College",
    homepage: "https://www.apnacollege.in",
    lastAttemptedAt: capturedAt,
  } as const;

  try {
    const html = await fetchText(providerBase.homepage);

    const discoveredTitles = unique(
      [...html.matchAll(/Prime 2\.0 \(Complete AI\/ML Batch\)|Sigma Prime \(Sigma \+ AI\/ML\)|Alpha Plus \(Complete DSA\)|Delta \(Web Development\)/g)].map(
        ([title]) => title.replace(/\\\//g, "/")
      )
    );

    const listingMap: Record<string, Omit<CourseListing, "capturedAt">> = {
      "Prime 2.0 (Complete AI/ML Batch)": {
        id: "apna-college-prime-2-0-complete-ai-ml-batch",
        title: "Prime 2.0 (Complete AI/ML Batch)",
        providerId: providerBase.id,
        providerName: providerBase.name,
        url: "https://www.apnacollege.in/course/prime-2",
        categoryIds: ["ai-ml"],
        summary: "Public navigation exposes this AI/ML batch, but pricing is not published in the landing HTML.",
        priceLabel: null,
        priceStatus: "unlisted",
        durationLabel: null,
        confidence: "high",
        sourceNote: "Captured from Apna College public navigation.",
      },
      "Sigma Prime (Sigma + AI/ML)": {
        id: "apna-college-sigma-prime-sigma-ai-ml",
        title: "Sigma Prime (Sigma + AI/ML)",
        providerId: providerBase.id,
        providerName: providerBase.name,
        url: "https://www.apnacollege.in/course/sigma-prime-2",
        categoryIds: ["ai-ml", "gen-ai"],
        summary: "Hybrid software + AI/ML offering exposed in public navigation.",
        priceLabel: null,
        priceStatus: "unlisted",
        durationLabel: null,
        confidence: "high",
        sourceNote: "Captured from Apna College public navigation.",
      },
      "Delta (Web Development)": {
        id: "apna-college-delta-web-development",
        title: "Delta (Web Development)",
        providerId: providerBase.id,
        providerName: providerBase.name,
        url: "https://www.apnacollege.in/course/delta-8",
        categoryIds: ["full-stack-development"],
        summary: "Publicly linked web development course from Apna College.",
        priceLabel: null,
        priceStatus: "unlisted",
        durationLabel: null,
        confidence: "high",
        sourceNote: "Captured from Apna College public navigation.",
      },
      "Alpha Plus (Complete DSA)": {
        id: "apna-college-alpha-plus-complete-dsa",
        title: "Alpha Plus (Complete DSA)",
        providerId: providerBase.id,
        providerName: providerBase.name,
        url: "https://www.apnacollege.in/alpha-plus-dsa",
        categoryIds: ["full-stack-development"],
        summary: "DSA-first program; currently mapped into software development until a separate DSA track exists.",
        priceLabel: null,
        priceStatus: "unlisted",
        durationLabel: null,
        confidence: "medium",
        sourceNote: "Captured from Apna College public navigation.",
      },
    };

    const listings = discoveredTitles
      .map((title) => listingMap[title])
      .filter(Boolean)
      .map((listing) => ({
        ...listing,
        capturedAt,
      }));

    return {
      provider: {
        ...providerBase,
        mode: listings.length ? "partial" : "planned",
        note: listings.length
          ? "Public course titles are available. Pricing is not exposed in the landing HTML."
          : "No course titles were extracted from the public landing page.",
        listingCount: listings.length,
      },
      listings,
    };
  } catch (error) {
    return {
      provider: {
        ...providerBase,
        mode: "planned",
        note: `Refresh failed: ${error instanceof Error ? error.message : "unknown error"}`,
        listingCount: 0,
      },
      listings: [],
    };
  }
}

async function scrapeBosscoderAcademy(capturedAt: string): Promise<ProviderScrapeResult> {
  const providerBase = {
    id: "bosscoder-academy",
    name: "Bosscoder Academy",
    homepage: "https://www.bosscoderacademy.com",
    lastAttemptedAt: capturedAt,
  } as const;

  try {
    const html = await fetchText(providerBase.homepage);

    const discoveredPrograms = unique([
      html.includes("TRANSFORMER PROGRAM") ? "Transformer Program" : "",
      html.includes("EVOLVE PROGRAM") ? "Evolve Program" : "",
      html.includes("Bosscoder Academy Data Science Program") ? "Bosscoder Academy Data Science Program" : "",
    ]).filter(Boolean);

    const listingMap: Record<string, Omit<CourseListing, "capturedAt">> = {
      "Transformer Program": {
        id: "bosscoder-transformer-program",
        title: "Transformer Program",
        providerId: providerBase.id,
        providerName: providerBase.name,
        url: "https://www.bosscoderacademy.com/transformer",
        categoryIds: ["full-stack-development"],
        summary: "Public program card highlights DSA, system design, and full stack with AI.",
        priceLabel: null,
        priceStatus: "unlisted",
        durationLabel: "6 Months",
        confidence: "high",
        sourceNote: "Captured from Bosscoder public homepage.",
      },
      "Evolve Program": {
        id: "bosscoder-evolve-program",
        title: "Evolve Program",
        providerId: providerBase.id,
        providerName: providerBase.name,
        url: "https://www.bosscoderacademy.com/evolve",
        categoryIds: ["full-stack-development"],
        summary: "Public program card targets senior software engineers with full stack and AI emphasis.",
        priceLabel: null,
        priceStatus: "unlisted",
        durationLabel: "6 Months",
        confidence: "high",
        sourceNote: "Captured from Bosscoder public homepage.",
      },
      "Bosscoder Academy Data Science Program": {
        id: "bosscoder-data-science-program",
        title: "Bosscoder Academy Data Science Program",
        providerId: providerBase.id,
        providerName: providerBase.name,
        url: "https://www.bosscoderacademy.com/school-of-technology",
        categoryIds: ["data-science", "ai-ml"],
        summary: "Program name appears in the public page schema; pricing is not publicly disclosed.",
        priceLabel: null,
        priceStatus: "unlisted",
        durationLabel: null,
        confidence: "medium",
        sourceNote: "Captured from Bosscoder public schema markup.",
      },
    };

    const listings = discoveredPrograms.map((program) => ({
      ...listingMap[program],
      capturedAt,
    }));

    return {
      provider: {
        ...providerBase,
        mode: listings.length ? "partial" : "planned",
        note: listings.length
          ? "Program names and some durations are public; pricing remains callback-gated."
          : "No public program cards were extracted from the homepage.",
        listingCount: listings.length,
      },
      listings,
    };
  } catch (error) {
    return {
      provider: {
        ...providerBase,
        mode: "planned",
        note: `Refresh failed: ${error instanceof Error ? error.message : "unknown error"}`,
        listingCount: 0,
      },
      listings: [],
    };
  }
}

async function scrapeGeeksforGeeks(capturedAt: string): Promise<ProviderScrapeResult> {
  const providerBase = {
    id: "geeksforgeeks",
    name: "GeeksforGeeks",
    homepage: "https://www.geeksforgeeks.org/courses",
    lastAttemptedAt: capturedAt,
  } as const;

  try {
    const html = await fetchText(providerBase.homepage);
    const jsonLdBlock = extractJsonLdBlocks(html).find((block) => block.includes('"@type":"ItemList"'));

    if (!jsonLdBlock) {
      throw new Error("Course catalog JSON-LD not found.");
    }

    const parsed = JSON.parse(jsonLdBlock) as {
      itemListElement?: Array<{
        item?: {
          url?: string;
          name?: string;
          description?: string;
          offers?: Array<{ price?: number; priceCurrency?: string }>;
          hasCourseInstance?: Array<{ courseSchedule?: { duration?: string } }>;
        };
      }>;
    };

    const listings = (
      parsed.itemListElement
        ?.map((entry) => entry.item)
        .filter((item): item is NonNullable<typeof item> => Boolean(item?.name && item?.url))
        .map((item) => {
          const categoryIds = inferCategoryIds(`${item.name} ${item.description ?? ""}`);

          if (!categoryIds.length) {
            return null;
          }

          const offer = item.offers?.[0];
          const price = typeof offer?.price === "number" ? offer.price : null;
          const url = item.url ?? providerBase.homepage;
          const priceStatus: CourseListing["priceStatus"] = price ? "available" : "unlisted";

          return {
            id: `geeksforgeeks-${url.split("/courses/")[1]?.replace(/[^a-z0-9-]/gi, "-").toLowerCase()}`,
            title: item.name ?? "Unknown course",
            providerId: providerBase.id,
            providerName: providerBase.name,
            url,
            categoryIds,
            summary: item.description ?? "Course discovered from the GeeksforGeeks public course catalog.",
            priceLabel: price ? formatInrPrice(price) : null,
            priceStatus,
            durationLabel: item.hasCourseInstance?.[0]?.courseSchedule?.duration ?? null,
            capturedAt,
            confidence: "high" as const,
            sourceNote: "Captured from GeeksforGeeks public JSON-LD course catalog.",
          } satisfies CourseListing;
        })
        ?? []
    ).reduce<CourseListing[]>((accumulator, listing) => {
      if (listing) {
        accumulator.push(listing);
      }

      return accumulator;
    }, []);

    return {
      provider: {
        ...providerBase,
        mode: listings.length ? "live" : "planned",
        note: listings.length
          ? "Course names and INR prices are exposed in the public course catalog."
          : "No relevant courses were extracted from the public catalog.",
        listingCount: listings.length,
      },
      listings,
    };
  } catch (error) {
    return {
      provider: {
        ...providerBase,
        mode: "planned",
        note: `Refresh failed: ${error instanceof Error ? error.message : "unknown error"}`,
        listingCount: 0,
      },
      listings: [],
    };
  }
}

async function scrapeCodecademy(capturedAt: string): Promise<ProviderScrapeResult> {
  const providerBase = {
    id: "codecademy",
    name: "Codecademy",
    homepage: "https://www.codecademy.com/catalog",
    lastAttemptedAt: capturedAt,
  } as const;

  try {
    const html = await fetchText(providerBase.homepage);
    const jsonLdBlock = extractJsonLdBlocks(html).find(
      (block) => block.includes('"@type":"ItemList"') && block.includes('"itemListElement"')
    );

    if (!jsonLdBlock) {
      throw new Error("Catalog JSON-LD not found.");
    }

    const parsed = JSON.parse(jsonLdBlock) as {
      itemListElement?: Array<{
        "@type"?: string;
        name?: string;
        url?: string;
        description?: string;
        offers?: { category?: string };
        hasCourseInstance?: Array<{ courseWorkload?: string }>;
      }>;
    };

    const listings =
      parsed.itemListElement
        ?.map((item) => {
          if (!item.name || !item.url) {
            return null;
          }

          const categoryIds = inferCategoryIds(`${item.name} ${item.description ?? ""}`);
          if (!categoryIds.length) {
            return null;
          }

          const offerLabel = item.offers?.category ? normalizeWhitespace(item.offers.category) : null;

          return {
            id: buildListingId(providerBase.id, item.url),
            title: normalizeWhitespace(item.name),
            providerId: providerBase.id,
            providerName: providerBase.name,
            url: item.url,
            categoryIds,
            summary: normalizeWhitespace(item.description ?? "Course discovered from the Codecademy public catalog."),
            priceLabel: offerLabel,
            priceStatus: offerLabel ? ("available" as const) : ("unlisted" as const),
            durationLabel: formatIsoDurationLabel(item.hasCourseInstance?.[0]?.courseWorkload),
            capturedAt,
            confidence: "high" as const,
            sourceNote: "Captured from Codecademy public catalog JSON-LD.",
          } satisfies CourseListing;
        })
        .reduce<CourseListing[]>((accumulator, listing) => {
          if (listing) {
            accumulator.push(listing);
          }

          return accumulator;
        }, []) ?? [];

    return {
      provider: {
        ...providerBase,
        mode: listings.length ? "live" : "planned",
        note: listings.length
          ? "Catalog JSON-LD exposes course titles, access model, and workload details."
          : "No relevant listings were extracted from the public catalog.",
        listingCount: listings.length,
      },
      listings,
    };
  } catch (error) {
    return {
      provider: {
        ...providerBase,
        mode: "planned",
        note: `Refresh failed: ${error instanceof Error ? error.message : "unknown error"}`,
        listingCount: 0,
      },
      listings: [],
    };
  }
}

async function scrapeUpgrad(capturedAt: string): Promise<ProviderScrapeResult> {
  const providerBase = {
    id: "upgrad",
    name: "upGrad",
    homepage: "https://www.upgrad.com/bootcamps/",
    lastAttemptedAt: capturedAt,
  } as const;

  try {
    const html = await fetchText(providerBase.homepage);
    const listings = dedupeListingsByUrl(
      [...html.matchAll(/<a[^>]+href="(https:\/\/www\.upgrad\.com\/[^"]+)"[^>]*>([\s\S]*?)<\/a>/g)]
        .map(([, url, rawLabel]) => {
          const title = stripHtml(rawLabel);
          const categoryIds = inferCategoryIds(`${title} ${url}`);

          if (!title || !categoryIds.length) {
            return null;
          }

          return {
            id: buildListingId(providerBase.id, url),
            title,
            providerId: providerBase.id,
            providerName: providerBase.name,
            url,
            categoryIds,
            summary: "Program discovered from the upGrad public bootcamp catalog.",
            priceLabel: null,
            priceStatus: "unlisted" as const,
            durationLabel: null,
            capturedAt,
            confidence: "medium" as const,
            sourceNote: "Captured from upGrad public bootcamp pages.",
          } satisfies CourseListing;
        })
        .reduce<CourseListing[]>((accumulator, listing) => {
          if (listing) {
            accumulator.push(listing);
          }

          return accumulator;
        }, [])
    );

    return {
      provider: {
        ...providerBase,
        mode: listings.length ? "partial" : "planned",
        note: listings.length
          ? "Public bootcamp pages expose program titles and URLs; pricing remains mostly gated."
          : "No relevant upGrad programs were extracted from the public bootcamp pages.",
        listingCount: listings.length,
      },
      listings,
    };
  } catch (error) {
    return {
      provider: {
        ...providerBase,
        mode: "planned",
        note: `Refresh failed: ${error instanceof Error ? error.message : "unknown error"}`,
        listingCount: 0,
      },
      listings: [],
    };
  }
}

async function scrapeUdacity(capturedAt: string): Promise<ProviderScrapeResult> {
  const providerBase = {
    id: "udacity",
    name: "Udacity",
    homepage: "https://www.udacity.com/catalog",
    lastAttemptedAt: capturedAt,
  } as const;

  try {
    const html = await fetchText(providerBase.homepage);
    const nextData = html.match(/<script id="__NEXT_DATA__" type="application\/json">([\s\S]*?)<\/script>/)?.[1];

    if (!nextData) {
      throw new Error("Catalog payload not found.");
    }

    const parsed = JSON.parse(nextData) as {
      props?: {
        pageProps?: {
          catalogSearchResults?: {
            searchResultItems?: Array<{
              slug?: string;
              title?: string;
              summary?: string;
              duration?: string;
              rawDurationDisplay?: string;
              isFree?: boolean;
              skills?: string[];
            }>;
          };
        };
      };
    };

    const listings =
      parsed.props?.pageProps?.catalogSearchResults?.searchResultItems
        ?.map((item) => {
          if (!item.slug || !item.title) {
            return null;
          }

          const summary = normalizeWhitespace(item.summary ?? "");
          const categoryIds = inferCategoryIds(`${item.title} ${summary} ${(item.skills ?? []).join(" ")}`);
          if (!categoryIds.length) {
            return null;
          }

          return {
            id: buildListingId(providerBase.id, `https://www.udacity.com/course/${item.slug}`),
            title: normalizeWhitespace(item.title),
            providerId: providerBase.id,
            providerName: providerBase.name,
            url: `https://www.udacity.com/course/${item.slug}`,
            categoryIds,
            summary: summary || "Program discovered from the Udacity public catalog.",
            priceLabel: item.isFree ? "Free" : null,
            priceStatus: item.isFree ? ("available" as const) : ("unlisted" as const),
            durationLabel: item.rawDurationDisplay ?? item.duration ?? null,
            capturedAt,
            confidence: "high" as const,
            sourceNote: "Captured from Udacity catalog page JSON payload.",
          } satisfies CourseListing;
        })
        .reduce<CourseListing[]>((accumulator, listing) => {
          if (listing) {
            accumulator.push(listing);
          }

          return accumulator;
        }, []) ?? [];

    return {
      provider: {
        ...providerBase,
        mode: listings.length ? "live" : "planned",
        note: listings.length
          ? "Catalog payload exposes titles, summaries, and duration labels."
          : "No relevant Udacity programs were extracted from the public catalog.",
        listingCount: listings.length,
      },
      listings,
    };
  } catch (error) {
    return {
      provider: {
        ...providerBase,
        mode: "planned",
        note: `Refresh failed: ${error instanceof Error ? error.message : "unknown error"}`,
        listingCount: 0,
      },
      listings: [],
    };
  }
}

async function scrapeAlison(capturedAt: string): Promise<ProviderScrapeResult> {
  const providerBase = {
    id: "alison",
    name: "Alison",
    homepage: "https://www.alison.com/courses/it",
    lastAttemptedAt: capturedAt,
  } as const;

  const categoryPages = [
    { url: "https://www.alison.com/tag/artificial-intelligence", categoryIds: ["gen-ai", "ai-ml"] },
    { url: "https://www.alison.com/tag/data-science", categoryIds: ["data-science"] },
    { url: "https://www.alison.com/tag/web-development", categoryIds: ["full-stack-development"] },
    { url: "https://www.alison.com/tag/cloud-computing", categoryIds: ["cloud-computing"] },
    { url: "https://www.alison.com/tag/cyber-security", categoryIds: ["cyber-security"] },
    { url: "https://www.alison.com/tag/blockchain", categoryIds: ["web3-blockchain"] },
    { url: "https://www.alison.com/tag/devops", categoryIds: ["devops-engineering"] },
  ] as const;

  try {
    const pageResults = await Promise.all(
      categoryPages.map(async (page) => {
        const html = await fetchText(page.url);

        return [...html.matchAll(/<a[^>]+href="(https:\/\/alison\.com\/course\/[^"]+|\/course\/[^"]+)"[^>]*>([\s\S]*?)<\/a>/g)]
          .map(([, rawUrl, rawLabel]) => {
            const url = toAbsoluteUrl(providerBase.homepage, rawUrl);
            const title = stripHtml(rawLabel) || titleFromSlug(url);

            return {
              id: buildListingId(providerBase.id, url),
              title,
              providerId: providerBase.id,
              providerName: providerBase.name,
              url,
              categoryIds: [...page.categoryIds],
              summary: `Free course discovered from the Alison category page for ${page.categoryIds.join(", ")}.`,
              priceLabel: "Free",
              priceStatus: "available" as const,
              durationLabel: null,
              capturedAt,
              confidence: "medium" as const,
              sourceNote: `Captured from Alison public page ${page.url}.`,
            } satisfies CourseListing;
          });
      })
    );

    const listings = dedupeListingsByUrl(pageResults.flat()).filter((listing) => listing.title.length > 2);

    return {
      provider: {
        ...providerBase,
        mode: listings.length ? "partial" : "planned",
        note: listings.length
          ? "Public category pages expose many free course links, but duration and pricing details are limited."
          : "No relevant Alison course links were extracted from the public category pages.",
        listingCount: listings.length,
      },
      listings,
    };
  } catch (error) {
    return {
      provider: {
        ...providerBase,
        mode: "planned",
        note: `Refresh failed: ${error instanceof Error ? error.message : "unknown error"}`,
        listingCount: 0,
      },
      listings: [],
    };
  }
}

async function scrapeSimplilearn(capturedAt: string): Promise<ProviderScrapeResult> {
  const providerBase = {
    id: "simplilearn",
    name: "Simplilearn",
    homepage: "https://www.simplilearn.com/courses/ai",
    lastAttemptedAt: capturedAt,
  } as const;

  try {
    const html = await fetchText(providerBase.homepage);
    const discoveredLinks = [
      ...new Map(
        [...html.matchAll(/<a href=\\"(https:\/\/www\.simplilearn\.com\/[^"]+)\\"[^>]*>([^<]{3,120})<\/a>/g)].map(
          ([, url, label]) => [url, { url, label: label.replace(/&amp;/g, "&").trim() }]
        )
      ).values(),
    ];

    const listings = discoveredLinks
      .map((entry) => {
        const { url, label } = entry;
        const categoryIds = inferCategoryIds(`${label} ${url}`);

        if (!categoryIds.length) {
          return null;
        }

        return {
          id: `simplilearn-${url.split("https://www.simplilearn.com/")[1].replace(/[^a-z0-9-]/gi, "-").toLowerCase()}`,
          title: label,
          providerId: providerBase.id,
          providerName: providerBase.name,
          url,
          categoryIds,
          summary: "Relevant course or program discovered from the Simplilearn public AI category page.",
          priceLabel: null,
          priceStatus: "unlisted" as const,
          durationLabel: null,
          capturedAt,
          confidence: "medium" as const,
          sourceNote: "Captured from Simplilearn public category and FAQ links.",
        } satisfies CourseListing;
      })
      .reduce<CourseListing[]>((accumulator, listing) => {
        if (listing) {
          accumulator.push(listing);
        }

        return accumulator;
      }, []);
    const limitedListings = listings.slice(0, 14);

    return {
      provider: {
        ...providerBase,
        mode: limitedListings.length ? "partial" : "planned",
        note: limitedListings.length
          ? "Public course links are available; pricing is not reliably exposed on the category page."
          : "No relevant public course links were extracted from the category page.",
        listingCount: limitedListings.length,
      },
      listings: limitedListings,
    };
  } catch (error) {
    return {
      provider: {
        ...providerBase,
        mode: "planned",
        note: `Refresh failed: ${error instanceof Error ? error.message : "unknown error"}`,
        listingCount: 0,
      },
      listings: [],
    };
  }
}

async function scrapeEdx(capturedAt: string): Promise<ProviderScrapeResult> {
  const providerBase = {
    id: "edx",
    name: "edX",
    homepage: "https://www.edx.org/learn/artificial-intelligence",
    lastAttemptedAt: capturedAt,
  } as const;

  try {
    const html = await fetchText(providerBase.homepage);
    const itemListBlock = extractJsonLdBlocks(html).find(
      (block) => block.includes('"@type":"ItemList"') && block.includes('edx.org/learn/artificial-intelligence')
    );

    if (!itemListBlock) {
      throw new Error("Category item list not found.");
    }

    const parsed = JSON.parse(itemListBlock) as {
      "@graph"?: unknown[];
    };

    const graphEntries = flattenGraphEntries(parsed["@graph"]);
    const itemList = graphEntries.find((item) => item["@type"] === "ItemList") as
      | { itemListElement?: Array<{ url?: string }> }
      | undefined;
    const urls = unique(itemList?.itemListElement?.map((item) => item.url).filter((url): url is string => Boolean(url)) ?? []);

    const productNameBySlug = new Map<string, string>();
    for (const [, productSlug, productName] of html.matchAll(
      /"productSlug":"([^"]+)"[\s\S]{0,1500}?"productName":"([^"]+)"/g
    )) {
      productNameBySlug.set(productSlug, productName);
    }

    const listings = urls
      .map((url) => {
        const slug = url.replace("https://www.edx.org/", "");
        const title = productNameBySlug.get(slug) ?? titleFromSlug(slug);
        const categoryIds = inferCategoryIds(`${title} ${slug}`);

        if (!categoryIds.length) {
          return null;
        }

        return {
          id: `edx-${slug.replace(/[^a-z0-9-]/gi, "-").toLowerCase()}`,
          title,
          providerId: providerBase.id,
          providerName: providerBase.name,
          url,
          categoryIds,
          summary: "Discovered from the official edX AI category page.",
          priceLabel: null,
          priceStatus: "unlisted" as const,
          durationLabel: null,
          capturedAt,
          confidence: productNameBySlug.has(slug) ? ("high" as const) : ("medium" as const),
          sourceNote: "Captured from edX public category listings.",
        } satisfies CourseListing;
      })
      .reduce<CourseListing[]>((accumulator, listing) => {
        if (listing) {
          accumulator.push(listing);
        }

        return accumulator;
      }, []);
    const limitedListings = listings.slice(0, 16);

    return {
      provider: {
        ...providerBase,
        mode: limitedListings.length ? "partial" : "planned",
        note: limitedListings.length
          ? "Public category pages expose large course catalogs; prices are often not embedded in the listing payload."
          : "No relevant edX courses were extracted from the category page.",
        listingCount: limitedListings.length,
      },
      listings: limitedListings,
    };
  } catch (error) {
    return {
      provider: {
        ...providerBase,
        mode: "planned",
        note: `Refresh failed: ${error instanceof Error ? error.message : "unknown error"}`,
        listingCount: 0,
      },
      listings: [],
    };
  }
}

async function scrapeCoursera(capturedAt: string): Promise<ProviderScrapeResult> {
  const providerBase = {
    id: "coursera",
    name: "Coursera",
    homepage: "https://www.coursera.org",
    lastAttemptedAt: capturedAt,
  } as const;

  try {
    const searchConfigurations = [
      { query: "generative ai", categoryIds: ["gen-ai", "ai-ml"] },
      { query: "machine learning", categoryIds: ["ai-ml"] },
      { query: "data science", categoryIds: ["data-science"] },
      { query: "full stack development", categoryIds: ["full-stack-development"] },
      { query: "cloud computing", categoryIds: ["cloud-computing"] },
      { query: "cybersecurity", categoryIds: ["cyber-security"] },
      { query: "blockchain", categoryIds: ["web3-blockchain"] },
      { query: "devops", categoryIds: ["devops-engineering"] },
    ] as const;

    const searchResults = await Promise.all(
      searchConfigurations.map(async (configuration) => {
        const html = await fetchText(
          `${providerBase.homepage}/search?query=${encodeURIComponent(configuration.query)}`
        );
        const apolloStateMatch = html.match(/window\.__APOLLO_STATE__\s*=\s*(\{[\s\S]*?\});/);

        if (!apolloStateMatch) {
          return [];
        }

        const apolloState = JSON.parse(apolloStateMatch[1]) as Record<string, unknown>;
        return Object.entries(apolloState)
          .filter(([key]) => key.startsWith("Search_ProductHit:"))
          .map(([, rawValue]) => rawValue)
          .map((value) => {
            if (!value || typeof value !== "object") {
              return null;
            }

            const hit = value as {
              name?: string;
              url?: string;
              partners?: string[];
              productDuration?: string;
              productType?: string;
              productDifficultyLevel?: string;
              isCourseFree?: boolean;
              skills?: string[];
              productCard?: { __ref?: string };
            };

            if (!hit.name || !hit.url) {
              return null;
            }

            const productCardRef = hit.productCard?.__ref;
            const productCard = productCardRef ? (apolloState[productCardRef] as { badges?: string[] } | undefined) : undefined;
            const priceLabel = hit.isCourseFree ? "Free" : productCard?.badges?.[0] ?? null;
            const categoryIds = unique([
              ...configuration.categoryIds,
              ...inferCategoryIds(`${hit.name} ${(hit.partners ?? []).join(" ")} ${(hit.skills ?? []).join(" ")}`),
            ]);

            return {
              id: buildListingId(providerBase.id, toAbsoluteUrl(providerBase.homepage, hit.url)),
              title: normalizeWhitespace(hit.name),
              providerId: providerBase.id,
              providerName: providerBase.name,
              url: toAbsoluteUrl(providerBase.homepage, hit.url),
              categoryIds,
              summary: normalizeWhitespace(
                [
                  hit.partners?.length ? `Partner: ${hit.partners.join(", ")}` : "",
                  hit.productDifficultyLevel ? `Level: ${titleFromSlug(hit.productDifficultyLevel.toLowerCase())}` : "",
                  hit.productType ? `Type: ${titleFromSlug(hit.productType.toLowerCase())}` : "",
                ]
                  .filter(Boolean)
                  .join(" · ") || `Result discovered from Coursera search for ${configuration.query}.`
              ),
              priceLabel,
              priceStatus: priceLabel ? ("available" as const) : ("unlisted" as const),
              durationLabel: formatCourseraDurationLabel(hit.productDuration),
              capturedAt,
              confidence: "high" as const,
              sourceNote: `Captured from Coursera public search results for ${configuration.query}.`,
            } satisfies CourseListing;
          })
          .reduce<CourseListing[]>((accumulator, listing) => {
            if (listing) {
              accumulator.push(listing);
            }

            return accumulator;
          }, []);
      })
    );

    const listings = dedupeListingsByUrl(searchResults.flat());

    return {
      provider: {
        ...providerBase,
        mode: listings.length ? "live" : "planned",
        note: listings.length
          ? "Public search pages expose structured product hits with partner, duration, and badge metadata."
          : "No relevant Coursera listings were extracted from the public search pages.",
        listingCount: listings.length,
      },
      listings,
    };
  } catch (error) {
    return {
      provider: {
        ...providerBase,
        mode: "planned",
        note: `Search surface check failed: ${error instanceof Error ? error.message : "unknown error"}`,
        listingCount: 0,
      },
      listings: [],
    };
  }
}

async function inspectDataCamp(capturedAt: string): Promise<ProviderScrapeResult> {
  const providerBase = {
    id: "datacamp",
    name: "DataCamp",
    homepage: "https://www.datacamp.com/courses",
    lastAttemptedAt: capturedAt,
  } as const;

  try {
    const html = await fetchText(providerBase.homepage);
    const blocked = html.includes("Just a moment") || html.includes("Enable JavaScript and cookies to continue");

    return {
      provider: {
        ...providerBase,
        mode: blocked ? "blocked" : "planned",
        note: blocked
          ? "Course catalog requests currently hit anti-bot protection."
          : "Public catalog reachable, but parser not implemented yet.",
        listingCount: 0,
      },
      listings: [],
    };
  } catch (error) {
    return {
      provider: {
        ...providerBase,
        mode: "blocked",
        note: `Catalog blocked or failed: ${error instanceof Error ? error.message : "unknown error"}`,
        listingCount: 0,
      },
      listings: [],
    };
  }
}

async function inspectFutureLearn(capturedAt: string): Promise<ProviderScrapeResult> {
  const providerBase = {
    id: "futurelearn",
    name: "FutureLearn",
    homepage: "https://www.futurelearn.com",
    lastAttemptedAt: capturedAt,
  } as const;

  try {
    const html = await fetchText(
      "https://www.futurelearn.com/subjects/it-and-computer-science-courses/artificial-intelligence"
    );
    const blocked = html.includes("Just a moment") || html.includes("Enable JavaScript and cookies to continue");

    return {
      provider: {
        ...providerBase,
        mode: blocked ? "blocked" : "planned",
        note: blocked
          ? "Category pages currently sit behind anti-bot protection for simple server fetches."
          : "Public category reachable, but parser not implemented yet.",
        listingCount: 0,
      },
      listings: [],
    };
  } catch (error) {
    return {
      provider: {
        ...providerBase,
        mode: "blocked",
        note: `Category blocked or failed: ${error instanceof Error ? error.message : "unknown error"}`,
        listingCount: 0,
      },
      listings: [],
    };
  }
}

async function inspectUdemy(capturedAt: string): Promise<ProviderScrapeResult> {
  const providerBase = {
    id: "udemy",
    name: "Udemy",
    homepage: "https://www.udemy.com",
    lastAttemptedAt: capturedAt,
  } as const;

  try {
    const html = await fetchText("https://www.udemy.com/courses/search/?q=data%20science");
    const blocked = html.includes("Just a moment") || html.includes("Enable JavaScript and cookies to continue");

    return {
      provider: {
        ...providerBase,
        mode: blocked ? "blocked" : "planned",
        note: blocked
          ? "Simple server fetches hit an anti-bot challenge, so direct HTML scraping is not reliable."
          : "Public search page responded, but the parser is not implemented yet.",
        listingCount: 0,
      },
      listings: [],
    };
  } catch (error) {
    return {
      provider: {
        ...providerBase,
        mode: "blocked",
        note: `Search surface blocked or failed: ${error instanceof Error ? error.message : "unknown error"}`,
        listingCount: 0,
      },
      listings: [],
    };
  }
}

function buildCatalogFromResults(
  refreshedAt: string,
  providerResults: ProviderScrapeResult[]
): CourseMarketplaceCatalog {
  const categories = createEmptyCategories();
  const categoryMap = new Map(categories.map((category) => [category.id, category]));

  providerResults
    .flatMap((result) => result.listings)
    .map((listing) => ({
      ...listing,
      categoryIds: sanitizeCategoryIds(listing.categoryIds, listing.title, listing.summary),
    }))
    .sort((left, right) => left.title.localeCompare(right.title))
    .forEach((listing) => {
      listing.categoryIds.forEach((categoryId) => {
        categoryMap.get(categoryId)?.listings.push(listing);
      });
    });

  categories.forEach((category) => {
    category.listings.sort((left, right) => {
      if (left.providerName !== right.providerName) {
        return left.providerName.localeCompare(right.providerName);
      }

      return left.title.localeCompare(right.title);
    });
  });

  return {
    refreshedAt,
    nextSuggestedRefreshAt: isoFromNow(COURSE_REFRESH_INTERVAL_MINUTES),
    refreshIntervalMinutes: COURSE_REFRESH_INTERVAL_MINUTES,
    categories,
    providers: providerResults.map((result) => result.provider),
  };
}

async function persistCatalog(catalog: CourseMarketplaceCatalog) {
  const collection = await getCatalogCollection();

  await collection.updateOne(
    { _id: LATEST_CATALOG_ID },
    {
      $set: {
        ...catalog,
        updatedAt: new Date().toISOString(),
      },
    },
    { upsert: true }
  );
}

export async function refreshCourseMarketplaceCatalog() {
  const refreshedAt = new Date().toISOString();
  const providerResults = await Promise.all([
    scrapeApnaCollege(refreshedAt),
    scrapeBosscoderAcademy(refreshedAt),
    scrapeGeeksforGeeks(refreshedAt),
    scrapeCodecademy(refreshedAt),
    scrapeIbmSkillsBuild(refreshedAt),
    scrapeUpgrad(refreshedAt),
    scrapeUdacity(refreshedAt),
    scrapeAlison(refreshedAt),
    scrapeForageFeaturedSimulations(refreshedAt),
    scrapeSimplilearn(refreshedAt),
    scrapeCiscoNetworkingAcademy(refreshedAt),
    scrapeEdx(refreshedAt),
    scrapeCoursera(refreshedAt),
    inspectUdemy(refreshedAt),
    inspectDataCamp(refreshedAt),
    inspectFutureLearn(refreshedAt),
  ]);

  const catalog = buildCatalogFromResults(refreshedAt, providerResults);
  await persistCatalog(catalog);
  revalidateTag(COURSE_MARKETPLACE_CATALOG_TAG);
  return catalog;
}

async function readLatestCourseMarketplaceCatalog() {
  const collection = await getCatalogCollection();
  const storedCatalog = await collection.findOne({ _id: LATEST_CATALOG_ID });

  if (!storedCatalog) {
    return refreshCourseMarketplaceCatalog();
  }

  const { _id, updatedAt, ...catalog } = storedCatalog;
  return catalog;
}

const getCachedCourseMarketplaceCatalog = unstable_cache(readLatestCourseMarketplaceCatalog, ["latest"], {
  revalidate: 300,
  tags: [COURSE_MARKETPLACE_CATALOG_TAG],
});

export async function getCourseMarketplaceCatalog() {
  return getCachedCourseMarketplaceCatalog();
}

export function buildRefreshSummary(catalog: CourseMarketplaceCatalog) {
  const trackedListings = catalog.categories.reduce((count, category) => count + category.listings.length, 0);
  const liveProviders = catalog.providers.filter((provider) => provider.mode === "live" || provider.mode === "partial").length;

  return {
    trackedListings,
    liveProviders,
    blockedProviders: catalog.providers.filter((provider) => provider.mode === "blocked").length,
  };
}
