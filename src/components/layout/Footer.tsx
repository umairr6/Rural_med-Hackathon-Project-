import Link from "next/link";
import { ShieldCheck, Activity } from "lucide-react";

export function Footer() {
  return (
    <footer className="site-footer">
      <div className="container">
        <div className="footer-main">
          <div className="footer-brand">
            <Link href="/" className="brand brand-light">
              <span className="brand-mark"><Activity size={22}/></span>
              <span className="brand-word">Rural<span>Med</span><small>HEALTHCARE, CLOSER TO HOME</small></span>
            </Link>
            <p>Healthcare access, closer to home.</p>
            <span>Connecting rural communities with participating pharmacies through a simple, transparent process.</span>
          </div>
          <div className="footer-links">
            <div><strong>Explore</strong><Link href="/find-medicines">Find medicines</Link><Link href="/request-medicine">Request medicine</Link><Link href="/about">About RuralMed</Link></div>
            <div><strong>For partners</strong><Link href="/pharmacy/register">Register pharmacy</Link><Link href="/pharmacy/login">Pharmacy login</Link><Link href="/admin/login">Admin demo</Link><Link href="/contact">Contact</Link></div>
          </div>
        </div>
        <div className="safety-notice"><ShieldCheck size={19}/><p><strong>Important healthcare notice.</strong> RuralMed is not an emergency service and does not diagnose, prescribe or replace professional medical advice. A request is not a confirmed order. Pharmacy personnel must verify availability, prescription requirements, pricing and delivery. For emergencies, contact local emergency services.</p></div>
        <div className="footer-bottom"><span>© {new Date().getFullYear()} RuralMed. All rights reserved.</span><span>Designed for rural communities in Jammu & Kashmir.</span></div>
      </div>
    </footer>
  );
}
