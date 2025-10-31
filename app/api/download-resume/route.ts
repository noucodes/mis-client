// app/api/download-resume/route.ts
import { NextRequest, NextResponse } from "next/server";
import { S3Client, GetObjectCommand } from "@aws-sdk/client-s3";

const s3Client = new S3Client({
  region: process.env.AWS_REGION || "ap-southeast-2",
  credentials: {
    accessKeyId: process.env.AWS_ACCESS_KEY_ID!,
    secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY!,
  },
});

export async function POST(request: NextRequest) {
  try {
    const { fileUrl } = await request.json();

    console.log("Received fileUrl:", fileUrl);

    if (!fileUrl) {
      return NextResponse.json(
        { error: "File URL is required" },
        { status: 400 }
      );
    }

    // Extract bucket and key from the S3 URL
    const url = new URL(fileUrl);
    const bucket = process.env.AWS_S3_BUCKET_NAME!;

    // Extract key from pathname (remove leading slash)
    let key = decodeURIComponent(url.pathname.substring(1));

    // If URL format is s3.region.amazonaws.com/bucket/key, remove bucket from key
    if (url.hostname.startsWith("s3.")) {
      const pathParts = url.pathname.split("/");
      key = decodeURIComponent(pathParts.slice(2).join("/")); // Skip empty string and bucket name
    }

    console.log("Extracted bucket:", bucket);
    console.log("Extracted key:", key);

    if (!bucket || !key) {
      return NextResponse.json(
        { error: "Invalid S3 URL format" },
        { status: 400 }
      );
    }

    // Get the file from S3
    const command = new GetObjectCommand({
      Bucket: bucket,
      Key: key,
    });

    const s3Response = await s3Client.send(command);

    if (!s3Response.Body) {
      throw new Error("No file content received from S3");
    }

    // Convert stream to buffer
    const chunks: Uint8Array[] = [];
    for await (const chunk of s3Response.Body as any) {
      chunks.push(chunk);
    }
    const buffer = Buffer.concat(chunks);

    // Get filename from key
    const filename = key.split("/").pop() || "resume.pdf";

    // Return file with proper headers
    return new NextResponse(buffer, {
      headers: {
        "Content-Type": s3Response.ContentType || "application/pdf",
        "Content-Disposition": `attachment; filename="${filename}"`,
        "Content-Length": buffer.length.toString(),
      },
    });
  } catch (error: any) {
    console.error("Error downloading file:", error);
    return NextResponse.json(
      { error: error.message || "Failed to download file" },
      { status: 500 }
    );
  }
}
