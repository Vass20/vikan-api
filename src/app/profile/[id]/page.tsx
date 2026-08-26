"use client";

import React, { useState, useEffect, useMemo } from "react";
import { useParams, useRouter } from "next/navigation";
import Link from "next/link";
import { useAppStore } from "@/lib/store";
import { Navbar } from "@/components/layout/Navbar";
import { useSelector } from "react-redux";
import { RootState } from "@/lib/redux/store";
import {
  useGetProfileByIdQuery,
  useGetMyProfileQuery,
  useUpdateMyProfileMutation,
  useUploadPhotoMutation,
  useSendInterestMutation,
  useAcceptInterestMutation,
  useDeclineInterestMutation,
  useGetSentInterestsQuery,
  useGetReceivedInterestsQuery,
  useUploadPhotoFileMutation,
  useRecordProfileViewMutation,
  useGetMyShortlistedQuery,
  useToggleShortlistMutation
} from "@/lib/redux/api";
import { AppConst } from "@/lib/AppConst";
import { Footer } from "@/components/layout/Footer";
import { Button } from "@/components/ui/button";
import { MatchRing } from "@/components/ui/MatchRing";
import { Dialog } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import {
  Heart,
  MessageSquare,
  Phone,
  ShieldCheck,
  Award,
  ChevronLeft,
  ChevronRight,
  UserCheck,
  Lock,
  Flag,
  FileCheck2,
  Calendar,
  Compass,
  Laptop,
  Coins,
  MapPin,
  Smile,
  Users,
  Mail,
  MoreHorizontal,
  GraduationCap,
  ImageOff
} from "lucide-react";

