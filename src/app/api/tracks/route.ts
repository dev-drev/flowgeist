import { NextRequest, NextResponse } from "next/server";
import { supabase } from "@/lib/supabase";

// GET - Recupera tutte le tracce
export async function GET() {
  try {
    console.log("🔍 Fetching tracks from Supabase...");

    const { data, error } = await supabase
      .from("tracks")
      .select("*")
      .order("created_at", { ascending: false });

    if (error) {
      console.error("❌ Supabase error:", error);
      return NextResponse.json(
        { error: "Failed to fetch tracks", details: error.message },
        { status: 500 }
      );
    }

    console.log("✅ Tracks fetched successfully:", data?.length || 0, "tracks");
    return NextResponse.json({ tracks: data });
  } catch (error) {
    console.error("❌ Error in GET /api/tracks:", error);
    return NextResponse.json(
      { error: "Internal server error", details: error },
      { status: 500 }
    );
  }
}

// POST - Crea una nuova traccia
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { title, duration, audio_file, waveform } = body;

    // Validazione
    if (!title || !duration || !audio_file) {
      return NextResponse.json(
        { error: "Missing required fields" },
        { status: 400 }
      );
    }

    const { data, error } = await supabase
      .from("tracks")
      .insert([
        {
          title,
          duration,
          audio_file,
          waveform: waveform || null,
        },
      ])
      .select()
      .single();

    if (error) {
      console.error("Error creating track:", error);
      return NextResponse.json(
        { error: "Failed to create track" },
        { status: 500 }
      );
    }

    return NextResponse.json({
      success: true,
      track: data,
    });
  } catch (error) {
    console.error("Error in POST /api/tracks:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}

// PUT - Aggiorna una traccia esistente
export async function PUT(request: NextRequest) {
  try {
    const body = await request.json();
    const { id, title, duration, audio_file, waveform } = body;

    if (!id) {
      return NextResponse.json(
        { error: "Track ID is required" },
        { status: 400 }
      );
    }

    const { data, error } = await supabase
      .from("tracks")
      .update({
        title,
        duration,
        audio_file,
        waveform: waveform || null,
        updated_at: new Date().toISOString(),
      })
      .eq("id", id)
      .select()
      .single();

    if (error) {
      console.error("Error updating track:", error);
      return NextResponse.json(
        { error: "Failed to update track" },
        { status: 500 }
      );
    }

    return NextResponse.json({
      success: true,
      track: data,
    });
  } catch (error) {
    console.error("Error in PUT /api/tracks:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}

// DELETE - Elimina una traccia
export async function DELETE(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const id = searchParams.get("id");

    if (!id) {
      return NextResponse.json(
        { error: "Track ID is required" },
        { status: 400 }
      );
    }

    const { error } = await supabase.from("tracks").delete().eq("id", id);

    if (error) {
      console.error("Error deleting track:", error);
      return NextResponse.json(
        { error: "Failed to delete track" },
        { status: 500 }
      );
    }

    return NextResponse.json({
      success: true,
      message: "Track deleted successfully",
    });
  } catch (error) {
    console.error("Error in DELETE /api/tracks:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
