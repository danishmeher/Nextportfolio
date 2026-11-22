import { NextResponse } from "next/server";
import { notifyVisitor, VisitorInfo } from "@/lib/notifier";
import { saveVisitorLog } from "@/lib/visitor-store";

function parseUserAgent(ua: string) {
  let device = "Desktop";
  if (/mobile/i.test(ua)) device = "Mobile";
  else if (/tablet|ipad/i.test(ua)) device = "Tablet";

  let os = "Unknown OS";
  if (/windows/i.test(ua)) os = "Windows";
  else if (/android/i.test(ua)) os = "Android";
  else if (/iphone|ipad|ipod/i.test(ua)) os = "iOS";
  else if (/macintosh|mac os x/i.test(ua)) os = "macOS";
  else if (/linux/i.test(ua)) os = "Linux";

  let browser = "Unknown Browser";
  if (/edg/i.test(ua)) browser = "Edge";
  else if (/chrome|crios/i.test(ua)) browser = "Chrome";
  else if (/firefox|fxios/i.test(ua)) browser = "Firefox";
  else if (/safari/i.test(ua) && !/chrome/i.test(ua)) browser = "Safari";

  return { device, os, browser };
}

export async function POST(req: Request) {
  try {
    const body = await req.json().catch(() => ({}));
    const headers = req.headers;

    const ua = headers.get("user-agent") || "";
    const { device, os, browser } = parseUserAgent(ua);

    // IP Extraction
    const forwarded = headers.get("x-forwarded-for");
    const ip = forwarded ? forwarded.split(",")[0].trim() : headers.get("x-real-ip") || "127.0.0.1";

    // Country & City from hosting headers (Vercel / Cloudflare)
    let country = headers.get("x-vercel-ip-country") || headers.get("cf-ipcountry") || "";
    let city = headers.get("x-vercel-ip-city") || "";

    // If local or headers missing, check if it's a public IP
    if (!country && ip && ip !== "127.0.0.1" && ip !== "::1" && !ip.startsWith("192.168.") && !ip.startsWith("10.")) {
      try {
        const geoRes = await fetch(`http://ip-api.com/json/${ip}?fields=country,city`, {
          signal: AbortSignal.timeout(2000),
        });
        if (geoRes.ok) {
          const geoData = await geoRes.json();
          country = geoData.country || "";
          city = geoData.city || "";
        }
      } catch {
        // Ignore geo lookup timeout
      }
    }

    if (!country && (ip === "127.0.0.1" || ip === "::1")) {
      country = "Localhost (Dev)";
    }

    const visitorInfo: VisitorInfo = {
      ip,
      country: country || "Unknown Country",
      city: city || "",
      device,
      os,
      browser,
      referrer: body.referrer || "Direct",
      path: body.path || "/",
      screen: body.screen || "",
    };

    // Save visitor log reliably (local store + Firestore sync)
    await saveVisitorLog({
      ip,
      country: country || "Unknown Country",
      city: city || "",
      device,
      os,
      browser,
      referrer: body.referrer || "Direct",
      path: body.path || "/",
      screen: body.screen || "",
      createdAt: Date.now(),
    });

    // Optional notification (if configured)
    notifyVisitor(visitorInfo).catch(() => {});

    return NextResponse.json({ success: true });
  } catch (error: any) {
    return NextResponse.json({ success: false, error: error?.message || "Failed" }, { status: 500 });
  }
}
