import { createClient } from "@/lib/supabase/server";
export type AppRole = "patient" | "pharmacy" | "admin";
export async function getCurrentProfile() {
  const supabase = await createClient();
  const { data: { user }, error } = await supabase.auth.getUser();
  if(error || !user) return null;
  const { data: profile } = await supabase.from("profiles").select("id,full_name,role").eq("id",user.id).maybeSingle();
  return profile;
}
export async function requireRole(roles:AppRole[]) {
  const profile = await getCurrentProfile();
  if(!profile || !roles.includes(profile.role as AppRole)) throw new Error("Unauthorized");
  return profile;
}
