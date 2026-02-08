import { NextRequest, NextResponse } from "next/server";

/**
 * Enhanced Proxy API Route
 * 
 * Returns JSON with HTML, extracted CSS, and metadata for React rendering.
 */

interface ProxyResponse {
  html: string;
  css: string;
  baseUrl: string;
  title: string;
  success: boolean;
  error?: string;
}

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const targetUrl = searchParams.get("url");

  if (!targetUrl) {
    return NextResponse.json<ProxyResponse>(
      { html: "", css: "", baseUrl: "", title: "", success: false, error: "URL parameter is required" },
      { status: 400 }
    );
  }

  try {
    // Validate URL
    const url = new URL(targetUrl);

    // Fetch the external website with browser-like headers
    const response = await fetch(url.toString(), {
      headers: {
        "User-Agent": "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36",
        "Accept": "text/html,application/xhtml+xml,application/xml;q=0.9,image/avif,image/webp,image/apng,*/*;q=0.8",
        "Accept-Language": "en-US,en;q=0.9",
        "Accept-Encoding": "identity", // Don't compress for easier parsing
        "Cache-Control": "no-cache",
        "Sec-Fetch-Dest": "document",
        "Sec-Fetch-Mode": "navigate",
        "Sec-Fetch-Site": "none",
        "Upgrade-Insecure-Requests": "1",
      },
      redirect: "follow",
    });

    if (!response.ok) {
      return NextResponse.json<ProxyResponse>(
        { html: "", css: "", baseUrl: "", title: "", success: false, error: `Failed to fetch: ${response.status}` },
        { status: response.status }
      );
    }

    let html = await response.text();
    const finalUrl = response.url || url.toString();
    const baseUrl = new URL(finalUrl).origin;

    // Extract title
    const titleMatch = html.match(/<title[^>]*>([^<]*)<\/title>/i);
    const title = titleMatch ? titleMatch[1].trim() : new URL(finalUrl).hostname;

    // Extract all <style> tags content
    const styleMatches = html.matchAll(/<style[^>]*>([\s\S]*?)<\/style>/gi);
    let extractedCss = "";
    for (const match of styleMatches) {
      extractedCss += match[1] + "\n";
    }

    // Extract linked stylesheets and inline them (for critical CSS)
    const linkMatches = html.matchAll(/<link[^>]*rel=["']stylesheet["'][^>]*href=["']([^"']+)["'][^>]*>/gi);
    const cssLinks: string[] = [];
    for (const match of linkMatches) {
      let cssUrl = match[1];
      // Resolve relative URLs
      if (cssUrl.startsWith("/")) {
        cssUrl = baseUrl + cssUrl;
      } else if (!cssUrl.startsWith("http")) {
        cssUrl = baseUrl + "/" + cssUrl;
      }
      cssLinks.push(cssUrl);
    }

    // Fetch external CSS (limit to first 5 to avoid timeout)
    for (const cssUrl of cssLinks.slice(0, 5)) {
      try {
        const cssResponse = await fetch(cssUrl, {
          headers: { "User-Agent": "Mozilla/5.0" },
        });
        if (cssResponse.ok) {
          const cssText = await cssResponse.text();
          extractedCss += `\n/* From: ${cssUrl} */\n${cssText}\n`;
        }
      } catch {
        // Skip failed CSS fetches
      }
    }

    // Rewrite relative URLs in HTML to absolute
    html = html.replace(/src=["']\/([^"']*)/g, `src="${baseUrl}/$1`);
    html = html.replace(/href=["']\/([^"']*)/g, `href="${baseUrl}/$1`);
    html = html.replace(/url\(["']?\/([^"')]*)/g, `url("${baseUrl}/$1`);

    // Fix protocol-relative URLs
    html = html.replace(/src=["']\/\//g, `src="${url.protocol}//`);
    html = html.replace(/href=["']\/\//g, `href="${url.protocol}//`);

    // Rewrite relative URLs in CSS
    extractedCss = extractedCss.replace(/url\(["']?\/([^"')]*)/g, `url("${baseUrl}/$1`);
    extractedCss = extractedCss.replace(/url\(["']?\.\.\/([^"')]*)/g, `url("${baseUrl}/$1`);

    // Remove script tags (we'll handle functionality differently)
    html = html.replace(/<script[\s\S]*?<\/script>/gi, "");

    // Remove problematic meta tags
    html = html.replace(/<meta[^>]*http-equiv\s*=\s*["']?refresh["']?[^>]*>/gi, "");

    // Extract just the body content
    const bodyMatch = html.match(/<body[^>]*>([\s\S]*)<\/body>/i);
    const bodyHtml = bodyMatch ? bodyMatch[1] : html;

    return NextResponse.json<ProxyResponse>({
      html: bodyHtml,
      css: extractedCss,
      baseUrl,
      title,
      success: true,
    }, {
      headers: {
        "Cache-Control": "public, max-age=300", // Cache for 5 minutes
        "Access-Control-Allow-Origin": "*",
      },
    });

  } catch (error) {
    console.error("Proxy error:", error);
    return NextResponse.json<ProxyResponse>(
      {
        html: "",
        css: "",
        baseUrl: "",
        title: "",
        success: false,
        error: error instanceof Error ? error.message : "Failed to fetch website"
      },
      { status: 500 }
    );
  }
}

export async function OPTIONS() {
  return new NextResponse(null, {
    status: 200,
    headers: {
      "Access-Control-Allow-Origin": "*",
      "Access-Control-Allow-Methods": "GET, OPTIONS",
      "Access-Control-Allow-Headers": "*",
    },
  });
}
