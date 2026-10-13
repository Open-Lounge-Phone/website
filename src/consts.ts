import { type FundingConfig, HUB_FUNDING } from "../main/packages/core/src/funding.ts";

/** Public repository URL (see scripts/sync-docs.ts). */
export const GITHUB_URL = "https://github.com/Open-Lounge-Phone/open-lounge-phone";

const env = (name: string): string | undefined => process.env[name]?.trim() || undefined;
const num = (name: string, fallback: number): number => {
  const v = Number(env(name));
  return env(name) !== undefined && Number.isFinite(v) ? v : fallback;
};

/**
 * GitHub Sponsors link for the project (owner, 2026-09-29). A fork can override it with
 * `SPONSOR_URL` at build time, or hide the button with `SPONSOR_URL=none`.
 */
const PROJECT_SPONSOR_URL = "https://github.com/sponsors/previousdolphin";
const sponsorSetting = env("SPONSOR_URL") ?? PROJECT_SPONSOR_URL;
export const SPONSOR_URL = /^https:\/\/\S+$/.test(sponsorSetting) ? sponsorSetting : undefined;

/** The hub's funding, as configured for the build (defaults: the hub's current numbers). */
export const FUNDING: FundingConfig = {
  balanceUsd: num("FUNDING_BALANCE_USD", HUB_FUNDING.balanceUsd),
  baseCostUsdPerMonth: num("BASE_COST_USD_PER_MONTH", HUB_FUNDING.baseCostUsdPerMonth),
  costPerActiveUserUsdPerMonth: num(
    "COST_PER_ACTIVE_USER_USD_PER_MONTH",
    HUB_FUNDING.costPerActiveUserUsdPerMonth,
  ),
};

/**
 * The hub's monthly goal and what came in. Donations come in through GitHub Sponsors; the owner
 * sets this month's total (FUNDING_RAISED_USD) and adds each finished month to `history`.
 */
export const MONTHLY = {
  goalUsd: num("FUNDING_GOAL_USD", 150),
  month: env("FUNDING_MONTH") ?? "2026-10",
  raisedUsd: num("FUNDING_RAISED_USD", 0),
  history: [{ month: "2026-09", raisedUsd: 150 }],
};

export const CREDIT = {
  text: "Proudly supported by unsubscribe.llc",
  url: "https://www.unsubscribe.llc/",
};
