export type CourseIconKey =
  | "feather"
  | "cpu"
  | "database"
  | "code"
  | "server"
  | "lock"
  | "gem"
  | "rocket";

export type ProviderMode = "live" | "partial" | "blocked" | "planned";

export type PriceStatus = "available" | "unlisted" | "blocked";

export type ConfidenceLevel = "high" | "medium" | "low";

export interface CourseListing {
  id: string;
  title: string;
  providerId: string;
  providerName: string;
  url: string;
  categoryIds: string[];
  summary: string;
  priceLabel: string | null;
  priceStatus: PriceStatus;
  durationLabel: string | null;
  capturedAt: string;
  confidence: ConfidenceLevel;
  sourceNote: string;
}

export interface ProviderStatus {
  id: string;
  name: string;
  homepage: string;
  mode: ProviderMode;
  note: string;
  lastAttemptedAt: string;
  listingCount: number;
}

export interface CourseCategory {
  id: string;
  name: string;
  description: string;
  iconKey: CourseIconKey;
  ownedPrice: string;
  ownedTimeline: string;
  highlights: string[];
  listings: CourseListing[];
}

export interface CourseMarketplaceCatalog {
  refreshedAt: string;
  nextSuggestedRefreshAt: string;
  refreshIntervalMinutes: number;
  categories: CourseCategory[];
  providers: ProviderStatus[];
}
