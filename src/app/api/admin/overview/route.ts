import { NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';
export async function GET(){
 let supabase;try{supabase=await createClient();}catch{return NextResponse.json({error:'Backend not configured'},{status:503});}
 const {data:{user},error:authError}=await supabase.auth.getUser();if(authError||!user)return NextResponse.json({error:'Authentication required'},{status:401});
 const {data:profile}=await supabase.from('profiles').select('role').eq('id',user.id).maybeSingle();if(profile?.role!=='admin')return NextResponse.json({error:'Administrator access required'},{status:403});
 const [orders, pharmacies, pending, delivered]=await Promise.all([
  supabase.from('orders').select('id',{count:'exact',head:true}),
  supabase.from('pharmacies').select('id',{count:'exact',head:true}),
  supabase.from('pharmacies').select('id',{count:'exact',head:true}).eq('verification_status','pending'),
  supabase.from('orders').select('id',{count:'exact',head:true}).eq('status','delivered'),
 ]);
 return NextResponse.json({orders:orders.count??0,pharmacies:pharmacies.count??0,pendingApplications:pending.count??0,deliveredOrders:delivered.count??0});
}
