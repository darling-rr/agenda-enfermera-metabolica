import { createClient } from "@supabase/supabase-js";

const supabaseUrl = "https://npcbabcgexgbwnkyrmoj.supabase.co";
const supabaseAnonKey = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im5wY2JhYmNnZXhnYndua3lybW9qIiwicm9sZSI6ImFub24iLCJpYXQiOjE3Nzc0MTg5NjAsImV4cCI6MjA5Mjk5NDk2MH0.X4cVKolzFQTRCgY81DUyeW42PvJ06YC92sLs-e0lOI8";

export const supabase = createClient(supabaseUrl, supabaseAnonKey);