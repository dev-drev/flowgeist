import { createClient } from "@supabase/supabase-js";

const supabaseUrl = process.env.SUPABASE_URL!;
const supabaseAnonKey = process.env.SUPABASE_API_KEY!;

export const supabase = createClient(supabaseUrl, supabaseAnonKey);

// Tipi per le tabelle
export interface Track {
  id: number;
  title: string;
  duration: string;
  audio_file: string;
  waveform?: string;
  created_at: string;
  updated_at: string;
}

export interface NewTrack {
  title: string;
  duration: string;
  audio_file: string;
  waveform?: string;
}
