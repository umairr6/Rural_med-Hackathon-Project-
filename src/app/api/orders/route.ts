import { NextResponse } from "next/server";
export async function GET() {
  return NextResponse.json({error:"Authentication required",message:"Order data is private and requires an authenticated patient, pharmacy-scoped authorization or admin role."},{status:401});
}
export async function PATCH() {
  return NextResponse.json({error:"Backend not configured",message:"Order status transitions must be validated server-side after authentication and pharmacy ownership checks."},{status:501});
}
