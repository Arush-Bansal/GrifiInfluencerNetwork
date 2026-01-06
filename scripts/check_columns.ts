
import { supabase } from "./src/integrations/supabase/client";

async function checkColumns() {
  const { data, error } = await supabase.from("profiles").select("*").limit(1);
  if (error) {
    console.error("Error fetching profile:", error);
    return;
  }
  if (data && data.length > 0) {
    console.log("Columns:", Object.keys(data[0]));
  } else {
    console.log("No data in profiles table to check columns.");
  }
}

checkColumns();
