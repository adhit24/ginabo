import { jsonError, jsonOk } from "@/lib/http";
import { resolveCommandCenterProvider } from "@/features/command-center/provider";
import type { CommandCenterPeriod } from "@/features/command-center/types";

export const dynamic = "force-dynamic";

export async function GET(request: Request) {
  const periodParam = new URL(request.url).searchParams.get("period") ?? "7d";
  if (periodParam !== "7d" && periodParam !== "30d") {
    return jsonError("Unsupported command center period", 400);
  }

  try {
    const provider = resolveCommandCenterProvider(process.env.COMMAND_CENTER_DATA_SOURCE);
    const data = await provider({ period: periodParam as CommandCenterPeriod });
    return jsonOk(data, { headers: { "Cache-Control": "no-store" } });
  } catch (error) {
    return jsonError(
      "Command center data could not be loaded",
      500,
      error instanceof Error ? error.message : String(error),
    );
  }
}
