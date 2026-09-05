"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useAppStore } from "@/lib/store";
import { AppConst } from "@/lib/AppConst";
import { Navbar } from "@/components/layout/Navbar";
import { Footer } from "@/components/layout/Footer";
import { Button } from "@/components/ui/button";
import { MatchRing } from "@/components/ui/MatchRing";
import { useSelector } from "react-redux";
import { RootState } from "@/lib/redux/store";
import {
  useGetMyProfileQuery,
  useSearchProfilesQuery,
  useSendInterestMutation,
  useAcceptInterestMutation,
  useDeclineInterestMutation,
  useBoostProfileMutation,
  useGetSentInterestsQuery,
  useGetReceivedInterestsQuery,
  useGetMyVisitorsQuery,
  useGetMyShortlistedQuery,
  useToggleShortlistMutation,
  useGetChatConnectionsQuery
} from "@/lib/redux/api";
import {
  ShieldAlert,
  Flame,
  FileCheck,
  Eye,
  Heart,
  MessageSquare,
  ArrowRight,
  TrendingUp,
  UserCheck,
  Star,
  UserPlus,
  ImageOff,
  Users
} from "lucide-react";

export default function DashboardPage() {
  const router = useRouter();
  const authUser = useSelector((state: RootState) => state.auth.user);
  const { data: myProfile, isLoading: isProfileLoading } = useGetMyProfileQuery(undefined, { skip: !authUser });
  
  const targetGender = myProfile?.gender?.toLowerCase() === "female" ? "Male" : "Female";
  const { data: matchProfiles } = useSearchProfilesQuery(
    { gender: targetGender },
    { skip: !myProfile }
  );

  const { data: sentInterests } = useGetSentInterestsQuery(undefined, { skip: !myProfile });
  const { data: receivedInterests } = useGetReceivedInterestsQuery(undefined, { skip: !myProfile });
  const { data: dbVisitors } = useGetMyVisitorsQuery(undefined, { skip: !myProfile });
  const { data: dbShortlisted } = useGetMyShortlistedQuery(undefined, { skip: !myProfile });
  const { data: friendsList } = useGetChatConnectionsQuery(undefined, { skip: !myProfile });

  const [sendInterestApi] = useSendInterestMutation();
  const [acceptInterestApi] = useAcceptInterestMutation();
  const [declineInterestApi] = useDeclineInterestMutation();
  const [boostProfileApi] = useBoostProfileMutation();
  const [toggleShortlistApi] = useToggleShortlistMutation();

  const {
    profiles,
    showToast,
    addNotification,
    themeMode
  } = useAppStore();

  const [mounted, setMounted] = useState(false);
  const [boostActive, setBoostActive] = useState(false);
  const [avatarError, setAvatarError] = useState(false);

  useEffect(() => {
    setMounted(true);
    if (mounted) {
      if (!authUser) {
        router.push("/login");
      } else if (authUser.email === "admin@vikan.com") {
        router.push("/admin");
      }
    }
  }, [authUser, mounted]);

  useEffect(() => {
    if (myProfile) {
      setBoostActive(myProfile.isPremium);
    }
  }, [myProfile]);

  const handleSendInterest = async (id: string) => {
    try {
      await sendInterestApi(id).unwrap();
      showToast("Interest expressed successfully!", "success");
    } catch (e: any) {
      showToast(e?.data?.message || "Failed to express interest.", "error");
    }
  };

  const handleAcceptInterest = async (id: string) => {
    try {
      await acceptInterestApi(id).unwrap();
      showToast("Interest accepted! You can now chat directly.", "success");
    } catch (e: any) {
      showToast(e?.data?.message || "Failed to accept interest.", "error");
    }
  };

  const handleDeclineInterest = async (id: string) => {
    try {
      await declineInterestApi(id).unwrap();
      showToast("Interest declined.", "info");
    } catch (e: any) {
      showToast(e?.data?.message || "Failed to decline interest.", "error");
    }
  };

  function formatRelativeTime(dateString?: string) {
    if (!dateString) return "Recently";
    const date = new Date(dateString);
    const now = new Date();
    const diffSec = Math.floor((now.getTime() - date.getTime()) / 1000);
    if (diffSec < 60) return "Just now";
    if (diffSec < 3600) return `${Math.floor(diffSec / 60)}m ago`;
    if (diffSec < 86400) return `${Math.floor(diffSec / 3600)}h ago`;
    if (diffSec < 172800) return "Yesterday";
    return `${Math.floor(diffSec / 86400)}d ago`;
  }

  const handleBoost = async () => {
    try {
      await boostProfileApi().unwrap();
      setBoostActive(true);
      addNotification({
        type: "verification",
        title: "Profile Boost Active",
        body: "Your profile is highlighted at the top of search results."
      });
    } catch (err) {
      console.error(err);
    }
  };

  if (!mounted || isProfileLoading || !myProfile) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[#F7F3EE] dark:bg-[#081626]">
        <div className="h-10 w-10 border-4 border-brand-gold border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  const currentUser = myProfile;

  // Calculate matching scores and filter
  const recommendedMatches = (matchProfiles || [])
    .filter((p: any) => p.id !== currentUser.id)
    .map((p: any) => {
      let score = 70;
      if (p.religion === currentUser.religion) score += 10;
      if (p.diet === currentUser.diet) score += 5;
      if (p.state === currentUser.state) score += 5;
      if (p.isVerified) score += 5;
      if (p.isPremium) score += 5;
      return { profile: p, percentage: Math.min(score, 98) };
    })
    .sort((a: any, b: any) => b.percentage - a.percentage)
    .slice(0, 4);

  // Missing profile items for completion score
  const missingItems = [];
  let completionPercentage = 70;

  if (!currentUser.aboutMe || currentUser.aboutMe.trim().length < 15) {
    missingItems.push({ label: "Add 'About Me' personal bio", link: `/profile/${currentUser.id}` });
  } else {
    completionPercentage += 10;
  }
  if (!currentUser.isVerified) {
    missingItems.push({ label: "Submit Government Photo ID", link: "/verification" });
  } else {
    completionPercentage += 10;
  }
  if (!currentUser.photos || currentUser.photos.length < 2) {
    missingItems.push({ label: "Add secondary gallery photos", link: `/profile/${currentUser.id}` });
  } else {
    completionPercentage += 10;
  }



  // Helper for overlapping circular avatar stack
  const AvatarStack = ({ items, getPhoto }: { items: any[]; getPhoto: (item: any) => any }) => {
    if (!items || items.length === 0) return null;
    const visibleItems = items.slice(0, 4);
    const extraCount = items.length > 4 ? items.length - 4 : 0;

    return (
      <div className="flex items-center -space-x-3 overflow-hidden py-1">
        {visibleItems.map((item, idx) => {
          const rawPhoto = getPhoto(item);
          const name = item?.name || item?.profile?.name || item?.sender?.name || "User";
          const photoUrl = AppConst.getPhotoUrl(rawPhoto);
          return photoUrl ? (
            <img
              key={idx}
              src={photoUrl}
              alt={name}
              className="inline-block h-10 w-10 rounded-full ring-2 ring-card object-cover shrink-0 shadow-sm"
            />
          ) : (
            <div
              key={idx}
              className="inline-block h-10 w-10 rounded-full ring-2 ring-card bg-brand-gold/20 text-brand-gold font-serif font-bold text-xs flex items-center justify-center shrink-0 shadow-sm uppercase"
            >
              {name.charAt(0)}
            </div>
          );
        })}
        {extraCount > 0 && (
          <div className="inline-block h-10 w-10 rounded-full ring-2 ring-card bg-brand-navy dark:bg-card text-brand-gold text-[11px] font-bold font-support flex items-center justify-center shrink-0 shadow-sm border border-brand-gold/30">
            +{extraCount}
          </div>
        )}
      </div>
    );
  };

  return (
    <>
      <Navbar />

      <main className="flex-1 bg-[#F7F3EE] dark:bg-[#081626] py-10 px-4 sm:px-6 lg:px-8 text-foreground">
        <div className="mx-auto max-w-7xl">
          {/* Header Row */}
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-8">
            <div>
              <h1 className="font-serif text-3xl font-bold text-brand-navy dark:text-foreground">
                Namaste, {currentUser.name}
              </h1>
              <p className="text-xs text-muted-foreground font-support mt-1">
                Here is your matrimonial checklist and top curated matches today.
              </p>
            </div>

            <div className="flex items-center gap-2.5">
              <Button
                variant={boostActive ? "secondary" : "primary"}
                onClick={handleBoost}
                className="flex items-center gap-1.5 font-bold uppercase tracking-wider text-xs"
                disabled={boostActive}
              >
                <Flame className={`h-4 w-4 ${boostActive ? "animate-bounce text-brand-navy" : "text-brand-navy"}`} />
                {boostActive ? "Profile Boosted!" : "Boost Profile"}
              </Button>
            </div>
          </div>

          {/* Quick Metrics Overview Row with Overlapping Avatar Stacks */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
            {/* 1. Friends List */}
            <div className="bg-card border border-border/80 rounded-2xl p-5 shadow-sm flex flex-col justify-between hover:border-brand-gold/50 transition-all">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold font-support uppercase tracking-wider text-muted-foreground">
                  Friends List
                </span>
                <span className="bg-brand-gold/15 text-brand-gold text-xs font-bold px-2 py-0.5 rounded-full border border-brand-gold/30 font-support">
                  {friendsList?.length || 0}
                </span>
              </div>
              <div className="mt-3 flex items-center justify-between">
                <AvatarStack items={friendsList || []} getPhoto={(item) => item?.photos?.[0]} />
                <Link href="/chat" className="text-xs font-bold text-brand-gold hover:underline font-support">
                  Chat →
                </Link>
              </div>
            </div>

            {/* 2. Profile Visitors */}
            <div className="bg-card border border-border/80 rounded-2xl p-5 shadow-sm flex flex-col justify-between hover:border-brand-gold/50 transition-all">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold font-support uppercase tracking-wider text-muted-foreground">
                  Profile Visitors
                </span>
                <span className="bg-blue-500/15 text-blue-500 text-xs font-bold px-2 py-0.5 rounded-full border border-blue-500/30 font-support">
                  {dbVisitors?.length || 0}
                </span>
              </div>
              <div className="mt-3 flex items-center justify-between">
                <AvatarStack items={dbVisitors || []} getPhoto={(item) => item?.profile?.photos?.[0]} />
                <span className="text-xs text-muted-foreground font-support">Viewed</span>
              </div>
            </div>

            {/* 3. Shortlisted Profiles */}
            <div className="bg-card border border-border/80 rounded-2xl p-5 shadow-sm flex flex-col justify-between hover:border-brand-gold/50 transition-all">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold font-support uppercase tracking-wider text-muted-foreground">
                  Shortlisted
                </span>
                <span className="bg-rose-500/15 text-rose-500 text-xs font-bold px-2 py-0.5 rounded-full border border-rose-500/30 font-support">
                  {dbShortlisted?.length || 0}
                </span>
              </div>
              <div className="mt-3 flex items-center justify-between">
                <AvatarStack items={dbShortlisted || []} getPhoto={(item) => item?.profile?.photos?.[0]} />
                <Link href="/search" className="text-xs font-bold text-brand-gold hover:underline font-support">
                  Explore →
                </Link>
              </div>
            </div>

            {/* 4. Interests Received */}
            <div className="bg-card border border-border/80 rounded-2xl p-5 shadow-sm flex flex-col justify-between hover:border-brand-gold/50 transition-all">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold font-support uppercase tracking-wider text-muted-foreground">
                  Interests Received
                </span>
                <span className="bg-emerald-500/15 text-emerald-500 text-xs font-bold px-2 py-0.5 rounded-full border border-emerald-500/30 font-support">
                  {receivedInterests?.length || 0}
                </span>
              </div>
              <div className="mt-3 flex items-center justify-between">
                <AvatarStack items={receivedInterests || []} getPhoto={(item) => item?.sender?.photos?.[0]} />
                <span className="text-xs text-muted-foreground font-support">Requests</span>
              </div>
            </div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
            {/* Left side checklist and matches */}
            <div className="lg:col-span-8 space-y-8">
              {/* Profile Completion Box */}
              <div className="bg-card border border-border/80 rounded-2xl p-6 shadow-sm flex flex-col md:flex-row items-center gap-6">
                <div className="flex flex-col items-center md:items-start text-center md:text-left flex-1">
                  <h3 className="font-serif text-lg font-bold text-brand-navy dark:text-foreground">
                    Profile Strength: {completionPercentage}%
                  </h3>
                  <p className="text-xs text-muted-foreground font-support mt-1 max-w-md">
                    Complete your profile details to obtain verified badges and unlock unlimited interests.
                  </p>
                  
                  {missingItems.length > 0 && (
                    <div className="mt-4 space-y-2 w-full">
                      {missingItems.map((item, idx) => (
                        <Link
                          key={idx}
                          href={item.link}
                          className="flex items-center gap-2 text-xs font-semibold text-brand-gold hover:underline font-support"
                        >
                          <span className="h-1.5 w-1.5 rounded-full bg-brand-gold" />
                          {item.label}
                        </Link>
                      ))}
                    </div>
                  )}
                </div>

                <div className="w-24 h-24 flex-shrink-0 relative">
                  <div className="absolute inset-0 flex items-center justify-center">
                    <span className="text-xl font-bold font-sans text-brand-navy dark:text-foreground">
                      {completionPercentage}%
                    </span>
                  </div>
                  <svg className="w-full h-full transform -rotate-90">
                    <circle cx="48" cy="48" r="40" stroke="var(--border)" strokeWidth="6" fill="transparent" className="opacity-30" />
                    <circle
                      cx="48"
                      cy="48"
                      r="40"
                      stroke="var(--secondary)"
                      strokeWidth="6"
                      fill="transparent"
                      strokeDasharray={251.2}
                      strokeDashoffset={251.2 - (completionPercentage / 100) * 251.2}
                      strokeLinecap="round"
                    />
                  </svg>
                </div>
              </div>

              {/* Recommended Matches */}
              <div>
                <div className="flex justify-between items-center border-b border-border/60 pb-3 mb-6">
                  <h2 className="font-serif text-xl font-bold text-brand-navy dark:text-foreground flex items-center gap-2">
                    <Star className="h-5 w-5 text-brand-gold fill-current" /> Recommended Matches
                  </h2>
                  <Link href="/search" className="text-xs text-brand-gold hover:underline font-support font-semibold">
                    View All Matches →
                  </Link>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                  {recommendedMatches.map(({ profile, percentage }: any) => {
                    const p = profile;
                    const isSent = sentInterests?.some((i: any) => i.receiver.id === p.id);
                    const isMutual =
                      sentInterests?.some((i: any) => i.receiver.id === p.id && i.status === "Accepted") ||
                      receivedInterests?.some((i: any) => i.sender.id === p.id && i.status === "Accepted");

                    return (
                      <div
                        key={p.id}
                        className="bg-card rounded-2xl border border-border/70 overflow-hidden shadow-sm hover:shadow-md transition-all duration-300 flex flex-col justify-between"
                      >
                        <div className="relative h-60 w-full bg-muted">
                          {p.photos && p.photos.length > 0 && p.photos[0] ? (
                            <img src={AppConst.getPhotoUrl(p.photos[0])} alt={p.name} className="h-full w-full object-cover" />
                          ) : (
                            <div className="h-full w-full flex flex-col items-center justify-center bg-muted/65 p-4 text-center text-xs text-muted-foreground font-support gap-1.5">
                              <ImageOff className="h-7 w-7 text-brand-gold/40" />
                              <span>Please upload the images</span>
                            </div>
                          )}
                          
                          {/* Match Ring overlay */}
                          <div className="absolute bottom-3 right-3 bg-card/90 backdrop-blur-sm p-1.5 rounded-full border border-border/40">
                            <MatchRing percentage={percentage} size={42} strokeWidth={3} />
                          </div>

                          {/* Premium badge */}
                          {p.isPremium && (
                            <div className="absolute top-3 left-3 bg-brand-navy/90 text-brand-gold font-bold text-[9px] px-2 py-0.5 rounded uppercase tracking-wider border border-brand-gold/30">
                              ★ Premium
                            </div>
                          )}
                        </div>

                        <div className="p-5 flex-1 flex flex-col justify-between">
                          <div>
                            <div className="flex items-center gap-2 justify-between">
                              <h3 className="font-serif text-base font-bold text-brand-navy dark:text-foreground">
                                {p.name}
                              </h3>
                              {p.isVerified && (
                                <span className="bg-brand-gold/15 text-brand-gold text-[9px] font-bold px-1.5 py-0.5 rounded font-support border border-brand-gold/20">
                                  ✓ Verified
                                </span>
                              )}
                            </div>
                            <p className="text-xs text-muted-foreground font-support mt-1">
                              {p.age} Yrs • {p.height} • {p.religion} • {p.community}
                            </p>
                            <p className="text-xs text-muted-foreground font-support truncate mt-1">
                              {p.education.split(" (")[0]}
                            </p>
                            <p className="text-xs text-muted-foreground font-support italic truncate mt-1">
                              {p.occupation.split(" (")[0]} • {p.city}
                            </p>
                          </div>

                          <div className="grid grid-cols-2 gap-2 mt-5 pt-3 border-t border-border/40">
                            <Link href={`/profile/${p.id}`} className="w-full">
                              <Button variant="outline" size="sm" className="w-full uppercase font-support font-semibold tracking-wider text-[11px]">
                                View Profile
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
              </div>
            </div>

            {/* Right side metrics & visitors lists */}
            <div className="lg:col-span-4 space-y-8">
              {/* My Profile Card - Hidden as requested */}
              {/* <div className="bg-card border border-border/80 rounded-2xl p-6 shadow-sm flex flex-col items-center text-center">
                <div className="relative h-24 w-24 rounded-full overflow-hidden border-2 border-brand-gold shadow-md mb-4 bg-muted">
                  {currentUser.photos?.[0] && !avatarError ? (
                    <img 
                      src={AppConst.getPhotoUrl(currentUser.photos[0])} 
                      alt={currentUser.name} 
                      onError={() => setAvatarError(true)}
                      className="h-full w-full object-cover" 
                    />
                  ) : (
                    <div className="h-full w-full bg-brand-gold/20 text-brand-gold flex items-center justify-center text-2xl font-bold font-serif uppercase animate-pulse">
                      {currentUser.name?.charAt(0) || "U"}
                    </div>
                  )}
                </div>
                <h3 className="font-serif text-lg font-bold text-brand-navy dark:text-foreground">
                  {currentUser.name}
                </h3>
                <div className="flex gap-1.5 mt-2 justify-center">
                  {currentUser.isVerified && (
                    <span className="bg-brand-gold/15 text-brand-gold text-[9px] font-bold px-1.5 py-0.5 rounded font-support border border-brand-gold/20">
                      ✓ Verified
                    </span>
                  )}
                  {currentUser.isPremium && (
                    <span className="bg-brand-navy dark:bg-brand-navy/60 text-brand-gold text-[9px] font-bold px-1.5 py-0.5 rounded font-support border border-brand-gold/25 uppercase tracking-wider">
                      ★ Premium
                    </span>
                  )}
                </div>
                <hr className="w-full border-border/40 my-4" />
                <Link href={`/profile/${currentUser.id}`} className="w-full">
                  <Button variant="outline" size="sm" className="w-full uppercase font-support font-semibold tracking-wider text-[11px] border-brand-gold text-brand-gold hover:bg-brand-gold/10 hover:!text-brand-gold">
                    View My Full Profile
                  </Button>
                </Link>
              </div> */}

              {/* Friends & Connected Matches */}
              <div className="bg-card border border-border/80 rounded-2xl p-6 shadow-sm">
                <div className="border-b border-border/40 pb-3 mb-4 space-y-2">
                  <div className="flex items-center justify-between">
                    <h3 className="font-serif text-lg font-bold text-brand-navy dark:text-foreground flex items-center gap-2">
                      <UserCheck className="h-5 w-5 text-brand-gold" /> Friends & Connections
                    </h3>
                    <span className="text-xs text-muted-foreground font-support font-normal">
                      {friendsList?.length || 0} friends
                    </span>
                  </div>
                  <AvatarStack items={friendsList || []} getPhoto={(item) => item?.photos?.[0]} />
                </div>

                {(!friendsList || friendsList.length === 0) ? (
                  <div className="text-center py-6">
                    <p className="text-xs text-muted-foreground font-support">
                      No mutual friends connected yet.
                    </p>
                    <p className="text-[10px] text-muted-foreground/80 font-support mt-1">
                      Accept interest requests to unlock chat and connect with members.
                    </p>
                  </div>
                ) : (
                  <div className="space-y-3 max-h-[320px] overflow-y-auto pr-1 scrollbar-thin">
                    {friendsList.map((friend: any) => (
                      <div
                        key={friend.id}
                        className="flex items-center justify-between gap-3 group hover:bg-muted/10 p-2 rounded-xl transition-colors border border-border/30 bg-muted/5"
                      >
                        <Link href={`/profile/${friend.id}`} className="flex items-center gap-3 flex-1 min-w-0">
                          <div className="relative shrink-0">
                            {friend.photos?.[0] ? (
                              <img
                                src={AppConst.getPhotoUrl(friend.photos[0])}
                                alt={friend.name}
                                className="h-10 w-10 rounded-full object-cover border border-brand-gold/40 shrink-0"
                              />
                            ) : (
                              <div className="h-10 w-10 rounded-full bg-brand-gold/20 text-brand-gold flex items-center justify-center text-sm font-bold font-serif uppercase shrink-0">
                                {friend.name?.charAt(0) || "F"}
                              </div>
                            )}
                            <span className={`absolute bottom-0 right-0 h-2.5 w-2.5 rounded-full border-2 border-card ${
                              friend.onlineStatus === "Online" ? "bg-emerald-500" : "bg-muted-foreground/40"
                            }`} />
                          </div>
                          <div className="flex-1 min-w-0">
                            <h4 className="text-xs font-bold text-foreground truncate group-hover:text-brand-gold transition-colors">
                              {friend.name}
                            </h4>
                            <p className="text-[10px] text-muted-foreground font-support truncate">
                              {friend.gender} • {friend.onlineStatus || "Member"}
                            </p>
                          </div>
                        </Link>

                        <div className="flex items-center gap-1.5 shrink-0">
                          <Link href="/chat">
                            <Button size="sm" variant="gold" className="h-7 px-2.5 text-[10px] uppercase font-bold tracking-wider flex items-center gap-1">
                              <MessageSquare className="h-3 w-3" /> Chat
                            </Button>
                          </Link>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              {/* Profile Visitors */}
              <div className="bg-card border border-border/80 rounded-2xl p-6 shadow-sm">
                <div className="border-b border-border/40 pb-3 mb-4 space-y-2">
                  <div className="flex items-center justify-between">
                    <h3 className="font-serif text-lg font-bold text-brand-navy dark:text-foreground flex items-center gap-2">
                      <Eye className="h-5 w-5 text-brand-gold" /> Profile Visitors
                    </h3>
                    <span className="text-xs text-muted-foreground font-support font-normal">
                      {dbVisitors?.length || 0} viewed
                    </span>
                  </div>
                  <AvatarStack items={dbVisitors || []} getPhoto={(item) => item?.profile?.photos?.[0]} />
                </div>

                {(!dbVisitors || dbVisitors.length === 0) ? (
                  <div className="text-center py-6">
                    <p className="text-xs text-muted-foreground font-support">
                      No profile visitors yet.
                    </p>
                    <p className="text-[10px] text-muted-foreground/80 font-support mt-1">
                      Visitors will appear here when members view your profile.
                    </p>
                  </div>
                ) : (
                  <div className="space-y-3 max-h-[300px] overflow-y-auto pr-1 scrollbar-thin">
                    {dbVisitors.map((v: any) => {
                      const profile = v.profile;
                      if (!profile) return null;

                      return (
                        <Link
                          key={v.id}
                          href={`/profile/${profile.id}`}
                          className="flex items-center gap-3 group hover:bg-muted/10 p-1.5 rounded-lg transition-colors border-b border-border/20 last:border-0 pb-2 last:pb-0"
                        >
                          {profile.photos?.[0] ? (
                            <img
                              src={AppConst.getPhotoUrl(profile.photos[0])}
                              alt={profile.name}
                              className="h-10 w-10 rounded-full object-cover border border-border group-hover:border-brand-gold shrink-0"
                            />
                          ) : (
                            <div className="h-10 w-10 rounded-full bg-brand-gold/20 text-brand-gold flex items-center justify-center text-sm font-bold font-serif uppercase shrink-0">
                              {profile.name?.charAt(0) || "U"}
                            </div>
                          )}
                          <div className="flex-1 min-w-0">
                            <h4 className="text-xs font-bold text-foreground truncate group-hover:text-brand-gold transition-colors">
                              {profile.name}
                            </h4>
                            <p className="text-[10px] text-muted-foreground font-support truncate mt-0.5">
                              {profile.city || profile.religion || "Member"} • {profile.occupation || "Professional"}
                            </p>
                          </div>
                          <span className="text-[9px] text-muted-foreground font-support shrink-0">
                            {formatRelativeTime(v.viewedAt)}
                          </span>
                        </Link>
                      );
                    })}
                  </div>
                )}
              </div>

              {/* Shortlisted Favorites Card */}
              <div className="bg-card border border-border/80 rounded-2xl p-6 shadow-sm">
                <div className="border-b border-border/40 pb-3 mb-4 space-y-2">
                  <div className="flex items-center justify-between">
                    <h3 className="font-serif text-lg font-bold text-brand-navy dark:text-foreground flex items-center gap-2">
                      <Heart className="h-5 w-5 text-brand-gold fill-brand-gold/10" /> Shortlisted Profiles
                    </h3>
                    <span className="text-xs text-muted-foreground font-support font-normal">
                      {dbShortlisted?.length || 0} saved
                    </span>
                  </div>
                  <AvatarStack items={dbShortlisted || []} getPhoto={(item) => item?.profile?.photos?.[0]} />
                </div>

                {(!dbShortlisted || dbShortlisted.length === 0) ? (
                  <div className="text-center py-6">
                    <p className="text-xs text-muted-foreground font-support">
                      No shortlisted profiles yet.
                    </p>
                    <Link href="/search" className="text-xs text-brand-gold font-semibold font-support mt-2 hover:underline inline-block">
                      Discover Matches →
                    </Link>
                  </div>
                ) : (
                  <div className="space-y-3 max-h-[300px] overflow-y-auto pr-1 scrollbar-thin">
                    {dbShortlisted.map((item: any) => {
                      const profile = item.profile;
                      if (!profile) return null;

                      return (
                        <div key={item.id} className="flex items-center justify-between gap-3 group border-b border-border/20 last:border-0 pb-3 last:pb-0">
                          <Link
                            href={`/profile/${profile.id}`}
                            className="flex items-center gap-3 group hover:bg-muted/10 p-0.5 rounded-lg transition-colors flex-1 min-w-0"
                          >
                            {profile.photos?.[0] ? (
                              <img
                                src={AppConst.getPhotoUrl(profile.photos[0])}
                                alt={profile.name}
                                className="h-10 w-10 rounded-full object-cover border border-border group-hover:border-brand-gold shrink-0"
                              />
                            ) : (
                              <div className="h-10 w-10 rounded-full bg-brand-gold/20 text-brand-gold flex items-center justify-center text-sm font-bold font-serif uppercase shrink-0">
                                {profile.name?.charAt(0) || "U"}
                              </div>
                            )}
                            <div className="flex-1 min-w-0">
                              <h4 className="text-xs font-bold text-foreground truncate group-hover:text-brand-gold transition-colors">
                                {profile.name}
                              </h4>
                              <p className="text-[10px] text-muted-foreground font-support truncate mt-0.5">
                                {profile.city || profile.religion} • {profile.occupation || "Professional"}
                              </p>
                            </div>
                          </Link>
                          <div className="flex items-center gap-1.5 shrink-0">
                            <Link href={`/profile/${profile.id}`}>
                              <Button variant="outline" size="sm" className="px-2 py-1 text-[10px] border-brand-gold/30 text-brand-gold hover:bg-brand-gold/10 hover:!text-brand-gold uppercase tracking-wider font-semibold font-support cursor-pointer">
                                View
                              </Button>
                            </Link>
                            <button
                              onClick={async () => {
                                try {
                                  const res = await toggleShortlistApi(profile.id).unwrap();
                                  showToast(res.message, "info");
                                } catch (err) {
                                  showToast("Failed to remove from shortlist.", "error");
                                }
                              }}
                              className="p-1.5 text-muted-foreground hover:text-destructive hover:bg-destructive/10 rounded-lg transition-colors cursor-pointer"
                              title="Remove from shortlist"
                            >
                              <Heart className="h-4 w-4 fill-destructive text-destructive" />
                            </button>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                )}
              </div>

              {/* Interests Received Queue */}
              <div className="bg-card border border-border/80 rounded-2xl p-6 shadow-sm">
                <div className="border-b border-border/40 pb-3 mb-4 space-y-2">
                  <div className="flex items-center justify-between">
                    <h3 className="font-serif text-lg font-bold text-brand-navy dark:text-foreground flex items-center gap-2">
                      <Heart className="h-5 w-5 text-brand-gold fill-current" /> Interests Received
                    </h3>
                    <span className="text-xs text-muted-foreground font-support font-normal">
                      {receivedInterests?.filter((i: any) => i.status === "Pending")?.length || 0} pending
                    </span>
                  </div>
                  <AvatarStack items={receivedInterests || []} getPhoto={(item) => item?.sender?.photos?.[0]} />
                </div>

                {(!receivedInterests || receivedInterests.length === 0) ? (
                  <p className="text-xs text-muted-foreground text-center py-6 font-support">
                    No received interests yet.
                  </p>
                ) : (
                  <div className="space-y-4 max-h-[350px] overflow-y-auto pr-1 scrollbar-thin">
                    {receivedInterests.map((interest: any) => {
                      const profile = interest.sender;
                      if (!profile) return null;

                      const isAccepted = interest.status === "Accepted";
                      const isDeclined = interest.status === "Declined";

                      return (
                        <div key={interest.id || profile.id} className="p-3 border border-border/50 rounded-xl bg-muted/5">
                          <Link href={`/profile/${profile.id}`} className="flex items-center gap-3 group">
                            {profile.photos?.[0] ? (
                              <img
                                src={AppConst.getPhotoUrl(profile.photos[0])}
                                alt={profile.name}
                                className="h-10 w-10 rounded-full object-cover border border-border group-hover:border-brand-gold shrink-0"
                              />
                            ) : (
                              <div className="h-10 w-10 rounded-full bg-brand-gold/20 text-brand-gold flex items-center justify-center text-sm font-bold font-serif uppercase shrink-0">
                                {profile.name?.charAt(0) || "U"}
                              </div>
                            )}
                            <div className="flex-1 min-w-0">
                              <div className="flex items-center justify-between">
                                <h4 className="text-xs font-bold text-foreground truncate group-hover:text-brand-gold transition-colors">
                                  {profile.name}
                                </h4>
                                <span className={`text-[9px] font-bold px-1.5 py-0.5 rounded font-support uppercase ${
                                  isAccepted 
                                    ? "bg-emerald-500/10 text-emerald-500 border border-emerald-500/20"
                                    : isDeclined
                                    ? "bg-destructive/10 text-destructive border border-destructive/20"
                                    : "bg-amber-500/10 text-amber-500 border border-amber-500/20"
                                }`}>
                                  {interest.status}
                                </span>
                              </div>
                              <p className="text-[10px] text-muted-foreground font-support truncate mt-0.5">
                                {profile.city || profile.religion} • {profile.occupation || "Professional"}
                              </p>
                            </div>
                          </Link>

                          {interest.status === "Pending" ? (
                            <div className="flex items-center gap-2 mt-3 pt-2.5 border-t border-border/30">
                              <Button
                                variant="outline"
                                size="sm"
                                onClick={() => handleDeclineInterest(profile.id)}
                                className="flex-1 text-[10px] uppercase font-support py-1.5 px-3 h-auto border border-destructive/30 text-destructive hover:bg-destructive/10 cursor-pointer rounded-lg"
                              >
                                Decline
                              </Button>
                              <Button
                                variant="gold"
                                size="sm"
                                onClick={() => handleAcceptInterest(profile.id)}
                                className="flex-1 text-[10px] uppercase font-support py-1.5 px-3 h-auto bg-emerald-600 hover:bg-emerald-500 text-white cursor-pointer rounded-lg font-bold"
                              >
                                Accept
                              </Button>
                            </div>
                          ) : isAccepted ? (
                            <div className="mt-2.5 pt-2 border-t border-border/20 flex justify-end">
                              <Link href="/chat" className="w-full">
                                <Button
                                  variant="outline"
                                  size="sm"
                                  className="w-full text-[10px] uppercase font-support py-1.5 px-3 h-auto border-brand-gold text-brand-gold hover:bg-brand-gold/10 hover:!text-brand-gold flex items-center justify-center gap-1.5"
                                >
                                  <MessageSquare className="h-3 w-3" /> Chat Now
                                </Button>
                              </Link>
                            </div>
                          ) : null}
                        </div>
                      );
                    })}
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </main>

      <Footer />
    </>
  );
}
