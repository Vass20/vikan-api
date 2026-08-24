"use client";

import React, { useState, useEffect, useMemo, Suspense } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import { useAppStore } from "@/lib/store";
import { Navbar } from "@/components/layout/Navbar";
import { useSelector } from "react-redux";
import { RootState } from "@/lib/redux/store";
import {
  useSearchProfilesQuery,
  useSendInterestMutation,
  useGetSentInterestsQuery,
  useGetReceivedInterestsQuery,
  useGetMyProfileQuery,
  useGetCastesQuery,
  useGetMyShortlistedQuery,
  useToggleShortlistMutation
} from "@/lib/redux/api";
import { Footer } from "@/components/layout/Footer";
import { Button } from "@/components/ui/button";
import { Input, Select } from "@/components/ui/input";
import { MatchRing } from "@/components/ui/MatchRing";
import { Heart, Search as SearchIcon, Filter, Save, Sparkles, MessageSquare, ShieldCheck, CheckSquare, Trash2, ChevronDown, ImageOff } from "lucide-react";
import Link from "next/link";

function SearchContent() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const currentUser = useSelector((state: RootState) => state.auth.user);
  const { data: myProfile } = useGetMyProfileQuery(undefined, { skip: !currentUser });
  const { data: shortlistedData } = useGetMyShortlistedQuery(undefined, { skip: !currentUser });
  const [toggleShortlistApi] = useToggleShortlistMutation();
  
  const {
    savedSearches,
    recentSearches,
    saveSearch,
    deleteSavedSearch,
    addRecentSearch,
    showToast
  } = useAppStore();

  // Active filters state
  const [gender, setGender] = useState("female");
  const [religion, setReligion] = useState("all");
  const [motherTongue, setMotherTongue] = useState("all");
  const [maritalStatus, setMaritalStatus] = useState("all");
  const [diet, setDiet] = useState("all");
  const [familyStatus, setFamilyStatus] = useState("all");
  const [ageMin, setAgeMin] = useState(21);
  const [ageMax, setAgeMax] = useState(40);
  const [minIncome, setMinIncome] = useState(0); // numeric check
  const [onlyVerified, setOnlyVerified] = useState(false);
  const [onlyPremium, setOnlyPremium] = useState(false);
  const [community, setCommunity] = useState("all");
  const { data: castes } = useGetCastesQuery();

  const isFree = !myProfile?.membershipType || myProfile?.membershipType === "Free" || myProfile?.membershipType === "Free Member" || myProfile?.membershipType === "Free Package";

  const communityOptions = useMemo(() => {
    if (!castes || !religion || religion === "all") return [];
    return castes[religion] || [];
  }, [castes, religion]);

  // Reset community if religion changes and current community is not valid
  useEffect(() => {
    if (religion === "all") {
      setCommunity("all");
    } else if (communityOptions.length > 0 && community !== "all") {
      if (!communityOptions.includes(community)) {
        setCommunity("all");
      }
    }
  }, [religion, communityOptions]);

  // Search saving states
  const [searchSaveName, setSearchSaveName] = useState("");
  const [showSaveModal, setShowSaveModal] = useState(false);

  const { data: dbProfiles, isLoading: isProfilesLoading } = useSearchProfilesQuery({
    gender: gender === "male" ? "Male" : "Female",
    religion: religion !== "all" ? religion : undefined
  }, { skip: !currentUser });

  const { data: sentInterests } = useGetSentInterestsQuery(undefined, { skip: !currentUser });
  const { data: receivedInterests } = useGetReceivedInterestsQuery(undefined, { skip: !currentUser });
  const [sendInterestApi] = useSendInterestMutation();

  const todayInterestsCount = useMemo(() => {
    if (!sentInterests) return 0;
    const todayStart = new Date();
    todayStart.setHours(0,0,0,0);
    return sentInterests.filter((i: any) => {
      const sentDate = new Date(i.sentAt);
      return sentDate >= todayStart;
    }).length;
  }, [sentInterests]);

  const handleSendInterest = async (id: string) => {
    if (isFree && todayInterestsCount >= 5) {
      showToast("You have reached the daily interest request limit of 5 for Free Members. Upgrade your plan to send unlimited interests!", "warning");
      router.push("/membership");
      return;
    }
    try {
      await sendInterestApi(id).unwrap();
    } catch (e) {
      console.error(e);
    }
  };

  useEffect(() => {
    if (currentUser?.email === "admin@vikan.com") {
      router.push("/admin");
    }
  }, [currentUser]);

  // Load URL query parameters on mount
  useEffect(() => {
    const urlGender = searchParams.get("gender");
    const urlAgeFrom = searchParams.get("ageFrom");
    const urlAgeTo = searchParams.get("ageTo");
    const urlReligion = searchParams.get("religion");
    const urlTongue = searchParams.get("motherTongue");
    const urlCommunity = searchParams.get("community");

    if (urlGender) setGender(urlGender);
    if (urlAgeFrom) setAgeMin(Number(urlAgeFrom));
    if (urlAgeTo) setAgeMax(Number(urlAgeTo));
    if (urlReligion && urlReligion !== "all") setReligion(urlReligion);
    if (urlTongue && urlTongue !== "all") setMotherTongue(urlTongue);
    if (urlCommunity && urlCommunity !== "all") setCommunity(urlCommunity);
  }, [searchParams]);

  // Handle saving search trigger
  const handleSaveSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (!searchSaveName.trim()) return;

    saveSearch(searchSaveName, {
      gender,
      religion,
      community,
      motherTongue,
      maritalStatus,
      diet,
      familyStatus,
      ageMin,
      ageMax,
      minIncome,
      onlyVerified,
      onlyPremium
    });

    setSearchSaveName("");
    setShowSaveModal(false);
  };

  const handleApplySavedSearch = (filters: any) => {
    if (filters.gender) setGender(filters.gender);
    if (filters.religion) setReligion(filters.religion);
    if (filters.community) setCommunity(filters.community);
    if (filters.motherTongue) setMotherTongue(filters.motherTongue);
    if (filters.maritalStatus) setMaritalStatus(filters.maritalStatus);
    if (filters.diet) setDiet(filters.diet);
    if (filters.familyStatus) setFamilyStatus(filters.familyStatus);
    if (filters.ageMin) setAgeMin(filters.ageMin);
    if (filters.ageMax) setAgeMax(filters.ageMax);
    if (filters.minIncome !== undefined) setMinIncome(filters.minIncome);
    if (filters.onlyVerified !== undefined) setOnlyVerified(filters.onlyVerified);
    if (filters.onlyPremium !== undefined) setOnlyPremium(filters.onlyPremium);
  };

  function parseSalaryToNumber(salaryStr?: string): number {
    if (!salaryStr) return 0;
    const clean = salaryStr.replace(/[^\d.]/g, "");
    const num = parseFloat(clean);
    if (isNaN(num)) return 0;
    if (/cr|crore/i.test(salaryStr)) {
      return num * 10000000;
    }
    if (/lpa|lakh/i.test(salaryStr)) {
      return num * 100000;
    }
    return num;
  }

  // Comprehensive Filter implementation across all 11 criteria
  const filteredProfiles = (dbProfiles || []).filter((p: any) => {
    // 1. Exclude the logged-in user profile
    if (myProfile && (p.id === myProfile.id || p.userId === myProfile.userId || p.userId === myProfile.user?.id)) return false;
    if (currentUser && (p.userId === currentUser.id || p.id === currentUser.id || p.id === currentUser.profileId)) return false;
    
    // 2. Gender check
    if (gender && p.gender && p.gender.toLowerCase() !== gender.toLowerCase()) return false;

    // 3. Age Range
    let age = p.age;
    if (!age && p.dateOfBirth) {
      const birthYear = new Date(p.dateOfBirth).getFullYear();
      const currentYear = new Date().getFullYear();
      age = currentYear - birthYear;
    }
    if (age && (age < ageMin || age > ageMax)) return false;

    // 4. Religion
    if (religion !== "all") {
      if (!p.religion || p.religion.toLowerCase() !== religion.toLowerCase()) return false;
    }

    // 5. Community / Caste
    if (community !== "all") {
      if (!p.community || p.community.toLowerCase() !== community.toLowerCase()) return false;
    }

    // 6. Mother Tongue
    if (motherTongue !== "all") {
      if (!p.motherTongue || p.motherTongue.toLowerCase() !== motherTongue.toLowerCase()) return false;
    }

    // 7. Marital Status
    if (maritalStatus !== "all") {
      if (!p.maritalStatus || p.maritalStatus.toLowerCase() !== maritalStatus.toLowerCase()) return false;
    }

    // 8. Dietary Preferences
    if (diet !== "all") {
      if (!p.diet || p.diet.toLowerCase() !== diet.toLowerCase()) return false;
    }

    // 9. Family Status
    if (familyStatus !== "all") {
      if (!p.familyStatus || p.familyStatus.toLowerCase() !== familyStatus.toLowerCase()) return false;
    }

    // 10. Minimum Annual Income
    if (minIncome > 0) {
      const profileIncome = parseSalaryToNumber(p.salary);
      if (profileIncome > 0 && profileIncome < minIncome) return false;
    }

    // 11. Badges & Verifications
    if (onlyVerified && !p.isVerified) return false;
    if (onlyPremium && !p.isPremium) return false;

    return true;
  });

  // Calculate semi-realistic compatibility score for profiles
  const getCompatibilityScore = (p: any) => {
    let score = 75;
    if (myProfile) {
      if (p.religion && myProfile.religion && p.religion.toLowerCase() === myProfile.religion.toLowerCase()) score += 8;
      if (p.motherTongue && myProfile.motherTongue && p.motherTongue.toLowerCase() === myProfile.motherTongue.toLowerCase()) score += 6;
      if (p.diet && myProfile.diet && p.diet.toLowerCase() === myProfile.diet.toLowerCase()) score += 5;
      if (p.familyValues && myProfile.familyValues && p.familyValues.toLowerCase() === myProfile.familyValues.toLowerCase()) score += 4;
      if (p.state && myProfile.state && p.state.toLowerCase() === myProfile.state.toLowerCase()) score += 2;
    }
    return Math.min(score, 99);
  };

  // Trigger search analytics log
  const handleKeywordSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const query = `${religion !== "all" ? religion : ""} ${motherTongue !== "all" ? motherTongue : ""} ${gender === "female" ? "Bride" : "Groom"}`.trim();
    if (query) {
      addRecentSearch(query);
    }
  };

  return (
    <div className="mx-auto max-w-7xl">
      <div className="flex flex-col lg:flex-row gap-8 items-start">
        {/* LEFT COLUMN: FILTERS PANEL */}
        <aside className="relative w-full lg:w-80 bg-[#051121]/60 backdrop-blur-xl border border-brand-gold/15 rounded-[2rem] p-6 shadow-2xl shrink-0 text-white overflow-visible">
          {/* Diamond Accent */}
          <div className="absolute top-0 left-1/2 transform -translate-x-1/2 -translate-y-1/2 rotate-45 w-3 h-3 bg-brand-gold border border-brand-gold z-20" />
          
          <div className="flex items-center justify-between border-b border-border/10 pb-3 mb-6">
            <h2 className="font-serif text-lg font-bold text-white flex items-center gap-2">
              <Filter className="h-4 w-4 text-brand-gold" /> Filter Criteria
            </h2>
            <button
              onClick={() => {
                setGender(myProfile?.gender?.toLowerCase() === "male" ? "female" : "male");
                setReligion("all");
                setCommunity("all");
                setMotherTongue("all");
                setMaritalStatus("all");
                setDiet("all");
                setFamilyStatus("all");
                setAgeMin(20);
                setAgeMax(45);
                setMinIncome(0);
                setOnlyVerified(false);
                setOnlyPremium(false);
                showToast("Filters reset to defaults", "info");
              }}
              className="text-[10px] text-brand-gold font-bold hover:underline font-support cursor-pointer"
            >
              Reset Filters
            </button>
          </div>

          <form onSubmit={handleKeywordSearchSubmit} className="space-y-5">
            {/* Seeking gender */}
            <div className="flex flex-col gap-2">
              <label className="text-[10px] font-bold text-[#E5DCD0]/60 uppercase tracking-widest">
                Looking For
              </label>
              <div className="grid grid-cols-2 gap-2">
                <button
                  type="button"
                  onClick={() => setGender("female")}
                  className={`py-2.5 rounded-xl text-xs font-bold border transition-all cursor-pointer ${
                    gender === "female"
                      ? "bg-brand-gold text-brand-navy border-brand-gold"
                      : "bg-[#081626]/40 text-[#E5DCD0]/60 border-[#E5DCD0]/20 hover:border-brand-gold/60"
                  }`}
                >
                  Bride
                </button>
                <button
                  type="button"
                  onClick={() => setGender("male")}
                  className={`py-2.5 rounded-xl text-xs font-bold border transition-all cursor-pointer ${
                    gender === "male"
                      ? "bg-brand-gold text-brand-navy border-brand-gold"
                      : "bg-[#081626]/40 text-[#E5DCD0]/60 border-[#E5DCD0]/20 hover:border-brand-gold/60"
                  }`}
                >
                  Groom
                </button>
              </div>
            </div>

            {/* Age Range */}
            <div className="flex flex-col gap-2">
              <label className="text-[10px] font-bold text-[#E5DCD0]/60 uppercase tracking-widest">
                Age Boundary: {ageMin} to {ageMax}
              </label>
              <div className="grid grid-cols-2 gap-3">
                <div className="relative">
                  <select
                    value={ageMin}
                    onChange={(e) => setAgeMin(Number(e.target.value))}
                    className="w-full bg-[#081626]/40 border border-[#E5DCD0]/20 rounded-xl px-4 py-2.5 text-xs text-white appearance-none outline-none focus:border-brand-gold transition-colors pr-10 cursor-pointer"
                  >
                    {Array.from({ length: 20 }, (_, i) => 20 + i).map((a) => (
                      <option key={a} value={a} className="bg-[#0B1E36] text-white">
                        Min: {a} Yrs
                      </option>
                    ))}
                  </select>
                  <ChevronDown className="absolute right-5 top-1/2 transform -translate-y-1/2 h-4 w-4 text-[#E5DCD0]/60 pointer-events-none" />
                </div>
                <div className="relative">
                  <select
                    value={ageMax}
                    onChange={(e) => setAgeMax(Number(e.target.value))}
                    className="w-full bg-[#081626]/40 border border-[#E5DCD0]/20 rounded-xl px-4 py-2.5 text-xs text-white appearance-none outline-none focus:border-brand-gold transition-colors pr-10 cursor-pointer"
                  >
                    {Array.from({ length: 25 }, (_, i) => 21 + i).map((a) => (
                      <option key={a} value={a} className="bg-[#0B1E36] text-white">
                        Max: {a} Yrs
                      </option>
                    ))}
                  </select>
                  <ChevronDown className="absolute right-5 top-1/2 transform -translate-y-1/2 h-4 w-4 text-[#E5DCD0]/60 pointer-events-none" />
                </div>
              </div>
            </div>

            {/* Religion */}
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
                  <option value="all" className="bg-[#0B1E36] text-white">All Religions</option>
                  <option value="Hindu" className="bg-[#0B1E36] text-white">Hindu</option>
                  <option value="Muslim" className="bg-[#0B1E36] text-white">Muslim</option>
                  <option value="Christian" className="bg-[#0B1E36] text-white">Christian</option>
                  <option value="Jain" className="bg-[#0B1E36] text-white">Jain</option>
                </select>
                <ChevronDown className="absolute right-5 top-1/2 transform -translate-y-1/2 h-4 w-4 text-[#E5DCD0]/60 pointer-events-none" />
              </div>
            </div>

            {/* Community / Caste */}
            {religion !== "all" && communityOptions.length > 0 && (
              <div className="flex flex-col gap-2 animate-fadeIn">
                <label className="text-[10px] font-bold text-[#E5DCD0]/60 uppercase tracking-widest">
                  Community / Caste
                </label>
                <div className="relative">
                  <select
                    value={community}
                    onChange={(e) => setCommunity(e.target.value)}
                    className="w-full bg-[#081626]/40 border border-[#E5DCD0]/20 rounded-xl px-4 py-2.5 text-xs text-white appearance-none outline-none focus:border-brand-gold transition-colors pr-10 cursor-pointer"
                  >
                    <option value="all" className="bg-[#0B1E36] text-white">All Communities</option>
                    {communityOptions.map((c: string) => (
                      <option key={c} value={c} className="bg-[#0B1E36] text-white">
                        {c}
                      </option>
                    ))}
                  </select>
                  <ChevronDown className="absolute right-5 top-1/2 transform -translate-y-1/2 h-4 w-4 text-[#E5DCD0]/60 pointer-events-none" />
                </div>
              </div>
            )}

            {/* Mother tongue */}
            <div className="flex flex-col gap-2">
              <label className="text-[10px] font-bold text-[#E5DCD0]/60 uppercase tracking-widest">
                Mother Tongue
              </label>
              <div className="relative">
                <select
                  value={motherTongue}
                  onChange={(e) => setMotherTongue(e.target.value)}
                  className="w-full bg-[#081626]/40 border border-[#E5DCD0]/20 rounded-xl px-4 py-2.5 text-xs text-white appearance-none outline-none focus:border-brand-gold transition-colors pr-10 cursor-pointer"
                >
                  <option value="all" className="bg-[#0B1E36] text-white">All Languages</option>
                  <option value="Hindi" className="bg-[#0B1E36] text-white">Hindi</option>
                  <option value="Punjabi" className="bg-[#0B1E36] text-white">Punjabi</option>
                  <option value="Tamil" className="bg-[#0B1E36] text-white">Tamil</option>
                  <option value="Telugu" className="bg-[#0B1E36] text-white">Telugu</option>
                  <option value="Bengali" className="bg-[#0B1E36] text-white">Bengali</option>
                  <option value="Marathi" className="bg-[#0B1E36] text-white">Marathi</option>
                  <option value="Gujarati" className="bg-[#0B1E36] text-white">Gujarati</option>
                  <option value="Malayalam" className="bg-[#0B1E36] text-white">Malayalam</option>
                  <option value="Urdu" className="bg-[#0B1E36] text-white">Urdu</option>
                  <option value="English" className="bg-[#0B1E36] text-white">English</option>
                </select>
                <ChevronDown className="absolute right-5 top-1/2 transform -translate-y-1/2 h-4 w-4 text-[#E5DCD0]/60 pointer-events-none" />
              </div>
            </div>

            {/* Marital Status */}
            <div className="flex flex-col gap-2">
              <label className="text-[10px] font-bold text-[#E5DCD0]/60 uppercase tracking-widest flex items-center justify-between">
                <span>Marital Status</span>
                {isFree && <span className="text-[9px] text-brand-gold font-support flex items-center gap-0.5 uppercase tracking-normal">🔒 Upgrade</span>}
              </label>
              <div className="relative">
                <select
                  value={maritalStatus}
                  onChange={(e) => setMaritalStatus(e.target.value)}
                  disabled={isFree}
                  className="w-full bg-[#081626]/40 border border-[#E5DCD0]/20 rounded-xl px-4 py-2.5 text-xs text-white appearance-none outline-none focus:border-brand-gold transition-colors pr-10 cursor-pointer disabled:opacity-50"
                >
                  <option value="all" className="bg-[#0B1E36] text-white">All Statuses</option>
                  <option value="Never Married" className="bg-[#0B1E36] text-white">Never Married</option>
                  <option value="Divorced" className="bg-[#0B1E36] text-white">Divorced</option>
                </select>
                <ChevronDown className="absolute right-5 top-1/2 transform -translate-y-1/2 h-4 w-4 text-[#E5DCD0]/60 pointer-events-none" />
              </div>
            </div>

            {/* Diet */}
            <div className="flex flex-col gap-2">
              <label className="text-[10px] font-bold text-[#E5DCD0]/60 uppercase tracking-widest flex items-center justify-between">
                <span>Dietary Preferences</span>
                {isFree && <span className="text-[9px] text-brand-gold font-support flex items-center gap-0.5 uppercase tracking-normal">🔒 Upgrade</span>}
              </label>
              <div className="relative">
                <select
                  value={diet}
                  onChange={(e) => setDiet(e.target.value)}
                  disabled={isFree}
                  className="w-full bg-[#081626]/40 border border-[#E5DCD0]/20 rounded-xl px-4 py-2.5 text-xs text-white appearance-none outline-none focus:border-brand-gold transition-colors pr-10 cursor-pointer disabled:opacity-50"
                >
                  <option value="all" className="bg-[#0B1E36] text-white">Any Diet</option>
                  <option value="Vegetarian" className="bg-[#0B1E36] text-white">Vegetarian Only</option>
                  <option value="Non-vegetarian" className="bg-[#0B1E36] text-white">Non-Vegetarian Only</option>
                </select>
                <ChevronDown className="absolute right-5 top-1/2 transform -translate-y-1/2 h-4 w-4 text-[#E5DCD0]/60 pointer-events-none" />
              </div>
            </div>

            {/* Family Status */}
            <div className="flex flex-col gap-2">
              <label className="text-[10px] font-bold text-[#E5DCD0]/60 uppercase tracking-widest flex items-center justify-between">
                <span>Family Status</span>
                {isFree && <span className="text-[9px] text-brand-gold font-support flex items-center gap-0.5 uppercase tracking-normal">🔒 Upgrade</span>}
              </label>
              <div className="relative">
                <select
                  value={familyStatus}
                  onChange={(e) => setFamilyStatus(e.target.value)}
                  disabled={isFree}
                  className="w-full bg-[#081626]/40 border border-[#E5DCD0]/20 rounded-xl px-4 py-2.5 text-xs text-white appearance-none outline-none focus:border-brand-gold transition-colors pr-10 cursor-pointer disabled:opacity-50"
                >
                  <option value="all" className="bg-[#0B1E36] text-white">Any Background Status</option>
                  <option value="Middle Class" className="bg-[#0B1E36] text-white">Middle Class</option>
                  <option value="Upper Middle Class" className="bg-[#0B1E36] text-white">Upper Middle Class</option>
                  <option value="Rich/Affluent" className="bg-[#0B1E36] text-white">Rich & Affluent</option>
                  <option value="Elite" className="bg-[#0B1E36] text-white">Elite</option>
                </select>
                <ChevronDown className="absolute right-5 top-1/2 transform -translate-y-1/2 h-4 w-4 text-[#E5DCD0]/60 pointer-events-none" />
              </div>
            </div>

            {/* Minimum Income */}
            <div className="flex flex-col gap-2">
              <label className="text-[10px] font-bold text-[#E5DCD0]/60 uppercase tracking-widest flex items-center justify-between">
                <span>Minimum Annual Income</span>
                {isFree && <span className="text-[9px] text-brand-gold font-support flex items-center gap-0.5 uppercase tracking-normal">🔒 Upgrade</span>}
              </label>
              <div className="relative">
                <select
                  value={minIncome}
                  onChange={(e) => setMinIncome(Number(e.target.value))}
                  disabled={isFree}
                  className="w-full bg-[#081626]/40 border border-[#E5DCD0]/20 rounded-xl px-4 py-2.5 text-xs text-white appearance-none outline-none focus:border-brand-gold transition-colors pr-10 cursor-pointer disabled:opacity-50"
                >
                  <option value="0" className="bg-[#0B1E36] text-white">Any Income</option>
                  <option value="1000000" className="bg-[#0B1E36] text-white">10 LPA+</option>
                  <option value="1800000" className="bg-[#0B1E36] text-white">15 LPA+</option>
                  <option value="2500000" className="bg-[#0B1E36] text-white">25 LPA+</option>
                  <option value="5000000" className="bg-[#0B1E36] text-white">50 LPA+</option>
                  <option value="10000000" className="bg-[#0B1E36] text-white">1 Crore+</option>
                </select>
                <ChevronDown className="absolute right-5 top-1/2 transform -translate-y-1/2 h-4 w-4 text-[#E5DCD0]/60 pointer-events-none" />
              </div>
            </div>

            {/* Checkbox filters */}
            <div className="space-y-2.5 pt-2">
              <label className={`flex items-center gap-2.5 text-xs text-[#E5DCD0]/80 font-support select-none ${isFree ? "opacity-50 cursor-not-allowed" : "cursor-pointer"}`}>
                <input
                  type="checkbox"
                  checked={onlyVerified}
                  onChange={(e) => setOnlyVerified(e.target.checked)}
                  disabled={isFree}
                  className="rounded text-brand-gold accent-brand-gold shadow-sm"
                />
                ID Verified Profiles Only {isFree && "🔒"}
              </label>
              <label className={`flex items-center gap-2.5 text-xs text-[#E5DCD0]/80 font-support select-none ${isFree ? "opacity-50 cursor-not-allowed" : "cursor-pointer"}`}>
                <input
                  type="checkbox"
                  checked={onlyPremium}
                  onChange={(e) => setOnlyPremium(e.target.checked)}
                  disabled={isFree}
                  className="rounded text-brand-gold accent-brand-gold shadow-sm"
                />
                Premium Members Only {isFree && "🔒"}
              </label>
            </div>

            {/* Save search option */}
            <div className="pt-4 border-t border-border/10">
              <button
                type="button"
                onClick={() => setShowSaveModal(true)}
                className="w-full border border-brand-gold/30 text-brand-gold hover:border-brand-gold hover:bg-brand-gold/10 hover:!text-brand-gold rounded-xl py-2.5 text-xs flex items-center justify-center gap-2 font-medium transition-all duration-300 font-sans cursor-pointer"
              >
                <Save className="h-4 w-4" /> Save Search Settings
              </button>
            </div>
          </form>

          {/* Saved Searches List */}
          {savedSearches.length > 0 && (
            <div className="mt-8 pt-6 border-t border-border/10">
              <h3 className="text-xs font-support font-semibold text-[#E5DCD0]/60 uppercase tracking-wider mb-3">
                Saved Search Templates
              </h3>
              <div className="space-y-2">
                {savedSearches.map((s) => (
                  <div key={s.id} className="flex items-center justify-between group p-1.5 rounded hover:bg-white/5">
                    <button
                      onClick={() => handleApplySavedSearch(s.filters)}
                      className="text-xs text-brand-gold font-bold hover:underline text-left truncate flex-1 font-support cursor-pointer"
                    >
                      {s.name}
                    </button>
                    <button
                      onClick={() => deleteSavedSearch(s.id)}
                      className="text-muted-foreground hover:text-destructive shrink-0 cursor-pointer"
                    >
                      <Trash2 className="h-3.5 w-3.5" />
                    </button>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Recent Queries */}
          {recentSearches.length > 0 && (
            <div className="mt-6 pt-6 border-t border-border/10">
              <h3 className="text-xs font-support font-semibold text-[#E5DCD0]/60 uppercase tracking-wider mb-2">
                Recent Matches Searched
              </h3>
              <div className="flex flex-wrap gap-1.5">
                {recentSearches.map((q, idx) => (
                  <span
                    key={idx}
                    className="text-[9px] bg-white/5 text-[#E5DCD0]/85 px-2 py-0.5 rounded font-support border border-border/10"
                  >
                    {q}
                  </span>
                ))}
              </div>
            </div>
          )}
        </aside>

        {/* RIGHT COLUMN: SEARCH RESULTS GRID */}
        <section className="flex-1 w-full space-y-6">
          <div className="bg-card border border-border/80 rounded-2xl p-5 shadow-sm flex items-center justify-between">
            <span className="text-xs font-support text-muted-foreground">
              Showing <span className="font-bold text-foreground">{filteredProfiles.length}</span> luxury matches matching your search criteria
            </span>
            <div className="flex items-center gap-1 text-xs text-brand-gold font-bold font-support">
              <Sparkles className="h-4 w-4" /> CURATED ALIGNMENT
            </div>
          </div>

          {filteredProfiles.length === 0 ? (
            <div className="bg-card border border-border/70 rounded-2xl p-16 text-center shadow-sm">
              <SearchIcon className="h-12 w-12 text-muted-foreground mx-auto mb-4 opacity-40" />
              <h3 className="font-serif text-xl font-bold text-brand-navy dark:text-foreground">
                No Compatible Matches Found
              </h3>
              <p className="text-xs text-muted-foreground max-w-sm mx-auto mt-2 leading-relaxed font-support">
                Try widening your filtering parameters (e.g. including wider age groups, multiple languages, or any family status values).
              </p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {filteredProfiles.map((p: any) => {
                const percentage = getCompatibilityScore(p);
                const isSent = sentInterests?.some((i: any) => i.receiver.id === p.id);
                const isMutual =
                  sentInterests?.some((i: any) => i.receiver.id === p.id && i.status === "Accepted") ||
                  receivedInterests?.some((i: any) => i.sender.id === p.id && i.status === "Accepted");
                const isShort = (shortlistedData || []).some((s: any) => s.profile?.id === p.id || s.targetProfile?.id === p.id || s.id === p.id);

                return (
                  <div
                    key={p.id}
                    className="bg-card rounded-2xl border border-border/70 overflow-hidden shadow-sm hover:shadow-md hover:border-brand-gold/50 transition-all duration-300 flex flex-col justify-between"
                  >
                    <div className="relative h-64 w-full bg-muted overflow-hidden group">
                      {p.photos && p.photos.length > 0 && p.photos[0] ? (
                        <img
                          src={p.photos[0]}
                          alt={p.name}
                          className="h-full w-full object-cover group-hover:scale-105 transition-transform duration-500"
                        />
                      ) : (
                        <div className="h-full w-full flex flex-col items-center justify-center bg-muted/65 p-4 text-center text-xs text-muted-foreground font-support gap-1.5 animate-pulse">
                          <ImageOff className="h-7 w-7 text-brand-gold/40" />
                          <span>Please upload the images</span>
                        </div>
                      )}

                      {/* Header indicators */}
                      <div className="absolute top-3 left-3 flex gap-1.5 items-center">
                        {p.isVerified && (
                          <span className="flex items-center gap-0.5 bg-brand-navy/95 backdrop-blur-sm text-brand-ivory text-[9px] font-bold px-2 py-0.5 rounded-full border border-[#F7F3EE]/20 shadow-sm font-support uppercase">
                            <ShieldCheck className="h-2.5 w-2.5 text-brand-gold fill-brand-navy" /> Verified
                          </span>
                        )}
                        {p.isPremium && (
                          <span className="bg-brand-navy/95 backdrop-blur-sm text-brand-gold text-[9px] font-bold px-2 py-0.5 rounded-full border border-brand-gold/30 shadow-sm font-support uppercase">
                            ★ Premium
                          </span>
                        )}
                      </div>

                      {/* Match percentage circular ring */}
                      <div className="absolute bottom-3 right-3 bg-card/95 backdrop-blur-sm p-1.5 rounded-full border border-border/40 shadow-md">
                        <MatchRing percentage={percentage} size={42} strokeWidth={3} />
                      </div>

                      {/* Shortlist heart button */}
                      <button
                        onClick={async () => {
                          try {
                            const res = await toggleShortlistApi(p.id).unwrap();
                            showToast(res.message, "info");
                          } catch (err) {
                            showToast("Failed to update shortlist.", "error");
                          }
                        }}
                        className={`absolute top-3 right-3 p-2 rounded-full backdrop-blur-sm transition-colors border cursor-pointer ${
                          isShort
                            ? "bg-destructive border-destructive text-white"
                            : "bg-black/40 border-white/20 text-[#E5DCD0] hover:text-white"
                        }`}
                      >
                        <Heart className={`h-4 w-4 ${isShort ? "fill-current" : ""}`} />
                      </button>
                    </div>

                    <div className="p-5 flex-1 flex flex-col justify-between">
                      <div>
                        <div className="flex items-center justify-between">
                          <h3 className="font-serif text-lg font-bold text-brand-navy dark:text-foreground">
                            {p.name}
                          </h3>
                        </div>

                        <p className="text-xs text-muted-foreground font-support mt-1">
                          {p.dateOfBirth ? (new Date().getFullYear() - new Date(p.dateOfBirth).getFullYear()) : 25} Yrs • {p.height || "5 ft 7 in"} • {p.religion} • {p.community}
                        </p>
                        <p className="text-xs text-muted-foreground font-support truncate mt-1">
                          {p.education.split(" (")[0]}
                        </p>
                        <p className="text-xs text-muted-foreground font-support italic truncate mt-1">
                          {p.occupation.split(" (")[0]} • {p.city}, {p.state}
                        </p>
                        <p className="text-xs font-support font-semibold text-brand-gold mt-2">
                          Salary: {p.salary}
                        </p>
                      </div>

                      <div className="grid grid-cols-2 gap-2 mt-5 pt-3 border-t border-border/40">
                        <Link href={`/profile/${p.id}`} className="w-full">
                          <Button variant="outline" size="sm" className="w-full border-brand-gold/30 text-brand-gold hover:border-brand-gold hover:bg-brand-gold/10 hover:!text-brand-gold uppercase font-support font-semibold tracking-wider text-[11px]">
                            View Details
                          </Button>
                        </Link>

                        {isMutual ? (
                          <Link href="/chat" className="w-full">
                            <Button variant="gold" size="sm" className="w-full uppercase font-support font-semibold tracking-wider text-[11px] flex items-center justify-center gap-1">
                              <MessageSquare className="h-3.5 w-3.5" /> Chat
                            </Button>
                          </Link>
                        ) : (
                          <Button
                            variant={isSent ? "outline" : "primary"}
                            size="sm"
                            onClick={() => handleSendInterest(p.id)}
                            className="w-full uppercase font-support font-semibold tracking-wider text-[11px] flex items-center justify-center gap-1"
                            disabled={isSent}
                          >
                            <Heart className={`h-3.5 w-3.5 ${isSent ? "fill-current text-destructive" : ""}`} />
                            {isSent ? "Interested" : "Connect"}
                          </Button>
                        )}
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </section>
      </div>

      {/* SAVE SEARCH MODAL */}
      {showSaveModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div onClick={() => setShowSaveModal(false)} className="fixed inset-0 bg-brand-navy/60 backdrop-blur-sm" />
          <div className="relative z-10 w-full max-w-sm glass-premium rounded-2xl shadow-xl border border-brand-gold/30 p-6 text-foreground">
            <h3 className="font-serif text-lg font-semibold text-brand-navy dark:text-foreground mb-4">
              Save Filters
            </h3>
            <form onSubmit={handleSaveSearch} className="space-y-4">
              <Input
                label="Enter a name for this search"
                placeholder="E.g. Brahmin Software Engineers"
                required
                value={searchSaveName}
                onChange={(e) => setSearchSaveName(e.target.value)}
              />
              <div className="flex items-center gap-2 pt-2">
                <Button type="button" variant="outline" className="flex-1" onClick={() => setShowSaveModal(false)}>
                  Cancel
                </Button>
                <Button type="submit" variant="primary" className="flex-1 font-semibold uppercase tracking-wider text-xs">
                  Save Settings
                </Button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}

export default function SearchPage() {
  return (
    <>
      <Navbar />

      <main className="flex-1 bg-[#F7F3EE] dark:bg-[#081626] py-10 px-4 sm:px-6 lg:px-8">
        <Suspense fallback={
          <div className="min-h-screen flex items-center justify-center">
            <div className="h-10 w-10 border-4 border-brand-gold border-t-transparent rounded-full animate-spin" />
          </div>
        }>
          <SearchContent />
        </Suspense>
      </main>

      <Footer />
    </>
  );
}
