import { config } from "dotenv";

import { runAiEnclaveService } from "../src/ai/flows/run-ai-enclave-service";
import { AI_ENCLAVE_SERVICE_SECTIONS, type AiEnclaveServiceId } from "../src/lib/ai-enclave/services";
import { getAiEnclaveWorkbenchConfig } from "../src/lib/ai-enclave/workbench";

config({ path: ".env.local" });

type ServiceCheckResult = {
  serviceId: AiEnclaveServiceId;
  name: string;
  ok: boolean;
  titleLength?: number;
  contentLength?: number;
  message?: string;
};

function getServicesToCheck() {
  return AI_ENCLAVE_SERVICE_SECTIONS.flatMap((section) => section.services).filter(
    (service) => service.id !== "blog-generator"
  );
}

function buildValues(serviceId: AiEnclaveServiceId) {
  const configForService = getAiEnclaveWorkbenchConfig(serviceId);

  if (!configForService) {
    throw new Error(`No workbench config found for ${serviceId}`);
  }

  return Object.fromEntries(
    configForService.fields.map((field) => [field.name, field.defaultValue ?? ""])
  ) as Record<string, string>;
}

async function main() {
  const services = getServicesToCheck();
  const results: ServiceCheckResult[] = [];

  for (const service of services) {
    try {
      const values = buildValues(service.id);
      const result = await runAiEnclaveService({
        serviceId: service.id,
        values,
      });

      const titleLength = result.title.trim().length;
      const contentLength = result.content.trim().length;
      const ok = titleLength > 0 && contentLength > 0;

      results.push({
        serviceId: service.id,
        name: service.name,
        ok,
        titleLength,
        contentLength,
        message: ok ? undefined : "Received empty title/content.",
      });
    } catch (error) {
      results.push({
        serviceId: service.id,
        name: service.name,
        ok: false,
        message: error instanceof Error ? error.message : "Unknown error",
      });
    }
  }

  let passCount = 0;
  let failCount = 0;

  for (const result of results) {
    if (result.ok) {
      passCount += 1;
      console.log(
        `PASS | ${result.serviceId} | title=${result.titleLength} | content=${result.contentLength}`
      );
    } else {
      failCount += 1;
      console.log(`FAIL | ${result.serviceId} | ${result.message ?? "Unknown failure"}`);
    }
  }

  console.log(`SUMMARY pass=${passCount} fail=${failCount} total=${results.length}`);

  if (failCount > 0) {
    process.exit(1);
  }
}

main().catch((error) => {
  console.error("Failed to run AI enclave verification:", error);
  process.exit(1);
});
