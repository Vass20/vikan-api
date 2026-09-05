"use client";

import React from "react";
import Link from "next/link";
import { Navbar } from "@/components/layout/Navbar";
import { Footer } from "@/components/layout/Footer";
import { Shield, Lock, Eye, Mail, Phone, MapPin, ArrowLeft } from "lucide-react";

export default function PrivacyPolicyPage() {
  return (
    <>
      <Navbar />

      <main className="flex-1 bg-[#F7F3EE] dark:bg-[#081626] py-12 px-4 sm:px-6 lg:px-8 text-foreground min-h-screen">
        <div className="mx-auto max-w-4xl space-y-8">
          {/* Top Navigation / Breadcrumb */}
          <Link
            href="/"
            className="inline-flex items-center gap-2 text-xs font-semibold text-brand-gold hover:underline font-support"
          >
            <ArrowLeft className="h-4 w-4" /> Back to Home
          </Link>

          {/* Hero Header */}
          <div className="bg-card border border-border/80 rounded-2xl p-8 shadow-sm text-center space-y-3">
            <div className="mx-auto h-12 w-12 rounded-full bg-brand-gold/15 text-brand-gold flex items-center justify-center border border-brand-gold/30">
              <Shield className="h-6 w-6" />
            </div>
            <h1 className="font-serif text-3xl sm:text-4xl font-bold text-brand-navy dark:text-foreground">
              Privacy Policy
            </h1>
            <p className="text-xs font-support text-muted-foreground">
              Last Updated: September 4, 2026
            </p>
            <p className="text-sm font-support text-muted-foreground max-w-2xl mx-auto pt-2 border-t border-border/40">
              At Vikan Matrimony (<span className="text-brand-gold font-semibold">vikanmatrimony.in</span>), we value your trust and are committed to protecting your personal information and privacy rights.
            </p>
          </div>

          {/* Content Body */}
          <div className="bg-card border border-border/80 rounded-2xl p-6 sm:p-10 shadow-sm space-y-8 text-sm leading-relaxed font-support text-foreground/90">
            
            <section className="space-y-3">
              <h2 className="font-serif text-xl font-bold text-brand-navy dark:text-brand-gold flex items-center gap-2 border-b border-border/40 pb-2">
                1. INFORMATION WE COLLECT
              </h2>
              <p>To provide personalized matrimonial matchmaking services, we collect information you provide directly to us when registering or updating your profile:</p>
              <ul className="list-disc pl-5 space-y-1.5 text-muted-foreground">
                <li><strong className="text-foreground">Basic Profile Data:</strong> Full Name, Gender, Date of Birth, Age, Height, Religion, Caste/Community, Mother Tongue, Marital Status, City, State, and Country.</li>
                <li><strong className="text-foreground">Contact Details:</strong> Mobile Number, Email Address, and Postal Address.</li>
                <li><strong className="text-foreground">Educational &amp; Professional Info:</strong> Highest Qualification, Occupation, Annual Income, and Employment Sector.</li>
                <li><strong className="text-foreground">Personal Media &amp; Horoscope:</strong> Profile Photos, Gallery Images, About Me bio, and Horoscope / Kundali details.</li>
                <li><strong className="text-foreground">Verification Documents:</strong> Government-issued Photo ID (Aadhaar, Passport, Driving License) submitted optionally for profile verification badges.</li>
                <li><strong className="text-foreground">Payment Data:</strong> Transaction ID and payment reference numbers processed securely via third-party gateways (e.g. Razorpay). We do not store raw credit card numbers or UPI PINs.</li>
              </ul>
            </section>

            <section className="space-y-3">
              <h2 className="font-serif text-xl font-bold text-brand-navy dark:text-brand-gold flex items-center gap-2 border-b border-border/40 pb-2">
                2. HOW WE USE YOUR INFORMATION
              </h2>
              <p>We use the collected information for the following specific purposes:</p>
              <ul className="list-disc pl-5 space-y-1.5 text-muted-foreground">
                <li>Displaying your matrimony profile to other verified members seeking prospective life partners.</li>
                <li>Calculating compatibility match scores based on age, religion, community, education, and location.</li>
                <li>Enabling communication features such as interest requests, mutual chat, and contact detail sharing.</li>
                <li>Verifying profile authenticity to maintain a safe, fraud-free matrimonial platform.</li>
                <li>Processing membership subscription upgrades and issuing activation notifications.</li>
                <li>Providing customer support and sending critical account security alerts.</li>
              </ul>
            </section>

            <section className="space-y-3">
              <h2 className="font-serif text-xl font-bold text-brand-navy dark:text-brand-gold flex items-center gap-2 border-b border-border/40 pb-2">
                3. INFORMATION SHARING &amp; VISIBILITY CONTROLS
              </h2>
              <p>Your profile information is visible to registered members on Vikan Matrimony for matchmaking purposes.</p>
              <div className="bg-brand-gold/10 border border-brand-gold/30 p-4 rounded-xl space-y-2 text-xs">
                <p className="font-bold text-brand-navy dark:text-brand-gold flex items-center gap-1.5">
                  <Lock className="h-4 w-4" /> We Never Sell Your Data
                </p>
                <p className="text-muted-foreground">
                  Vikan Matrimony strictly does NOT sell, rent, trade, or commercialize your personal information to third-party advertisers or marketing agencies.
                </p>
              </div>
              <p className="text-muted-foreground pt-1">We may share information only in the following limited circumstances:</p>
              <ul className="list-disc pl-5 space-y-1 text-muted-foreground">
                <li><strong className="text-foreground">With Other Members:</strong> Basic profile, photos, and preferences are visible to members. Contact details are revealed only according to your membership plan and consent.</li>
                <li><strong className="text-foreground">Service Providers:</strong> Trusted third-party partners (such as payment gateways, SMS/Email delivery providers, and cloud hosting) acting on our behalf.</li>
                <li><strong className="text-foreground">Legal Obligations:</strong> When required by Indian law enforcement, court order, or government authority.</li>
              </ul>
            </section>

            <section className="space-y-3">
              <h2 className="font-serif text-xl font-bold text-brand-navy dark:text-brand-gold flex items-center gap-2 border-b border-border/40 pb-2">
                4. DATA SECURITY &amp; PROTECTION
              </h2>
              <p>We implement industry-standard administrative, technical, and physical security measures to safeguard your personal data:</p>
              <ul className="list-disc pl-5 space-y-1 text-muted-foreground">
                <li>HTTPS SSL encryption for all web traffic between your browser and our servers.</li>
                <li>Secure database storage hosted on protected Linux VPS infrastructure.</li>
                <li>Restricted administrative access with multi-factor authentication.</li>
                <li>Automated monitoring and firewalls to prevent unauthorized access or data breaches.</li>
              </ul>
            </section>

            <section className="space-y-3">
              <h2 className="font-serif text-xl font-bold text-brand-navy dark:text-brand-gold flex items-center gap-2 border-b border-border/40 pb-2">
                5. YOUR PRIVACY RIGHTS &amp; CHOICES
              </h2>
              <p>You maintain full control over your personal data on Vikan Matrimony:</p>
              <ul className="list-disc pl-5 space-y-1.5 text-muted-foreground">
                <li><strong className="text-foreground">Edit &amp; Update:</strong> Modify your profile details, bio, photos, and preferences anytime in your Profile Settings.</li>
                <li><strong className="text-foreground">Photo Privacy:</strong> Choose to restrict secondary gallery photos or lock visibility.</li>
                <li><strong className="text-foreground">Account Deletion:</strong> You may request profile deletion or account deactivation by emailing support. Upon deletion, your profile will be removed from public search.</li>
              </ul>
            </section>

            <section className="space-y-3">
              <h2 className="font-serif text-xl font-bold text-brand-navy dark:text-brand-gold flex items-center gap-2 border-b border-border/40 pb-2">
                6. COOKIES &amp; TRACKING
              </h2>
              <p>We use session cookies and local storage tokens to keep you logged in, save your dark/light theme preferences, and maintain website security. You can customize cookie preferences via the Cookie Preferences link in our website footer.</p>
            </section>

            <section className="space-y-3">
              <h2 className="font-serif text-xl font-bold text-brand-navy dark:text-brand-gold flex items-center gap-2 border-b border-border/40 pb-2">
                7. CHANGES TO THIS PRIVACY POLICY
              </h2>
              <p>We may update this Privacy Policy periodically to reflect changes in our practices or applicable legal requirements. The updated version will be indicated by the &ldquo;Last Updated&rdquo; date at the top of this page.</p>
            </section>

            {/* Contact Box */}
            <section className="space-y-4 pt-6 border-t border-border/60">
              <h2 className="font-serif text-xl font-bold text-brand-navy dark:text-brand-gold flex items-center gap-2">
                <Eye className="h-5 w-5 text-brand-gold" /> 8. GRIEVANCE OFFICER &amp; CONTACT US
              </h2>
              <p className="text-xs text-muted-foreground">
                If you have questions, concerns, or privacy grievances regarding your personal data, please reach out to our Grievance Officer:
              </p>
              
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 text-xs font-support pt-2">
                <div className="p-4 rounded-xl bg-muted/30 border border-border/40 space-y-1">
                  <div className="font-bold flex items-center gap-1.5 text-brand-gold">
                    <Mail className="h-4 w-4" /> Email Support
                  </div>
                  <a href="mailto:vikanmatrimony@gmail.com" className="text-muted-foreground hover:underline block truncate">
                    vikanmatrimony@gmail.com
                  </a>
                </div>

                <div className="p-4 rounded-xl bg-muted/30 border border-border/40 space-y-1">
                  <div className="font-bold flex items-center gap-1.5 text-brand-gold">
                    <Phone className="h-4 w-4" /> Helpline
                  </div>
                  <a href="tel:+919787484864" className="text-muted-foreground hover:underline block">
                    +91 9787 484864
                  </a>
                </div>

                <div className="p-4 rounded-xl bg-muted/30 border border-border/40 space-y-1">
                  <div className="font-bold flex items-center gap-1.5 text-brand-gold">
                    <MapPin className="h-4 w-4" /> Office Address
                  </div>
                  <p className="text-muted-foreground text-[11px]">
                    36 E, C Block, Srikrishna Nagar, Chidambaram Main Road, Jayankondam, Ariyalur, TN – 621802
                  </p>
                </div>
              </div>
            </section>

          </div>
        </div>
      </main>

      <Footer />
    </>
  );
}
