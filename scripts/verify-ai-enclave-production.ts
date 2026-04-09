import { config } from "dotenv";

import { AI_ENCLAVE_SERVICE_SECTIONS } from "../src/lib/ai-enclave/services";
import { getAiEnclaveWorkbenchConfig } from "../src/lib/ai-enclave/workbench";

config({ path: ".env.local" });

type Result = {
  serviceId: string;
  ok: boolean;
  status: number;
  note: string;
};

function getCookieValue(setCookie: string | null, name: string) {
  if (!setCookie) {
    return null;
  }

  const cookies = setCookie.split(/,(?=[^;]+=[^;]+)/g);

  for (const cookie of cookies) {
    const firstPart = cookie.split(";")[0]?.trim();

    if (!firstPart) {
      continue;
    }

    const [cookieName, ...cookieValueParts] = firstPart.split("=");
    if (cookieName === name) {
      return cookieValueParts.join("=");
    }
  }

  return null;
}

async function login(baseUrl: string, email: string, password: string) {
  const response = await fetch(`${baseUrl}/api/email-auth/login`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      email,
      password,
    }),
  });

  const setCookieHeader = response.headers.get("set-cookie");
  const session = getCookieValue(setCookieHeader, "digitantra_email_session");

  if (!response.ok || !session) {
    const payload = await response.text();
    throw new Error(`Login failed (${response.status}): ${payload}`);
  }

  return `digitantra_email_session=${session}`;
}

function buildDefaultValues(serviceId: string) {
  const configForService = getAiEnclaveWorkbenchConfig(serviceId as never);

  if (!configForService) {
    throw new Error(`No workbench config for service ${serviceId}`);
  }

  return Object.fromEntries(
    configForService.fields.map((field) => [field.name, field.defaultValue ?? ""])
  );
}

async function run() {
  const baseUrl = process.argv[2] || "https://digitantra.vercel.app";
  const email = process.argv[3] || "";
  const password = process.argv[4] || "";

  if (!email || !password) {
    throw new Error("Usage: npx tsx scripts/verify-ai-enclave-production.ts <baseUrl> <email> <password>");
  }

  const cookieHeader = await login(baseUrl, email, password);
  const services = AI_ENCLAVE_SERVICE_SECTIONS.flatMap((section) => section.services).filter(
    (service) => service.id !== "blog-generator"
  );

  const results: Result[] = [];

  for (const service of services) {
    const values = buildDefaultValues(service.id);
    const response = await fetch(`${baseUrl}/api/ai-enclave/run`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Cookie: cookieHeader,
      },
      body: JSON.stringify({
        serviceId: service.id,
        values,
      }),
    });

    let note = "";
    let ok = false;

    const raw = await response.text();
    let payload:
      | { title?: string; content?: string; error?: string; message?: string }
      | null = null;

    try {
      payload = JSON.parse(raw) as {
        title?: string;
        content?: string;
        error?: string;
        message?: string;
      };
    } catch {
      payload = null;
    }

    if (response.ok && payload) {
      const title = (payload.title ?? "").trim();
      const content = (payload.content ?? "").trim();
      ok =
        title.length > 0 &&
        content.length > 0 &&
        !/temporarily unavailable|configuration is missing/i.test(title) &&
        !/temporarily unavailable|could not be completed|rate-limited/i.test(content);
      note = ok
        ? `title=${title.length},content=${content.length}`
        : `degraded-response:${content.slice(0, 140)}`;
    } else {
      note = payload?.message || payload?.error || raw.slice(0, 180) || "request failed";
    }

    results.push({
      serviceId: service.id,
      ok,
      status: response.status,
      note,
    });
  }

  const pass = results.filter((result) => result.ok).length;
  const fail = results.length - pass;

  for (const result of results) {
    if (result.ok) {
      console.log(`PASS | ${result.serviceId} | ${result.note}`);
    } else {
      console.log(`FAIL | ${result.serviceId} | status=${result.status} | ${result.note}`);
    }
  }

  console.log(`SUMMARY pass=${pass} fail=${fail} total=${results.length}`);

  if (fail > 0) {
    process.exit(1);
  }
}

run().catch((error) => {
  console.error(error instanceof Error ? error.message : String(error));
  process.exit(1);
});
