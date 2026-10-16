import Link from "next/link";
import { LayoutDashboard, ClipboardList, Store, ShieldCheck, PackageCheck } from "lucide-react";

export function Sidebar({ role = "pharmacy" }: { role?: "pharmacy" | "admin" | "patient" }) {
  const items = role === "admin"
    ? [{ href: "/admin/dashboard", label: "Overview", icon: LayoutDashboard }, { href: "/pharmacy/register", label: "Applications", icon: Store }]
    : role === "patient"
    ? [{ href: "/orders", label: "My requests", icon: ClipboardList }, { href: "/find-medicines", label: "Find medicines", icon: PackageCheck }]
    : [{ href: "/pharmacy/dashboard", label: "Requests", icon: ClipboardList }, { href: "/pharmacy/register", label: "Pharmacy profile", icon: Store }];
  return <aside className="panel stack" aria-label="Dashboard navigation">{items.map(({href,label,icon:Icon})=><Link className="page-link status-line" href={href} key={href}><Icon size={17}/>{label}</Link>)}<span className="help-text"><ShieldCheck size={14}/> Demo navigation. Production routes require server-side authorization.</span></aside>;
}
