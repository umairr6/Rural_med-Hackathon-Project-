import { NextResponse } from "next/server";
import { quoteSchema } from "@/lib/validation";
export async function POST(request:Request) {
  const body = await request.json().catch(()=>null);
  const parsed = quoteSchema.safeParse(body);
  if(!parsed.success) return NextResponse.json({error:"Invalid quote data",details:parsed.error.flatten()},{status:400});
  return NextResponse.json({error:"Backend not configured",message:"Quote creation requires an authenticated, approved pharmacy and server-side authorization."},{status:501});
}
