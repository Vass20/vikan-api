"use client";

import React from "react";
import Link from "next/link";
import { Navbar } from "@/components/layout/Navbar";
import { Footer } from "@/components/layout/Footer";
import { FileText, ShieldCheck, Mail, Phone, MapPin, ArrowLeft } from "lucide-react";

export default function TermsPage() {
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
              <FileText className="h-6 w-6" />
            </div>
            <h1 className="font-serif text-3xl sm:text-4xl font-bold text-brand-navy dark:text-foreground">
              Terms & Conditions
            </h1>
            <p className="text-xs font-support text-muted-foreground">
              Last Updated: September 4, 2026
            </p>
            <p className="text-sm font-support text-muted-foreground max-w-2xl mx-auto pt-2 border-t border-border/40">
              Welcome to Vikan Matrimony (&ldquo;Vikan Matrimony,&rdquo; &ldquo;we,&rdquo; &ldquo;us,&rdquo; or &ldquo;our&rdquo;). These Terms &amp; Conditions govern your use of <span className="text-brand-gold font-semibold">vikanmatrimony.in</span> and our related services.
            </p>
          </div>

          {/* Content Body */}
          <div className="bg-card border border-border/80 rounded-2xl p-6 sm:p-10 shadow-sm space-y-8 text-sm leading-relaxed font-support text-foreground/90">
            
            <section className="space-y-3">
              <h2 className="font-serif text-xl font-bold text-brand-navy dark:text-brand-gold flex items-center gap-2 border-b border-border/40 pb-2">
                1. ELIGIBILITY
              </h2>
              <p>Vikan Matrimony is intended for adults seeking matrimonial relationships.</p>
              <p>By creating an account, you confirm that:</p>
              <ul className="list-disc pl-5 space-y-1.5 text-muted-foreground">
                <li>You are legally eligible to use matrimonial services.</li>
                <li>The information you provide is accurate and not misleading.</li>
                <li>You will use the website for genuine matrimonial purposes.</li>
                <li>You will not create an account on behalf of another person without their knowledge and consent.</li>
              </ul>
            </section>

            <section className="space-y-3">
              <h2 className="font-serif text-xl font-bold text-brand-navy dark:text-brand-gold flex items-center gap-2 border-b border-border/40 pb-2">
                2. ACCOUNT REGISTRATION
              </h2>
              <p>To use certain features, you may need to create an account.</p>
              <p>You agree to:</p>
              <ul className="list-disc pl-5 space-y-1.5 text-muted-foreground">
                <li>Provide accurate and current information.</li>
                <li>Keep your login credentials confidential.</li>
                <li>Update your information when necessary.</li>
                <li>Notify us if you suspect unauthorized access to your account.</li>
              </ul>
              <p className="font-semibold text-brand-navy dark:text-foreground">You are responsible for activity carried out through your account.</p>
            </section>

            <section className="space-y-3">
              <h2 className="font-serif text-xl font-bold text-brand-navy dark:text-brand-gold flex items-center gap-2 border-b border-border/40 pb-2">
                3. MATRIMONY PROFILES
              </h2>
              <p>You may create a profile containing information such as your name, age, photographs, education, occupation, location, and personal preferences.</p>
              <p>You agree that:</p>
              <ul className="list-disc pl-5 space-y-1.5 text-muted-foreground">
                <li>Your profile information is truthful and not misleading.</li>
                <li>You have the right to upload and share photographs and other information.</li>
                <li>You will not upload another person’s photographs or impersonate someone.</li>
                <li>You will not include offensive, abusive, fraudulent, or inappropriate content.</li>
                <li>You will not use the website to advertise unrelated products or services.</li>
              </ul>
              <p className="text-muted-foreground italic">We may review, restrict, suspend, or remove profiles that violate these Terms.</p>
            </section>

            <section className="space-y-3">
              <h2 className="font-serif text-xl font-bold text-brand-navy dark:text-brand-gold flex items-center gap-2 border-b border-border/40 pb-2">
                4. PROFILE VERIFICATION
              </h2>
              <p>Where verification features are available, we may verify certain information or documents.</p>
              <p>Verification does not guarantee a person’s identity, character, background, intentions, or suitability for marriage.</p>
              <p className="bg-brand-gold/10 border border-brand-gold/30 p-3 rounded-xl text-xs font-semibold text-brand-navy dark:text-brand-gold">
                Members should independently verify information and exercise caution before making personal, financial, or matrimonial decisions.
              </p>
            </section>

            <section className="space-y-3">
              <h2 className="font-serif text-xl font-bold text-brand-navy dark:text-brand-gold flex items-center gap-2 border-b border-border/40 pb-2">
                5. INTERESTS AND COMMUNICATION
              </h2>
              <p>Vikan Matrimony may provide features such as:</p>
              <ul className="list-disc pl-5 space-y-1 text-muted-foreground">
                <li>Sending and receiving interest requests</li>
                <li>Browsing member profiles</li>
                <li>Chat and messaging</li>
                <li>Contact detail access, where available</li>
              </ul>
              <p>You agree to communicate respectfully and not use these features for harassment, spam, fraud, or inappropriate purposes.</p>
              <p>We do not guarantee that:</p>
              <ul className="list-disc pl-5 space-y-1 text-muted-foreground">
                <li>A member will respond to your interest or message.</li>
                <li>A particular profile will remain available.</li>
                <li>A conversation will result in a match or marriage.</li>
                <li>Any member’s information is completely accurate.</li>
              </ul>
            </section>

            <section className="space-y-3">
              <h2 className="font-serif text-xl font-bold text-brand-navy dark:text-brand-gold flex items-center gap-2 border-b border-border/40 pb-2">
                6. MEMBERSHIP PLANS
              </h2>
              <p>We may offer free and paid membership plans, including:</p>
              <ul className="list-disc pl-5 space-y-1 text-muted-foreground">
                <li>Free Member</li>
                <li>Silver Member</li>
                <li>Gold Member</li>
                <li>Diamond Member</li>
                <li>Royal Platinum</li>
              </ul>
              <p>Membership features, pricing, duration, and limits are displayed on the membership page.</p>
              <p>Paid plans may include features such as limited or unlimited chat, contact detail access, profile visibility benefits, profile boosts, and other premium features.</p>
            </section>

            <section className="space-y-3">
              <h2 className="font-serif text-xl font-bold text-brand-navy dark:text-brand-gold flex items-center gap-2 border-b border-border/40 pb-2">
                7. MEMBERSHIP DURATION AND LIMITS
              </h2>
              <p>Memberships are valid for the period stated at the time of purchase. The current membership durations are:</p>
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 my-2 text-center">
                <div className="p-3 bg-muted/40 rounded-xl border border-border/50">
                  <div className="font-bold text-brand-gold">Silver</div>
                  <div className="text-xs text-muted-foreground">1 Month</div>
                </div>
                <div className="p-3 bg-muted/40 rounded-xl border border-border/50">
                  <div className="font-bold text-brand-gold">Gold</div>
                  <div className="text-xs text-muted-foreground">3 Months</div>
                </div>
                <div className="p-3 bg-muted/40 rounded-xl border border-border/50">
                  <div className="font-bold text-brand-gold">Diamond</div>
                  <div className="text-xs text-muted-foreground">6 Months</div>
                </div>
                <div className="p-3 bg-muted/40 rounded-xl border border-border/50">
                  <div className="font-bold text-brand-gold">Royal Platinum</div>
                  <div className="text-xs text-muted-foreground">12 Months</div>
                </div>
              </div>
              <p className="text-xs text-muted-foreground">Membership benefits may expire when the membership period ends.</p>
            </section>

            <section className="space-y-3">
              <h2 className="font-serif text-xl font-bold text-brand-navy dark:text-brand-gold flex items-center gap-2 border-b border-border/40 pb-2">
                8. CONTACT DETAILS AND PRIVACY
              </h2>
              <p>Certain membership plans may allow access to contact details shared by other members.</p>
              <p>You agree to:</p>
              <ul className="list-disc pl-5 space-y-1 text-muted-foreground">
                <li>Use contact information only for genuine matrimonial purposes.</li>
                <li>Respect the privacy of other members.</li>
                <li>Not sell, publish, distribute, or misuse another member’s contact information.</li>
                <li>Not use contact details for spam, marketing, harassment, or unauthorized purposes.</li>
              </ul>
              <p>Please refer to our <Link href="/privacy" className="text-brand-gold font-semibold hover:underline">Privacy Policy</Link> for information about how personal data is collected and used.</p>
            </section>

            <section className="space-y-3">
              <h2 className="font-serif text-xl font-bold text-brand-navy dark:text-brand-gold flex items-center gap-2 border-b border-border/40 pb-2">
                9. PAYMENTS
              </h2>
              <p>Membership payments may be processed through third-party payment providers. You agree to provide accurate payment and billing information. Membership activation may depend on successful payment confirmation.</p>
            </section>

            <section className="space-y-3">
              <h2 className="font-serif text-xl font-bold text-brand-navy dark:text-brand-gold flex items-center gap-2 border-b border-border/40 pb-2">
                10. PROHIBITED ACTIVITIES
              </h2>
              <p>You must not:</p>
              <ul className="list-disc pl-5 space-y-1 text-muted-foreground">
                <li>Create fake or misleading profiles.</li>
                <li>Impersonate another person.</li>
                <li>Use the website for fraud or financial scams.</li>
                <li>Harass, threaten, or abuse other members.</li>
                <li>Send spam or unsolicited promotional messages.</li>
                <li>Attempt to access another member’s account.</li>
                <li>Copy, scrape, or misuse member information.</li>
                <li>Upload malicious software or harmful content.</li>
                <li>Use the website for unlawful activities.</li>
              </ul>
              <p className="text-destructive text-xs font-semibold">We may suspend or terminate accounts involved in prohibited activities.</p>
            </section>

            <section className="space-y-3">
              <h2 className="font-serif text-xl font-bold text-brand-navy dark:text-brand-gold flex items-center gap-2 border-b border-border/40 pb-2">
                11. ACCOUNT SUSPENSION OR TERMINATION
              </h2>
              <p>We may suspend, restrict, or terminate an account if you violate these Terms, provide false information, misuse the website, or if required by applicable law.</p>
            </section>

            <section className="space-y-3">
              <h2 className="font-serif text-xl font-bold text-brand-navy dark:text-brand-gold flex items-center gap-2 border-b border-border/40 pb-2">
                12. USER RESPONSIBILITY
              </h2>
              <p>Vikan Matrimony is a platform that helps members connect. You are responsible for your own decisions and interactions with other members.</p>
              <div className="bg-card border border-border p-4 rounded-xl space-y-2 text-xs text-muted-foreground">
                <p className="font-bold text-brand-navy dark:text-foreground">Recommended Safety Practices:</p>
                <ul className="list-disc pl-5 space-y-1">
                  <li>Verify a person’s identity independently.</li>
                  <li>Avoid sharing sensitive financial information.</li>
                  <li>Meet in safe and public places.</li>
                  <li>Inform trusted family members before meeting someone.</li>
                  <li>Exercise caution before making financial or matrimonial commitments.</li>
                </ul>
              </div>
            </section>

            <section className="space-y-3">
              <h2 className="font-serif text-xl font-bold text-brand-navy dark:text-brand-gold flex items-center gap-2 border-b border-border/40 pb-2">
                13. INTELLECTUAL PROPERTY
              </h2>
              <p>The website, including its design, branding, software, and original content, belongs to Vikan Matrimony or its respective owners. You may not copy, reproduce, modify, or distribute our website content without permission.</p>
            </section>

            <section className="space-y-3">
              <h2 className="font-serif text-xl font-bold text-brand-navy dark:text-brand-gold flex items-center gap-2 border-b border-border/40 pb-2">
                14. THIRD-PARTY SERVICES
              </h2>
              <p>Our website may use third-party services such as payment providers, hosting providers, analytics tools, or communication services, which are subject to their own terms.</p>
            </section>

            <section className="space-y-3">
              <h2 className="font-serif text-xl font-bold text-brand-navy dark:text-brand-gold flex items-center gap-2 border-b border-border/40 pb-2">
                15. DISCLAIMER
              </h2>
              <p>We provide the website and its services on an &ldquo;as available&rdquo; basis without warranties of uninterrupted availability, profile completeness, or guaranteed match success.</p>
            </section>

            <section className="space-y-3">
              <h2 className="font-serif text-xl font-bold text-brand-navy dark:text-brand-gold flex items-center gap-2 border-b border-border/40 pb-2">
                16. CHANGES TO THESE TERMS
              </h2>
              <p>We may update these Terms &amp; Conditions from time to time. Any changes will be posted on this page with a revised Last Updated date.</p>
            </section>

            {/* Contact Box */}
            <section className="space-y-4 pt-6 border-t border-border/60">
              <h2 className="font-serif text-xl font-bold text-brand-navy dark:text-brand-gold flex items-center gap-2">
                <ShieldCheck className="h-5 w-5 text-brand-gold" /> 17. CONTACT US
              </h2>
              <p className="text-xs text-muted-foreground">
                If you have questions regarding these Terms &amp; Conditions, please contact us:
              </p>
              
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 text-xs font-support pt-2">
                <div className="p-4 rounded-xl bg-muted/30 border border-border/40 space-y-1">
                  <div className="font-bold flex items-center gap-1.5 text-brand-gold">
                    <Mail className="h-4 w-4" /> Email
                  </div>
                  <a href="mailto:vikanmatrimony@gmail.com" className="text-muted-foreground hover:underline block truncate">
                    vikanmatrimony@gmail.com
                  </a>
                </div>

                <div className="p-4 rounded-xl bg-muted/30 border border-border/40 space-y-1">
                  <div className="font-bold flex items-center gap-1.5 text-brand-gold">
                    <Phone className="h-4 w-4" /> Phone
                  </div>
                  <a href="tel:+919787484864" className="text-muted-foreground hover:underline block">
                    +91 9787 484864
                  </a>
                </div>

                <div className="p-4 rounded-xl bg-muted/30 border border-border/40 space-y-1">
                  <div className="font-bold flex items-center gap-1.5 text-brand-gold">
                    <MapPin className="h-4 w-4" /> Address
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
