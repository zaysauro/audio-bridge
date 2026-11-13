import { handleUpload, type HandleUploadBody } from "@vercel/blob/client";
import { NextResponse } from "next/server";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Methods": "POST, OPTIONS",
  "Access-Control-Allow-Headers": "*",
  "Access-Control-Max-Age": "86400",
};

export function OPTIONS() {
  return new Response(null, { status: 204, headers: corsHeaders });
}

export async function POST(request: Request) {
  try {
    const body = (await request.json()) as HandleUploadBody;
    const result = await handleUpload({
      body,
      request,
      onBeforeGenerateToken: async () => ({
        allowedContentTypes: [
          "audio/mpeg",
          "audio/wav",
          "audio/x-wav",
          "audio/mp4",
          "audio/x-m4a",
          "audio/webm",
          "audio/ogg",
          "application/ogg",
          "audio/opus",
          "audio/amr",
          "audio/3gpp",
          "video/3gpp",
          "video/mp4",
          "video/webm",
          "application/octet-stream",
        ],
        maximumSizeInBytes: 25 * 1024 * 1024,
        addRandomSuffix: true,
      }),
      onUploadCompleted: async () => {},
    });
    return NextResponse.json(result, { headers: corsHeaders });
  } catch (error) {
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Upload inválido" },
      { status: 400, headers: corsHeaders },
    );
  }
}
