// Replace with generated Supabase database types after your schema is deployed.
// Command: npx supabase gen types typescript --project-id YOUR_PROJECT_ID > src/types/database.ts
export type Json = string | number | boolean | null | { [key:string]: Json | undefined } | Json[];
export type Database = {
  public: {
    Tables: {
      profiles: { Row: { id:string; full_name:string|null; role:"patient"|"pharmacy"|"admin"; created_at:string }; Insert: { id:string; full_name?:string|null; role?:"patient"|"pharmacy"|"admin"; created_at?:string }; Update: { full_name?:string|null } };
      villages: { Row: { id:string; region:string; district:string; name:string; latitude:number|null; longitude:number|null }; Insert: { id?:string; region:string; district:string; name:string; latitude?:number|null; longitude?:number|null }; Update: Partial<{ region:string; district:string; name:string; latitude:number|null; longitude:number|null }> };
      pharmacies: { Row: { id:string; owner_id:string; name:string; licence_number:string; verification_status:string; is_active:boolean }; Insert: { id?:string; owner_id:string; name:string; licence_number:string; verification_status?:string; is_active?:boolean }; Update: Partial<{ name:string; licence_number:string; verification_status:string; is_active:boolean }> };
      orders: { Row: { id:string; patient_id:string; village_id:string|null; medicine_summary:string; status:string; created_at:string }; Insert: { id?:string; patient_id:string; village_id?:string|null; medicine_summary:string; status?:string }; Update: Partial<{ status:string; medicine_summary:string }> };
    };
    Views: Record<string, never>;
    Functions: Record<string, never>;
    Enums: Record<string, never>;
    CompositeTypes: Record<string, never>;
  };
};
