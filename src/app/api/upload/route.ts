import { NextRequest, NextResponse } from "next/server";
import { supabase } from "@/lib/supabase";

export async function POST(request: NextRequest) {
  try {
    console.log("🚀 Starting file upload...");

    const formData = await request.formData();
    const file = formData.get("file") as File;
    const title = formData.get("title") as string;
    const duration = formData.get("duration") as string;

    console.log("📁 File info:", {
      name: file?.name,
      size: file?.size,
      type: file?.type,
    });

    if (!file) {
      console.error("❌ No file provided");
      return NextResponse.json({ error: "No file provided" }, { status: 400 });
    }

    // Validazione file audio
    if (!file.type.startsWith("audio/")) {
      console.error("❌ Invalid file type:", file.type);
      return NextResponse.json(
        { error: "File must be an audio file" },
        { status: 400 }
      );
    }

    // Genera nome file unico
    const fileExt = file.name.split(".").pop();
    const fileName = `${Date.now()}-${Math.random()
      .toString(36)
      .substring(2)}.${fileExt}`;
    const filePath = `audio/${fileName}`;

    console.log("📤 Uploading to path:", filePath);

    // Upload file su Supabase Storage
    const { data: uploadData, error: uploadError } = await supabase.storage
      .from("audio-files")
      .upload(filePath, file, {
        cacheControl: "3600",
        upsert: false,
      });

    if (uploadError) {
      console.error("❌ Upload error:", uploadError);
      return NextResponse.json(
        { error: "Failed to upload file", details: uploadError.message },
        { status: 500 }
      );
    }

    console.log("✅ File uploaded successfully:", uploadData);

    // Ottieni URL pubblico del file
    const { data: urlData } = supabase.storage
      .from("audio-files")
      .getPublicUrl(filePath);

    console.log("🔗 Public URL:", urlData.publicUrl);

    // Salva metadati nel database
    const { data: trackData, error: dbError } = await supabase
      .from("tracks")
      .insert([
        {
          title: title || file.name.replace(/\.[^/.]+$/, ""),
          duration: duration || "0:00",
          audio_file: urlData.publicUrl,
          waveform: null,
        },
      ])
      .select()
      .single();

    if (dbError) {
      console.error("❌ Database error:", dbError);
      return NextResponse.json(
        { error: "Failed to save track metadata", details: dbError.message },
        { status: 500 }
      );
    }

    console.log("✅ Track saved to database:", trackData);

    return NextResponse.json({
      success: true,
      track: trackData,
      fileUrl: urlData.publicUrl,
    });
  } catch (error) {
    console.error("❌ Error in upload:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
