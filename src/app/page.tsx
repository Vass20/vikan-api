"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import {
  ShieldCheck,
  Lock,
  Search,
  Check,
  ArrowRight,
  Star,
  Users,
  Compass,
  FileText,
  ChevronDown,
  ChevronUp,
  Heart,
  ChevronLeft,
  ChevronRight,
  Sparkles,
  SlidersHorizontal
} from "lucide-react";
import { useAppStore } from "@/lib/store";
import { AppConst } from "@/lib/AppConst";
import { Navbar } from "@/components/layout/Navbar";
import { useSelector } from "react-redux";
import { RootState } from "@/lib/redux/store";
import { useSearchProfilesQuery } from "@/lib/redux/api";
import { Footer } from "@/components/layout/Footer";
import { Button } from "@/components/ui/button";
import { MOCK_SUCCESS_STORIES, MOCK_BLOG_POSTS, MOCK_FAQS } from "@/lib/mock-data";

export default function LandingPage() {
  const router = useRouter();
  const currentUser = useSelector((state: RootState) => state.auth.user);

  const { data: bridesData } = useSearchProfilesQuery({ gender: "Female" });
  const { data: groomsData } = useSearchProfilesQuery({ gender: "Male" });

  const { profiles } = useAppStore();

  const containerVariants = {
    hidden: {},
    visible: {
      transition: {
        staggerChildren: 0.1
      }
    }
  };

  const cardVariants = {
    hidden: { opacity: 0, y: 25 },
    visible: {
      opacity: 1,
      y: 0,
      transition: { type: "spring" as const, stiffness: 70, damping: 16 }
    }
  };

  // Search form states
  const [lookingFor, setLookingFor] = useState("female");
  const [ageRange, setAgeRange] = useState("22-32");
  const [ageFrom, setAgeFrom] = useState("22");
  const [ageTo, setAgeTo] = useState("32");
  const [religion, setReligion] = useState("Any Religion");
  const [location, setLocation] = useState("Any Location");

  // Success story carousel state
  const [storyIndex, setStoryIndex] = useState(0);

  // FAQ accordion open index
  const [openFaq, setOpenFaq] = useState<number | null>(null);

  // Hydration guard
  const [mounted, setMounted] = useState(false);
  useEffect(() => {
    setMounted(true);
    // If user is already logged in, standard behavior is dashboard, but let them explore.
  }, []);

  // Auto carousel for Success Stories (6-second intervals)
  useEffect(() => {
    const timer = setInterval(() => {
      setStoryIndex((prev) => (prev + 1) % MOCK_SUCCESS_STORIES.length);
    }, 6000);
    return () => clearInterval(timer);
  }, []);

  if (!mounted) return null;

  const dbBrides = bridesData || [];
  const dbGrooms = groomsData || [];

  // Filter profiles for featured brides/grooms
  const featuredBrides = dbBrides.length > 0
    ? dbBrides.slice(0, 4)
    : profiles.filter((p) => p.gender === "female").slice(0, 4);

  const featuredGrooms = dbGrooms.length > 0
    ? dbGrooms.slice(0, 4)
    : profiles.filter((p) => p.gender === "male").slice(0, 4);

  const handleQuickSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (!currentUser) {
      router.push("/login");
    } else {
      router.push(
        `/search?gender=${lookingFor}&ageFrom=${ageFrom}&ageTo=${ageTo}&religion=${religion === "Any Religion" ? "" : religion}&location=${location === "Any Location" ? "" : location}`
      );
    }
  };

  const nextStory = () => {
    setStoryIndex((prev) => (prev + 1) % MOCK_SUCCESS_STORIES.length);
  };

  const prevStory = () => {
    setStoryIndex((prev) => (prev - 1 + MOCK_SUCCESS_STORIES.length) % MOCK_SUCCESS_STORIES.length);
  };

  return (
    <>
      <Navbar />

      <main className="flex-1 overflow-x-hidden">
        {/* Section 1: Hero Banner */}
        <section className="relative min-h-[85vh] lg:min-h-[90vh] flex items-center justify-center bg-[#020914] py-20 px-4 md:px-8 border-b border-brand-gold/15 overflow-hidden">
          
          {/* Faded Background Video */}
          <video
            autoPlay
            loop
            muted
            playsInline
            className="absolute inset-0 w-full h-full object-cover opacity-[0.05] z-0 mix-blend-luminosity"
          >
            <source src="https://assets.mixkit.co/videos/preview/mixkit-wedding-celebration-with-gold-sparklers-32917-large.mp4" type="video/mp4" />
          </video>

          {/* Background Indian Couple Portrait on the right side */}
          <div 
            className="absolute top-0 right-0 bottom-0 w-full lg:w-1/2 bg-cover bg-[position:center_20%] lg:bg-center z-0 opacity-45 lg:opacity-85"
            style={{ 
              backgroundImage: `url('/hero_couple.jpg')`,
            }}
          >
            {/* Seamless gradient mask to blend left into Navy */}
            <div className="absolute inset-y-0 left-0 w-full lg:w-96 bg-gradient-to-r from-[#020914] via-[#020914]/60 lg:via-[#020914]/35 to-transparent z-10 pointer-events-none" />
            {/* Bottom fade for small screens */}
            <div className="absolute inset-x-0 bottom-0 h-48 bg-gradient-to-t from-[#020914] to-transparent lg:hidden z-10" />
          </div>

          {/* Radial gold-navy overlay to blend the left side solid Navy and add ambient glow */}
          <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_left,_var(--tw-gradient-stops))] from-[#020914] via-[#020914]/90 to-transparent z-0 pointer-events-none" />
          
          {/* Subtle background shapes representing infinity/double rings */}
          <div className="absolute top-10 left-[5%] w-[500px] h-[500px] rounded-full border border-brand-gold/5 pointer-events-none" />
          <div className="absolute bottom-10 left-[15%] w-[400px] h-[400px] rounded-full border border-brand-gold/5 pointer-events-none" />

          <div className="relative mx-auto max-w-7xl w-full grid grid-cols-1 lg:grid-cols-12 gap-12 items-center z-10">
            {/* Left side copy */}
            <div className="lg:col-span-7 text-center lg:text-left flex flex-col justify-center items-center lg:items-start">
              
              {/* Subtitle with gold sparkle and horizontal line */}
              <motion.div
                initial={{ opacity: 0, y: -20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.8 }}
                className="flex items-center justify-center lg:justify-start gap-3 mb-6"
              >
                <span className="font-support text-[10px] sm:text-xs font-bold text-[#E5DCD0]/90 uppercase tracking-widest">
                  Love Begins with the Right Connection.
                </span>
                <div className="w-12 h-px bg-brand-gold/60" />
                <Sparkles className="h-4 w-4 text-brand-gold fill-brand-gold animate-pulse-slow" />
              </motion.div>

              {/* Main Headline */}
              <motion.h1
                initial={{ opacity: 0, y: 15 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.8, delay: 0.15 }}
                className="font-serif text-4xl sm:text-6xl lg:text-7xl font-bold tracking-tight text-white leading-[1.05]"
              >
                Where Two Souls<br />
                <span className="text-brand-gold">Become One</span>
              </motion.h1>

              {/* Sub paragraph */}
              <motion.p
                initial={{ opacity: 0, y: 15 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.8, delay: 0.3 }}
                className="font-support text-sm sm:text-base text-muted-foreground/95 max-w-lg mt-6 leading-relaxed"
              >
                Vikan Matrimony helps you discover meaningful connections built on trust, values, and compatibility.
              </motion.p>

              {/* Premium Search Widget */}
              <motion.div
                initial={{ opacity: 0, y: 30 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.8, delay: 0.45 }}
                className="relative mt-12 bg-[#051121]/60 backdrop-blur-xl border border-brand-gold/15 rounded-[2rem] w-full max-w-3xl shadow-2xl overflow-visible text-left"
              >
                {/* Diamond border accent centered */}
                <div className="absolute top-0 left-1/2 transform -translate-x-1/2 -translate-y-1/2 rotate-45 w-3 h-3 bg-brand-gold border border-brand-gold z-20" />
                
                <form onSubmit={handleQuickSearch} className="p-8 flex flex-col gap-6">
                  {/* Select Fields Grid in a single horizontal row on desktop */}
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-5">
                    {/* Field 1: Looking For */}
                    <div className="flex flex-col gap-2">
                      <label className="text-[10px] font-bold text-[#E5DCD0]/60 uppercase tracking-widest">
                        Looking For
                      </label>
                      <div className="relative">
                        <select 
                          value={lookingFor}
                          onChange={(e) => setLookingFor(e.target.value)}
                          className="w-full bg-[#081626]/40 border border-[#E5DCD0]/20 rounded-xl px-4 py-2.5 text-xs text-white appearance-none outline-none focus:border-brand-gold transition-colors pr-10 cursor-pointer"
                        >
                          <option value="female" className="bg-[#0B1E36] text-white">Bride</option>
                          <option value="male" className="bg-[#0B1E36] text-white">Groom</option>
                        </select>
                        <ChevronDown className="absolute right-5.5 top-1/2 transform -translate-y-1/2 h-4 w-4 text-[#E5DCD0]/60 pointer-events-none" />
                      </div>
                    </div>

                    {/* Field 2: Age */}
                    <div className="flex flex-col gap-2">
                      <label className="text-[10px] font-bold text-[#E5DCD0]/60 uppercase tracking-widest">
                        Age
                      </label>
                      <div className="relative">
                        <select 
                          value={ageRange}
                          onChange={(e) => {
                            setAgeRange(e.target.value);
                            const [from, to] = e.target.value.split("-");
                            setAgeFrom(from);
                            setAgeTo(to);
                          }}
                          className="w-full bg-[#081626]/40 border border-[#E5DCD0]/20 rounded-xl px-4 py-2.5 text-xs text-white appearance-none outline-none focus:border-brand-gold transition-colors pr-10 cursor-pointer"
                        >
                          <option value="22-32" className="bg-[#0B1E36] text-white">22 - 32</option>
                          <option value="18-25" className="bg-[#0B1E36] text-white">18 - 25</option>
                          <option value="26-35" className="bg-[#0B1E36] text-white">26 - 35</option>
                          <option value="36-45" className="bg-[#0B1E36] text-white">36 - 45</option>
                        </select>
                        <ChevronDown className="absolute right-5.5 top-1/2 transform -translate-y-1/2 h-4 w-4 text-[#E5DCD0]/60 pointer-events-none" />
                      </div>
                    </div>

                    {/* Field 3: Religion */}
                    <div className="flex flex-col gap-2">
                      <label className="text-[10px] font-bold text-[#E5DCD0]/60 uppercase tracking-widest">
                        Religion
                      </label>
                      <div className="relative">
                        <select 
                          value={religion}
                          onChange={(e) => setReligion(e.target.value)}
                          className="w-full bg-[#081626]/40 border border-[#E5DCD0]/20 rounded-xl px-4 py-2.5 text-xs text-white appearance-none outline-none focus:border-brand-gold transition-colors pr-10 cursor-pointer"
                        >
                          <option value="Any Religion" className="bg-[#0B1E36] text-white">Any Religion</option>
                          <option value="Hindu" className="bg-[#0B1E36] text-white">Hindu</option>
                          <option value="Muslim" className="bg-[#0B1E36] text-white">Muslim</option>
                          <option value="Christian" className="bg-[#0B1E36] text-white">Christian</option>
                          <option value="Jain" className="bg-[#0B1E36] text-white">Jain</option>
                        </select>
                        <ChevronDown className="absolute right-5.5 top-1/2 transform -translate-y-1/2 h-4 w-4 text-[#E5DCD0]/60 pointer-events-none" />
                      </div>
                    </div>

                    {/* Field 4: Location */}
                    <div className="flex flex-col gap-2">
                      <label className="text-[10px] font-bold text-[#E5DCD0]/60 uppercase tracking-widest">
                        Location
                      </label>
                      <div className="relative">
                        <select 
                          value={location}
                          onChange={(e) => setLocation(e.target.value)}
                          className="w-full bg-[#081626]/40 border border-[#E5DCD0]/20 rounded-xl px-4 py-2.5 text-xs text-white appearance-none outline-none focus:border-brand-gold transition-colors pr-10 cursor-pointer"
                        >
                          <option value="Any Location" className="bg-[#0B1E36] text-white">Any Location</option>
                          <option value="Delhi NCR" className="bg-[#0B1E36] text-white">Delhi NCR</option>
                          <option value="Mumbai" className="bg-[#0B1E36] text-white">Mumbai</option>
                          <option value="Bangalore" className="bg-[#0B1E36] text-white">Bangalore</option>
                          <option value="Chennai" className="bg-[#0B1E36] text-white">Chennai</option>
                          <option value="Hyderabad" className="bg-[#0B1E36] text-white">Hyderabad</option>
                          <option value="Kolkata" className="bg-[#0B1E36] text-white">Kolkata</option>
                          <option value="Punjab" className="bg-[#0B1E36] text-white">Punjab</option>
                        </select>
                        <ChevronDown className="absolute right-5.5 top-1/2 transform -translate-y-1/2 h-4 w-4 text-[#E5DCD0]/60 pointer-events-none" />
                      </div>
                    </div>
                  </div>

                  <div className="flex flex-col sm:flex-row items-center justify-between gap-4 mt-2">
                    <button
                      type="submit"
                      className="gold-gradient text-brand-navy font-serif font-bold text-xs uppercase tracking-wider px-8 py-3.5 rounded-xl shadow-md hover:brightness-105 transition-all flex items-center justify-center gap-2 cursor-pointer w-full sm:w-auto"
                    >
                      Search Profiles
                      <ArrowRight className="h-4 w-4" />
                    </button>

                    <button
                      type="button"
                      onClick={() => {
                        if (!currentUser) {
                          router.push("/login");
                        } else {
                          router.push("/search");
                        }
                      }}
                      className="text-brand-gold hover:underline text-xs uppercase tracking-wider font-semibold font-support flex items-center gap-1.5 cursor-pointer bg-transparent border-none outline-none"
                    >
                      Advanced Search
                      <SlidersHorizontal className="h-3.5 w-3.5 text-brand-gold" />
                    </button>
                  </div>
                </form>
              </motion.div>
            </div>
            
            {/* Spanning spacer to reserve spacing on right for desktop */}
            <div className="hidden lg:block lg:col-span-5" />
          </div>
        </section>

        {/* Subtle Luxury Divider */}
        <div className="w-full h-px bg-gradient-to-r from-transparent via-brand-gold/15 to-transparent" />

        {/* Section 2: Verified Trust & Protection Badges */}
        <section className="py-12 bg-white dark:bg-[#071321]">
          <motion.div 
            variants={containerVariants}
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, margin: "-100px" }}
            className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 grid grid-cols-1 md:grid-cols-3 gap-8 items-center text-center"
          >
            <motion.div variants={cardVariants} className="flex flex-col items-center p-4">
              <ShieldCheck className="h-10 w-10 text-brand-gold mb-3 animate-pulse-slow" />
              <h3 className="font-serif text-lg font-bold text-brand-navy dark:text-foreground">
                100% ID Verified Profiles
              </h3>
              <p className="text-xs text-muted-foreground mt-1 font-support">
                Every member is verified via government photo ID submission.
              </p>
            </motion.div>
            <motion.div variants={cardVariants} className="flex flex-col items-center p-4 border-y md:border-y-0 md:border-x border-border/50">
              <Lock className="h-10 w-10 text-brand-gold mb-3" />
              <h3 className="font-serif text-lg font-bold text-brand-navy dark:text-foreground">
                Advanced Privacy Controls
              </h3>
              <p className="text-xs text-muted-foreground mt-1 font-support">
                Control photo access, phone visibility, and who can message you.
              </p>
            </motion.div>
            <motion.div variants={cardVariants} className="flex flex-col items-center p-4">
              <Users className="h-10 w-10 text-brand-gold mb-3" />
              <h3 className="font-serif text-lg font-bold text-brand-navy dark:text-foreground">
                Family Managed Portals
              </h3>
              <p className="text-xs text-muted-foreground mt-1 font-support">
                Collaborate with parents and elders through shared dashboard portals.
              </p>
            </motion.div>
          </motion.div>
        </section>

        {/* Subtle Luxury Divider */}
        <div className="w-full h-px bg-gradient-to-r from-transparent via-brand-gold/15 to-transparent" />

        {/* Section 3: Featured Brides Carousel */}
        <section className="py-20 bg-background text-foreground">
          <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
            <motion.div 
              initial={{ opacity: 0, y: 15 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.6 }}
              className="text-center md:text-left md:flex justify-between items-end border-b border-border pb-6 mb-10"
            >
              <div>
                <span className="font-support text-xs font-bold text-brand-gold uppercase tracking-widest block mb-2">
                  Elite Matching
                </span>
                <h2 className="font-serif text-3xl md:text-4xl font-bold text-brand-navy dark:text-foreground">
                  Featured Brides
                </h2>
              </div>
              <Link href="/register" className="mt-4 md:mt-0 inline-flex items-center gap-1.5 text-sm font-semibold text-brand-gold hover:underline cursor-pointer font-support">
                Register to View All <ArrowRight className="h-4 w-4" />
              </Link>
            </motion.div>

            <motion.div 
              variants={containerVariants}
              initial="hidden"
              whileInView="visible"
              viewport={{ once: true, margin: "-50px" }}
              className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6"
            >
              {featuredBrides.map((p: any) => (
                <motion.div
                  key={p.id}
                  variants={cardVariants}
                  whileHover={{ y: -8 }}
                  className="bg-card rounded-2xl border border-border/60 hover:border-brand-gold/60 transition-all duration-300 overflow-hidden group shadow-sm hover:shadow-md"
                >
                  <div className="relative h-72 w-full bg-muted overflow-hidden">
                    <img
                      src={AppConst.getPhotoUrl(p.photos[0])}
                      alt={p.name}
                      className="h-full w-full object-cover group-hover:scale-105 transition-transform duration-500"
                    />
                    {/* Badge */}
                    <div className="absolute top-3 left-3 bg-brand-navy/85 backdrop-blur-sm text-brand-gold text-[10px] font-bold px-2 py-0.5 rounded-full border border-brand-gold/30">
                      ★ {p.isPremium ? "Elite Premium" : "Verified"}
                    </div>
                  </div>
                  <div className="p-5">
                    <h3 className="font-serif text-lg font-semibold text-brand-navy dark:text-foreground">
                      {p.name.split(" ")[0]} ...
                    </h3>
                    <p className="text-xs text-muted-foreground font-support mt-1">
                      {p.age} Yrs • {p.height} • {p.religion}
                    </p>
                    <p className="text-xs text-muted-foreground font-support truncate mt-1">
                      {p.education.split(" (")[0]}
                    </p>
                    <p className="text-xs text-muted-foreground font-support italic truncate mt-1">
                      {p.occupation.split(" (")[0]} • {p.city}
                    </p>
                    <Link href="/register">
                      <Button variant="outline" size="sm" className="w-full mt-4 border-brand-gold text-brand-gold hover:bg-brand-gold/10 hover:!text-brand-gold font-support uppercase tracking-wider font-semibold">
                        Connect Profile
                      </Button>
                    </Link>
                  </div>
                </motion.div>
              ))}
            </motion.div>
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

        {/* Section 4: Featured Grooms Carousel */}
        <section className="py-20 bg-[#F2EDE5] dark:bg-[#0A1728] text-foreground">
          <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
            <motion.div 
              initial={{ opacity: 0, y: 15 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.6 }}
              className="text-center md:text-left md:flex justify-between items-end border-b border-border/80 pb-6 mb-10"
            >
              <div>
                <span className="font-support text-xs font-bold text-brand-gold uppercase tracking-widest block mb-2">
                  Elite Matching
                </span>
                <h2 className="font-serif text-3xl md:text-4xl font-bold text-brand-navy dark:text-foreground">
                  Featured Grooms
                </h2>
              </div>
              <Link href="/register" className="mt-4 md:mt-0 inline-flex items-center gap-1.5 text-sm font-semibold text-brand-gold hover:underline cursor-pointer font-support">
                Register to View All <ArrowRight className="h-4 w-4" />
              </Link>
            </motion.div>

            <motion.div 
              variants={containerVariants}
              initial="hidden"
              whileInView="visible"
              viewport={{ once: true, margin: "-50px" }}
              className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6"
            >
              {featuredGrooms.map((p: any) => (
                <motion.div
                  key={p.id}
                  variants={cardVariants}
                  whileHover={{ y: -8 }}
                  className="bg-card rounded-2xl border border-border/60 hover:border-brand-gold/60 transition-all duration-300 overflow-hidden group shadow-sm hover:shadow-md"
                >
                  <div className="relative h-72 w-full bg-muted overflow-hidden">
                    <img
                      src={AppConst.getPhotoUrl(p.photos[0])}
                      alt={p.name}
                      className="h-full w-full object-cover group-hover:scale-105 transition-transform duration-500"
                    />
                    {/* Badge */}
                    <div className="absolute top-3 left-3 bg-brand-navy/85 backdrop-blur-sm text-brand-gold text-[10px] font-bold px-2 py-0.5 rounded-full border border-brand-gold/30">
                      ★ {p.isPremium ? "Elite Premium" : "Verified"}
                    </div>
                  </div>
                  <div className="p-5">
                    <h3 className="font-serif text-lg font-semibold text-brand-navy dark:text-foreground">
                      {p.name.split(" ")[0]} ...
                    </h3>
                    <p className="text-xs text-muted-foreground font-support mt-1">
                      {p.age} Yrs • {p.height} • {p.religion}
                    </p>
                    <p className="text-xs text-muted-foreground font-support truncate mt-1">
                      {p.education.split(" (")[0]}
                    </p>
                    <p className="text-xs text-muted-foreground font-support italic truncate mt-1">
                      {p.occupation.split(" (")[0]} • {p.city}
                    </p>
                    <Link href="/register">
                      <Button variant="outline" size="sm" className="w-full mt-4 border-brand-gold text-brand-gold hover:bg-brand-gold/10 hover:!text-brand-gold font-support uppercase tracking-wider font-semibold">
                        Connect Profile
                      </Button>
                    </Link>
                  </div>
                </motion.div>
              ))}
            </motion.div>
          </div>
        </section>

        {/* Subtle Luxury Divider */}
        <div className="w-full h-px bg-gradient-to-r from-transparent via-brand-gold/15 to-transparent" />

        {/* Section 5: How It Works */}
        <section className="py-20 bg-white dark:bg-[#071321]">
          <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 text-center">
            <span className="font-support text-xs font-bold text-brand-gold uppercase tracking-widest block mb-2">
              Simple Alignment
            </span>
            <h2 className="font-serif text-3xl md:text-4xl font-bold text-brand-navy dark:text-foreground mb-16">
              How It Works
            </h2>

            <motion.div 
              variants={containerVariants}
              initial="hidden"
              whileInView="visible"
              viewport={{ once: true, margin: "-50px" }}
              className="grid grid-cols-1 md:grid-cols-4 gap-8 relative"
            >
              {[
                { step: "1", title: "Create Profile", desc: "Register free. Complete your basic details, background, and preferences.", icon: Compass },
                { step: "2", title: "Verify Credentials", desc: "Upload a secure government ID card and quick selfie verification badge.", icon: ShieldCheck },
                { step: "3", title: "Discover & Connect", desc: "Filter through elite verified matches. Express interest, get accepted.", icon: Users },
                { step: "4", title: "Express Chats", desc: "Communicate directly through our luxury messaging dashboard. Align families.", icon: Heart },
              ].map((item, index) => {
                const Icon = item.icon;
                return (
                  <motion.div 
                    key={item.step} 
                    variants={cardVariants}
                    className="flex flex-col items-center p-4 relative group"
                  >
                    <div className="w-16 h-16 rounded-full border-2 border-brand-gold/30 flex items-center justify-center text-brand-gold bg-brand-gold/5 group-hover:bg-brand-gold group-hover:text-brand-navy transition-all duration-500 mb-6">
                      <Icon className="h-7 w-7" />
                    </div>
                    <h3 className="font-serif text-lg font-bold text-brand-navy dark:text-foreground">
                      {item.step}. {item.title}
                    </h3>
                    <p className="text-xs text-muted-foreground/90 font-support mt-2 leading-relaxed max-w-xs">
                      {item.desc}
                    </p>
                  </motion.div>
                );
              })}
            </motion.div>
          </div>
        </section>



        {/* Subtle Luxury Divider */}
        <div className="w-full h-px bg-gradient-to-r from-transparent via-brand-gold/15 to-transparent" />

        {/* Section 6: Success Stories */}
        <section className="py-24 bg-[#F9F8F6] dark:bg-[#071321] text-foreground overflow-hidden">
          <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-center">
              
              {/* Left Column: Heading and Info */}
              <div className="lg:col-span-4 text-left flex flex-col justify-center">
                <span className="font-support text-xs font-bold text-brand-gold uppercase tracking-widest block mb-3">
                  Sacred Endings
                </span>
                <h2 className="font-serif text-3xl md:text-5xl font-semibold tracking-tight text-brand-navy dark:text-foreground leading-tight">
                  Real Stories,<br />True Connections
                </h2>
                <p className="text-sm sm:text-base text-muted-foreground/90 font-support mt-5 max-w-md leading-relaxed">
                  Discover how Vikan Matrimony has brought together couples through meaningful connections and shared journeys. Your success story could be next!
                </p>
                <Link href="/register" className="mt-8 w-fit">
                  <Button variant="secondary" size="lg" className="font-bold uppercase tracking-wider px-8 rounded-full">
                    Know More &rarr;
                  </Button>
                </Link>
              </div>

              {/* Right Column: Carousel Cards */}
              <div className="lg:col-span-8 flex flex-col gap-6 w-full">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  {/* Card 1 */}
                  <motion.div
                    key={`card-1-${storyIndex}`}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.5 }}
                    className="bg-white dark:bg-[#0A1D33] rounded-3xl border border-border/40 dark:border-border/10 shadow-sm overflow-hidden flex flex-col h-full hover:shadow-md transition-all duration-300"
                  >
                    <div className="relative aspect-[4/3] w-full overflow-hidden bg-muted">
                      <img
                        src={MOCK_SUCCESS_STORIES[storyIndex].image}
                        alt={MOCK_SUCCESS_STORIES[storyIndex].names}
                        className="w-full h-full object-cover transition-transform duration-500 hover:scale-105"
                      />
                      <div className="absolute top-4 left-4 bg-brand-navy/80 backdrop-blur-md text-brand-gold px-3 py-1 rounded-full text-[10px] font-bold font-support uppercase tracking-wider">
                        {MOCK_SUCCESS_STORIES[storyIndex].marriageDate}
                      </div>
                    </div>
                    <div className="p-6 flex flex-col flex-grow">
                      <h3 className="font-serif text-lg font-bold text-brand-navy dark:text-foreground">
                        {MOCK_SUCCESS_STORIES[storyIndex].names}
                      </h3>
                      <p className="text-xs md:text-sm text-muted-foreground mt-3 leading-relaxed font-support flex-grow italic">
                        "{MOCK_SUCCESS_STORIES[storyIndex].story}"
                      </p>
                    </div>
                  </motion.div>

                  {/* Card 2 (Visible on desktop, loops next story) */}
                  <motion.div
                    key={`card-2-${storyIndex}`}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.5, delay: 0.1 }}
                    className="hidden md:flex bg-white dark:bg-[#0A1D33] rounded-3xl border border-border/40 dark:border-border/10 shadow-sm overflow-hidden flex-col h-full hover:shadow-md transition-all duration-300"
                  >
                    <div className="relative aspect-[4/3] w-full overflow-hidden bg-muted">
                      <img
                        src={MOCK_SUCCESS_STORIES[(storyIndex + 1) % MOCK_SUCCESS_STORIES.length].image}
                        alt={MOCK_SUCCESS_STORIES[(storyIndex + 1) % MOCK_SUCCESS_STORIES.length].names}
                        className="w-full h-full object-cover transition-transform duration-500 hover:scale-105"
                      />
                      <div className="absolute top-4 left-4 bg-brand-navy/80 backdrop-blur-md text-brand-gold px-3 py-1 rounded-full text-[10px] font-bold font-support uppercase tracking-wider">
                        {MOCK_SUCCESS_STORIES[(storyIndex + 1) % MOCK_SUCCESS_STORIES.length].marriageDate}
                      </div>
                    </div>
                    <div className="p-6 flex flex-col flex-grow">
                      <h3 className="font-serif text-lg font-bold text-brand-navy dark:text-foreground">
                        {MOCK_SUCCESS_STORIES[(storyIndex + 1) % MOCK_SUCCESS_STORIES.length].names}
                      </h3>
                      <p className="text-xs md:text-sm text-muted-foreground mt-3 leading-relaxed font-support flex-grow italic">
                        "{MOCK_SUCCESS_STORIES[(storyIndex + 1) % MOCK_SUCCESS_STORIES.length].story}"
                      </p>
                    </div>
                  </motion.div>
                </div>

                {/* Scroll Indicator & Controls */}
                <div className="flex items-center justify-between gap-4 mt-2">
                  {/* Progress Indicator Bar */}
                  <div className="flex-1 max-w-xs bg-slate-200 dark:bg-slate-800 h-1 rounded-full overflow-hidden relative">
                    <div 
                      className="absolute top-0 bottom-0 bg-brand-gold rounded-full transition-all duration-500"
                      style={{
                        width: "33.33%",
                        left: `${(storyIndex * 33.33)}%`
                      }}
                    />
                  </div>

                  {/* Navigation controls */}
                  <div className="flex items-center gap-3 justify-end">
                    <button
                      onClick={prevStory}
                      className="p-2.5 rounded-full border border-border/80 dark:border-border/10 text-muted-foreground hover:border-brand-gold hover:text-brand-gold bg-white dark:bg-[#0A1D33] hover:shadow-md transition-all cursor-pointer"
                      aria-label="Previous story"
                    >
                      <ChevronLeft className="h-4 w-4" />
                    </button>
                    <button
                      onClick={nextStory}
                      className="p-2.5 rounded-full border border-border/80 dark:border-border/10 text-muted-foreground hover:border-brand-gold hover:text-brand-gold bg-white dark:bg-[#0A1D33] hover:shadow-md transition-all cursor-pointer"
                      aria-label="Next story"
                    >
                      <ChevronRight className="h-4 w-4" />
                    </button>
                  </div>
                </div>
              </div>

            </div>
          </div>
        </section>

        {/* Subtle Luxury Divider */}
        <div className="w-full h-px bg-gradient-to-r from-transparent via-brand-gold/15 to-transparent" />

        {/* Section 7: FAQ Accordion */}
        <section className="py-20 bg-white dark:bg-[#071321]">
          <div className="mx-auto max-w-3xl px-4 sm:px-6 lg:px-8">
            <div className="text-center mb-16">
              <span className="font-support text-xs font-bold text-brand-gold uppercase tracking-widest block mb-2">
                Questions
              </span>
              <h2 className="font-serif text-3xl md:text-4xl font-bold text-brand-navy dark:text-foreground">
                Frequently Asked Questions
              </h2>
            </div>

            <div className="space-y-4">
              {MOCK_FAQS.map((faq, idx) => {
                const isOpen = openFaq === idx;
                return (
                  <div
                    key={idx}
                    className="border border-border/80 rounded-xl overflow-hidden bg-card"
                  >
                    <button
                      onClick={() => setOpenFaq(isOpen ? null : idx)}
                      className="w-full flex items-center justify-between px-6 py-5 text-left font-serif text-base font-bold text-brand-navy dark:text-foreground hover:bg-muted/10 transition-colors cursor-pointer"
                    >
                      <span>{faq.question}</span>
                      {isOpen ? <ChevronUp className="h-4 w-4" /> : <ChevronDown className="h-4 w-4" />}
                    </button>
                    <AnimatePresence initial={false}>
                      {isOpen && (
                        <motion.div 
                          initial={{ height: 0, opacity: 0 }}
                          animate={{ height: "auto", opacity: 1 }}
                          exit={{ height: 0, opacity: 0 }}
                          transition={{ duration: 0.25, ease: "easeInOut" }}
                          className="px-6 pb-5 pt-1 text-xs md:text-sm text-muted-foreground font-support border-t border-border/20 leading-relaxed bg-muted/5 overflow-hidden"
                        >
                          {faq.answer}
                        </motion.div>
                      )}
                    </AnimatePresence>
                  </div>
                );
              })}
            </div>
          </div>
        </section>

        {/* Subtle Luxury Divider */}
        <div className="w-full h-px bg-gradient-to-r from-transparent via-brand-gold/15 to-transparent" />

        {/* Section 8: Blog / Wedding Tips */}
        <section className="py-20 bg-[#FBF9F6] dark:bg-[#091523] text-foreground">
          <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
            <div className="text-center mb-16">
              <span className="font-support text-xs font-bold text-brand-gold uppercase tracking-widest block mb-2">
                Read Stories
              </span>
              <h2 className="font-serif text-3xl md:text-4xl font-bold text-brand-navy dark:text-foreground">
                Blog & Wedding Tips
              </h2>
            </div>

            <motion.div 
              variants={containerVariants}
              initial="hidden"
              whileInView="visible"
              viewport={{ once: true, margin: "-50px" }}
              className="grid grid-cols-1 md:grid-cols-3 gap-8"
            >
              {MOCK_BLOG_POSTS.map((post) => (
                <motion.div
                  key={post.id}
                  variants={cardVariants}
                  whileHover={{ y: -8 }}
                  className="bg-card rounded-2xl border border-border/60 overflow-hidden shadow-sm hover:shadow-md hover:border-brand-gold/45 transition-all duration-300 group flex flex-col h-full"
                >
                  <div className="h-52 w-full bg-muted overflow-hidden relative">
                    <img
                      src={post.image}
                      alt={post.title}
                      className="h-full w-full object-cover group-hover:scale-105 transition-transform duration-500"
                    />
                    <div className="absolute top-3 left-3 bg-brand-gold text-brand-navy text-[10px] font-bold px-2.5 py-0.5 rounded uppercase font-support">
                      {post.category}
                    </div>
                  </div>
                  <div className="p-6 flex flex-col flex-1 justify-between">
                    <div>
                      <span className="text-[10px] text-muted-foreground font-support">
                        {post.date} • {post.readTime}
                      </span>
                      <h3 className="font-serif text-lg font-bold text-brand-navy dark:text-foreground mt-2 leading-snug">
                        {post.title}
                      </h3>
                      <p className="text-xs text-muted-foreground mt-2 font-support leading-relaxed">
                        {post.summary}
                      </p>
                    </div>
                    <button className="mt-4 inline-flex items-center gap-1 text-xs font-bold text-brand-gold group-hover:underline cursor-pointer font-support">
                      Read Article <ChevronRight className="h-3 w-3" />
                    </button>
                  </div>
                </motion.div>
              ))}
            </motion.div>
          </div>
        </section>

        {/* Subtle Luxury Divider */}
        <div className="w-full h-px bg-gradient-to-r from-transparent via-brand-gold/15 to-transparent" />

        {/* Section 9: Register Free CTA Banner */}
        <section className="py-20 bg-brand-navy text-[#F7F3EE] relative overflow-hidden">
          {/* Faded Luxury Background Photo */}
          <div 
            className="absolute inset-0 z-0 bg-cover bg-center opacity-[0.06] mix-blend-luminosity"
            style={{ 
              backgroundImage: `url('https://images.unsplash.com/photo-1583939003579-730e3918a45a?w=1200&auto=format&fit=crop&q=80')`,
            }} 
          />
          {/* Decorative luxury gradient overlays */}
          <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_bottom_right,_var(--tw-gradient-stops))] from-[#17467C]/90 via-brand-navy/95 to-[#051121] z-0" />
          <motion.div 
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.8 }}
            className="relative mx-auto max-w-4xl px-4 sm:px-6 lg:px-8 text-center z-10"
          >
            <h2 className="font-serif text-3xl md:text-5xl font-semibold tracking-tight leading-tight">
              Begin Your Journey to a<span className="text-brand-gold font-bold"> Lifelong Bond</span>
            </h2>
            <p className="text-sm text-[#E5DCD0]/90 font-support mt-4 max-w-xl mx-auto leading-relaxed">
              Create your complimentary profile today. Access detailed preferences, mutual matchmaking filters, and verified Indian bride and groom profiles.
            </p>
            <div className="mt-8 flex flex-col sm:flex-row items-center justify-center gap-4">
              <Link href="/register" className="w-full sm:w-auto">
                <button className="w-full sm:w-auto bg-[#0B1E36] text-brand-gold border border-brand-gold/30 hover:border-brand-gold hover:bg-[#0E2746] rounded-xl font-sans font-medium text-base tracking-wider px-10 py-3 flex items-center justify-center gap-2 transition-all cursor-pointer shadow-lg hover:shadow-brand-gold/5">
                  Register Complimentarily
                  <ArrowRight className="h-4 w-4" />
                </button>
              </Link>
              <Link href="/login" className="w-full sm:w-auto">
                <Button variant="outline" size="lg" className="w-full sm:w-auto border-brand-gold/30 text-brand-gold hover:border-brand-gold hover:bg-brand-gold/10 hover:!text-brand-gold px-10">
                  Login to Account
                </Button>
              </Link>
            </div>
          </motion.div>
        </section>
      </main>

      <Footer />
    </>
  );
}
