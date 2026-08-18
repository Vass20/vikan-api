"use client";

import React from "react";
import { motion } from "framer-motion";
import { Navbar } from "@/components/layout/Navbar";
import { Footer } from "@/components/layout/Footer";
import { Button } from "@/components/ui/button";
import Link from "next/link";
import { ShieldCheck, Heart, Award, Sparkles, Compass, Eye, Users, TrendingUp } from "lucide-react";

export default function AboutPage() {
  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.15,
      },
    },
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 30 },
    visible: {
      opacity: 1,
      y: 0,
      transition: { type: "spring" as const, stiffness: 70, damping: 16 },
    },
  };

  return (
    <>
      <Navbar />

      <main className="flex-grow bg-[#F7F3EE] dark:bg-[#071321] text-foreground font-sans">
        
        {/* Section 1: Hero Header */}
        <section className="relative min-h-[50vh] flex items-center justify-center bg-brand-navy text-[#F7F3EE] overflow-hidden border-b border-brand-gold/15">
          {/* Faded background image */}
          <div 
            className="absolute inset-0 z-0 bg-cover bg-center opacity-[0.08] mix-blend-luminosity"
            style={{ 
              backgroundImage: `url('https://images.unsplash.com/photo-1519741497674-611481863552?w=1600&auto=format&fit=crop&q=80')`,
            }} 
          />
          {/* Radial gold-navy gradient */}
          <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,_var(--tw-gradient-stops))] from-[#133A69]/80 via-brand-navy/95 to-[#061426] z-0" />
          
          <div className="relative z-10 text-center px-4 max-w-3xl mx-auto mt-8">
            <motion.span 
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6 }}
              className="font-support text-xs font-bold text-brand-gold uppercase tracking-widest block mb-4"
            >
              Discover Vikan
            </motion.span>
            <motion.h1 
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8, delay: 0.1 }}
              className="font-serif text-4xl md:text-6xl font-bold tracking-tight text-white"
            >
              Crafting Lifelong<br />
              <span className="text-brand-gold italic font-normal">Endless Bonds</span>
            </motion.h1>
            <motion.p 
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8, delay: 0.2 }}
              className="mt-6 text-sm sm:text-base text-[#E5DCD0]/90 font-support leading-relaxed max-w-xl mx-auto"
            >
              Vikan Matrimony is a premium, family-first matchmaking platform built on absolute trust, heritage, and luxury interactions.
            </motion.p>
          </div>
        </section>

        {/* Decorative Divider */}
        <div className="w-full flex justify-center py-2 px-4 overflow-hidden my-0">
          <img 
            src="/couple-divider.png" 
            alt="Vikan Motif" 
            className="w-full max-w-lg h-auto object-contain" 
          />
        </div>

        {/* Section 2: Our Philosophy & Values */}
        <section className="py-16 mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="text-center max-w-2xl mx-auto mb-16">
            <span className="font-support text-xs font-bold text-brand-gold uppercase tracking-widest block mb-3">
              Our Compass
            </span>
            <h2 className="font-serif text-3xl md:text-4xl font-bold text-brand-navy dark:text-foreground">
              Built On Integrity & Customization
            </h2>
            <p className="text-sm text-muted-foreground font-support mt-4">
              We understand that marriage is a coming together of two individuals, their traditions, and their families.
            </p>
          </div>

          <motion.div 
            variants={containerVariants}
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, margin: "-100px" }}
            className="grid grid-cols-1 md:grid-cols-3 gap-8"
          >
            {/* Value 1: Absolute Discretion */}
            <motion.div variants={itemVariants} className="bg-white dark:bg-[#0A1D33] p-8 rounded-3xl border border-border/40 dark:border-border/10 shadow-sm flex flex-col items-start gap-4">
              <span className="p-3.5 rounded-2xl bg-[#F7F3EE] dark:bg-brand-navy/30 text-brand-gold">
                <ShieldCheck className="h-6 w-6" />
              </span>
              <h3 className="font-serif text-xl font-bold text-brand-navy dark:text-foreground mt-2">
                Absolute Privacy
              </h3>
              <p className="text-sm text-muted-foreground font-support leading-relaxed">
                Vikan keeps your profile private from searches until you authorize access. Control phone visibility, document viewing, and photos dynamically.
              </p>
            </motion.div>

            {/* Value 2: Handpicked Selections */}
            <motion.div variants={itemVariants} className="bg-white dark:bg-[#0A1D33] p-8 rounded-3xl border border-border/40 dark:border-border/10 shadow-sm flex flex-col items-start gap-4">
              <span className="p-3.5 rounded-2xl bg-[#F7F3EE] dark:bg-brand-navy/30 text-brand-gold">
                <Sparkles className="h-6 w-6" />
              </span>
              <h3 className="font-serif text-xl font-bold text-brand-navy dark:text-foreground mt-2">
                Handpicked Matches
              </h3>
              <p className="text-sm text-muted-foreground font-support leading-relaxed">
                We focus on curated matching, bypassing generic algorithms. Discover profiles with verified details, shared cultural alignment, and life goals.
              </p>
            </motion.div>

            {/* Value 3: Family Focused */}
            <motion.div variants={itemVariants} className="bg-white dark:bg-[#0A1D33] p-8 rounded-3xl border border-border/40 dark:border-border/10 shadow-sm flex flex-col items-start gap-4">
              <span className="p-3.5 rounded-2xl bg-[#F7F3EE] dark:bg-brand-navy/30 text-brand-gold">
                <Users className="h-6 w-6" />
              </span>
              <h3 className="font-serif text-xl font-bold text-brand-navy dark:text-foreground mt-2">
                Family Alignment
              </h3>
              <p className="text-sm text-muted-foreground font-support leading-relaxed">
                Our Family Dashboard enables parents and siblings to co-manage the profile, chat with prospective in-laws, and align values with total peace of mind.
              </p>
            </motion.div>
          </motion.div>
        </section>

        {/* Why Vikan Matrimony? Section (Startup Stats) */}
        <section className="py-20 bg-[#F9F8F6] dark:bg-brand-navy/10 border-y border-border/40 dark:border-border/10">
          <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
            <div className="text-center max-w-3xl mx-auto mb-16">
              <span className="font-support text-xs font-bold text-brand-gold uppercase tracking-widest block mb-3">
                Overview
              </span>
              <h2 className="font-serif text-3xl md:text-4xl font-bold text-brand-navy dark:text-foreground">
                Why Vikan Matrimony?
              </h2>
              <p className="text-xs text-muted-foreground font-support mt-2 max-w-md mx-auto">
                A modern matchmaking startup built on absolute security, curated elite circles, and premium family alignments.
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-4 gap-8 md:divide-x divide-brand-gold/15">
              {/* Stat 1 */}
              <div className="flex flex-col items-center text-center px-4">
                <div className="p-4 rounded-full bg-brand-gold/5 border border-brand-gold/15 text-brand-gold mb-5">
                  <ShieldCheck className="h-7 w-7" />
                </div>
                <strong className="font-serif text-2xl md:text-3xl font-bold text-brand-gold">
                  100%
                </strong>
                <span className="text-xs font-bold uppercase tracking-widest text-foreground/90 mt-1 font-sans">
                  ID Verified Profiles
                </span>
                <p className="text-[11px] text-muted-foreground font-support mt-3 leading-relaxed max-w-[200px]">
                  Strict selfie face scan and government ID moderation ensure absolute presence authenticity.
                </p>
              </div>

              {/* Stat 2 */}
              <div className="flex flex-col items-center text-center px-4 md:pl-8">
                <div className="p-4 rounded-full bg-brand-gold/5 border border-brand-gold/15 text-brand-gold mb-5">
                  <Users className="h-7 w-7" />
                </div>
                <strong className="font-serif text-2xl md:text-3xl font-bold text-brand-gold">
                  5,000+
                </strong>
                <span className="text-xs font-bold uppercase tracking-widest text-foreground/90 mt-1 font-sans">
                  Active Elite Seekers
                </span>
                <p className="text-[11px] text-muted-foreground font-support mt-3 leading-relaxed max-w-[200px]">
                  A premium circle of educated professionals joining daily from major urban centers.
                </p>
              </div>

              {/* Stat 3 */}
              <div className="flex flex-col items-center text-center px-4 md:pl-8">
                <div className="p-4 rounded-full bg-brand-gold/5 border border-brand-gold/15 text-brand-gold mb-5">
                  <TrendingUp className="h-7 w-7" />
                </div>
                <strong className="font-serif text-2xl md:text-3xl font-bold text-brand-gold">
                  500+
                </strong>
                <span className="text-xs font-bold uppercase tracking-widest text-foreground/90 mt-1 font-sans">
                  Daily Interactions
                </span>
                <p className="text-[11px] text-muted-foreground font-support mt-3 leading-relaxed max-w-[200px]">
                  High-intent members browsing profiles and initiating conversations every single day.
                </p>
              </div>

              {/* Stat 4 */}
              <div className="flex flex-col items-center text-center px-4 md:pl-8">
                <div className="p-4 rounded-full bg-brand-gold/5 border border-brand-gold/15 text-brand-gold mb-5">
                  <Heart className="h-7 w-7 fill-current" />
                </div>
                <strong className="font-serif text-2xl md:text-3xl font-bold text-brand-gold">
                  50+
                </strong>
                <span className="text-xs font-bold uppercase tracking-widest text-foreground/90 mt-1 font-sans">
                  Happy Unions
                </span>
                <p className="text-[11px] text-muted-foreground font-support mt-3 leading-relaxed max-w-[200px]">
                  Already facilitating successful introductions and family alignments in our first few months.
                </p>
              </div>
            </div>
          </div>
        </section>

        {/* Section 3: The Editorial Story (Visual & Text Split) */}
        <section className="py-20 bg-card border-b border-border/40 dark:border-border/10">
          <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-center">
              
              {/* Left Column: Premium editorial photo */}
              <motion.div 
                initial={{ opacity: 0, x: -30 }}
                whileInView={{ opacity: 1, x: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.8 }}
                className="lg:col-span-5 aspect-[4/5] rounded-3xl overflow-hidden relative shadow-lg bg-muted"
              >
                <img 
                  src="https://images.unsplash.com/photo-1583939003579-730e3918a45a?w=800&auto=format&fit=crop&q=80" 
                  alt="Traditional Indian wedding ceremony couple" 
                  className="w-full h-full object-cover"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-brand-navy/65 via-transparent to-transparent" />
                <div className="absolute bottom-6 left-6 text-[#F7F3EE]">
                  <span className="font-serif text-2xl font-bold block">Vikan Heritage</span>
                  <span className="text-xs text-brand-gold tracking-widest font-support uppercase">Honoring Roots, Building Futures</span>
                </div>
              </motion.div>

              {/* Right Column: Narrative content */}
              <motion.div 
                initial={{ opacity: 0, x: 30 }}
                whileInView={{ opacity: 1, x: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.8, delay: 0.2 }}
                className="lg:col-span-7 text-left"
              >
                <span className="font-support text-xs font-bold text-brand-gold uppercase tracking-widest block mb-3">
                  Our Story
                </span>
                <h2 className="font-serif text-3xl md:text-5xl font-semibold tracking-tight text-brand-navy dark:text-foreground leading-tight">
                  Bringing Grace Back to Matchmaking
                </h2>
                <div className="mt-6 space-y-5 text-sm sm:text-base text-muted-foreground/90 font-support leading-relaxed">
                  <p>
                    Vikan was founded on a simple insight: finding a life partner is a deeply spiritual and personal journey that deserves a level of respect, security, and elegance that generic platforms ignore.
                  </p>
                  <p>
                    We decided to craft an environment that does away with mass listings, random spamming, and unverified data. By introducing features like 100% ID Verified profiles, advanced face matching verification, and a co-coordinated Family Dashboard, we provide a protected haven for families seeking true commitment.
                  </p>
                  <p className="font-serif text-brand-navy dark:text-foreground font-semibold italic border-l-2 border-brand-gold pl-4 mt-2">
                    "We do not count swipes. We celebrate matches, traditional alignments, and the promise of a lifelong beautiful journey."
                  </p>
                </div>

                <div className="mt-8 flex flex-wrap gap-6 items-center">
                  <div className="flex flex-col gap-0.5">
                    <span className="font-serif text-3xl font-bold text-brand-gold">100%</span>
                    <span className="text-[10px] uppercase font-support tracking-wider text-muted-foreground">ID Verified Profiles</span>
                  </div>
                  <div className="w-px h-10 bg-border/60" />
                  <div className="flex flex-col gap-0.5">
                    <span className="font-serif text-3xl font-bold text-brand-gold">Elite</span>
                    <span className="text-[10px] uppercase font-support tracking-wider text-muted-foreground">Matchmaking Circles</span>
                  </div>
                  <div className="w-px h-10 bg-border/60" />
                  <div className="flex flex-col gap-0.5">
                    <span className="font-serif text-3xl font-bold text-brand-gold">24/7</span>
                    <span className="text-[10px] uppercase font-support tracking-wider text-muted-foreground">Family Concierge Support</span>
                  </div>
                </div>
              </motion.div>

            </div>
          </div>
        </section>

        {/* Section 4: Pillars of Trust */}
        <section className="py-24 mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 text-center">
          <div className="max-w-2xl mx-auto mb-16">
            <span className="font-support text-xs font-bold text-brand-gold uppercase tracking-widest block mb-3">
              Security
            </span>
            <h2 className="font-serif text-3xl md:text-4xl font-bold text-brand-navy dark:text-foreground">
              Pillars of Absolute Trust
            </h2>
            <p className="text-sm text-muted-foreground font-support mt-4">
              Your security is our absolute highest priority. Explore our core safety structures.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {/* Pillar 1 */}
            <div className="bg-white dark:bg-[#0A1D33] p-6 rounded-2xl border border-border/40 dark:border-border/10 shadow-sm flex flex-col items-center text-center">
              <span className="p-3 bg-green-50 dark:bg-green-950/20 text-green-600 dark:text-green-400 rounded-full mb-4">
                <ShieldCheck className="h-5 w-5" />
              </span>
              <h4 className="font-serif text-base font-bold text-brand-navy dark:text-foreground">
                Document Verification
              </h4>
              <p className="text-xs text-muted-foreground mt-2 font-support leading-relaxed">
                Profiles undergo mandatory document vetting (Aadhaar, Passport, PAN, or employment details).
              </p>
            </div>

            {/* Pillar 2 */}
            <div className="bg-white dark:bg-[#0A1D33] p-6 rounded-2xl border border-border/40 dark:border-border/10 shadow-sm flex flex-col items-center text-center">
              <span className="p-3 bg-brand-gold/10 text-brand-gold rounded-full mb-4">
                <Award className="h-5 w-5" />
              </span>
              <h4 className="font-serif text-base font-bold text-brand-navy dark:text-foreground">
                Face Match Verification
              </h4>
              <p className="text-xs text-muted-foreground mt-2 font-support leading-relaxed">
                Live camera verification compares matching photos to ensure 100% presence authenticity.
              </p>
            </div>

            {/* Pillar 3 */}
            <div className="bg-white dark:bg-[#0A1D33] p-6 rounded-2xl border border-border/40 dark:border-border/10 shadow-sm flex flex-col items-center text-center">
              <span className="p-3 bg-[#E5DCD0] dark:bg-brand-navy/30 text-brand-navy dark:text-brand-gold rounded-full mb-4">
                <Eye className="h-5 w-5" />
              </span>
              <h4 className="font-serif text-base font-bold text-brand-navy dark:text-foreground">
                Spam Shielding
              </h4>
              <p className="text-xs text-muted-foreground mt-2 font-support leading-relaxed">
                Advanced limits block automated bulk invites or unsolicited calls, keeping interactions safe.
              </p>
            </div>

            {/* Pillar 4 */}
            <div className="bg-white dark:bg-[#0A1D33] p-6 rounded-2xl border border-border/40 dark:border-border/10 shadow-sm flex flex-col items-center text-center">
              <span className="p-3 bg-[#E5DCD0] dark:bg-brand-navy/30 text-brand-navy dark:text-brand-gold rounded-full mb-4">
                <Heart className="h-5 w-5" />
              </span>
              <h4 className="font-serif text-base font-bold text-brand-navy dark:text-foreground">
                Curated Recommendations
              </h4>
              <p className="text-xs text-muted-foreground mt-2 font-support leading-relaxed">
                Our matchmaking team handpicks connections aligned to your preferences.
              </p>
            </div>
          </div>
        </section>

        {/* Section 5: Register CTA */}
        <section className="py-20 bg-brand-navy text-[#F7F3EE] relative border-t border-brand-gold/15 overflow-hidden">
          {/* Faded Background Photo */}
          <div 
            className="absolute inset-0 z-0 bg-cover bg-center opacity-[0.06] mix-blend-luminosity"
            style={{ 
              backgroundImage: `url('https://images.unsplash.com/photo-1519741497674-611481863552?w=1200&auto=format&fit=crop&q=80')`,
            }} 
          />
          <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_bottom_right,_var(--tw-gradient-stops))] from-[#17467C]/90 via-brand-navy/95 to-[#051121] z-0" />
          <div className="relative mx-auto max-w-4xl px-4 sm:px-6 lg:px-8 text-center z-10">
            <h2 className="font-serif text-3xl md:text-5xl font-semibold tracking-tight leading-tight">
              Begin Your Story of a<span className="text-brand-gold font-bold"> Lifetime</span>
            </h2>
            <p className="text-sm text-[#E5DCD0]/90 font-support mt-4 max-w-xl mx-auto leading-relaxed">
              Create your complimentary profile today, explore handpicked profiles, and start matching with true dignity.
            </p>
            <div className="mt-8 flex justify-center">
              <Link href="/register">
                <Button variant="secondary" size="lg" className="font-bold uppercase tracking-wider px-10 rounded-full">
                  Register Complimentarily Now
                </Button>
              </Link>
            </div>
          </div>
        </section>

      </main>

      <Footer />
    </>
  );
}
