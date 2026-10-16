import { NextResponse } from "next/server";
import { medicineRequestSchema } from "@/lib/validation";
export async function POST(request:Request) {
  const body = await request.json().catch(()=>null);
  const parsed = medicineRequestSchema.safeParse(body);
  if(!parsed.success) return NextResponse.json({error:"Invalid request data",details:parsed.error.flatten()}, {status:400});
  // Do not persist health-related data until authentication, database access, consent and retention are configured.
  return NextResponse.json({error:"Backend not configured",message:"This endpoint validates the request schema but does not store or route medicine requests. Configure Supabase and authorization before use."},{status:501});
}
export async function GET() {
  return NextResponse.json({error:"Authentication required",message:"Request listing is not available until Supabase auth and row-level policies are configured."},{status:401});
}
