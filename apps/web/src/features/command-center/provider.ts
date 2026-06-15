import { getDemoCommandCenterData } from "./demo";
import { getLiveCommandCenterData } from "./live";
import type { CommandCenterProvider } from "./types";

export interface CommandCenterProviders {
  demo: CommandCenterProvider;
  live: CommandCenterProvider;
}

export function resolveCommandCenterProvider(
  source: string | undefined,
  providers: CommandCenterProviders = { demo: getDemoCommandCenterData, live: getLiveCommandCenterData },
): CommandCenterProvider {
  if (!source || source === "demo") return providers.demo;
  if (source === "live") return providers.live;
  throw new Error(`Unsupported COMMAND_CENTER_DATA_SOURCE: ${source}`);
}
