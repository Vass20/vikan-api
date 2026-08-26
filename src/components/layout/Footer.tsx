"use client";

import React from "react";
import Link from "next/link";
import { VikanLogo } from "./Navbar";
import { ShieldCheck, Lock, Heart, Award } from "lucide-react";

export const Footer: React.FC = () => {
  const currentYear = new Date().getFullYear();

  const openCookiePreferences = (e: React.MouseEvent) => {
    e.preventDefault();
    if (typeof window !== "undefined") {
      window.dispatchEvent(new CustomEvent("open-cookie-preferences"));
    }
  };

  return (
    <footer className="w-full bg-brand-navy text-[#E5DCD0] border-t border-brand-gold/20 pt-16 pb-8 font-sans">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-10 border-b border-border/10 pb-12">
          {/* Brand Info */}
          <div className="lg:col-span-2 flex flex-col gap-4">
            <VikanLogo imgClassName="h-20 md:h-26" className="text-[#F7F3EE]" />
            <p className="text-sm font-support text-muted-foreground/90 max-w-sm mt-3 leading-relaxed">
              Vikan Matrimony is the world's most elegant, trusted, and luxury-centric matchmaking portal. We celebrate relationships, traditional roots, and secure family alignments.
            </p>
            <div className="flex items-center gap-3.5 mt-4">
              <span className="p-2 rounded-full bg-[#1B3E69] text-brand-gold" title="100% Verified Profiles">
                <ShieldCheck className="h-5 w-5" />
              </span>
              <span className="p-2 rounded-full bg-[#1B3E69] text-brand-gold" title="Encrypted Connection">
                <Lock className="h-5 w-5" />
              </span>
              <span className="p-2 rounded-full bg-[#1B3E69] text-brand-gold" title="Elite Matchmaking">
                <Award className="h-5 w-5" />
              </span>
              <span className="p-2 rounded-full bg-[#1B3E69] text-brand-gold" title="Success Stories">
                <Heart className="h-5 w-5" />
              </span>
            </div>
          </div>

          {/* Column 2: Browse Religions */}
          <div>
            <h4 className="font-serif text-[#F7F3EE] text-base font-semibold tracking-wider mb-5">
              Religion Matches
            </h4>
            <ul className="space-y-2.5 text-sm font-support">
              {["Hindu Matrimony", "Muslim Matrimony", "Christian Matrimony"].map((item) => (
                <li key={item}>
                  <Link href="/search" className="hover:text-brand-gold transition-colors text-muted-foreground/95">
                    {item}
                  </Link>
                </li>
              ))}
            </ul>
          </div>
 
          {/* Column 3: Browse Communities */}
          <div>
            <h4 className="font-serif text-[#F7F3EE] text-base font-semibold tracking-wider mb-5">
              Elite Communities
            </h4>
            <ul className="space-y-2.5 text-sm font-support">
              {["Tamil Matches", "Brahmin Matches"].map((item) => (
                <li key={item}>
                  <Link href="/search" className="hover:text-brand-gold transition-colors text-muted-foreground/95">
                    {item}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Column 4: Quick Links */}
          <div>
            <h4 className="font-serif text-[#F7F3EE] text-base font-semibold tracking-wider mb-5">
              Vikan Premium
            </h4>
            <ul className="space-y-2.5 text-sm font-support">
              <li>
                <Link href="/membership" className="hover:text-brand-gold transition-colors text-muted-foreground/95">
                  Membership Plans
                </Link>
              </li>
              <li>
                <Link href="/search" className="hover:text-brand-gold transition-colors text-muted-foreground/95">
                  Advanced Search
                </Link>
              </li>
              <li>
                <Link href="/verification" className="hover:text-brand-gold transition-colors text-muted-foreground/95">
                  Profile Verification
                </Link>
              </li>
              <li>
                <Link href="/about" className="hover:text-brand-gold transition-colors text-muted-foreground/95">
                  About Us
                </Link>
              </li>
            </ul>
          </div>
        </div>

{/* Bottom copyright details */}
        <div className="flex flex-col md:flex-row items-center justify-between pt-8 text-xs text-muted-foreground/80 font-support">
          <div className="flex flex-col gap-2.5 text-center md:text-left">
            <span>
              &copy; {currentYear} Vikan Matrimony. All Rights Reserved. "Endless Bond. Perfect Match."
            </span>
            <div className="flex gap-4 justify-center md:justify-start">
              {/* Instagram */}
              <Link href="https://instagram.com" target="_blank" rel="noopener noreferrer" className="text-muted-foreground hover:text-brand-gold transition-colors" title="Instagram">
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="h-4 w-4">
                  <rect width="20" height="20" x="2" y="2" rx="5" ry="5" />
                  <path d="M16 11.37A4 4 0 1 1 12.63 8 4 4 0 0 1 16 11.37z" />
                  <line x1="17.5" x2="17.51" y1="6.5" y2="6.5" />
                </svg>
              </Link>
              {/* Facebook */}
              <Link href="https://facebook.com" target="_blank" rel="noopener noreferrer" className="text-muted-foreground hover:text-brand-gold transition-colors" title="Facebook">
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="h-4 w-4">
                  <path d="M18 2h-3a5 5 0 0 0-5 5v3H7v4h3v8h4v-8h3l1-4h-4V7a1 1 0 0 1 1-1h3z" />
                </svg>
              </Link>
              {/* Youtube */}
              <Link href="https://youtube.com" target="_blank" rel="noopener noreferrer" className="text-muted-foreground hover:text-brand-gold transition-colors" title="YouTube">
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="h-4 w-4">
                  <path d="M2.5 17a24.12 24.12 0 0 1 0-10 2 2 0 0 1 1.4-1.4 49.56 49.56 0 0 1 16.2 0A2 2 0 0 1 21.5 7a24.12 24.12 0 0 1 0 10 2 2 0 0 1-1.4 1.4 49.55 49.55 0 0 1-16.2 0A2 2 0 0 1 2.5 17z" />
                  <polygon points="10 15 15 12 10 9" fill="currentColor" />
                </svg>
              </Link>
              {/* X / Twitter */}
              <Link href="https://x.com" target="_blank" rel="noopener noreferrer" className="text-muted-foreground hover:text-brand-gold transition-colors" title="X (Twitter)">
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="h-4 w-4">
                  <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z" fill="currentColor" stroke="none" />
                </svg>
              </Link>
            </div>
          </div>
          <div className="flex gap-4 mt-4 md:mt-0">
            <Link href="/" className="hover:text-brand-gold">Terms of Service</Link>
            <Link href="/" className="hover:text-brand-gold">Privacy Policy</Link>
            <a href="#" onClick={openCookiePreferences} className="hover:text-brand-gold cursor-pointer">Cookie Preferences</a>
            <Link href="/contact" className="hover:text-brand-gold">Contact Support</Link>
          </div>
        </div>
      </div>
    </footer>
  );
};