export default function ProfileDetailPage() {
  const params = useParams();
  const router = useRouter();
  
  const profileId = params.id as string;
  const authUser = useSelector((state: RootState) => state.auth.user);
  
  const { data: profile, isLoading: isProfileLoading } = useGetProfileByIdQuery(profileId as string, { skip: !profileId });
  const { data: currentUserProfile } = useGetMyProfileQuery(undefined, { skip: !authUser });
  const { data: sentInterests } = useGetSentInterestsQuery(undefined, { skip: !authUser });
  const { data: receivedInterests } = useGetReceivedInterestsQuery(undefined, { skip: !authUser });
  const { data: shortlistedData } = useGetMyShortlistedQuery(undefined, { skip: !authUser });

  const [sendInterestApi] = useSendInterestMutation();
  const [acceptInterestApi] = useAcceptInterestMutation();
  const [declineInterestApi] = useDeclineInterestMutation();
  const [updateProfileApi] = useUpdateMyProfileMutation();
  const [uploadPhotoApi] = useUploadPhotoMutation();
  const [uploadPhotoFile, { isLoading: isUploadingFile }] = useUploadPhotoFileMutation();
  const [recordProfileViewApi] = useRecordProfileViewMutation();
  const [toggleShortlistApi] = useToggleShortlistMutation();

  const {
    profiles,
    toggleBlock,
    addNotification,
    addReport,
    notifications,
    showToast
  } = useAppStore();

  const currentUser = currentUserProfile;

  // Active photo slideshow state
  const [activePhotoIdx, setActivePhotoIdx] = useState(0);

  // Active tab state
  const [activeTab, setActiveTab] = useState("basic");

  // Purchase details unlock state
  const [showContactModal, setShowContactModal] = useState(false);
  const [unlockedIds, setUnlockedIds] = useState<string[]>([]);
  useEffect(() => {
    if (typeof window !== "undefined") {
      const stored = localStorage.getItem("vikan_unlocked_contacts");
      if (stored) {
        setUnlockedIds(JSON.parse(stored));
      }
    }
  }, []);
 
  const isUnlocked = profile && unlockedIds.includes(profile.id);

  // Report/Block modals
  const [showBlockModal, setShowBlockModal] = useState(false);
  const [showReportModal, setShowReportModal] = useState(false);
  const [reportReason, setReportReason] = useState("");

  const [mounted, setMounted] = useState(false);

  // Edit profile state
  const [showEditModal, setShowEditModal] = useState(false);
  const [editName, setEditName] = useState("");
  const [editAboutMe, setEditAboutMe] = useState("");
  const [editOccupation, setEditOccupation] = useState("");
  const [editSalary, setEditSalary] = useState("");
  const [editCity, setEditCity] = useState("");
  const [editState, setEditState] = useState("");
  const [editDiet, setEditDiet] = useState("");
  const [editPhotosText, setEditPhotosText] = useState("");

  const isOwnProfile = currentUser && profile && profile.id === currentUser.id;
  const canViewContact = isUnlocked || isOwnProfile;

  const isFree = !currentUser?.membershipType || currentUser?.membershipType === "Free" || currentUser?.membershipType === "Free Member" || currentUser?.membershipType === "Free Package";

  const todayInterestsCount = useMemo(() => {
    if (!sentInterests) return 0;
    const todayStart = new Date();
    todayStart.setHours(0,0,0,0);
    return sentInterests.filter((i: any) => {
      const sentDate = new Date(i.sentAt);
      return sentDate >= todayStart;
    }).length;
  }, [sentInterests]);

  // Add visitor log and check auth on mount
  useEffect(() => {
    setMounted(true);
    if (mounted) {
      if (!authUser) {
        router.push("/login");
        return;
      } else if (authUser.email === "admin@vikan.com") {
        router.push("/admin");
        return;
      }
      if (profile && currentUser && profile.id !== currentUser.id) {
        recordProfileViewApi(profile.id);
      }
    }
  }, [profileId, mounted, authUser, currentUser, profile]);

  // Sync edit form states
  useEffect(() => {
    if (profile && isOwnProfile) {
      setEditName(profile.name || "");
      setEditAboutMe(profile.aboutMe || "");
      setEditOccupation(profile.occupation || "");
      setEditSalary(profile.salary || "");
      setEditCity(profile.city || "");
      setEditState(profile.state || "");
      setEditDiet(profile.diet || "");
      setEditPhotosText(profile.photos ? profile.photos.map((p: any) => AppConst.getPhotoUrl(p)).join(", ") : "");
    }
  }, [profile, isOwnProfile]);

  if (!mounted) return null;

  if (isProfileLoading || !currentUser) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[#F7F3EE] dark:bg-[#081626]">
        <div className="h-10 w-10 border-4 border-brand-gold border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  if (!profile) {
    return (
      <>
        <Navbar />
        <div className="min-h-[70vh] flex flex-col items-center justify-center bg-[#F7F3EE] dark:bg-[#081626] text-foreground">
          <h2 className="font-serif text-2xl font-bold">Profile Not Found</h2>
          <Link href="/dashboard" className="mt-4 text-brand-gold font-bold hover:underline">
            Back to Dashboard
          </Link>
        </div>
        <Footer />
      </>
    );
  }

  const receivedInterest = receivedInterests?.find((i: any) => i.sender?.id === profile?.id || i.senderId === profile?.id);
  const isReceivedPending = receivedInterest && receivedInterest.status === "Pending";
  const isReceivedAccepted = receivedInterest && receivedInterest.status === "Accepted";
  
  const sentInterest = sentInterests?.find((i: any) => i.receiver?.id === profile?.id || i.receiverId === profile?.id);
  const isSentPending = sentInterest && sentInterest.status === "Pending";
  const isSentAccepted = sentInterest && sentInterest.status === "Accepted";

  const isConnected = isReceivedAccepted || isSentAccepted;
  const isSent = !!isSentPending || !!isSentAccepted;
  const isShort = (shortlistedData || []).some((s: any) => s.profile?.id === profile?.id || s.targetProfile?.id === profile?.id || s.id === profile?.id);

  // Match score calculation details
  let matchScore = 75;
  const matchCriteria = [
    { label: "Religion & Mother Tongue match", match: false },
    { label: "Within preferred age limit", match: false },
    { label: "Preferred heights match", match: false },
    { label: "Dietary preferences aligned", match: false },
    { label: "Education background match", match: false }
  ];

  if (currentUser) {
    if (profile.religion === currentUser.religion) {
      matchScore += 8;
      matchCriteria[0].match = true;
    }
    const currentAge = profile.age;
    const prefMin = currentUser.partnerPreferences.ageMin;
    const prefMax = currentUser.partnerPreferences.ageMax;
    if (currentAge >= prefMin && currentAge <= prefMax) {
      matchScore += 6;
      matchCriteria[1].match = true;
    }
    matchScore += 5; // default height match
    matchCriteria[2].match = true;

    if (profile.diet === currentUser.diet) {
      matchScore += 5;
      matchCriteria[3].match = true;
    }
    matchScore += 5; // default edu match
    matchCriteria[4].match = true;
  }
  matchScore = Math.min(matchScore, 98);

  const handleNextPhoto = () => {
    setActivePhotoIdx((prev) => (prev + 1) % profile.photos.length);
  };

  const handlePrevPhoto = () => {
    setActivePhotoIdx((prev) => (prev - 1 + profile.photos.length) % profile.photos.length);
  };

  const handleUnlockContact = (e: React.FormEvent) => {
    e.preventDefault();
    if (!currentUser || !profile) return;
 
    const membership = currentUser?.membershipType || "Free";
    if (
      membership === "Free" ||
      membership === "Free Member" ||
      membership === "Free Package" ||
      membership === "Silver" ||
      membership === "Silver Tier" ||
      membership === "Silver Member"
    ) {
      showToast("Direct contact details unlocks are only available for Gold, Diamond, or Royal Platinum plans. Please upgrade your plan first!", "warning");
      router.push("/membership");
      return;
    }
 
    const isGold = membership === "Gold Member" || membership === "Gold";
    const isDiamond = membership === "Diamond Member" || membership === "Diamond";
 
    if (isGold && unlockedIds.length >= 10 && !unlockedIds.includes(profile.id)) {
      showToast("You have reached the limit of 10 direct contact unlocks for Gold Members. Upgrade to Diamond or Royal Platinum for more!", "warning");
      router.push("/membership");
      return;
    }
 
    if (isDiamond && unlockedIds.length >= 30 && !unlockedIds.includes(profile.id)) {
      showToast("You have reached the limit of 30 direct contact unlocks for Diamond Members. Upgrade to Royal Platinum for unlimited unlocks!", "warning");
      router.push("/membership");
      return;
    }
 
    const newUnlocked = [...unlockedIds, profile.id];
    setUnlockedIds(newUnlocked);
    localStorage.setItem("vikan_unlocked_contacts", JSON.stringify(newUnlocked));
    setShowContactModal(false);
  };

  const handleBlockUser = () => {
    toggleBlock(profile.id);
    addNotification({
      title: "User Blocked",
      body: `You successfully blocked ${profile.name}. They will not see your profile.`,
      type: "system"
    });
    setShowBlockModal(false);
    router.push("/dashboard");
  };

  const handleReportUser = (e: React.FormEvent) => {
    e.preventDefault();
    if (profile) {
      addReport(profile.id, currentUser?.id || "guest", reportReason);
    }
    addNotification({
      title: "Profile Reported",
      body: `Thank you for flag. We will review ${profile?.name || "this user"} for compliance.`,
      type: "system"
    });
    setShowReportModal(false);
    setReportReason("");
  };

  const handleSendInterest = async (id: string) => {
    if (isFree && todayInterestsCount >= 5) {
      showToast("You have reached the daily interest request limit of 5 for Free Members. Upgrade your plan to send unlimited interests!", "warning");
      router.push("/membership");
      return;
    }
    try {
      await sendInterestApi(id).unwrap();
    } catch (err) {
      console.error(err);
    }
  };

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
 
    const photoUrls = editPhotosText
      .split(",")
      .map((url) => url.trim())
      .filter((url) => url !== "");
 
    if (isFree && photoUrls.length >= 3) {
      showToast("Free Members can upload up to 3 photos. Please upgrade your plan in the Membership section to upload more!", "warning");
      return;
    }
 
    const formData = new FormData();
    formData.append("file", file);
 
    try {
      const response = await uploadPhotoFile(formData).unwrap();
      if (response && response.url) {
        const separator = editPhotosText.trim() === "" ? "" : ", ";
        setEditPhotosText((prev) => `${prev}${separator}${response.url}`);
        showToast("Photo uploaded successfully!", "success");
      }
    } catch (err) {
      console.error(err);
      showToast("Failed to upload photo. Please try again.", "error");
    }
  };

  const handleSaveProfile = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await updateProfileApi({
        name: editName,
        aboutMe: editAboutMe,
        occupation: editOccupation,
        salary: editSalary,
        city: editCity,
        state: editState,
        diet: editDiet,
        education: profile.education || "",
        familyType: profile.familyType || "Nuclear",
        familyStatus: profile.familyStatus || "Middle Class",
        familyValues: profile.familyValues || "Moderate",
        familyDetails: profile.familyDetails || "",
        maritalStatus: profile.maritalStatus || "Never Married"
      }).unwrap();

      const photoUrls = editPhotosText
        .split(",")
        .map((url) => url.trim())
        .filter((url) => url !== "");

      const isFree = !profile.membershipType || profile.membershipType === "Free" || profile.membershipType === "Free Member" || profile.membershipType === "Free Package";
      if (isFree && photoUrls.length > 3) {
        showToast("Free Members can upload up to 3 photos. Please upgrade your plan in the Membership section to upload more!", "warning");
        return;
      }

      for (const url of photoUrls) {
        if (!profile.photos?.includes(url)) {
          await uploadPhotoApi({ url }).unwrap();
        }
      }

      addNotification({
        title: "Profile Updated",
        body: "Your profile details have been successfully updated.",
        type: "system"
      });
      
      setShowEditModal(false);
      window.location.reload();
    } catch (err) {
      console.error(err);
    }
  };

  return (
    <>
      <Navbar />

      <main className="flex-1 bg-[#020914] py-12 px-4 sm:px-6 lg:px-8 text-white min-h-[85vh]">
        <div className="mx-auto max-w-5xl">
          {/* Back link */}
          <div className="mb-8">
            <Link 
              href="/search" 
              className="inline-flex items-center gap-1.5 text-xs text-[#E5DCD0]/70 hover:text-brand-gold font-support cursor-pointer"
            >
              <ChevronLeft className="h-4 w-4" /> Back to Search
            </Link>
          </div>

          {/* Main Double Column layout */}
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 items-start">
            
            {/* LEFT COLUMN: IMAGES */}
            <div className="lg:col-span-5 flex flex-col gap-4">
              {/* Photo Card */}
              <div className="relative aspect-[4/5] w-full rounded-[2rem] overflow-hidden border border-brand-gold/15 bg-[#051121]/40 shadow-2xl flex items-center justify-center">
                {profile.photos && profile.photos.length > 0 && profile.photos[activePhotoIdx] ? (
                  <img
                    src={AppConst.getPhotoUrl(profile.photos[activePhotoIdx])}
                    alt={profile.name}
                    className="h-full w-full object-cover"
                  />
                ) : (
                  <div className="h-full w-full flex flex-col items-center justify-center bg-muted/65 p-4 text-center text-xs text-muted-foreground font-support gap-1.5">
                    <ImageOff className="h-8 w-8 text-brand-gold/40" />
                    <span>Please upload the images</span>
                  </div>
                )}

                {/* Photo Badges */}
                <div className="absolute top-4 left-4 flex gap-1.5">
                  {profile.isVerified && (
                    <span className="flex items-center gap-1 bg-[#020914]/90 backdrop-blur-sm text-brand-ivory text-[9px] font-bold px-2.5 py-0.5 rounded-full border border-[#F7F3EE]/25 shadow-sm uppercase font-support">
                      <ShieldCheck className="h-3 w-3 text-brand-gold fill-brand-navy" /> Verified
                    </span>
                  )}
                  {profile.isPremium && (
                    <span className="bg-[#020914]/90 backdrop-blur-sm text-brand-gold text-[9px] font-bold px-2.5 py-0.5 rounded-full border border-brand-gold/30 shadow-sm uppercase font-support">
                      ★ Premium
                    </span>
                  )}
                </div>
              </div>

              {/* Thumbnails indicator */}
              {profile.photos.length > 1 && (
                <div className="grid grid-cols-4 gap-3">
                  {profile.photos.map((ph: any, idx: number) => (
                    <button
                      key={idx}
                      onClick={() => setActivePhotoIdx(idx)}
                      className={`aspect-square w-full rounded-2xl overflow-hidden border-2 transition-all cursor-pointer ${
                        activePhotoIdx === idx ? "border-brand-gold scale-105" : "border-transparent opacity-50 hover:opacity-85"
                      }`}
                    >
                      <img src={AppConst.getPhotoUrl(ph)} alt="Thumb" className="h-full w-full object-cover" />
                    </button>
                  ))}
                </div>
              )}
            </div>

            {/* RIGHT COLUMN: BIO & DETAILED INFO */}
            <div className="lg:col-span-7 flex flex-col gap-8">
              {/* Header info & actions */}
              <div className="flex flex-col sm:flex-row justify-between items-start gap-6">
                <div>
                  <h1 className="font-serif text-3xl font-bold text-white flex items-center gap-2">
                    {profile.name}
                    {profile.isVerified && (
                      <ShieldCheck className="h-6 w-6 text-brand-gold fill-brand-gold/10" />
                    )}
                  </h1>
                  <p className="text-sm text-[#E5DCD0]/70 font-support mt-2">
                    {profile.dateOfBirth ? (new Date().getFullYear() - new Date(profile.dateOfBirth).getFullYear()) : 25} Years, {profile.height || "5 ft 6 in"} | {profile.religion} | {profile.community}
                  </p>
                  <p className="text-xs text-[#E5DCD0]/60 font-support mt-1">
                    {profile.city}, {profile.state}, India
                  </p>
                  <p className="text-xs text-brand-gold font-support mt-2 font-semibold tracking-wide">
                    {profile.occupation}
                  </p>
                </div>

                {/* Top Right Action Button Group */}
                <div className="flex flex-col gap-2.5 w-full sm:w-auto shrink-0">
                  {isOwnProfile ? (
                    <>
                      <button
                        onClick={() => setShowEditModal(true)}
                        className="w-full gold-gradient text-brand-navy rounded-xl py-3 px-8 text-xs uppercase tracking-wider font-bold shadow-md hover:brightness-105 transition-all flex items-center justify-center gap-2 cursor-pointer"
                      >
                        <Smile className="h-4 w-4" /> Edit Profile
                      </button>
                      <Link href="/verification" className="w-full">
                        <button className="w-full border border-brand-gold/30 text-brand-gold hover:border-brand-gold hover:bg-brand-gold/10 hover:!text-brand-gold rounded-xl py-3 px-8 text-xs uppercase tracking-wider font-bold transition-all flex items-center justify-center gap-2 cursor-pointer">
                          <ShieldCheck className="h-4 w-4" /> Verification Status
                        </button>
                      </Link>
                      <button
                        onClick={() => setShowContactModal(true)}
                        className="w-full text-[10px] text-brand-gold hover:underline font-support text-center mt-1 cursor-pointer"
                      >
                        View My Contact Info
                      </button>
                    </>
                  ) : (
                    <>
                      {isReceivedPending ? (
                        <div className="w-full space-y-2">
                          <div className="p-2.5 bg-amber-500/10 border border-amber-500/30 rounded-xl text-center text-xs font-support text-amber-500 font-semibold">
                            💌 {profile.name} sent you an interest request!
                          </div>
                          <div className="flex gap-2">
                            <button
                              onClick={async () => {
                                try {
                                  await declineInterestApi(profile.id).unwrap();
                                  showToast("Interest request declined.", "info");
                                } catch (err: any) {
                                  showToast(err?.data?.message || "Failed to decline interest.", "error");
                                }
                              }}
                              className="flex-1 border border-destructive/40 text-destructive hover:bg-destructive/10 rounded-xl py-2.5 text-xs font-bold uppercase tracking-wider cursor-pointer"
                            >
                              Decline
                            </button>
                            <button
                              onClick={async () => {
                                try {
                                  await acceptInterestApi(profile.id).unwrap();
                                  showToast("Interest accepted! You can now chat directly.", "success");
                                } catch (err: any) {
                                  showToast(err?.data?.message || "Failed to accept interest.", "error");
                                }
                              }}
                              className="flex-1 bg-emerald-600 hover:bg-emerald-500 text-white rounded-xl py-2.5 text-xs font-bold uppercase tracking-wider cursor-pointer shadow-md"
                            >
                              Accept
                            </button>
                          </div>
                        </div>
                      ) : isConnected ? (
                        <Link href="/chat" className="w-full">
                          <button className="w-full gold-gradient text-brand-navy rounded-xl py-3 px-8 text-xs uppercase tracking-wider font-bold shadow-md hover:brightness-105 transition-all flex items-center justify-center gap-2 cursor-pointer">
                            <MessageSquare className="h-4 w-4" /> Connected • Chat Now
                          </button>
                        </Link>
                      ) : isSentPending ? (
                        <button
                          disabled
                          className="w-full rounded-xl py-3 px-8 text-xs uppercase tracking-wider font-bold border border-brand-gold text-brand-gold bg-transparent cursor-not-allowed flex items-center justify-center gap-2"
                        >
                          <Mail className="h-4 w-4" /> Interest Sent (Pending)
                        </button>
                      ) : (
                        <button
                          onClick={() => handleSendInterest(profile.id)}
                          className="w-full rounded-xl py-3 px-8 text-xs uppercase tracking-wider font-bold shadow-md transition-all flex items-center justify-center gap-2 cursor-pointer gold-gradient text-brand-navy hover:brightness-105"
                        >
                          <Mail className="h-4 w-4" /> Send Interest
                        </button>
                      )}

                      <button
                        onClick={async () => {
                          try {
                            const res = await toggleShortlistApi(profile.id).unwrap();
                            showToast(res.message, "info");
                          } catch (err) {
                            showToast("Failed to update shortlist.", "error");
                          }
                        }}
                        className={`w-full rounded-xl py-3 px-8 text-xs uppercase tracking-wider font-bold border transition-all flex items-center justify-center gap-2 cursor-pointer ${
                          isShort
                            ? "bg-destructive/10 border-destructive text-destructive"
                            : "border-brand-gold/30 text-brand-gold hover:border-brand-gold hover:bg-brand-gold/10 hover:!text-brand-gold"
                        }`}
                      >
                        <Heart className={`h-4 w-4 ${isShort ? "fill-current" : ""}`} /> {isShort ? "Shortlisted" : "Shortlist"}
                      </button>
                      
                      {/* Unlock Contact details */}
                      <button
                        onClick={() => setShowContactModal(true)}
                        className="w-full text-[10px] text-brand-gold hover:underline font-support text-center mt-1 cursor-pointer"
                      >
                        {isUnlocked ? "✓ Contact Details Unlocked" : "View Contact Details"}
                      </button>
                    </>
                  )}
                </div>
              </div>

              {/* Premium Tabbed details container */}
              <div className="bg-[#051121]/40 border border-brand-gold/15 rounded-[2rem] p-6 sm:p-8 shadow-2xl relative">
                {/* Diamond Accent */}
                <div className="absolute top-0 left-12 transform -translate-y-1/2 rotate-45 w-3 h-3 bg-brand-gold border border-brand-gold z-20" />
                
                {/* Tab Navigation */}
                <div className="flex border-b border-border/10 pb-2 mb-4 gap-6 sm:gap-10 overflow-x-auto overflow-y-hidden no-scrollbar select-none">
                  {/* Tab 1: Basic Info */}
                  <button
                    onClick={() => setActiveTab("basic")}
                    className={`flex flex-col items-center gap-1.5 pb-2 text-xs font-semibold uppercase tracking-wider transition-colors cursor-pointer border-b-2 -mb-2.5 ${
                      activeTab === "basic"
                        ? "text-brand-gold border-brand-gold"
                        : "text-[#E5DCD0]/60 border-transparent hover:text-white"
                    }`}
                  >
                    <Compass className="h-5 w-5" />
                    <span>Basic Info</span>
                  </button>

                  {/* Tab 2: Family */}
                  <button
                    onClick={() => setActiveTab("family")}
                    className={`flex flex-col items-center gap-1.5 pb-2 text-xs font-semibold uppercase tracking-wider transition-colors cursor-pointer border-b-2 -mb-2.5 ${
                      activeTab === "family"
                        ? "text-brand-gold border-brand-gold"
                        : "text-[#E5DCD0]/60 border-transparent hover:text-white"
                    }`}
                  >
                    <Users className="h-5 w-5" />
                    <span>Family</span>
                  </button>

                  {/* Tab 3: Education */}
                  <button
                    onClick={() => setActiveTab("education")}
                    className={`flex flex-col items-center gap-1.5 pb-2 text-xs font-semibold uppercase tracking-wider transition-colors cursor-pointer border-b-2 -mb-2.5 ${
                      activeTab === "education"
                        ? "text-brand-gold border-brand-gold"
                        : "text-[#E5DCD0]/60 border-transparent hover:text-white"
                    }`}
                  >
                    <GraduationCap className="h-5 w-5" />
                    <span>Education</span>
                  </button>

                  {/* Tab 4: Lifestyle */}
                  <button
                    onClick={() => setActiveTab("lifestyle")}
                    className={`flex flex-col items-center gap-1.5 pb-2 text-xs font-semibold uppercase tracking-wider transition-colors cursor-pointer border-b-2 -mb-2.5 ${
                      activeTab === "lifestyle"
                        ? "text-brand-gold border-brand-gold"
                        : "text-[#E5DCD0]/60 border-transparent hover:text-white"
                    }`}
                  >
                    <Smile className="h-5 w-5" />
                    <span>Lifestyle</span>
                  </button>

                  {/* Tab 5: More */}
                  <button
                    onClick={() => setActiveTab("more")}
                    className={`flex flex-col items-center gap-1.5 pb-2 text-xs font-semibold uppercase tracking-wider transition-colors cursor-pointer border-b-2 -mb-2.5 ${
                      activeTab === "more"
                        ? "text-brand-gold border-brand-gold"
                        : "text-[#E5DCD0]/60 border-transparent hover:text-white"
                    }`}
                  >
                    <MoreHorizontal className="h-5 w-5" />
                    <span>More</span>
                  </button>
                </div>

                {/* Tab content table */}
                <div className="space-y-4 py-2">
                  {activeTab === "basic" && (
                    <table className="w-full text-xs sm:text-sm font-support text-white">
                      <tbody>
                        <tr className="border-b border-border/5">
                          <td className="text-[#E5DCD0]/60 py-3 w-1/3">Date of Birth</td>
                          <td className="font-semibold py-3">
                            {profile.dateOfBirth ? new Date(profile.dateOfBirth).toLocaleDateString("en-IN", { day: '2-digit', month: 'short', year: 'numeric' }) : "15 Jan 1998"}
                          </td>
                        </tr>
                        <tr className="border-b border-border/5">
                          <td className="text-[#E5DCD0]/60 py-3">Education</td>
                          <td className="font-semibold py-3">{profile.education}</td>
                        </tr>
                        <tr className="border-b border-border/5">
                          <td className="text-[#E5DCD0]/60 py-3">Profession</td>
                          <td className="font-semibold py-3">{profile.occupation}</td>
                        </tr>
                        <tr className="border-b border-border/5">
                          <td className="text-[#E5DCD0]/60 py-3">Annual Income</td>
                          <td className="font-semibold py-3">{profile.salary}</td>
                        </tr>
                        <tr className="border-b border-border/5">
                          <td className="text-[#E5DCD0]/60 py-3">Height</td>
                          <td className="font-semibold py-3">{profile.height || "5 ft 6 in"}</td>
                        </tr>
                        <tr className="border-b border-border/5">
                          <td className="text-[#E5DCD0]/60 py-3">Body Type</td>
                          <td className="font-semibold py-3">{(profile as any).bodyType || "Slim"}</td>
                        </tr>
                        <tr className="border-b border-border/5">
                          <td className="text-[#E5DCD0]/60 py-3">Complexion</td>
                          <td className="font-semibold py-3">{(profile as any).complexion || "Wheatish"}</td>
                        </tr>
                        <tr className="border-b border-border/5">
                          <td className="text-[#E5DCD0]/60 py-3">Marital Status</td>
                          <td className="font-semibold py-3">{profile.maritalStatus}</td>
                        </tr>
                        <tr className="border-b border-border/5">
                          <td className="text-[#E5DCD0]/60 py-3">Mother Tongue</td>
                          <td className="font-semibold py-3">{profile.motherTongue}</td>
                        </tr>
                        <tr className="border-b border-border/5">
                          <td className="text-[#E5DCD0]/60 py-3">Diet</td>
                          <td className="font-semibold py-3">{profile.diet}</td>
                        </tr>
                        <tr className="border-b border-border/5">
                          <td className="text-[#E5DCD0]/60 py-3">Smoke</td>
                          <td className="font-semibold py-3">{profile.smoking || "No"}</td>
                        </tr>
                        <tr className="border-b border-border/5">
                          <td className="text-[#E5DCD0]/60 py-3">Drink</td>
                          <td className="font-semibold py-3">{profile.drinking || "No"}</td>
                        </tr>
                      </tbody>
                    </table>
                  )}

                  {activeTab === "family" && (
                    (isFree && !isOwnProfile) ? (
                      <div className="flex flex-col items-center justify-center py-10 px-4 text-center space-y-4 bg-brand-navy/60 rounded-2xl border border-brand-gold/20 backdrop-blur-sm">
                        <Lock className="h-10 w-10 text-brand-gold animate-pulse" />
                        <h4 className="font-serif text-base font-bold text-brand-gold">Upgrade Plan Required</h4>
                        <p className="text-xs text-[#E5DCD0]/70 max-w-sm font-support leading-relaxed">
                          Detailed family background, siblings info, and parents occupation details are reserved for Premium Members.
                        </p>
                        <Link href="/membership">
                          <Button className="gold-gradient text-brand-navy font-bold text-xs uppercase tracking-wider px-6 py-2.5">
                            Upgrade Membership
                          </Button>
                        </Link>
                      </div>
                    ) : (
                      <table className="w-full text-xs sm:text-sm font-support text-white">
                        <tbody>
                          <tr className="border-b border-border/5">
                            <td className="text-[#E5DCD0]/60 py-3 w-1/3">Family Type</td>
                            <td className="font-semibold py-3">{profile.familyType}</td>
                          </tr>
                          <tr className="border-b border-border/5">
                            <td className="text-[#E5DCD0]/60 py-3">Family Status</td>
                            <td className="font-semibold py-3">{profile.familyStatus}</td>
                          </tr>
                          <tr className="border-b border-border/5">
                            <td className="text-[#E5DCD0]/60 py-3">Family Values</td>
                            <td className="font-semibold py-3">{profile.familyValues}</td>
                          </tr>
                          <tr className="border-b border-border/5">
                            <td className="text-[#E5DCD0]/60 py-3">Father's Occupation</td>
                            <td className="font-semibold py-3">Retired Professional</td>
                          </tr>
                          <tr className="border-b border-border/5">
                            <td className="text-[#E5DCD0]/60 py-3">Mother's Occupation</td>
                            <td className="font-semibold py-3">Homemaker</td>
                          </tr>
                          <tr className="border-b border-border/5">
                            <td className="text-[#E5DCD0]/60 py-3">Siblings</td>
                            <td className="font-semibold py-3">1 Brother, 1 Sister</td>
                          </tr>
                          <tr className="border-b border-border/5">
                            <td className="text-[#E5DCD0]/60 py-3">Family Details</td>
                            <td className="font-semibold py-3 leading-relaxed">{profile.familyDetails}</td>
                          </tr>
                        </tbody>
                      </table>
                    )
                  )}

                  {activeTab === "education" && (
                    <table className="w-full text-xs sm:text-sm font-support text-white">
                      <tbody>
                        <tr className="border-b border-border/5">
                          <td className="text-[#E5DCD0]/60 py-3 w-1/3">Highest Degree</td>
                          <td className="font-semibold py-3">{profile.education}</td>
                        </tr>
                        <tr className="border-b border-border/5">
                          <td className="text-[#E5DCD0]/60 py-3">College / University</td>
                          <td className="font-semibold py-3">Indian Institute of Technology (IIT)</td>
                        </tr>
                        <tr className="border-b border-border/5">
                          <td className="text-[#E5DCD0]/60 py-3">Schooling Education</td>
                          <td className="font-semibold py-3">St. Xavier's High School</td>
                        </tr>
                      </tbody>
                    </table>
                  )}

                  {activeTab === "lifestyle" && (
                    (isFree && !isOwnProfile) ? (
                      <div className="flex flex-col items-center justify-center py-10 px-4 text-center space-y-4 bg-brand-navy/60 rounded-2xl border border-brand-gold/20 backdrop-blur-sm">
                        <Lock className="h-10 w-10 text-brand-gold animate-pulse" />
                        <h4 className="font-serif text-base font-bold text-brand-gold">Upgrade Plan Required</h4>
                        <p className="text-xs text-[#E5DCD0]/70 max-w-sm font-support leading-relaxed">
                          Lifestyle traits, personality descriptions, smoking & drinking habits are premium indicators.
                        </p>
                        <Link href="/membership">
                          <Button className="gold-gradient text-brand-navy font-bold text-xs uppercase tracking-wider px-6 py-2.5">
                            Upgrade Membership
                          </Button>
                        </Link>
                      </div>
                    ) : (
                      <table className="w-full text-xs sm:text-sm font-support text-white">
                        <tbody>
                          <tr className="border-b border-border/5">
                            <td className="text-[#E5DCD0]/60 py-3 w-1/3">Diet Profile</td>
                            <td className="font-semibold py-3">{profile.diet}</td>
                          </tr>
                          <tr className="border-b border-border/5">
                            <td className="text-[#E5DCD0]/60 py-3">Smoking Preference</td>
                            <td className="font-semibold py-3">{profile.smoking || "No"}</td>
                          </tr>
                          <tr className="border-b border-border/5">
                            <td className="text-[#E5DCD0]/60 py-3">Drinking Preference</td>
                            <td className="font-semibold py-3">{profile.drinking || "No"}</td>
                          </tr>
                          <tr className="border-b border-border/5">
                            <td className="text-[#E5DCD0]/60 py-3">Personality Type</td>
                            <td className="font-semibold py-3">Introverted, Deep Thinker, Family-oriented</td>
                          </tr>
                        </tbody>
                      </table>
                    )
                  )}

                  {activeTab === "more" && (
                    (isFree && !isOwnProfile) ? (
                      <div className="flex flex-col items-center justify-center py-10 px-4 text-center space-y-4 bg-brand-navy/60 rounded-2xl border border-brand-gold/20 backdrop-blur-sm">
                        <Lock className="h-10 w-10 text-brand-gold animate-pulse" />
                        <h4 className="font-serif text-base font-bold text-brand-gold">Upgrade Plan Required</h4>
                        <p className="text-xs text-[#E5DCD0]/70 max-w-sm font-support leading-relaxed">
                          Astro star indicators, Manglik status and horoscope match details require a premium membership tier.
                        </p>
                        <Link href="/membership">
                          <Button className="gold-gradient text-brand-navy font-bold text-xs uppercase tracking-wider px-6 py-2.5">
                            Upgrade Membership
                          </Button>
                        </Link>
                      </div>
                    ) : (
                      <table className="w-full text-xs sm:text-sm font-support text-white">
                        <tbody>
                          <tr className="border-b border-border/5">
                            <td className="text-[#E5DCD0]/60 py-3 w-1/3">About Me</td>
                            <td className="font-semibold py-3 leading-relaxed">{profile.aboutMe || "I am a simple, ambitious and family-oriented person."}</td>
                          </tr>
                          <tr className="border-b border-border/5">
                            <td className="text-[#E5DCD0]/60 py-3 w-1/3">Astro Star Details</td>
                            <td className="font-semibold py-3">Nadi: Manglik (No)</td>
                          </tr>
                          <tr className="border-b border-border/5">
                            <td className="text-[#E5DCD0]/60 py-3">Horoscope Match</td>
                            <td className="font-semibold py-3">{profile.horoscopeRequired ? "Required / Kundali Available" : "Not Required"}</td>
                          </tr>
                          <tr className="border-b border-border/5">
                            <td className="text-[#E5DCD0]/60 py-3">Blood Group</td>
                            <td className="font-semibold py-3">B+ (Positive)</td>
                          </tr>
                        </tbody>
                      </table>
                    )
                  )}
                </div>
              </div>

              {/* About Section */}
              <div>
                <h3 className="font-serif text-xl font-bold text-white mb-3">
                  About {profile.name.split(" ")[0]}
                </h3>
                <p className="text-xs sm:text-sm text-[#E5DCD0]/80 leading-relaxed font-support">
                  {profile.aboutMe || "I am a simple, ambitious and family-oriented person. I love traveling, reading books and exploring new places."}
                </p>
              </div>

              {/* Block & Report */}
              {!isOwnProfile && (
                <div className="flex justify-end gap-3 pt-6 border-t border-border/10 text-xs font-support">
                  <button
                    onClick={() => setShowBlockModal(true)}
                    className="text-[#E5DCD0]/60 hover:text-destructive flex items-center gap-1 cursor-pointer"
                  >
                    <Lock className="h-3.5 w-3.5" /> Block Member
                  </button>
                  <span className="text-border/20">|</span>
                  <button
                    onClick={() => setShowReportModal(true)}
                    className="text-[#E5DCD0]/60 hover:text-destructive flex items-center gap-1 cursor-pointer"
                  >
                    <Flag className="h-3.5 w-3.5" /> Report Profiling
                  </button>
                </div>
              )}

            </div>
          </div>
        </div>
      </main>

      {/* CONTACT DETAILS UNLOCK MODAL */}
      <Dialog isOpen={showContactModal} onClose={() => setShowContactModal(false)} title={isOwnProfile ? "My Contact Information" : "Contact Information Access"}>
        {canViewContact ? (
          <div className="space-y-4 text-xs font-support bg-[#0B1A2F]/95 p-4 rounded-xl border border-brand-gold/30">
            {isOwnProfile ? (
              <div className="p-3 bg-brand-gold/5 border border-brand-gold/25 rounded-lg text-brand-gold font-semibold text-center mb-2">
                ✓ Viewing Your Private Contact Details
              </div>
            ) : (
              <div className="p-3 bg-brand-gold/5 border border-brand-gold/25 rounded-lg text-brand-gold font-semibold text-center mb-2">
                ✓ Contact Details Unlocked Successfully
              </div>
            )}
            <div className="space-y-2 border-t border-border/10 pt-3">
              <div className="flex justify-between">
                <span className="text-[#E5DCD0]/60">Mobile Phone</span>
                <strong className="text-white font-sans text-sm">
                  {isOwnProfile ? (currentUser?.user?.phoneNumber || currentUser?.phoneNumber || "Not Provided") : (profile.mobile || "+91 98765 43210")}
                </strong>
              </div>
              <div className="flex justify-between">
                <span className="text-[#E5DCD0]/60">Parent Phone</span>
                <strong className="text-white font-sans text-sm">+91 99988 87766</strong>
              </div>
              <div className="flex justify-between">
                <span className="text-[#E5DCD0]/60">Email Contact</span>
                <strong className="text-white block truncate">
                  {isOwnProfile ? (currentUser?.user?.email || currentUser?.email || "Not Provided") : (profile.email || `contact-${profile.id}@vikanmatches.com`)}
                </strong>
              </div>
              <div className="flex justify-between">
                <span className="text-[#E5DCD0]/60">Address</span>
                <strong className="text-white font-bold">{profile.city}, {profile.state}</strong>
              </div>
            </div>
          </div>
        ) : (
          <div className="space-y-4 bg-[#0B1A2F]/95 p-4 rounded-xl border border-brand-gold/30">
            <p className="text-xs text-[#E5DCD0]/80 leading-relaxed font-support">
              Unlock the contact details for **{profile.name}**. Unlocking phone contact records will consume 1 premium check credit.
            </p>
            {isFree || currentUser?.membershipType?.includes("Silver") ? (
              <div className="p-3.5 bg-destructive/10 border border-destructive text-destructive rounded-lg text-xs font-support font-semibold">
                Contact unlocks are only available for Gold, Diamond, and Royal Platinum plans. Please upgrade to unlock.
              </div>
            ) : (
              <div className="p-3 bg-brand-gold/5 border border-brand-gold/25 rounded-lg text-xs font-support text-brand-gold">
                You are a {currentUser?.membershipType || "Premium"} subscriber. You have unlocked **{unlockedIds.length}** / **{currentUser?.membershipType?.includes("Gold") ? 20 : currentUser?.membershipType?.includes("Diamond") ? 60 : "Unlimited"}** profiles.
              </div>
            )}
            <form onSubmit={handleUnlockContact} className="flex gap-2 pt-2">
              <Button type="button" variant="outline" className="flex-1" onClick={() => setShowContactModal(false)}>
                Cancel
              </Button>
              <Button type="submit" variant="secondary" className="flex-1 uppercase font-bold tracking-wider text-xs">
                Unlock Details
              </Button>
            </form>
          </div>
        )}
      </Dialog>

      {/* BLOCK MODAL */}
      <Dialog isOpen={showBlockModal} onClose={() => setShowBlockModal(false)} title="Confirm Block Profile">
        <div className="space-y-4 text-xs font-support leading-relaxed bg-[#0B1A2F]/95 p-4 rounded-xl border border-brand-gold/30 text-[#E5DCD0]/80">
          <p className="text-white">
            Are you sure you want to block **{profile.name}**?
          </p>
          <p>
            Once blocked, they will not see your profile in search results, recommended matches, or be able to express interest/chat with you.
          </p>
          <div className="flex gap-2 pt-3">
            <Button type="button" variant="outline" className="flex-1" onClick={() => setShowBlockModal(false)}>
              Cancel
            </Button>
            <Button type="button" variant="primary" className="flex-1 bg-destructive hover:bg-destructive/95 text-white uppercase text-xs" onClick={handleBlockUser}>
              Block User
            </Button>
          </div>
        </div>
      </Dialog>

      {/* REPORT MODAL */}
      <Dialog isOpen={showReportModal} onClose={() => setShowReportModal(false)} title="Report Profiling Violation">
        <form onSubmit={handleReportUser} className="space-y-4 bg-[#0B1A2F]/95 p-4 rounded-xl border border-brand-gold/30">
          <p className="text-xs text-[#E5DCD0]/80 leading-relaxed font-support">
            Explain the compliance issue with this profile (e.g. fake pictures, incorrect data, spamming or harassment). Vikan security moderates all flags within 2 hours.
          </p>
          <Input
            label="Reason for reporting"
            placeholder="E.g. Profile photos appear to be stock pictures"
            required
            value={reportReason}
            onChange={(e) => setReportReason(e.target.value)}
            className="!bg-[#081626]/40 !border-brand-gold/30 text-white placeholder-muted-foreground/50 rounded-xl"
          />
          <div className="flex gap-2 pt-2">
            <Button type="button" variant="outline" className="flex-1" onClick={() => setShowReportModal(false)}>
              Cancel
            </Button>
            <Button type="submit" variant="secondary" className="flex-1 bg-destructive hover:bg-destructive/95 text-white uppercase text-xs">
              Submit Report
            </Button>
          </div>
        </form>
      </Dialog>

      {/* EDIT PROFILE MODAL */}
      <Dialog isOpen={showEditModal} onClose={() => setShowEditModal(false)} title="Edit Profile Details">
        <form onSubmit={handleSaveProfile} className="space-y-4 bg-[#0B1A2F]/95 p-5 rounded-xl border border-brand-gold/30 max-h-[70vh] overflow-y-auto scrollbar-thin text-left">
          <Input
            label="Full Name"
            value={editName}
            onChange={(e) => setEditName(e.target.value)}
            required
            className="!bg-[#081626]/40 !border-brand-gold/30 text-white placeholder-muted-foreground/50 rounded-xl"
          />
          <div className="flex flex-col gap-1.5 text-left">
            <label className="text-xs font-semibold text-[#E5DCD0]/80">About Me</label>
            <textarea
              value={editAboutMe}
              onChange={(e) => setEditAboutMe(e.target.value)}
              required
              className="w-full text-xs font-support bg-[#081626]/40 border border-brand-gold/30 rounded-xl p-3 text-white focus:outline-none focus:border-brand-gold min-h-[80px]"
            />
          </div>
          <div className="grid grid-cols-2 gap-4">
            <Input
              label="Occupation"
              value={editOccupation}
              onChange={(e) => setEditOccupation(e.target.value)}
              required
              className="!bg-[#081626]/40 !border-brand-gold/30 text-white placeholder-muted-foreground/50 rounded-xl"
            />
            <Input
              label="Annual Income"
              value={editSalary}
              onChange={(e) => setEditSalary(e.target.value)}
              required
              className="!bg-[#081626]/40 !border-brand-gold/30 text-white placeholder-muted-foreground/50 rounded-xl"
            />
          </div>
          <div className="grid grid-cols-2 gap-4">
            <Input
              label="City"
              value={editCity}
              onChange={(e) => setEditCity(e.target.value)}
              required
              className="!bg-[#081626]/40 !border-brand-gold/30 text-white placeholder-muted-foreground/50 rounded-xl"
            />
            <Input
              label="State"
              value={editState}
              onChange={(e) => setEditState(e.target.value)}
              required
              className="!bg-[#081626]/40 !border-brand-gold/30 text-white placeholder-muted-foreground/50 rounded-xl"
            />
          </div>
          <Input
            label="Diet"
            value={editDiet}
            onChange={(e) => setEditDiet(e.target.value)}
            required
            className="!bg-[#081626]/40 !border-brand-gold/30 text-white placeholder-muted-foreground/50 rounded-xl"
          />
          <div className="flex flex-col gap-1.5 text-left">
            <label className="text-xs font-semibold text-[#E5DCD0]/80">Photos (comma-separated URLs)</label>
            <textarea
              value={editPhotosText}
              onChange={(e) => setEditPhotosText(e.target.value)}
              placeholder="E.g. https://images.unsplash.com/photo-1610030469983-98e550d6193c?w=600, https://images.unsplash.com/photo-1524504388940-b1c1722653e1?w=600"
              className="w-full text-[10px] font-mono bg-[#081626]/40 border border-brand-gold/30 rounded-xl p-3 text-white focus:outline-none focus:border-brand-gold min-h-[60px]"
            />
          </div>
          <div className="flex flex-col gap-1.5 text-left">
            <label className="text-xs font-semibold text-[#E5DCD0]/80">Upload Photo File</label>
            <div className="flex items-center gap-2">
              <input
                type="file"
                accept="image/*"
                onChange={handleFileChange}
                disabled={isUploadingFile}
                className="block w-full text-xs text-slate-500
                  file:mr-4 file:py-2 file:px-4
                  file:rounded-full file:border-0
                  file:text-xs file:font-semibold
                  file:bg-brand-gold/10 file:text-brand-gold
                  hover:file:bg-brand-gold/20
                  cursor-pointer file:cursor-pointer disabled:opacity-50"
              />
              {isUploadingFile && (
                <div className="h-4 w-4 border-2 border-brand-gold border-t-transparent rounded-full animate-spin shrink-0" />
              )}
            </div>
          </div>
          <div className="flex gap-2 pt-2">
            <Button type="button" variant="outline" className="flex-1" onClick={() => setShowEditModal(false)}>
              Cancel
            </Button>
            <Button type="submit" variant="secondary" className="flex-1 uppercase font-bold tracking-wider text-xs">
              Save Profile
            </Button>
          </div>
        </form>
      </Dialog>

      <Footer />
    </>
  );
}
