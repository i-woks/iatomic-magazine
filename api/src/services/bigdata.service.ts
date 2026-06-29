export type BigDataEnv = {
  BIGDATA_API_KEY?: string;
  BIGDATA_ENDPOINT?: string;
};

export type BigDataArchiveResult =
  | { ok: true; archiveId?: string }
  | { ok: false; error: "MISSING_API_KEY" | "MISSING_ENDPOINT" | "NETWORK_ERROR" | "API_ERROR" };

export function getBigDataStatus(env: BigDataEnv) {
  return {
    apiKeyConfigured: Boolean(env.BIGDATA_API_KEY),
    endpointConfigured: Boolean(env.BIGDATA_ENDPOINT),
    fullyConfigured: Boolean(env.BIGDATA_API_KEY && env.BIGDATA_ENDPOINT),
  };
}

export async function archiveToBigData(
  env: BigDataEnv,
  payload: { postId: number; title: string; content: string; timestamp: string },
): Promise<BigDataArchiveResult> {
  const apiKey = env.BIGDATA_API_KEY;
  const endpoint = env.BIGDATA_ENDPOINT;

  if (!apiKey) return { ok: false, error: "MISSING_API_KEY" };
  if (!endpoint) return { ok: false, error: "MISSING_ENDPOINT" };

  try {
    const response = await fetch(endpoint, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "Authorization": `Bearer ${apiKey}`,
      },
      body: JSON.stringify({
        source: "iatomic-magazine",
        data: payload,
      }),
      signal: AbortSignal.timeout(10000),
    });

    if (!response.ok) {
      console.error(`BigData archive failed with status ${response.status}`);
      return { ok: false, error: "API_ERROR" };
    }

    const result = await response.json().catch(() => null) as { archiveId?: string } | null;
    return { ok: true, archiveId: result?.archiveId };
  } catch {
    console.error("BigData archive failed due to network/runtime error");
    return { ok: false, error: "NETWORK_ERROR" };
  }
}

export function safeBigDataErrorMessage(code: BigDataArchiveResult extends infer R ? R extends { ok: false; error: infer E } ? E : never : never) {
  switch (code) {
    case "MISSING_API_KEY":
    case "MISSING_ENDPOINT":
      return "BigData archive not configured";
    case "API_ERROR":
    case "NETWORK_ERROR":
    default:
      return "Archive operation failed";
  }
}
