import { NextRequest, NextResponse } from "next/server";

import { uploadToBlob } from "@/lib/blob";

export const maxDuration = 30; // Extend timeout for file uploads

/**
 * Handles file uploads to Vercel Blob Storage
 * Requires authentication
 */
export async function POST(req: NextRequest) {
  try {
    // Parse the multipart/form-data
    const formData = await req.formData();
    const files = formData.getAll("files") as File[];

    if (!files || files.length === 0) {
      return NextResponse.json({ error: "No files provided" }, { status: 400 });
    }

    // Process each file
    const uploadPromises = files.map(async (file) => {
      if (!file || !(file instanceof File)) {
        return null;
      }

      // Sanitize filename
      const originalName = file.name.replace(/[^a-zA-Z0-9.-]/g, "_");

      // Upload to Vercel Blob
      const url = await uploadToBlob(originalName, file);

      return {
        name: originalName,
        url,
        size: file.size,
        type: file.type,
      };
    });

    // Wait for all uploads to complete
    const uploadedFiles = await Promise.all(uploadPromises);
    const validFiles = uploadedFiles.filter((file) => file !== null);

    // Return file URLs
    return NextResponse.json({ files: validFiles });
  } catch (error) {
    console.error("Upload error:", error);

    return NextResponse.json(
      { error: "Failed to upload files" },
      { status: 500 },
    );
  }
}

// Export the POST handler directly
// The withRoleAuth middleware is used when calling the API
