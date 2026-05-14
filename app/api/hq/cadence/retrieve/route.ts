import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import {
  retrieveEntityMemory,
  retrieveTextSearch,
  retrieveTimelineRange,
  retrieveRelationshipGraph,
  retrieveRecentActivity,
  retrieveHighPriority,
} from "@/lib/cadence-retrieval";
import type { RetrievalQueryType } from "@/lib/supabase/types";

async function requireHQAuth() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return null;
  const { data: profile } = await supabase
    .from("profiles")
    .select("role, status")
    .eq("id", user.id)
    .single() as { data: { role: string; status: string } | null; error: unknown };
  if (!profile || profile.status !== "active" || !["admin", "team"].includes(profile.role)) return null;
  return user;
}

interface RetrievalRequest {
  type: RetrievalQueryType;
  entity_type?: string;
  entity_id?: string;
  text_query?: string;
  date_from?: string;
  date_to?: string;
  hours?: number;
  limit?: number;
  depth?: number;
}

export async function POST(req: NextRequest) {
  const user = await requireHQAuth();
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  let body: RetrievalRequest;
  try {
    body = await req.json() as RetrievalRequest;
  } catch {
    return NextResponse.json({ error: "Invalid request body" }, { status: 400 });
  }

  const { type, entity_type, entity_id, text_query, date_from, date_to, hours, limit, depth } = body;

  switch (type) {
    case "entity_memory": {
      if (!entity_type || !entity_id) {
        return NextResponse.json({ error: "entity_type and entity_id required" }, { status: 400 });
      }
      const result = await retrieveEntityMemory(entity_type, entity_id);
      return NextResponse.json(result);
    }

    case "text_search": {
      if (!text_query?.trim()) {
        return NextResponse.json({ error: "text_query required" }, { status: 400 });
      }
      const result = await retrieveTextSearch(text_query, limit);
      return NextResponse.json(result);
    }

    case "timeline_range": {
      if (!date_from || !date_to) {
        return NextResponse.json({ error: "date_from and date_to required" }, { status: 400 });
      }
      const result = await retrieveTimelineRange(date_from, date_to, undefined, limit);
      return NextResponse.json(result);
    }

    case "relationship_graph": {
      if (!entity_type || !entity_id) {
        return NextResponse.json({ error: "entity_type and entity_id required" }, { status: 400 });
      }
      const result = await retrieveRelationshipGraph(entity_type, entity_id, depth);
      return NextResponse.json(result);
    }

    case "recent_activity": {
      const result = await retrieveRecentActivity(hours ?? 24, limit);
      return NextResponse.json(result);
    }

    case "high_priority": {
      const result = await retrieveHighPriority(limit);
      return NextResponse.json(result);
    }

    default:
      return NextResponse.json({ error: "Unknown query type" }, { status: 400 });
  }
}
