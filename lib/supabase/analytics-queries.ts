import { unstable_cache } from "next/cache";
import { createAdminClient } from "./server";

function getRangeCutoff(range: "today" | "7d" | "30d"): string {
  const now = new Date();
  if (range === "today") {
    now.setHours(0, 0, 0, 0);
  } else if (range === "7d") {
    now.setDate(now.getDate() - 7);
  } else {
    now.setDate(now.getDate() - 30);
  }
  return now.toISOString();
}

async function fetchSubmissionCounts(range: "today" | "7d" | "30d") {
  const client = createAdminClient();
  const cutoff = getRangeCutoff(range);

  const [sellerResult, partnerResult] = await Promise.all([
    client
      .from("contact_submissions")
      .select("id", { count: "exact", head: true })
      .gte("created_at", cutoff),
    client
      .from("partner_submissions")
      .select("id", { count: "exact", head: true })
      .gte("created_at", cutoff),
  ]);

  return {
    seller: sellerResult.count ?? 0,
    partner: partnerResult.count ?? 0,
  };
}

export const getSubmissionCounts = unstable_cache(
  fetchSubmissionCounts,
  ["analytics-submissions"],
  { revalidate: 300, tags: ["analytics-submissions"] }
);
