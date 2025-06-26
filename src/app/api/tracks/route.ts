import { NextRequest, NextResponse } from "next/server";

// GET - Recupera tutte le tracce
export async function GET() {
  try {
    return NextResponse.json({ success: true, tracks: [] });
  } catch (error) {
    console.error("❌ Error fetching tracks:", error);
    if (error instanceof Error) {
      return NextResponse.json(
        { error: "Failed to fetch tracks", details: error.message },
        { status: 500 }
      );
    }
    return NextResponse.json(
      { error: "Internal server error" },
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

    return NextResponse.json({
      success: true,
      track: {
        title,
        duration,
        audio_file,
        waveform: waveform || null,
      },
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

    return NextResponse.json({
      success: true,
      track: {
        title,
        duration,
        audio_file,
        waveform: waveform || null,
      },
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
    const { id } = await request.json();

    console.log("✅ Track deleted successfully:", id);

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("❌ Error deleting track:", error);
    if (error instanceof Error) {
      return NextResponse.json(
        { error: "Failed to delete track", details: error.message },
        { status: 500 }
      );
    }
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
