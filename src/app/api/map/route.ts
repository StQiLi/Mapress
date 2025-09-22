import { NextRequest, NextResponse } from "next/server";
import { GrokToolCalling } from "@/lib/grok-tool-calling";
import { MapRequest, MapResponse } from "@/lib/schema";

export const runtime = "nodejs";

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const mapRequest: MapRequest = {
      prompt: body.prompt,
      recencyDays: body.recencyDays || 7,
      maxSources: body.maxSources || 8,
      depth: body.depth || 2
    };

    if (!mapRequest.prompt || typeof mapRequest.prompt !== 'string') {
      return NextResponse.json({ error: "prompt is required" }, { status: 400 });
    }

    const grokToolCalling = new GrokToolCalling();
    let mapResponse: MapResponse;
    
    try {
      mapResponse = await grokToolCalling.generateMap(mapRequest);
    } catch (toolCallingError) {
      try {
        mapResponse = await grokToolCalling.generateMapFallback(mapRequest);
      } catch (fallbackError) {
        mapResponse = {
          topic: mapRequest.prompt,
          generatedAt: new Date().toISOString(),
          depth: mapRequest.depth,
          nodes: {
            "error": {
              id: "error",
              title: "Generation Failed",
              summary: "Unable to generate topic map. Please try again later.",
              citations: []
            }
          },
          edges: []
        };
      }
    }

    if (!mapResponse.nodes || Object.keys(mapResponse.nodes).length === 0) {
      mapResponse.nodes = {
        "default": {
          id: "default",
          title: "No Content Found",
          summary: "No relevant content could be found for this topic.",
          citations: []
        }
      };
    }

    return NextResponse.json(mapResponse);

  } catch (error) {
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}

// Handle OPTIONS for CORS
export async function OPTIONS() {
  return new NextResponse(null, {
    status: 200,
    headers: {
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Methods': 'POST, OPTIONS',
      'Access-Control-Allow-Headers': 'Content-Type, Authorization',
    },
  });
}
