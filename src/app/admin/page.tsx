"use client";

import React, { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { useAppStore } from "@/lib/store";
import { Navbar } from "@/components/layout/Navbar";
import { useSelector } from "react-redux";
import { RootState } from "@/lib/redux/store";
import {
  useGetDashboardMetricsQuery,
  useGetPendingApprovalsQuery,
  useApproveProfileMutation,
  useRejectProfileMutation,
  useGetPendingVerificationsQuery,
  useApproveVerificationMutation,
  useRejectVerificationMutation,
  useGetSafetyReportsQuery,
  useSuspendMemberMutation,
  useGetSupportTicketsQuery,
  useUpdateTicketStatusMutation
} from "@/lib/redux/api";
import { Footer } from "@/components/layout/Footer";
import { Button } from "@/components/ui/button";
import { Input, Textarea } from "@/components/ui/input";
import { Dialog } from "@/components/ui/dialog";
import {
  ShieldAlert,
  Flame,
  FileCheck2,
  Coins,
  TrendingUp,
  UserCheck,
  Flag,
  PenTool,
  Bookmark,
  Users,
  Settings,
  Award,
  Check
} from "lucide-react";

export default function AdminPortalPage() {
  const router = useRouter();
  const authUser = useSelector((state: RootState) => state.auth.user);

  const { data: metrics } = useGetDashboardMetricsQuery(undefined, { skip: !authUser });
  const { data: pendingApprovalsData } = useGetPendingApprovalsQuery(undefined, { skip: !authUser });
  const { data: verificationsData } = useGetPendingVerificationsQuery(undefined, { skip: !authUser });
  const { data: reportsData } = useGetSafetyReportsQuery(undefined, { skip: !authUser });
  const { data: ticketsData } = useGetSupportTicketsQuery(undefined, { skip: !authUser });

  const [approveProfileApi, { isLoading: isApprovingProfile }] = useApproveProfileMutation();
  const [rejectProfileApi, { isLoading: isRejectingProfile }] = useRejectProfileMutation();
  const [approveVerificationApi] = useApproveVerificationMutation();
  const [rejectVerificationApi] = useRejectVerificationMutation();
  const [suspendMemberApi] = useSuspendMemberMutation();
  const [updateTicketStatusApi] = useUpdateTicketStatusMutation();

  const {
    profiles,
    showToast,
    addNotification
  } = useAppStore();

  const currentUser = authUser;
  const pendingApprovals = pendingApprovalsData || [];
  const pendingRequests = verificationsData || [];
  const reports = reportsData || [];
  const tickets = ticketsData || [];

  const totalUsers = metrics?.totalMembers || 0;
  const premiumCount = metrics?.premiumMembers || 0;
  const verifiedCount = metrics?.verifiedMembers || 0;
  const simulatedRevenue = premiumCount * 4999;

  const trendData = metrics?.registrationTrend || [];
  const maxCount = Math.max(5, ...trendData.map((d: any) => d.count || 0));

  const getSvgPath = () => {
    if (trendData.length === 0) return "";
    return trendData.map((d: any, i: number) => {
      const x = 50 + (i * (420 / 6));
      const y = 150 - ((d.count || 0) * 120 / maxCount);
      return `${i === 0 ? 'M' : 'L'} ${x} ${y}`;
    }).join(' ');
  };

  const getAreaPath = () => {
    const linePath = getSvgPath();
    if (!linePath) return "";
    const firstX = 50;
    const lastX = 50 + ((trendData.length - 1) * (420 / 6));
    return `${linePath} L ${lastX} 150 L ${firstX} 150 Z`;
  };

  const maleCount = metrics?.demographics?.maleCount || 0;
  const femaleCount = metrics?.demographics?.femaleCount || 0;
  const totalDemographics = maleCount + femaleCount;
  const malePercentage = totalDemographics > 0 ? (maleCount * 100 / totalDemographics) : 50;
  const femalePercentage = totalDemographics > 0 ? (femaleCount * 100 / totalDemographics) : 50;
  const dashOffset = 219.9 - (219.9 * malePercentage / 100);

  const premiumUsersCount = metrics?.premiumMembers || 0;
  const freeUsersCount = Math.max(0, totalUsers - premiumUsersCount);
  const premiumPercentage = totalUsers > 0 ? (premiumUsersCount * 100 / totalUsers) : 0;
  const freePercentage = totalUsers > 0 ? (freeUsersCount * 100 / totalUsers) : 100;

  const [activeTab, setActiveTab] = useState<"approvals" | "verification" | "cms" | "reports" | "metrics" | "tickets">("approvals");
  const [processingProfileId, setProcessingProfileId] = useState<string | null>(null);
  const [rejectingProfile, setRejectingProfile] = useState<any | null>(null);
  const [rejectionReason, setRejectionReason] = useState("");
  const [selectedFullImage, setSelectedFullImage] = useState<string | null>(null);
  const [mounted, setMounted] = useState(false);

  // CMS forms
  const [storyName, setStoryName] = useState("");
  const [storyDate, setStoryDate] = useState("");
  const [storyText, setStoryText] = useState("");
  const [blogTitle, setBlogTitle] = useState("");
  const [blogSummary, setBlogSummary] = useState("");

  useEffect(() => {
    setMounted(true);
    if (mounted) {
      if (!currentUser) {
        router.push("/login");
      } else if (currentUser.email !== "admin@vikan.com") {
        router.push("/dashboard");
      }
    }
  }, [currentUser, mounted]);

  if (!mounted || !currentUser) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[#F7F3EE] dark:bg-[#081626]">
        <div className="h-10 w-10 border-4 border-brand-gold border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  const handleApprove = async (verificationId: string) => {
    try {
      await approveVerificationApi(verificationId).unwrap();
      addNotification({
        title: "Moderator Update",
        body: `You approved profile verification request.`,
        type: "system"
      });
    } catch (err) {
      console.error(err);
    }
  };

  const handleReject = async (verificationId: string) => {
    try {
      await rejectVerificationApi(verificationId).unwrap();
      addNotification({
        title: "Moderator Update",
        body: `You rejected profile verification request.`,
        type: "system"
      });
    } catch (err) {
      console.error(err);
    }
  };

  const handleAddStory = (e: React.FormEvent) => {
    e.preventDefault();
    if (!storyName.trim() || !storyText.trim()) return;

    addNotification({
      title: "CMS Update",
      body: `Success story for ${storyName} has been published successfully.`,
      type: "system"
    });

    setStoryName("");
    setStoryDate("");
    setStoryText("");
  };

  const handleAddBlog = (e: React.FormEvent) => {
    e.preventDefault();
    if (!blogTitle.trim()) return;

    addNotification({
      title: "CMS Update",
      body: `Blog post '${blogTitle}' has been added to drafts.`,
      type: "system"
    });

    setBlogTitle("");
    setBlogSummary("");
  };

  return (
    <>
      <Navbar />

      <main className="flex-1 bg-[#F7F3EE] dark:bg-[#081626] py-10 px-4 sm:px-6 lg:px-8 text-foreground">
        <div className="mx-auto max-w-7xl">
          
          {/* Header section */}
          <div className="border-b border-border pb-6 mb-8 flex flex-col md:flex-row md:items-center justify-between gap-4">
            <div>
              <h1 className="font-serif text-3xl font-bold text-brand-navy dark:text-foreground flex items-center gap-2">
                <Settings className="h-7 w-7 text-brand-gold animate-spin-slow" /> Security & Admin Portal
              </h1>
              <p className="text-xs text-muted-foreground font-support mt-1">
                Moderator interface for user ID verification approvals, metric logs, and CMS success stories.
              </p>
            </div>

            {/* Navigation Tabs */}
            <div className="flex bg-[#081626]/40 rounded-full p-1 border border-brand-gold/15 gap-2 overflow-x-auto scrollbar-none">
              <button
                onClick={() => setActiveTab("approvals")}
                className={`py-1.5 px-4 text-xs font-semibold rounded-full transition-all cursor-pointer border whitespace-nowrap flex items-center gap-1.5 ${
                  activeTab === "approvals"
                    ? "bg-brand-gold text-brand-navy border-transparent shadow-sm font-bold"
                    : "bg-transparent text-[#E5DCD0]/60 hover:text-white border-brand-gold/20 hover:border-brand-gold/45"
                }`}
              >
                <UserCheck className="h-3.5 w-3.5" />
                Profile Approvals ({pendingApprovals.length})
              </button>
              <button
                onClick={() => setActiveTab("verification")}
                className={`py-1.5 px-4 text-xs font-semibold rounded-full transition-all cursor-pointer border whitespace-nowrap ${
                  activeTab === "verification"
                    ? "bg-brand-gold text-brand-navy border-transparent shadow-sm font-bold"
                    : "bg-transparent text-[#E5DCD0]/60 hover:text-white border-brand-gold/20 hover:border-brand-gold/45"
                }`}
              >
                Verification Queue ({pendingRequests.length})
              </button>
              <button
                onClick={() => setActiveTab("reports")}
                className={`py-1.5 px-4 text-xs font-semibold rounded-full transition-all cursor-pointer border whitespace-nowrap ${
                  activeTab === "reports"
                    ? "bg-brand-gold text-brand-navy border-transparent shadow-sm font-bold"
                    : "bg-transparent text-[#E5DCD0]/60 hover:text-white border-brand-gold/20 hover:border-brand-gold/45"
                }`}
              >
                Compliance Reports ({reports.length})
              </button>
              <button
                onClick={() => setActiveTab("metrics")}
                className={`py-1.5 px-4 text-xs font-semibold rounded-full transition-all cursor-pointer border whitespace-nowrap ${
                  activeTab === "metrics"
                    ? "bg-brand-gold text-brand-navy border-transparent shadow-sm font-bold"
                    : "bg-transparent text-[#E5DCD0]/60 hover:text-white border-brand-gold/20 hover:border-brand-gold/45"
                }`}
              >
                System Metrics
              </button>
              <button
                onClick={() => setActiveTab("cms")}
                className={`py-1.5 px-4 text-xs font-semibold rounded-full transition-all cursor-pointer border whitespace-nowrap ${
                  activeTab === "cms"
                    ? "bg-brand-gold text-brand-navy border-transparent shadow-sm font-bold"
                    : "bg-transparent text-[#E5DCD0]/60 hover:text-white border-brand-gold/20 hover:border-brand-gold/45"
                }`}
              >
                CMS Controls
              </button>
              <button
                onClick={() => setActiveTab("tickets")}
                className={`py-1.5 px-4 text-xs font-semibold rounded-full transition-all cursor-pointer border whitespace-nowrap ${
                  activeTab === "tickets"
                    ? "bg-brand-gold text-brand-navy border-transparent shadow-sm font-bold"
                    : "bg-transparent text-[#E5DCD0]/60 hover:text-white border-brand-gold/20 hover:border-brand-gold/45"
                }`}
              >
                Helpdesk Tickets ({tickets.length})
              </button>
            </div>
          </div>

          {/* Tab 0: New Profile Approvals */}
          {activeTab === "approvals" && (
            <div className="space-y-6">
              <div className="bg-card border border-border/80 rounded-2xl p-5 shadow-sm flex items-center justify-between">
                <div>
                  <h3 className="font-serif text-lg font-bold text-foreground">New Registrations Pending Superadmin Approval</h3>
                  <p className="text-xs text-muted-foreground font-support mt-0.5">
                    Newly registered users cannot log in until approved. Approving will automatically send an email confirmation to the user.
                  </p>
                </div>
                <span className="px-3 py-1 rounded-full bg-brand-gold/10 border border-brand-gold/30 text-brand-gold text-xs font-bold font-support">
                  {pendingApprovals.length} Pending
                </span>
              </div>

              {pendingApprovals.length === 0 ? (
                <div className="bg-card border border-border/70 rounded-2xl p-16 text-center shadow-sm">
                  <UserCheck className="h-12 w-12 text-muted-foreground mx-auto mb-4 opacity-40" />
                  <h3 className="font-serif text-xl font-bold text-brand-navy dark:text-foreground">
                    All Profiles Approved
                  </h3>
                  <p className="text-xs text-muted-foreground mt-1 max-w-sm mx-auto font-support">
                    There are no new registration accounts waiting for approval. New registrations will automatically appear here.
                  </p>
                </div>
              ) : (
                <div className="space-y-4">
                  {pendingApprovals.map((prof: any) => {
                    const primaryPhoto = prof.photos?.[0] || "/avatar-placeholder.png";
                    const isCurrentProcessing = processingProfileId === prof.id;

                    return (
                      <div
                        key={prof.id}
                        className="bg-card border border-border/60 hover:border-brand-gold/30 rounded-2xl p-5 shadow-md flex flex-col lg:flex-row justify-between items-start lg:items-center gap-6 transition-all"
                      >
                        {/* Left: Thumbnail and Bio */}
                        <div className="flex items-start gap-4 flex-1 min-w-0">
                          <button
                            type="button"
                            onClick={() => setSelectedFullImage(primaryPhoto)}
                            className="h-20 w-20 rounded-xl overflow-hidden bg-[#051121] border border-brand-gold/20 shrink-0 hover:scale-105 transition-all cursor-zoom-in relative"
                            title="Click to view full photo"
                          >
                            <img src={primaryPhoto} alt={prof.name} className="h-full w-full object-cover" />
                          </button>

                          <div className="flex-1 min-w-0 text-left">
                            <div className="flex items-center gap-2 flex-wrap">
                              <h4 className="font-serif text-lg font-bold text-foreground">
                                {prof.name}
                              </h4>
                              <span className="text-[11px] font-bold px-2 py-0.5 rounded-md bg-brand-gold/10 text-brand-gold border border-brand-gold/20">
                                {prof.gender}
                              </span>
                              <span className="text-[11px] font-semibold px-2 py-0.5 rounded-md bg-amber-500/10 text-amber-400 border border-amber-500/30">
                                Pending Approval
                              </span>
                            </div>

                            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-x-4 gap-y-1 mt-2 text-xs text-muted-foreground font-support">
                              <div><strong className="text-foreground">Email:</strong> {prof.email}</div>
                              {prof.phoneNumber && <div><strong className="text-foreground">Phone:</strong> {prof.phoneNumber}</div>}
                              <div><strong className="text-foreground">Community:</strong> {prof.religion} • {prof.community}</div>
                              <div><strong className="text-foreground">Location:</strong> {prof.city}, {prof.state}</div>
                              <div><strong className="text-foreground">Education:</strong> {prof.education || "N/A"}</div>
                              <div><strong className="text-foreground">Occupation:</strong> {prof.occupation || "N/A"} ({prof.salary || "N/A"})</div>
                            </div>
                            
                            <span className="text-[10px] text-muted-foreground/60 font-support block mt-2">
                              Registered on: {new Date(prof.createdAt).toLocaleString()}
                            </span>
                          </div>
                        </div>

                        {/* Right: Actions */}
                        <div className="flex items-center gap-3 shrink-0 w-full lg:w-auto justify-end border-t lg:border-t-0 pt-4 lg:pt-0 border-border/40">
                          <Button
                            variant="gold"
                            size="sm"
                            disabled={isCurrentProcessing}
                            isLoading={isCurrentProcessing}
                            onClick={async () => {
                              setProcessingProfileId(prof.id);
                              try {
                                const res = await approveProfileApi(prof.id).unwrap();
                                showToast(res.message || "Profile approved and confirmation email sent!", "success");
                              } catch (err: any) {
                                showToast(err?.data?.message || "Failed to approve profile.", "error");
                              } finally {
                                setProcessingProfileId(null);
                              }
                            }}
                            className="bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs flex items-center gap-1.5 px-4 cursor-pointer"
                          >
                            <Check className="h-4 w-4" /> Approve & Send Email
                          </Button>

                          <Button
                            variant="outline"
                            size="sm"
                            disabled={isCurrentProcessing}
                            onClick={() => {
                              setRejectingProfile(prof);
                              setRejectionReason("Incomplete profile details or photo verification requirements were not met.");
                            }}
                            className="border-destructive/40 text-destructive hover:bg-destructive/10 text-xs cursor-pointer"
                          >
                            Reject
                          </Button>
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          )}

          {/* Tab 1: Verification moderations */}
          {activeTab === "verification" && (
            <div className="space-y-6">
              <div className="bg-card border border-border/80 rounded-2xl p-5 shadow-sm">
                <span className="text-xs text-muted-foreground font-support">
                  There are <span className="font-bold text-foreground">{pendingRequests.length}</span> pending verification packets requiring review.
                </span>
              </div>

              {pendingRequests.length === 0 ? (
                <div className="bg-card border border-border/70 rounded-2xl p-16 text-center shadow-sm">
                  <UserCheck className="h-12 w-12 text-muted-foreground mx-auto mb-4 opacity-40" />
                  <h3 className="font-serif text-xl font-bold text-brand-navy dark:text-foreground">
                    Verification Queue Empty
                  </h3>
                  <p className="text-xs text-muted-foreground mt-1 max-w-sm mx-auto font-support">
                    All users are current. Users can submit verification scans from the Verification page inside accounts.
                  </p>
                </div>
              ) : (
                <div className="space-y-4">
                  {pendingRequests.map((req: any) => {
                    const profile = req.profile;
                    if (!profile) return null;

                    return (
                      <div
                        key={req.id}
                        className="bg-card border border-border/60 hover:border-brand-gold/20 rounded-xl p-4 shadow-sm flex flex-col sm:flex-row justify-between items-center gap-4 transition-all"
                      >
                        {/* Profile Info */}
                        <div className="flex-1 min-w-0 text-left">
                          <h4 className="font-serif text-base font-bold text-brand-navy dark:text-foreground">
                            Verification Packet: {profile.name}
                          </h4>
                          <span className="text-[10px] text-muted-foreground font-support uppercase block mt-0.5">
                            ID: {profile.id} • {profile.gender}
                          </span>
                        </div>

                        {/* Shorter, Compact Thumbnails */}
                        <div className="flex gap-4 items-center">
                           <div className="text-center">
                             <span className="text-[9px] text-muted-foreground font-support block mb-1">Selfie</span>
                             <button
                               onClick={() => setSelectedFullImage(profile.photos?.[0] || req.faceScanUrl || "/avatar-placeholder.png")}
                               className="h-16 w-20 rounded-lg overflow-hidden bg-[#051121] border border-brand-gold/15 block hover:scale-105 active:scale-95 transition-all cursor-zoom-in"
                               title="Click to view full image"
                             >
                               <img src={profile.photos?.[0] || req.faceScanUrl || "/avatar-placeholder.png"} alt="Selfie" className="h-full w-full object-cover" />
                             </button>
                           </div>
                           <div className="text-center">
                             <span className="text-[9px] text-muted-foreground font-support block mb-1">Govt ID</span>
                             <button
                               onClick={() => setSelectedFullImage(req.documentUrl || "/mock_id_card.png")}
                               className="h-16 w-20 rounded-lg overflow-hidden bg-[#051121] border border-brand-gold/15 block hover:scale-105 active:scale-95 transition-all cursor-zoom-in"
                               title="Click to view full image"
                             >
                               <img src={req.documentUrl || "/mock_id_card.png"} alt="Govt ID" className="h-full w-full object-cover" />
                             </button>
                           </div>
                        </div>

                        {/* Quick Action buttons */}
                        <div className="flex sm:flex-col gap-2 w-full sm:w-auto shrink-0">
                          <Button
                            variant="gold"
                            size="sm"
                            onClick={() => handleApprove(req.id)}
                            className="flex-1 sm:flex-none uppercase text-[10px] font-bold py-2 px-3 rounded-lg tracking-wider"
                          >
                            Approve
                          </Button>
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => handleReject(req.id)}
                            className="flex-1 sm:flex-none uppercase text-[10px] font-bold py-2 px-3 rounded-lg tracking-wider"
                          >
                            Reject
                          </Button>
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          )}

          {/* Tab 2: System Metrics */}
          {activeTab === "metrics" && (
            <div className="space-y-8">
              {/* Stat Cards Row 1 */}
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                {/* Stat card 1: total registrations */}
                <div className="bg-card border border-border/80 rounded-2xl p-6 shadow-sm flex items-center gap-4">
                  <span className="p-3.5 rounded-full bg-brand-gold/15 text-brand-gold">
                    <Users className="h-6 w-6" />
                  </span>
                  <div className="text-left">
                    <span className="text-[10px] text-muted-foreground font-support uppercase tracking-wider block">
                      Total Registrations
                    </span>
                    <strong className="text-2xl font-bold font-sans block mt-0.5">
                      {totalUsers}
                    </strong>
                  </div>
                </div>

                {/* Stat card 2: premium members */}
                <div className="bg-card border border-border/80 rounded-2xl p-6 shadow-sm flex items-center gap-4">
                  <span className="p-3.5 rounded-full bg-brand-gold/15 text-brand-gold">
                    <Award className="h-6 w-6" />
                  </span>
                  <div className="text-left">
                    <span className="text-[10px] text-muted-foreground font-support uppercase tracking-wider block">
                      Premium Members
                    </span>
                    <strong className="text-2xl font-bold font-sans block mt-0.5">
                      {premiumCount}
                    </strong>
                  </div>
                </div>

                {/* Stat card 3: verified badges */}
                <div className="bg-card border border-border/80 rounded-2xl p-6 shadow-sm flex items-center gap-4">
                  <span className="p-3.5 rounded-full bg-brand-gold/15 text-brand-gold">
                    <FileCheck2 className="h-6 w-6" />
                  </span>
                  <div className="text-left">
                    <span className="text-[10px] text-muted-foreground font-support uppercase tracking-wider block">
                      Verified Badges
                    </span>
                    <strong className="text-2xl font-bold font-sans block mt-0.5">
                      {verifiedCount}
                    </strong>
                  </div>
                </div>

                {/* Stat card 4: simulated revenue */}
                <div className="bg-card border border-border/80 rounded-2xl p-6 shadow-sm flex items-center gap-4">
                  <span className="p-3.5 rounded-full bg-brand-gold/15 text-brand-gold">
                    <Coins className="h-6 w-6" />
                  </span>
                  <div className="text-left">
                    <span className="text-[10px] text-muted-foreground font-support uppercase tracking-wider block">
                      Estimated Revenue
                    </span>
                    <strong className="text-2xl font-bold font-sans block mt-0.5">
                      ₹{simulatedRevenue.toLocaleString("en-IN")}
                    </strong>
                  </div>
                </div>
              </div>

              {/* Stat Cards Row 2 (Added Metrics) */}
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                {/* Stat card 5: Gender Ratio */}
                <div className="bg-card border border-border/80 rounded-2xl p-6 shadow-sm flex items-center gap-4">
                  <span className="p-3.5 rounded-full bg-brand-gold/15 text-brand-gold">
                    <TrendingUp className="h-6 w-6" />
                  </span>
                  <div className="text-left">
                    <span className="text-[10px] text-muted-foreground font-support uppercase tracking-wider block">
                      Gender Ratio (M : F)
                    </span>
                    <strong className="text-lg font-bold font-sans block mt-0.5">
                      {metrics?.demographics?.maleCount || 0} Male : {metrics?.demographics?.femaleCount || 0} Female
                    </strong>
                  </div>
                </div>

                {/* Stat card 6: Compliance Flags */}
                <div className="bg-card border border-border/80 rounded-2xl p-6 shadow-sm flex items-center gap-4">
                  <span className="p-3.5 rounded-full bg-destructive/10 text-destructive">
                    <Flag className="h-6 w-6" />
                  </span>
                  <div className="text-left">
                    <span className="text-[10px] text-muted-foreground font-support uppercase tracking-wider block">
                      Unresolved Safety Flags
                    </span>
                    <strong className="text-2xl font-bold font-sans block mt-0.5 text-destructive">
                      {reports.length}
                    </strong>
                  </div>
                </div>

                {/* Stat card 7: Pending Verifications */}
                <div className="bg-card border border-border/80 rounded-2xl p-6 shadow-sm flex items-center gap-4">
                  <span className="p-3.5 rounded-full bg-brand-gold/15 text-brand-gold">
                    <UserCheck className="h-6 w-6" />
                  </span>
                  <div className="text-left">
                    <span className="text-[10px] text-muted-foreground font-support uppercase tracking-wider block">
                      Pending in Queue
                    </span>
                    <strong className="text-2xl font-bold font-sans block mt-0.5">
                      {pendingRequests.length}
                    </strong>
                  </div>
                </div>

                {/* Stat card 8: Simulated Success Matches */}
                <div className="bg-card border border-border/80 rounded-2xl p-6 shadow-sm flex items-center gap-4">
                  <span className="p-3.5 rounded-full bg-brand-gold/15 text-brand-gold">
                    <Flame className="h-6 w-6" />
                  </span>
                  <div className="text-left">
                    <span className="text-[10px] text-muted-foreground font-support uppercase tracking-wider block">
                      Mutual Interests Matches
                    </span>
                    <strong className="text-2xl font-bold font-sans block mt-0.5">
                      {Math.max(0, (totalUsers * 2) - 8)}
                    </strong>
                  </div>
                </div>
              </div>

              {/* Report Analytics Charts */}
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                {/* Line Chart: Registration Trend */}
                <div className="bg-card border border-border/80 rounded-2xl p-6 shadow-sm text-left">
                  <h3 className="font-serif text-lg font-bold text-brand-navy dark:text-foreground mb-1 border-b border-border/40 pb-2 flex items-center gap-2">
                    <TrendingUp className="h-5 w-5 text-brand-gold" />
                    New User Registrations (7-Day Trend)
                  </h3>
                  <p className="text-[11px] text-muted-foreground font-support mb-4">
                    Daily signup count for the last 7 days.
                  </p>
                  
                  <div className="w-full h-48 flex items-center justify-center relative">
                    {trendData.length === 0 ? (
                      <span className="text-xs text-muted-foreground font-support">No registration data available.</span>
                    ) : (
                      <svg viewBox="0 0 500 180" className="w-full h-full overflow-visible">
                        {/* Gradients */}
                        <defs>
                          <linearGradient id="chartGradient" x1="0" y1="0" x2="0" y2="1">
                            <stop offset="0%" stopColor="var(--brand-gold, #D4AF37)" stopOpacity="0.3" />
                            <stop offset="100%" stopColor="var(--brand-gold, #D4AF37)" stopOpacity="0" />
                          </linearGradient>
                        </defs>
                        
                        {/* Horizontal Grid lines */}
                        <line x1="50" y1="30" x2="470" y2="30" stroke="currentColor" strokeOpacity="0.1" strokeDasharray="3" />
                        <line x1="50" y1="90" x2="470" y2="90" stroke="currentColor" strokeOpacity="0.1" strokeDasharray="3" />
                        <line x1="50" y1="150" x2="470" y2="150" stroke="currentColor" strokeOpacity="0.2" />
                        
                        {/* Grid labels */}
                        <text x="35" y="35" className="fill-muted-foreground text-[9px] font-mono text-right" textAnchor="end">{maxCount}</text>
                        <text x="35" y="95" className="fill-muted-foreground text-[9px] font-mono text-right" textAnchor="end">{Math.round(maxCount / 2)}</text>
                        <text x="35" y="155" className="fill-muted-foreground text-[9px] font-mono text-right" textAnchor="end">0</text>
                        
                        {/* Trend Area */}
                        <path d={getAreaPath()} fill="url(#chartGradient)" />
                        
                        {/* Trend Line */}
                        <path d={getSvgPath()} fill="none" stroke="var(--brand-gold, #D4AF37)" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" />
                        
                        {/* Data Points / Circles */}
                        {trendData.map((d: any, i: number) => {
                          const x = 50 + (i * (420 / 6));
                          const y = 150 - ((d.count || 0) * 120 / maxCount);
                          return (
                            <g key={i} className="group cursor-pointer">
                              <circle cx={x} cy={y} r="4" fill="var(--brand-gold, #D4AF37)" stroke="var(--background)" strokeWidth="1.5" />
                              <circle cx={x} cy={y} r="8" fill="var(--brand-gold, #D4AF37)" fillOpacity="0.15" className="opacity-0 group-hover:opacity-100 transition-opacity" />
                              {/* Simple hover tooltip */}
                              <title>{`${d.date}: ${d.count} signups`}</title>
                            </g>
                          );
                        })}
                        
                        {/* X-Axis labels */}
                        {trendData.map((d: any, i: number) => {
                          const x = 50 + (i * (420 / 6));
                          return (
                            <text key={i} x={x} y="170" className="fill-muted-foreground text-[9px] font-sans text-center" textAnchor="middle">
                              {d.label}
                            </text>
                          );
                        })}
                      </svg>
                    )}
                  </div>
                </div>

                {/* Donut Chart & Membership Ratio */}
                <div className="bg-card border border-border/80 rounded-2xl p-6 shadow-sm text-left">
                  <h3 className="font-serif text-lg font-bold text-brand-navy dark:text-foreground mb-1 border-b border-border/40 pb-2 flex items-center gap-2">
                    <Users className="h-5 w-5 text-brand-gold" />
                    Member Demographics & Plans
                  </h3>
                  <p className="text-[11px] text-muted-foreground font-support mb-4">
                    Gender split ratio and active user subscription levels.
                  </p>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6 h-48 items-center">
                    {/* SVG Donut Chart */}
                    <div className="flex flex-col items-center">
                      <div className="relative w-24 h-24 flex items-center justify-center">
                        <svg className="w-full h-full transform -rotate-90" viewBox="0 0 100 100">
                          {/* Background Track */}
                          <circle cx="50" cy="50" r="35" fill="none" stroke="var(--brand-gold, #D4AF37)" strokeWidth="10" strokeOpacity="0.15" />
                          {/* Colored Segments */}
                          <circle
                            cx="50"
                            cy="50"
                            r="35"
                            fill="none"
                            stroke="var(--brand-gold, #D4AF37)"
                            strokeWidth="10"
                            strokeDasharray="219.9"
                            strokeDashoffset={dashOffset}
                            strokeLinecap="round"
                          />
                        </svg>
                        <div className="absolute flex flex-col items-center justify-center">
                          <span className="text-lg font-bold font-sans">{Math.round(malePercentage)}%</span>
                          <span className="text-[8px] text-muted-foreground uppercase font-support">Male Ratio</span>
                        </div>
                      </div>
                      
                      <div className="flex gap-4 mt-3 text-[10px] font-support">
                        <div className="flex items-center gap-1.5">
                          <span className="h-2.5 w-2.5 rounded-full bg-brand-gold" />
                          <span>Male ({Math.round(malePercentage)}%)</span>
                        </div>
                        <div className="flex items-center gap-1.5">
                          <span className="h-2.5 w-2.5 rounded-full bg-brand-gold/15" />
                          <span>Female ({Math.round(femalePercentage)}%)</span>
                        </div>
                      </div>
                    </div>

                    {/* Progress Bar: Free vs Premium */}
                    <div className="flex flex-col justify-center space-y-4 text-xs font-support">
                      <div>
                        <div className="flex justify-between mb-1 font-semibold">
                          <span>Free Package</span>
                          <span>{freeUsersCount} ({Math.round(freePercentage)}%)</span>
                        </div>
                        <div className="w-full bg-muted/60 h-2 rounded-full overflow-hidden">
                          <div className="bg-muted-foreground/35 h-full rounded-full" style={{ width: `${freePercentage}%` }} />
                        </div>
                      </div>
                      
                      <div>
                        <div className="flex justify-between mb-1 font-semibold text-brand-gold">
                          <span>Premium Plus</span>
                          <span>{premiumUsersCount} ({Math.round(premiumPercentage)}%)</span>
                        </div>
                        <div className="w-full bg-brand-gold/15 h-2 rounded-full overflow-hidden">
                          <div className="bg-brand-gold h-full rounded-full" style={{ width: `${premiumPercentage}%` }} />
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              {/* Detailed Breakdown Reports Tables */}
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                {/* Demographics Report */}
                <div className="bg-card border border-border/80 rounded-2xl p-6 shadow-sm text-left">
                  <h3 className="font-serif text-lg font-bold text-brand-navy dark:text-foreground mb-4 border-b border-border/40 pb-2">
                    Matrimonial Demographics Report
                  </h3>
                  <div className="overflow-x-auto">
                    <table className="w-full text-xs font-support text-foreground">
                      <thead>
                        <tr className="border-b border-border/60 text-muted-foreground text-left">
                          <th className="py-2 pb-3 font-semibold">Religion</th>
                          <th className="py-2 pb-3 font-semibold text-center">Registrations</th>
                          <th className="py-2 pb-3 font-semibold text-center">Premium ratio</th>
                        </tr>
                      </thead>
                      <tbody>
                        <tr className="border-b border-border/20">
                          <td className="py-3 font-medium">Hindu</td>
                          <td className="py-3 text-center">{profiles.filter((p) => p.religion === "Hindu").length}</td>
                          <td className="py-3 text-center">45%</td>
                        </tr>
                        <tr className="border-b border-border/20">
                          <td className="py-3 font-medium">Sikh</td>
                          <td className="py-3 text-center">{profiles.filter((p) => p.religion === "Sikh").length || 1}</td>
                          <td className="py-3 text-center">30%</td>
                        </tr>
                        <tr className="border-b border-border/20">
                          <td className="py-3 font-medium">Muslim</td>
                          <td className="py-3 text-center">{profiles.filter((p) => p.religion === "Muslim").length || 1}</td>
                          <td className="py-3 text-center">25%</td>
                        </tr>
                        <tr className="border-b border-border/20">
                          <td className="py-3 font-medium">Christian</td>
                          <td className="py-3 text-center">{profiles.filter((p) => p.religion === "Christian").length || 1}</td>
                          <td className="py-3 text-center">40%</td>
                        </tr>
                      </tbody>
                    </table>
                  </div>
                </div>

                {/* Sales Packages & Revenue Breakdown */}
                <div className="bg-card border border-border/80 rounded-2xl p-6 shadow-sm text-left">
                  <h3 className="font-serif text-lg font-bold text-brand-navy dark:text-foreground mb-4 border-b border-border/40 pb-2">
                    Premium Packages Breakdown
                  </h3>
                  <div className="overflow-x-auto">
                    <table className="w-full text-xs font-support text-foreground">
                      <thead>
                        <tr className="border-b border-border/60 text-muted-foreground text-left">
                          <th className="py-2 pb-3 font-semibold">Tier Plan</th>
                          <th className="py-2 pb-3 font-semibold text-center">Sales count</th>
                          <th className="py-2 pb-3 font-semibold text-right">Gross revenue</th>
                        </tr>
                      </thead>
                      <tbody>
                        <tr className="border-b border-border/20">
                          <td className="py-3 font-medium">Gold Member (6 Months)</td>
                          <td className="py-3 text-center">{Math.floor(premiumCount * 0.7)}</td>
                          <td className="py-3 text-right">₹{Math.floor(premiumCount * 0.7 * 4999).toLocaleString("en-IN")}</td>
                        </tr>
                        <tr className="border-b border-border/20">
                          <td className="py-3 font-medium">Elite Diamond (12 Months)</td>
                          <td className="py-3 text-center">{Math.ceil(premiumCount * 0.3)}</td>
                          <td className="py-3 text-right">₹{Math.ceil(premiumCount * 0.3 * 8999).toLocaleString("en-IN")}</td>
                        </tr>
                        <tr className="border-b border-border/20 font-bold">
                          <td className="py-3">Total Estimated revenue</td>
                          <td className="py-3 text-center">{premiumCount}</td>
                          <td className="py-3 text-right text-brand-gold">₹{((Math.floor(premiumCount * 0.7) * 4999) + (Math.ceil(premiumCount * 0.3) * 8999)).toLocaleString("en-IN")}</td>
                        </tr>
                      </tbody>
                    </table>
                  </div>
                </div>
              </div>

              {/* Recent System Activity Log */}
              <div className="bg-card border border-border/80 rounded-2xl p-6 shadow-sm text-left">
                <h3 className="font-serif text-lg font-bold text-brand-navy dark:text-foreground mb-4 border-b border-border/40 pb-2">
                  System Audit logs
                </h3>
                <div className="space-y-3.5 text-xs font-support">
                  <div className="flex justify-between items-start border-b border-border/10 pb-2 last:border-0 last:pb-0">
                    <div>
                      <span className="font-semibold text-brand-gold">[AUTH]</span> Registered user vikan-10005 requested selfie verification
                    </div>
                    <span className="text-[10px] text-muted-foreground">1 hour ago</span>
                  </div>
                  <div className="flex justify-between items-start border-b border-border/10 pb-2 last:border-0 last:pb-0">
                    <div>
                      <span className="font-semibold text-brand-gold">[SYSTEM]</span> Matching preference engine scanned 30 registered profiles
                    </div>
                    <span className="text-[10px] text-muted-foreground">2 hours ago</span>
                  </div>
                  <div className="flex justify-between items-start border-b border-border/10 pb-2 last:border-0 last:pb-0">
                    <div>
                      <span className="font-semibold text-brand-gold">[SECURITY]</span> Admin verified identity badge for profile ID: vikan-10011
                    </div>
                    <span className="text-[10px] text-muted-foreground">3 hours ago</span>
                  </div>
                  <div className="flex justify-between items-start border-b border-border/10 pb-2 last:border-0 last:pb-0">
                    <div>
                      <span className="font-semibold text-brand-gold">[CMS]</span> Success story: Priyanka & Rohan marriage entry added
                    </div>
                    <span className="text-[10px] text-muted-foreground">5 hours ago</span>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Tab 3: CMS controls */}
          {activeTab === "cms" && (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8 items-start">
              
              {/* CMS story creator */}
              <div className="bg-card border border-border/80 rounded-2xl p-6 shadow-sm">
                <h3 className="font-serif text-lg font-bold text-brand-navy dark:text-foreground flex items-center gap-1.5 mb-4 border-b border-border/40 pb-2">
                  <PenTool className="h-5 w-5 text-brand-gold" /> Add Success Story
                </h3>
                <form onSubmit={handleAddStory} className="space-y-4 font-support text-xs">
                  <Input
                    label="Couple Names"
                    placeholder="E.g. Priyanka & Rohan"
                    required
                    value={storyName}
                    onChange={(e) => setStoryName(e.target.value)}
                  />
                  <Input
                    label="Marriage Date"
                    placeholder="E.g. November 12, 2025"
                    value={storyDate}
                    onChange={(e) => setStoryDate(e.target.value)}
                  />
                  <Textarea
                    label="Success Story Text"
                    placeholder="Write a brief account of how they connected..."
                    required
                    value={storyText}
                    onChange={(e) => setStoryText(e.target.value)}
                  />
                   <Button type="submit" variant="gold" className="w-full uppercase text-xs font-bold tracking-wider rounded-full py-2.5 h-auto cursor-pointer">
                    Publish Success Story
                  </Button>
                </form>
              </div>

              {/* CMS Blog drafts */}
              <div className="bg-card border border-border/80 rounded-2xl p-6 shadow-sm">
                <h3 className="font-serif text-lg font-bold text-brand-navy dark:text-foreground flex items-center gap-1.5 mb-4 border-b border-border/40 pb-2">
                  <Bookmark className="h-5 w-5 text-brand-gold" /> Draft Blog Post
                </h3>
                <form onSubmit={handleAddBlog} className="space-y-4 font-support text-xs">
                  <Input
                    label="Blog Post Title"
                    placeholder="E.g. Customer Relationship Advice for In-Laws"
                    required
                    value={blogTitle}
                    onChange={(e) => setBlogTitle(e.target.value)}
                  />
                  <Textarea
                    label="Article Summary"
                    placeholder="Brief 2 sentence outline..."
                    required
                    value={blogSummary}
                    onChange={(e) => setBlogSummary(e.target.value)}
                  />
                  <Button type="submit" variant="outline" className="w-full uppercase text-xs font-bold tracking-wider border border-[#E5DCD0]/45 hover:border-[#E5DCD0]/70 text-foreground hover:bg-muted/10 rounded-full py-2.5 h-auto cursor-pointer">
                    Save Draft Blog
                  </Button>
                </form>
              </div>

            </div>
          )}

          {/* Tab 4: Compliance Reports */}
          {activeTab === "reports" && (
            <div className="space-y-6">
              <div className="bg-card border border-border/80 rounded-2xl p-5 shadow-sm text-left">
                <span className="text-xs text-muted-foreground font-support">
                  There are <span className="font-bold text-foreground">{reports.length}</span> active member safety reports.
                </span>
              </div>

              {reports.length === 0 ? (
                <div className="bg-card border border-border/70 rounded-2xl p-16 text-center shadow-sm">
                  <Flag className="h-12 w-12 text-muted-foreground mx-auto mb-4 opacity-40" />
                  <h3 className="font-serif text-xl font-bold text-brand-navy dark:text-foreground">
                    No Safety Reports
                  </h3>
                  <p className="text-xs text-muted-foreground mt-1 max-w-sm mx-auto font-support">
                    All clear. Currently there are no compliance or spam flags reported by members.
                  </p>
                </div>
              ) : (
                <div className="space-y-4">
                  {reports.map((rep: any) => {
                    const reportedProfile = rep.reported;
                    if (!reportedProfile) return null;

                    return (
                      <div
                        key={rep.id}
                        className="bg-card border border-border/60 rounded-xl p-4 shadow-sm flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 text-left"
                      >
                        <div className="flex-1 space-y-1">
                          <div className="flex items-center gap-2">
                            <h4 className="font-serif text-base font-bold text-brand-navy dark:text-foreground">
                              Reported User: {reportedProfile.name}
                            </h4>
                            <span className="text-[10px] text-destructive bg-destructive/10 border border-destructive/20 font-bold px-2 py-0.5 rounded font-support uppercase">
                              Flagged
                            </span>
                          </div>
                          <p className="text-xs text-[#E5DCD0]/80 font-support">
                            <strong>Reason:</strong> "{rep.reason}"
                          </p>
                          <p className="text-[10px] text-muted-foreground font-support">
                            Reported by ID: {rep.reporterId}
                          </p>
                        </div>

                        {/* Action buttons */}
                        <div className="flex gap-2 w-full sm:w-auto">
                          <Button
                            variant="gold"
                            size="sm"
                            onClick={async () => {
                              try {
                                await suspendMemberApi(reportedProfile.id).unwrap();
                                addNotification({
                                  title: "Profile Suspended",
                                  body: `The profile of ${reportedProfile.name} has been suspended pending compliance review.`,
                                  type: "system"
                                });
                              } catch (err) {
                                console.error(err);
                              }
                            }}
                            className="flex-1 sm:flex-none uppercase text-[10px] font-bold py-2 px-3 rounded-lg tracking-wider !bg-destructive hover:!bg-destructive/90 !text-white border-none"
                          >
                            Suspend Member
                          </Button>
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          )}

          {/* Tab 6: Helpdesk Support Tickets */}
          {activeTab === "tickets" && (
            <div className="space-y-6">
              <div className="bg-card border border-border/80 rounded-2xl p-5 shadow-sm text-left">
                <span className="text-xs text-muted-foreground font-support">
                  There are <span className="font-bold text-foreground">{tickets.length}</span> active helpdesk support tickets.
                </span>
              </div>

              {tickets.length === 0 ? (
                <div className="text-center p-12 border border-dashed border-border/60 rounded-2xl bg-card">
                  <ShieldAlert className="h-8 w-8 text-brand-gold/60 mx-auto mb-2" />
                  <h4 className="text-sm font-serif font-bold text-brand-navy dark:text-foreground">All Tickets Resolved</h4>
                  <p className="text-xs text-muted-foreground font-support mt-1">There are no open customer support requests.</p>
                </div>
              ) : (
                <div className="space-y-4">
                  {tickets.map((t: any) => (
                    <div
                      key={t.id}
                      className="bg-card border border-border/80 rounded-2xl p-6 shadow-sm flex flex-col md:flex-row md:items-center justify-between gap-6 hover:border-brand-gold/40 transition-all text-left"
                    >
                      <div className="space-y-3 flex-1">
                        <div className="flex items-center gap-3">
                          <span className="text-xs font-mono font-bold text-[#F44336] dark:text-[#E91E63]">
                            {t.ticketNumber}
                          </span>
                          <span className={`px-2 py-0.5 rounded-full text-[9px] font-bold font-sans uppercase tracking-wider ${
                            t.status === "Open"
                              ? "bg-amber-500/10 text-amber-500 border border-amber-500/20"
                              : "bg-emerald-500/10 text-emerald-500 border border-emerald-500/20"
                          }`}>
                            {t.status}
                          </span>
                          <span className="text-[10px] text-muted-foreground font-support">
                            {new Date(t.createdAt).toLocaleString()}
                          </span>
                        </div>

                        <div>
                          <h4 className="text-sm font-bold text-[#F7F3EE]">{t.subject}</h4>
                          <p className="text-xs text-muted-foreground font-support leading-relaxed mt-1 whitespace-pre-wrap">
                            "{t.message}"
                          </p>
                        </div>

                        <div className="flex items-center gap-4 text-[10px] text-muted-foreground font-support border-t border-border/20 pt-3">
                          <span>
                            <strong>Name:</strong> {t.name}
                          </span>
                          <span>
                            <strong>Email:</strong> <a href={`mailto:${t.email}`} className="text-brand-gold hover:underline">{t.email}</a>
                          </span>
                          {t.profileId && (
                            <span>
                              <strong>Profile ID:</strong> {t.profileId}
                            </span>
                          )}
                        </div>
                      </div>

                      {t.status === "Open" && (
                        <div className="flex gap-2 shrink-0 w-full md:w-auto">
                          <Button
                            variant="gold"
                            size="sm"
                            onClick={async () => {
                              try {
                                await updateTicketStatusApi({ id: t.id, status: "Resolved" }).unwrap();
                                showToast("Support ticket resolved successfully", "success");
                              } catch (err) {
                                console.error(err);
                                showToast("Failed to resolve ticket", "error");
                              }
                            }}
                            className="w-full md:w-auto uppercase text-[10px] font-bold py-2 px-3 rounded-lg tracking-wider"
                          >
                            Resolve Ticket
                          </Button>
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}

        </div>
      </main>

      {/* FULL IMAGE VIEWER MODAL */}
      <Dialog isOpen={!!selectedFullImage} onClose={() => setSelectedFullImage(null)} title="Document Image Preview">
        <div className="bg-[#051121] p-2 rounded-xl border border-brand-gold/30 flex items-center justify-center max-h-[80vh] overflow-hidden">
          {selectedFullImage && (
            <img 
              src={selectedFullImage} 
              alt="Verification Document Preview" 
              className="max-h-[70vh] max-w-full object-contain rounded-lg shadow-lg"
            />
          )}
        </div>
        <div className="mt-4 flex justify-end">
          <Button variant="outline" size="sm" onClick={() => setSelectedFullImage(null)}>
            Close Preview
          </Button>
        </div>
      </Dialog>

      {/* REJECT PROFILE MODAL */}
      <Dialog
        isOpen={!!rejectingProfile}
        onClose={() => {
          if (!isRejectingProfile) {
            setRejectingProfile(null);
            setRejectionReason("");
          }
        }}
        title="Reject Profile Registration"
      >
        {rejectingProfile && (
          <div className="space-y-4 text-left">
            <div className="p-3.5 bg-destructive/10 border border-destructive/30 rounded-xl text-xs font-support text-destructive space-y-1">
              <div className="font-bold flex items-center gap-1.5 text-sm">
                <ShieldAlert className="h-4 w-4" /> Reject Registration: {rejectingProfile.name}
              </div>
              <p className="text-muted-foreground text-[11px] leading-relaxed">
                Rejecting this profile will prevent the user from logging in and will automatically dispatch a rejection notification email to <strong className="text-foreground">{rejectingProfile.email}</strong>.
              </p>
            </div>

            <div className="space-y-1.5">
              <label className="text-xs font-support font-semibold tracking-wider text-muted-foreground uppercase">
                Reason for Rejection (Included in notification email)
              </label>
              <Textarea
                rows={3}
                value={rejectionReason}
                onChange={(e) => setRejectionReason(e.target.value)}
                placeholder="Specify reason (e.g. Inappropriate profile photo, incomplete mandatory information, policy violation)..."
                className="text-xs font-support"
              />
            </div>

            <div className="flex items-center justify-end gap-3 pt-3 border-t border-border/40">
              <Button
                type="button"
                variant="outline"
                disabled={isRejectingProfile}
                onClick={() => {
                  setRejectingProfile(null);
                  setRejectionReason("");
                }}
                className="text-xs cursor-pointer"
              >
                Cancel
              </Button>
              <Button
                type="button"
                variant="gold"
                disabled={isRejectingProfile}
                isLoading={isRejectingProfile}
                onClick={async () => {
                  try {
                    const res = await rejectProfileApi({
                      id: rejectingProfile.id,
                      reason: rejectionReason
                    }).unwrap();
                    showToast(res.message || "Profile rejected and email sent to user.", "info");
                    setRejectingProfile(null);
                    setRejectionReason("");
                  } catch (err: any) {
                    showToast(err?.data?.message || "Failed to reject profile.", "error");
                  }
                }}
                className="bg-destructive hover:bg-destructive/90 text-white font-bold text-xs flex items-center gap-1.5 cursor-pointer"
              >
                Confirm Rejection & Send Email
              </Button>
            </div>
          </div>
        )}
      </Dialog>
    </>
  );
}
