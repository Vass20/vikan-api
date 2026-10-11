"use client";

import React, { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
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
  useGetAllCustomersQuery,
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
  Check,
  Download,
  Search,
  Filter,
  Eye,
  Mail,
  Phone,
  MapPin,
  Calendar,
  ChevronDown,
  X
} from "lucide-react";

export default function AdminPortalPage() {
  const router = useRouter();
  const authUser = useSelector((state: RootState) => state.auth.user);

  const { data: metrics } = useGetDashboardMetricsQuery(undefined, { skip: !authUser });
  const { data: pendingApprovalsData } = useGetPendingApprovalsQuery(undefined, { skip: !authUser });
  const { data: verificationsData } = useGetPendingVerificationsQuery(undefined, { skip: !authUser });
  const { data: reportsData } = useGetSafetyReportsQuery(undefined, { skip: !authUser });
  const { data: ticketsData } = useGetSupportTicketsQuery(undefined, { skip: !authUser });
  const { data: customersData, isLoading: isLoadingCustomers } = useGetAllCustomersQuery(undefined, { skip: !authUser });

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
  const allCustomers = customersData || [];

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

  const [activeTab, setActiveTab] = useState<"customers" | "approvals" | "verification" | "cms" | "reports" | "metrics" | "tickets">("customers");
  const [processingProfileId, setProcessingProfileId] = useState<string | null>(null);
  const [rejectingProfile, setRejectingProfile] = useState<any | null>(null);
  const [rejectionReason, setRejectionReason] = useState("");
  const [selectedFullImage, setSelectedFullImage] = useState<string | null>(null);
  const [mounted, setMounted] = useState(false);

  // Customer Report Filters & States
  const [showCustomerFilters, setShowCustomerFilters] = useState(false);
  const [customerSearchQuery, setCustomerSearchQuery] = useState("");
  const [customerFilterGender, setCustomerFilterGender] = useState("all");
  const [customerFilterMembership, setCustomerFilterMembership] = useState("all");
  const [customerFilterStatus, setCustomerFilterStatus] = useState("all");
  const [customerFilterVerified, setCustomerFilterVerified] = useState("all");
  const [selectedCustomerModal, setSelectedCustomerModal] = useState<any | null>(null);
  const [customerPage, setCustomerPage] = useState(1);
  const customersPerPage = 12;

  const activeCustomerFilterCount = (customerFilterGender !== "all" ? 1 : 0) +
    (customerFilterMembership !== "all" ? 1 : 0) +
    (customerFilterStatus !== "all" ? 1 : 0) +
    (customerSearchQuery.trim() ? 1 : 0);

  const filteredCustomers = React.useMemo(() => {
    return allCustomers.filter((c: any) => {
      // Search text
      if (customerSearchQuery.trim()) {
        const q = customerSearchQuery.toLowerCase();
        const matchesName = (c.name || "").toLowerCase().includes(q);
        const matchesEmail = (c.email || "").toLowerCase().includes(q);
        const matchesPhone = (c.phoneNumber || "").toLowerCase().includes(q);
        const matchesParents = (c.parentsNumber || "").toLowerCase().includes(q);
        const matchesCity = (c.city || "").toLowerCase().includes(q);
        const matchesCaste = (c.community || "").toLowerCase().includes(q);
        const matchesId = (c.id || "").toLowerCase().includes(q);
        if (!matchesName && !matchesEmail && !matchesPhone && !matchesParents && !matchesCity && !matchesCaste && !matchesId) {
          return false;
        }
      }

      // Gender
      if (customerFilterGender !== "all" && (c.gender || "").toLowerCase() !== customerFilterGender.toLowerCase()) {
        return false;
      }

      // Membership
      if (customerFilterMembership !== "all") {
        const mem = (c.membershipType || "Free").toLowerCase();
        if (!mem.includes(customerFilterMembership.toLowerCase())) {
          return false;
        }
      }

      // Approval Status
      if (customerFilterStatus !== "all") {
        const status = (c.approvalStatus || (c.isApproved ? "Approved" : "Pending")).toLowerCase();
        if (status !== customerFilterStatus.toLowerCase()) {
          return false;
        }
      }

      // Verification
      if (customerFilterVerified !== "all") {
        if (customerFilterVerified === "verified" && !c.isVerified) return false;
        if (customerFilterVerified === "unverified" && c.isVerified) return false;
      }

      return true;
    });
  }, [allCustomers, customerSearchQuery, customerFilterGender, customerFilterMembership, customerFilterStatus, customerFilterVerified]);

  const totalCustomerPages = Math.ceil(filteredCustomers.length / customersPerPage) || 1;
  const paginatedCustomers = React.useMemo(() => {
    const start = (customerPage - 1) * customersPerPage;
    return filteredCustomers.slice(start, start + customersPerPage);
  }, [filteredCustomers, customerPage, customersPerPage]);

  const exportCustomersToCsv = () => {
    if (filteredCustomers.length === 0) {
      showToast("No customer records to export", "error");
      return;
    }

    const headers = [
      "ID",
      "Name",
      "Email",
      "Phone Number",
      "Parents Contact",
      "Gender",
      "DOB",
      "Age",
      "Religion",
      "Community / Caste",
      "Mother Tongue",
      "Marital Status",
      "City",
      "State",
      "Education",
      "Occupation",
      "Salary",
      "Diet",
      "Membership",
      "Is Verified",
      "Approval Status",
      "Registration Date"
    ];

    const rows = filteredCustomers.map((c: any) => {
      const age = c.dateOfBirth
        ? Math.floor((new Date().getTime() - new Date(c.dateOfBirth).getTime()) / (365.25 * 24 * 60 * 60 * 1000))
        : "";
      const regDate = c.createdAt ? new Date(c.createdAt).toLocaleDateString() : "";

      return [
        `"${c.id || ""}"`,
        `"${(c.name || "").replace(/"/g, '""')}"`,
        `"${(c.email || "").replace(/"/g, '""')}"`,
        `"${(c.phoneNumber || "").replace(/"/g, '""')}"`,
        `"${(c.parentsNumber || "").replace(/"/g, '""')}"`,
        `"${c.gender || ""}"`,
        `"${c.dateOfBirth ? new Date(c.dateOfBirth).toISOString().split('T')[0] : ""}"`,
        `"${age}"`,
        `"${(c.religion || "").replace(/"/g, '""')}"`,
        `"${(c.community || "").replace(/"/g, '""')}"`,
        `"${(c.motherTongue || "").replace(/"/g, '""')}"`,
        `"${(c.maritalStatus || "").replace(/"/g, '""')}"`,
        `"${(c.city || "").replace(/"/g, '""')}"`,
        `"${(c.state || "").replace(/"/g, '""')}"`,
        `"${(c.education || "").replace(/"/g, '""')}"`,
        `"${(c.occupation || "").replace(/"/g, '""')}"`,
        `"${(c.salary || "").replace(/"/g, '""')}"`,
        `"${(c.diet || "").replace(/"/g, '""')}"`,
        `"${(c.membershipType || "Free").replace(/"/g, '""')}"`,
        `"${c.isVerified ? "Yes" : "No"}"`,
        `"${c.approvalStatus || (c.isApproved ? "Approved" : "Pending")}"`,
        `"${regDate}"`
      ].join(",");
    });

    const csvContent = "data:text/csv;charset=utf-8," + [headers.join(","), ...rows].join("\n");
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement("a");
    link.setAttribute("href", encodedUri);
    link.setAttribute("download", `vikan_customers_report_${new Date().toISOString().split('T')[0]}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);

    showToast(`Exported ${filteredCustomers.length} customer records to CSV!`, "success");
  };

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

            {/* Responsive Navigation Layout */}
            <div className="w-full lg:w-auto">
              {/* Mobile & Tablet Dropdown Selector */}
              <div className="lg:hidden w-full">
                <label className="text-[11px] font-bold text-brand-gold uppercase tracking-wider block mb-1.5 font-support">
                  Select Admin Module:
                </label>
                <div className="relative">
                  <select
                    value={activeTab}
                    onChange={(e) => { setActiveTab(e.target.value as any); setCustomerPage(1); }}
                    className="w-full bg-[#0B1A2F] border-2 border-brand-gold/50 text-brand-gold text-xs font-bold font-support rounded-xl px-4 py-3 outline-none focus:border-brand-gold cursor-pointer shadow-lg appearance-none"
                  >
                    <option value="customers" className="bg-[#0B1A2F] text-white">📋 Customers Directory & Report ({allCustomers.length})</option>
                    <option value="approvals" className="bg-[#0B1A2F] text-white">👤 Profile Approvals ({pendingApprovals.length})</option>
                    <option value="verification" className="bg-[#0B1A2F] text-white">🛡️ Verification Queue ({pendingRequests.length})</option>
                    <option value="reports" className="bg-[#0B1A2F] text-white">🚩 Compliance Reports ({reports.length})</option>
                    <option value="metrics" className="bg-[#0B1A2F] text-white">📊 System Metrics</option>
                    <option value="cms" className="bg-[#0B1A2F] text-white">✍️ CMS Controls</option>
                    <option value="tickets" className="bg-[#0B1A2F] text-white">🎫 Helpdesk Tickets ({tickets.length})</option>
                  </select>
                  <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-4 text-brand-gold text-xs font-bold">
                    ▼
                  </div>
                </div>
              </div>

              {/* Desktop Tab Buttons */}
              <div className="hidden lg:flex flex-wrap items-center bg-[#081626]/80 rounded-2xl p-1.5 border border-brand-gold/25 gap-2 shadow-inner">
                <button
                  onClick={() => { setActiveTab("customers"); setCustomerPage(1); }}
                  className={`py-2 px-4 text-xs font-semibold rounded-xl transition-all cursor-pointer border whitespace-nowrap flex items-center gap-2 ${
                    activeTab === "customers"
                      ? "bg-brand-gold text-brand-navy border-transparent shadow-md font-bold"
                      : "bg-transparent text-[#E5DCD0]/70 hover:text-white border-brand-gold/15 hover:border-brand-gold/40"
                  }`}
                >
                  <Users className="h-4 w-4" />
                  Customers Report ({allCustomers.length})
                </button>
                <button
                  onClick={() => setActiveTab("approvals")}
                  className={`py-2 px-4 text-xs font-semibold rounded-xl transition-all cursor-pointer border whitespace-nowrap flex items-center gap-2 ${
                    activeTab === "approvals"
                      ? "bg-brand-gold text-brand-navy border-transparent shadow-md font-bold"
                      : "bg-transparent text-[#E5DCD0]/70 hover:text-white border-brand-gold/15 hover:border-brand-gold/40"
                  }`}
                >
                  <UserCheck className="h-4 w-4" />
                  Profile Approvals ({pendingApprovals.length})
                </button>
                <button
                  onClick={() => setActiveTab("verification")}
                  className={`py-2 px-4 text-xs font-semibold rounded-xl transition-all cursor-pointer border whitespace-nowrap flex items-center gap-2 ${
                    activeTab === "verification"
                      ? "bg-brand-gold text-brand-navy border-transparent shadow-md font-bold"
                      : "bg-transparent text-[#E5DCD0]/70 hover:text-white border-brand-gold/15 hover:border-brand-gold/40"
                  }`}
                >
                  <ShieldAlert className="h-4 w-4" />
                  Verification Queue ({pendingRequests.length})
                </button>
                <button
                  onClick={() => setActiveTab("reports")}
                  className={`py-2 px-4 text-xs font-semibold rounded-xl transition-all cursor-pointer border whitespace-nowrap flex items-center gap-2 ${
                    activeTab === "reports"
                      ? "bg-brand-gold text-brand-navy border-transparent shadow-md font-bold"
                      : "bg-transparent text-[#E5DCD0]/70 hover:text-white border-brand-gold/15 hover:border-brand-gold/40"
                  }`}
                >
                  <Flag className="h-4 w-4" />
                  Compliance Reports ({reports.length})
                </button>
                <button
                  onClick={() => setActiveTab("metrics")}
                  className={`py-2 px-4 text-xs font-semibold rounded-xl transition-all cursor-pointer border whitespace-nowrap flex items-center gap-2 ${
                    activeTab === "metrics"
                      ? "bg-brand-gold text-brand-navy border-transparent shadow-md font-bold"
                      : "bg-transparent text-[#E5DCD0]/70 hover:text-white border-brand-gold/15 hover:border-brand-gold/40"
                  }`}
                >
                  <TrendingUp className="h-4 w-4" />
                  System Metrics
                </button>
                <button
                  onClick={() => setActiveTab("cms")}
                  className={`py-2 px-4 text-xs font-semibold rounded-xl transition-all cursor-pointer border whitespace-nowrap flex items-center gap-2 ${
                    activeTab === "cms"
                      ? "bg-brand-gold text-brand-navy border-transparent shadow-md font-bold"
                      : "bg-transparent text-[#E5DCD0]/70 hover:text-white border-brand-gold/15 hover:border-brand-gold/40"
                  }`}
                >
                  <PenTool className="h-4 w-4" />
                  CMS Controls
                </button>
                <button
                  onClick={() => setActiveTab("tickets")}
                  className={`py-2 px-4 text-xs font-semibold rounded-xl transition-all cursor-pointer border whitespace-nowrap flex items-center gap-2 ${
                    activeTab === "tickets"
                      ? "bg-brand-gold text-brand-navy border-transparent shadow-md font-bold"
                      : "bg-transparent text-[#E5DCD0]/70 hover:text-white border-brand-gold/15 hover:border-brand-gold/40"
                  }`}
                >
                  <Bookmark className="h-4 w-4" />
                  Helpdesk Tickets ({tickets.length})
                </button>
              </div>
            </div>
          </div>

          {/* Tab: Customers Directory & Report */}
          {activeTab === "customers" && (
            <div className="space-y-6">
              {/* Report Header Card */}
              <div className="bg-card border border-border/80 rounded-2xl p-6 shadow-sm flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div>
                  <div className="flex items-center gap-2">
                    <Users className="h-6 w-6 text-brand-gold" />
                    <h3 className="font-serif text-xl font-bold text-foreground">Registered Customers Directory & Report</h3>
                  </div>
                  <p className="text-xs text-muted-foreground font-support mt-1">
                    Audit, filter, and view complete profiles of all registered members. Export records to spreadsheet or generate a report.
                  </p>
                </div>
                <div className="flex items-center gap-2.5 flex-wrap">
                  <button
                    type="button"
                    onClick={() => setShowCustomerFilters(prev => !prev)}
                    className={`px-4 py-2.5 rounded-xl border font-bold text-xs flex items-center gap-2 transition-all cursor-pointer shadow-md ${
                      showCustomerFilters || activeCustomerFilterCount > 0
                        ? "bg-brand-gold text-brand-navy border-brand-gold shadow-lg"
                        : "bg-[#081626] border-brand-gold/40 text-brand-gold hover:bg-brand-gold/10"
                    }`}
                    title={showCustomerFilters ? "Hide Filters & Search" : "Open Filters & Search"}
                  >
                    <Filter className="h-4 w-4" />
                    <span>{showCustomerFilters ? "Hide Filters" : "Filters"}</span>
                    {activeCustomerFilterCount > 0 && (
                      <span className={`h-4 w-4 rounded-full font-bold text-[10px] flex items-center justify-center ${
                        showCustomerFilters ? "bg-brand-navy text-brand-gold" : "bg-brand-gold text-brand-navy"
                      }`}>
                        {activeCustomerFilterCount}
                      </span>
                    )}
                  </button>
                  <button
                    onClick={exportCustomersToCsv}
                    className="px-4 py-2.5 rounded-xl bg-brand-gold text-brand-navy font-bold text-xs flex items-center gap-2 hover:bg-brand-gold/90 transition-all cursor-pointer shadow-md"
                  >
                    <Download className="h-4 w-4" />
                    <span>Export CSV</span>
                  </button>
                </div>
              </div>

              {/* KPI Summary Cards */}
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <div className="bg-card border border-border/70 rounded-2xl p-4 shadow-sm">
                  <span className="text-[10px] font-bold text-muted-foreground uppercase tracking-wider block font-support">Total Customers</span>
                  <div className="flex items-center justify-between mt-2">
                    <span className="font-serif text-2xl font-bold text-foreground">{allCustomers.length}</span>
                    <Users className="h-5 w-5 text-brand-gold opacity-70" />
                  </div>
                  <span className="text-[10px] text-muted-foreground mt-1 block">Active on platform</span>
                </div>

                <div className="bg-card border border-border/70 rounded-2xl p-4 shadow-sm">
                  <span className="text-[10px] font-bold text-muted-foreground uppercase tracking-wider block font-support">Premium Members</span>
                  <div className="flex items-center justify-between mt-2">
                    <span className="font-serif text-2xl font-bold text-brand-gold">
                      {allCustomers.filter((c: any) => c.isPremium || (c.membershipType && c.membershipType !== "Free" && c.membershipType !== "Free Member")).length}
                    </span>
                    <Award className="h-5 w-5 text-brand-gold opacity-70" />
                  </div>
                  <span className="text-[10px] text-muted-foreground mt-1 block">Silver / Gold / Platinum</span>
                </div>

                <div className="bg-card border border-border/70 rounded-2xl p-4 shadow-sm">
                  <span className="text-[10px] font-bold text-muted-foreground uppercase tracking-wider block font-support">ID Verified</span>
                  <div className="flex items-center justify-between mt-2">
                    <span className="font-serif text-2xl font-bold text-emerald-400">
                      {allCustomers.filter((c: any) => c.isVerified).length}
                    </span>
                    <FileCheck2 className="h-5 w-5 text-emerald-400 opacity-70" />
                  </div>
                  <span className="text-[10px] text-muted-foreground mt-1 block">Verified badge awarded</span>
                </div>

                <div className="bg-card border border-border/70 rounded-2xl p-4 shadow-sm">
                  <span className="text-[10px] font-bold text-muted-foreground uppercase tracking-wider block font-support">Pending Approvals</span>
                  <div className="flex items-center justify-between mt-2">
                    <span className="font-serif text-2xl font-bold text-amber-400">
                      {allCustomers.filter((c: any) => !c.isApproved || c.approvalStatus === "Pending").length}
                    </span>
                    <ShieldAlert className="h-5 w-5 text-amber-400 opacity-70" />
                  </div>
                  <span className="text-[10px] text-muted-foreground mt-1 block">Awaiting admin review</span>
                </div>
              </div>

              {/* Filter & Search Toolbar (Smooth animated transition on toggle) */}
              <AnimatePresence>
                {showCustomerFilters && (
                  <motion.div
                    initial={{ opacity: 0, height: 0, y: -8 }}
                    animate={{ opacity: 1, height: "auto", y: 0 }}
                    exit={{ opacity: 0, height: 0, y: -8 }}
                    transition={{ duration: 0.35, ease: [0.16, 1, 0.3, 1] }}
                    className="overflow-hidden"
                  >
                    <div className="bg-card border border-border/80 rounded-2xl p-4 shadow-sm space-y-3">
                      <div className="grid grid-cols-1 md:grid-cols-5 gap-3">
                        {/* Search Input */}
                        <div className="md:col-span-2 relative">
                          <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                          <input
                            type="text"
                            placeholder="Search name, email, phone, city, caste..."
                            value={customerSearchQuery}
                            onChange={(e) => { setCustomerSearchQuery(e.target.value); setCustomerPage(1); }}
                            className="w-full bg-[#081626]/80 border border-brand-gold/30 rounded-xl pl-10 pr-9 py-2.5 text-xs text-white placeholder-muted-foreground/60 focus:outline-none focus:border-brand-gold"
                            autoFocus
                          />
                          {customerSearchQuery && (
                            <button
                              onClick={() => { setCustomerSearchQuery(""); setCustomerPage(1); }}
                              className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-white cursor-pointer"
                            >
                              <X className="h-3.5 w-3.5" />
                            </button>
                          )}
                        </div>

                        {/* Gender Filter */}
                        <div className="relative">
                          <select
                            value={customerFilterGender}
                            onChange={(e) => { setCustomerFilterGender(e.target.value); setCustomerPage(1); }}
                            className="w-full bg-[#081626]/80 border border-brand-gold/30 rounded-xl pl-3.5 pr-10 py-2.5 text-xs text-white outline-none focus:border-brand-gold cursor-pointer appearance-none"
                          >
                            <option value="all" className="bg-[#0B1A2F]">All Genders</option>
                            <option value="Male" className="bg-[#0B1A2F]">Male</option>
                            <option value="Female" className="bg-[#0B1A2F]">Female</option>
                          </select>
                          <ChevronDown className="absolute right-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-brand-gold/70 pointer-events-none" />
                        </div>

                        {/* Membership Filter */}
                        <div className="relative">
                          <select
                            value={customerFilterMembership}
                            onChange={(e) => { setCustomerFilterMembership(e.target.value); setCustomerPage(1); }}
                            className="w-full bg-[#081626]/80 border border-brand-gold/30 rounded-xl pl-3.5 pr-10 py-2.5 text-xs text-white outline-none focus:border-brand-gold cursor-pointer appearance-none"
                          >
                            <option value="all" className="bg-[#0B1A2F]">All Memberships</option>
                            <option value="Free" className="bg-[#0B1A2F]">Free</option>
                            <option value="Silver" className="bg-[#0B1A2F]">Silver Member</option>
                            <option value="Gold" className="bg-[#0B1A2F]">Gold Member</option>
                            <option value="Platinum" className="bg-[#0B1A2F]">Platinum Member</option>
                          </select>
                          <ChevronDown className="absolute right-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-brand-gold/70 pointer-events-none" />
                        </div>

                        {/* Approval / Verification Filter */}
                        <div className="relative">
                          <select
                            value={customerFilterStatus}
                            onChange={(e) => { setCustomerFilterStatus(e.target.value); setCustomerPage(1); }}
                            className="w-full bg-[#081626]/80 border border-brand-gold/30 rounded-xl pl-3.5 pr-10 py-2.5 text-xs text-white outline-none focus:border-brand-gold cursor-pointer appearance-none"
                          >
                            <option value="all" className="bg-[#0B1A2F]">All Statuses</option>
                            <option value="Approved" className="bg-[#0B1A2F]">Approved</option>
                            <option value="Pending" className="bg-[#0B1A2F]">Pending Approval</option>
                            <option value="Rejected" className="bg-[#0B1A2F]">Rejected</option>
                          </select>
                          <ChevronDown className="absolute right-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-brand-gold/70 pointer-events-none" />
                        </div>
                      </div>

                      <div className="flex items-center justify-between text-xs text-muted-foreground pt-1 border-t border-border/40 font-support">
                        <span>
                          Showing <strong className="text-white">{filteredCustomers.length}</strong> of <strong className="text-white">{allCustomers.length}</strong> customers
                        </span>
                        {(customerSearchQuery || customerFilterGender !== "all" || customerFilterMembership !== "all" || customerFilterStatus !== "all" || customerFilterVerified !== "all") && (
                          <button
                            onClick={() => {
                              setCustomerSearchQuery("");
                              setCustomerFilterGender("all");
                              setCustomerFilterMembership("all");
                              setCustomerFilterStatus("all");
                              setCustomerFilterVerified("all");
                              setCustomerPage(1);
                            }}
                            className="text-brand-gold hover:underline text-xs cursor-pointer"
                          >
                            Reset All Filters
                          </button>
                        )}
                      </div>
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>

              {/* Data Table */}
              <div className="bg-card border border-border/80 rounded-2xl shadow-sm overflow-hidden">
                <div className="overflow-x-auto">
                  <table className="w-full text-left text-xs">
                    <thead className="bg-[#081626]/90 border-b border-border/80 text-muted-foreground uppercase text-[10px] font-bold tracking-wider">
                      <tr>
                        <th className="py-3.5 px-4">Customer</th>
                        <th className="py-3.5 px-4">Contact Details</th>
                        <th className="py-3.5 px-4">Background</th>
                        <th className="py-3.5 px-4">Location & Career</th>
                        <th className="py-3.5 px-4">Membership</th>
                        <th className="py-3.5 px-4">Status</th>
                        <th className="py-3.5 px-4">Registered</th>
                        <th className="py-3.5 px-4 text-right">Actions</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-border/40">
                      {paginatedCustomers.length === 0 ? (
                        <tr>
                          <td colSpan={8} className="py-12 text-center text-muted-foreground">
                            <Users className="h-10 w-10 mx-auto mb-2 opacity-30" />
                            <p className="font-medium text-sm">No customer records found</p>
                            <p className="text-xs text-muted-foreground/70 mt-1">Try adjusting your search query or filters.</p>
                          </td>
                        </tr>
                      ) : (
                        paginatedCustomers.map((customer: any) => {
                          const age = customer.dateOfBirth
                            ? Math.floor((new Date().getTime() - new Date(customer.dateOfBirth).getTime()) / (365.25 * 24 * 60 * 60 * 1000))
                            : null;
                          const photo = customer.photos?.[0] || null;

                          return (
                            <tr key={customer.id} className="hover:bg-muted/10 transition-colors">
                              {/* Customer Identity */}
                              <td className="py-3 px-4">
                                <div className="flex items-center gap-3">
                                  {photo ? (
                                    <img
                                      src={photo}
                                      alt={customer.name}
                                      className="h-10 w-10 rounded-full object-cover border border-brand-gold/30 shrink-0"
                                    />
                                  ) : (
                                    <div className="h-10 w-10 rounded-full bg-brand-gold/15 text-brand-gold font-bold flex items-center justify-center shrink-0 border border-brand-gold/30">
                                      {customer.name?.charAt(0)?.toUpperCase() || "U"}
                                    </div>
                                  )}
                                  <div>
                                    <div className="font-bold text-foreground text-xs">{customer.name}</div>
                                    <div className="text-[11px] text-muted-foreground flex items-center gap-1.5 mt-0.5">
                                      <span>{customer.gender || "N/A"}</span>
                                      {age && <span>• {age} yrs</span>}
                                    </div>
                                    <span className="text-[10px] font-mono text-muted-foreground/60 block truncate max-w-[120px]">
                                      ID: {customer.id?.substring(0, 8)}...
                                    </span>
                                  </div>
                                </div>
                              </td>

                              {/* Contact Information */}
                              <td className="py-3 px-4">
                                <div className="space-y-0.5">
                                  <div className="flex items-center gap-1.5 text-foreground text-[11px]">
                                    <Mail className="h-3 w-3 text-muted-foreground shrink-0" />
                                    <a href={`mailto:${customer.email}`} className="hover:text-brand-gold transition-colors truncate max-w-[180px]">
                                      {customer.email || "N/A"}
                                    </a>
                                  </div>
                                  <div className="flex items-center gap-1.5 text-muted-foreground text-[11px]">
                                    <Phone className="h-3 w-3 shrink-0" />
                                    <span>{customer.phoneNumber || "N/A"}</span>
                                  </div>
                                  {customer.parentsNumber && (
                                    <div className="text-[10px] text-muted-foreground/80">
                                      Parents: {customer.parentsNumber}
                                    </div>
                                  )}
                                </div>
                              </td>

                              {/* Background */}
                              <td className="py-3 px-4">
                                <div className="space-y-0.5">
                                  <div className="font-medium text-foreground text-[11px]">
                                    {customer.religion || "N/A"}
                                  </div>
                                  <div className="text-brand-gold/90 text-[11px]">
                                    {customer.community || "N/A"}
                                  </div>
                                  {customer.motherTongue && (
                                    <div className="text-[10px] text-muted-foreground">
                                      Tongue: {customer.motherTongue}
                                    </div>
                                  )}
                                </div>
                              </td>

                              {/* Location & Career */}
                              <td className="py-3 px-4">
                                <div className="space-y-0.5">
                                  <div className="flex items-center gap-1 text-[11px] text-foreground">
                                    <MapPin className="h-3 w-3 text-muted-foreground shrink-0" />
                                    <span>{customer.city ? `${customer.city}, ${customer.state || ""}` : "Location N/A"}</span>
                                  </div>
                                  <div className="text-[11px] text-muted-foreground truncate max-w-[150px]">
                                    {customer.occupation || customer.education || "Occupation N/A"}
                                  </div>
                                  {customer.salary && (
                                    <div className="text-[10px] text-emerald-400 font-medium">
                                      {customer.salary}
                                    </div>
                                  )}
                                </div>
                              </td>

                              {/* Membership */}
                              <td className="py-3 px-4">
                                {customer.membershipType?.includes("Gold") ? (
                                  <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full bg-brand-gold/15 border border-brand-gold/40 text-brand-gold font-bold text-[10px]">
                                    <Award className="h-3 w-3" /> Gold Member
                                  </span>
                                ) : customer.membershipType?.includes("Silver") ? (
                                  <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full bg-slate-400/15 border border-slate-400/40 text-slate-300 font-bold text-[10px]">
                                    <Award className="h-3 w-3" /> Silver Member
                                  </span>
                                ) : customer.membershipType?.includes("Platinum") ? (
                                  <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full bg-purple-500/15 border border-purple-500/40 text-purple-300 font-bold text-[10px]">
                                    <Award className="h-3 w-3" /> Platinum
                                  </span>
                                ) : (
                                  <span className="px-2 py-0.5 rounded-full bg-muted/30 border border-muted-foreground/20 text-muted-foreground text-[10px]">
                                    Free Member
                                  </span>
                                )}
                              </td>

                              {/* Status */}
                              <td className="py-3 px-4">
                                <div className="space-y-1">
                                  <div>
                                    {customer.isApproved || customer.approvalStatus === "Approved" ? (
                                      <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-emerald-500/15 text-emerald-400 font-medium text-[10px] border border-emerald-500/30">
                                        ✓ Approved
                                      </span>
                                    ) : customer.approvalStatus === "Rejected" ? (
                                      <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-rose-500/15 text-rose-400 font-medium text-[10px] border border-rose-500/30">
                                        ✗ Rejected
                                      </span>
                                    ) : (
                                      <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-amber-500/15 text-amber-400 font-medium text-[10px] border border-amber-500/30">
                                        ○ Pending
                                      </span>
                                    )}
                                  </div>
                                  <div>
                                    {customer.isVerified ? (
                                      <span className="text-[10px] text-emerald-400 flex items-center gap-1">
                                        <FileCheck2 className="h-3 w-3" /> Verified ID
                                      </span>
                                    ) : (
                                      <span className="text-[10px] text-muted-foreground/70">
                                        Unverified
                                      </span>
                                    )}
                                  </div>
                                </div>
                              </td>

                              {/* Registration Date */}
                              <td className="py-3 px-4 text-muted-foreground text-[11px] whitespace-nowrap">
                                {customer.createdAt ? new Date(customer.createdAt).toLocaleDateString() : "N/A"}
                              </td>

                              {/* Actions */}
                              <td className="py-3 px-4 text-right">
                                <div className="flex items-center justify-end">
                                  <button
                                    onClick={() => setSelectedCustomerModal(customer)}
                                    className="p-1.5 rounded-lg bg-card border border-brand-gold/30 text-brand-gold hover:bg-brand-gold hover:text-brand-navy transition-all cursor-pointer flex items-center gap-1.5 px-2.5"
                                    title="View Full Customer Details"
                                  >
                                    <Eye className="h-3.5 w-3.5" />
                                    <span className="text-[11px] font-medium">View</span>
                                  </button>
                                </div>
                              </td>
                            </tr>
                          );
                        })
                      )}
                    </tbody>
                  </table>
                </div>

                {/* Pagination Footer */}
                {totalCustomerPages > 1 && (
                  <div className="bg-[#081626]/70 p-4 border-t border-border flex items-center justify-between text-xs">
                    <span className="text-muted-foreground font-support">
                      Page <strong className="text-white">{customerPage}</strong> of <strong className="text-white">{totalCustomerPages}</strong>
                    </span>
                    <div className="flex items-center gap-2">
                      <button
                        onClick={() => setCustomerPage(p => Math.max(1, p - 1))}
                        disabled={customerPage <= 1}
                        className="px-3 py-1.5 rounded-lg border border-border text-xs font-semibold disabled:opacity-40 hover:bg-muted/20 cursor-pointer disabled:cursor-not-allowed"
                      >
                        Previous
                      </button>
                      <button
                        onClick={() => setCustomerPage(p => Math.min(totalCustomerPages, p + 1))}
                        disabled={customerPage >= totalCustomerPages}
                        className="px-3 py-1.5 rounded-lg border border-border text-xs font-semibold disabled:opacity-40 hover:bg-muted/20 cursor-pointer disabled:cursor-not-allowed"
                      >
                        Next
                      </button>
                    </div>
                  </div>
                )}
              </div>
            </div>
          )}

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

      {/* CUSTOMER QUICK DETAILS MODAL */}
      <Dialog
        isOpen={!!selectedCustomerModal}
        onClose={() => setSelectedCustomerModal(null)}
        title={`Customer Record: ${selectedCustomerModal?.name || "Member"}`}
        size="lg"
      >
        {selectedCustomerModal && (
          <div className="space-y-4 text-left">
            {/* Header Identity */}
            <div className="flex items-center gap-4 p-4 rounded-xl bg-[#081626]/80 border border-brand-gold/30">
              {selectedCustomerModal.photos?.[0] ? (
                <img
                  src={selectedCustomerModal.photos[0]}
                  alt={selectedCustomerModal.name}
                  className="h-16 w-16 rounded-xl object-cover border border-brand-gold"
                />
              ) : (
                <div className="h-16 w-16 rounded-xl bg-brand-gold/15 text-brand-gold font-bold text-2xl flex items-center justify-center border border-brand-gold">
                  {selectedCustomerModal.name?.charAt(0) || "U"}
                </div>
              )}
              <div className="flex-1">
                <h4 className="font-serif text-lg font-bold text-white">{selectedCustomerModal.name}</h4>
                <p className="text-xs text-muted-foreground">
                  {selectedCustomerModal.gender} • {selectedCustomerModal.religion} • {selectedCustomerModal.community}
                </p>
                <div className="flex items-center gap-2 mt-1.5">
                  <span className="px-2 py-0.5 rounded-full bg-brand-gold/20 text-brand-gold text-[10px] font-bold">
                    {selectedCustomerModal.membershipType || "Free Member"}
                  </span>
                  <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${selectedCustomerModal.isApproved ? "bg-emerald-500/20 text-emerald-400" : "bg-amber-500/20 text-amber-400"}`}>
                    {selectedCustomerModal.approvalStatus || (selectedCustomerModal.isApproved ? "Approved" : "Pending")}
                  </span>
                </div>
              </div>
            </div>

            {/* Grid of Key Info */}
            <div className="grid grid-cols-2 gap-3 text-xs">
              <div className="p-3 rounded-lg bg-card border border-border">
                <span className="text-[10px] uppercase text-muted-foreground block font-bold">Email Address</span>
                <span className="text-white font-medium break-all">{selectedCustomerModal.email || "N/A"}</span>
              </div>
              <div className="p-3 rounded-lg bg-card border border-border">
                <span className="text-[10px] uppercase text-muted-foreground block font-bold">Phone Number</span>
                <span className="text-white font-medium">{selectedCustomerModal.phoneNumber || "N/A"}</span>
              </div>
              <div className="p-3 rounded-lg bg-card border border-border">
                <span className="text-[10px] uppercase text-muted-foreground block font-bold">Parents Contact</span>
                <span className="text-white font-medium">{selectedCustomerModal.parentsNumber || "N/A"}</span>
              </div>
              <div className="p-3 rounded-lg bg-card border border-border">
                <span className="text-[10px] uppercase text-muted-foreground block font-bold">Location</span>
                <span className="text-white font-medium">{selectedCustomerModal.city ? `${selectedCustomerModal.city}, ${selectedCustomerModal.state || ""}` : "N/A"}</span>
              </div>
              <div className="p-3 rounded-lg bg-card border border-border">
                <span className="text-[10px] uppercase text-muted-foreground block font-bold">Education</span>
                <span className="text-white font-medium">{selectedCustomerModal.education || "N/A"}</span>
              </div>
              <div className="p-3 rounded-lg bg-card border border-border">
                <span className="text-[10px] uppercase text-muted-foreground block font-bold">Occupation & Salary</span>
                <span className="text-white font-medium">{selectedCustomerModal.occupation || "N/A"} ({selectedCustomerModal.salary || "N/A"})</span>
              </div>
              <div className="p-3 rounded-lg bg-card border border-border">
                <span className="text-[10px] uppercase text-muted-foreground block font-bold">Diet / Habits</span>
                <span className="text-white font-medium">{selectedCustomerModal.diet || "N/A"}</span>
              </div>
              <div className="p-3 rounded-lg bg-card border border-border">
                <span className="text-[10px] uppercase text-muted-foreground block font-bold">Registered On</span>
                <span className="text-white font-medium">{selectedCustomerModal.createdAt ? new Date(selectedCustomerModal.createdAt).toLocaleDateString() : "N/A"}</span>
              </div>
            </div>

            {/* Photos preview */}
            {selectedCustomerModal.photos && selectedCustomerModal.photos.length > 0 && (
              <div>
                <span className="text-xs font-bold text-muted-foreground uppercase block mb-2">Uploaded Photos ({selectedCustomerModal.photos.length})</span>
                <div className="flex gap-2 overflow-x-auto pb-2">
                  {selectedCustomerModal.photos.map((pUrl: string, idx: number) => (
                    <img
                      key={idx}
                      src={pUrl}
                      alt="Customer"
                      onClick={() => setSelectedFullImage(pUrl)}
                      className="h-20 w-20 rounded-lg object-cover border border-border cursor-pointer hover:border-brand-gold transition-colors shrink-0"
                    />
                  ))}
                </div>
              </div>
            )}

            {/* Dialog Footer Actions */}
            <div className="pt-2 flex items-center justify-end border-t border-border/40">
              <Button
                variant="outline"
                onClick={() => setSelectedCustomerModal(null)}
                className="text-xs"
              >
                Close
              </Button>
            </div>
          </div>
        )}
      </Dialog>
    </>
  );
}
