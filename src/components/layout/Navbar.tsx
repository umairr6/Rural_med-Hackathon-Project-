 "use client";
import Link from "next/link";
import { useState } from "react";
import { Menu, X, ArrowUpRight, Activity } from "lucide-react";

export function Navbar() {
  const [open, setOpen] = useState(false);
  const close = () => setOpen(false);
  return (
    <>
      <div className="announcement"><span className="announcement-dot" /> Building a more connected healthcare future for rural communities</div>
      <header className="site-header">
        <div className="container nav-inner">
          <Link href="/" className="brand" aria-label="RuralMed home">
            <span className="brand-mark"><Activity size={23} strokeWidth={2.6} /></span>
            <span className="brand-word">Rural<span>Med</span><small>HEALTHCARE, CLOSER TO HOME</small></span>
          </Link>
          <button className="mobile-menu-toggle" aria-label={open ? "Close navigation" : "Open navigation"} aria-expanded={open} onClick={() => setOpen(!open)}>{open ? <X size={22}/> : <Menu size={22}/>}</button>
          <nav className={`nav-links ${open ? "nav-open" : ""}`}>
            <Link href="/#how-it-works" onClick={close}>How it works</Link>
            <Link href="/#our-impact" onClick={close}>Our approach</Link>
            <Link href="/#faq" onClick={close}>FAQs</Link>
            <Link href="/contact" onClick={close}>Contact</Link>
            <Link className="button button-primary nav-cta" href="/find-medicines" onClick={close}>Find medicines <ArrowUpRight size={16}/></Link>
          </nav>
        </div>
      </header>
    </>
  );
}
