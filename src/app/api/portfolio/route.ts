import { NextResponse } from "next/server";
import { getProjects, getSkills, getExperiences } from "@/lib/firestore";

// Cache in memory for 60 seconds to avoid unnecessary database hits
let cachedData: {
  projects: any[];
  skills: any[];
  experiences: any[];
} | null = null;
let lastCacheTime = 0;
const CACHE_TTL_MS = 60 * 1000;

export async function GET() {
  try {
    const now = Date.now();
    if (cachedData && now - lastCacheTime < CACHE_TTL_MS) {
      return NextResponse.json(cachedData, {
        headers: {
          "Cache-Control": "public, s-maxage=60, stale-while-revalidate=300",
        },
      });
    }

    const [projects, skills, experiences] = await Promise.all([
      getProjects().catch(() => []),
      getSkills().catch(() => []),
      getExperiences().catch(() => []),
    ]);

    cachedData = { projects, skills, experiences };
    lastCacheTime = now;

    return NextResponse.json(cachedData, {
      headers: {
        "Cache-Control": "public, s-maxage=60, stale-while-revalidate=300",
      },
    });
  } catch (error) {
    console.error("Failed to fetch portfolio data:", error);
    return NextResponse.json(
      { projects: [], skills: [], experiences: [] },
      { status: 500 }
    );
  }
}
