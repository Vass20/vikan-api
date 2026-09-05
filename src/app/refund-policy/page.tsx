"use client";

import React from "react";
import Link from "next/link";
import { Navbar } from "@/components/layout/Navbar";
import { Footer } from "@/components/layout/Footer";
import { RefreshCcw, CheckCircle2, AlertCircle, Mail, Phone, MapPin, ArrowLeft } from "lucide-react";

export default function RefundPolicyPage() {
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
              <RefreshCcw className="h-6 w-6" />
            </div>
            <h1 className="font-serif text-3xl sm:text-4xl font-bold text-brand-navy dark:text-foreground">
              Refund &amp; Cancellation Policy
            </h1>
            <p className="text-xs font-support text-muted-foreground">
              Last Updated: September 4, 2026
            </p>
            <p className="text-sm font-support text-muted-foreground max-w-2xl mx-auto pt-2 border-t border-border/40">
              Thank you for choosing Vikan Matrimony (<span className="text-brand-gold font-semibold">vikanmatrimony.in</span>). This policy outlines the terms and conditions regarding membership payment refunds and service cancellations.
            </p>
          </div>

          {/* Content Body */}
          <div className="bg-card border border-border/80 rounded-2xl p-6 sm:p-10 shadow-sm space-y-8 text-sm leading-relaxed font-support text-foreground/90">
            
            <section className="space-y-3">
              <h2 className="font-serif text-xl font-bold text-brand-navy dark:text-brand-gold flex items-center gap-2 border-b border-border/40 pb-2">
                1. OVERVIEW &amp; DIGITAL SERVICE NATURE
              </h2>
              <p>Vikan Matrimony provides digital matrimonial matchmaking services, including access to member databases, direct messaging, profile visibility boosts, and contact information unlocking.</p>
              <p className="text-muted-foreground">
                Upon purchasing any paid membership tier (Silver, Gold, Diamond, or Royal Platinum), service benefits, feature unlocks, and digital permissions are activated immediately for your account.
              </p>
            </section>

            <section className="space-y-3">
              <h2 className="font-serif text-xl font-bold text-brand-navy dark:text-brand-gold flex items-center gap-2 border-b border-border/40 pb-2">
                2. NON-REFUNDABLE CIRCUMSTANCES
              </h2>
              <p>Except as explicitly provided in Section 3 below, all membership subscription payments made on Vikan Matrimony are <strong className="text-brand-gold font-semibold">final and non-refundable</strong>.</p>
              <p className="text-muted-foreground">Refunds will NOT be granted under the following circumstances:</p>
              <ul className="list-disc pl-5 space-y-1.5 text-muted-foreground">
                <li>Once your paid membership plan has been successfully activated and access to premium features or contact unlocks has been granted.</li>
                <li>If you change your mind after purchasing a membership plan or finding a match independently outside our platform.</li>
                <li>If other members do not accept or respond to your expressed interest requests or chat messages.</li>
                <li>If your account is suspended or terminated due to a violation of our <Link href="/terms" className="text-brand-gold font-semibold hover:underline">Terms &amp; Conditions</Link> or fraudulent conduct.</li>
                <li>For partially used membership validity periods.</li>
              </ul>
            </section>

            <section className="space-y-3">
              <h2 className="font-serif text-xl font-bold text-brand-navy dark:text-brand-gold flex items-center gap-2 border-b border-border/40 pb-2">
                3. ELIGIBLE REFUND EXCEPTIONS
              </h2>
              <p>We evaluate refund requests on a case-by-case basis under the following strictly eligible conditions:</p>
              
              <div className="space-y-3 pt-1">
                <div className="p-4 rounded-xl bg-emerald-500/10 border border-emerald-500/20 flex gap-3 items-start">
                  <CheckCircle2 className="h-5 w-5 text-emerald-500 shrink-0 mt-0.5" />
                  <div className="space-y-1 text-xs">
                    <strong className="text-foreground text-sm block">A. Technical Duplicate Payment Glitch</strong>
                    <p className="text-muted-foreground">
                      If your bank account or card was charged twice for a single transaction due to a payment gateway timeout or processing error.
                    </p>
                  </div>
                </div>

                <div className="p-4 rounded-xl bg-emerald-500/10 border border-emerald-500/20 flex gap-3 items-start">
                  <CheckCircle2 className="h-5 w-5 text-emerald-500 shrink-0 mt-0.5" />
                  <div className="space-y-1 text-xs">
                    <strong className="text-foreground text-sm block">B. Unactivated Membership Technical Failure</strong>
                    <p className="text-muted-foreground">
                      If payment was successfully deducted from your account, but your membership plan failed to activate due to a technical failure, and our support team is unable to activate your service within 7 business days of written notification.
                    </p>
                  </div>
                </div>
              </div>
            </section>

            <section className="space-y-3">
              <h2 className="font-serif text-xl font-bold text-brand-navy dark:text-brand-gold flex items-center gap-2 border-b border-border/40 pb-2">
                4. HOW TO REQUEST A REFUND
              </h2>
              <p>If you meet one of the eligible refund exceptions listed above, please follow these steps to submit a formal request:</p>
              <ol className="list-decimal pl-5 space-y-2 text-muted-foreground">
                <li>
                  Send an email to <a href="mailto:vikanmatrimony@gmail.com" className="text-brand-gold font-bold hover:underline">vikanmatrimony@gmail.com</a> within <strong>7 days</strong> of the transaction date.
                </li>
                <li>
                  Include your <strong>Registered Email Address</strong>, <strong>Mobile Number</strong>, <strong>Payment Gateway Transaction ID / Order ID</strong>, and a clear description of the issue.
                </li>
                <li>
                  Attach your bank/payment receipt or screenshot demonstrating the duplicate charge.
                </li>
              </ol>
            </section>

            <section className="space-y-3">
              <h2 className="font-serif text-xl font-bold text-brand-navy dark:text-brand-gold flex items-center gap-2 border-b border-border/40 pb-2">
                5. REFUND PROCESSING &amp; TIMELINES
              </h2>
              <p>Once your refund request is received and verified by our billing team:</p>
              <ul className="list-disc pl-5 space-y-1.5 text-muted-foreground">
                <li>We will inspect the transaction logs within <strong>48 business hours</strong> and notify you of the approval or rejection of your claim.</li>
                <li>If approved, the refund will be credited back to your original payment method (Debit Card, Credit Card, Net Banking, or UPI) within <strong>5 to 7 business days</strong> depending on your issuing bank.</li>
              </ul>
            </section>

            {/* Contact Box */}
            <section className="space-y-4 pt-6 border-t border-border/60">
              <h2 className="font-serif text-xl font-bold text-brand-navy dark:text-brand-gold flex items-center gap-2">
                <AlertCircle className="h-5 w-5 text-brand-gold" /> 6. NEED BILLING HELP?
              </h2>
              <p className="text-xs text-muted-foreground">
                If you have any questions regarding your membership billing or payment status, our support team is available to assist you:
              </p>
              
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 text-xs font-support pt-2">
                <div className="p-4 rounded-xl bg-muted/30 border border-border/40 space-y-1">
                  <div className="font-bold flex items-center gap-1.5 text-brand-gold">
                    <Mail className="h-4 w-4" /> Billing Support
                  </div>
                  <a href="mailto:vikanmatrimony@gmail.com" className="text-muted-foreground hover:underline block truncate">
                    vikanmatrimony@gmail.com
                  </a>
                </div>

                <div className="p-4 rounded-xl bg-muted/30 border border-border/40 space-y-1">
                  <div className="font-bold flex items-center gap-1.5 text-brand-gold">
                    <Phone className="h-4 w-4" /> Phone Support
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
