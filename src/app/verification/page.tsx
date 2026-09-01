"use client";

import React, { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { useAppStore } from "@/lib/store";
import { Navbar } from "@/components/layout/Navbar";
import { useSelector } from "react-redux";
import { RootState } from "@/lib/redux/store";
import {
  useGetMyProfileQuery,
  useGetMyVerificationsQuery,
  useSubmitVerificationMutation
} from "@/lib/redux/api";
import { Footer } from "@/components/layout/Footer";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { ShieldCheck, ShieldAlert, Camera, FileCheck2, UserCheck, CheckCircle2, RefreshCw } from "lucide-react";

export default function VerificationPage() {
  const router = useRouter();
  const authUser = useSelector((state: RootState) => state.auth.user);

  const { data: myProfile } = useGetMyProfileQuery(undefined, { skip: !authUser });
  const { data: verifications } = useGetMyVerificationsQuery(undefined, { skip: !authUser });
  const [submitVerificationApi] = useSubmitVerificationMutation();

  const {
    addNotification,
    showToast
  } = useAppStore();

  const [mounted, setMounted] = useState(false);
  const [idCardFile, setIdCardFile] = useState<string>("");
  const [selfieFile, setSelfieFile] = useState<string>("");
  const [cameraActive, setCameraActive] = useState(false);
  const [cameraCountdown, setCameraCountdown] = useState<number | null>(null);
  const [submitting, setSubmitting] = useState(false);

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

  const currentUser = myProfile;

  // Simulated countdown for camera capture
  useEffect(() => {
    if (cameraCountdown === null) return;
    if (cameraCountdown === 0) {
      setSelfieFile(currentUser?.photos[0] || "https://images.unsplash.com/photo-1610030469983-98e550d6193c?w=400");
      setCameraActive(false);
      setCameraCountdown(null);
      return;
    }
    const timer = setTimeout(() => {
      setCameraCountdown(cameraCountdown - 1);
    }, 1000);
    return () => clearTimeout(timer);
  }, [cameraCountdown]);

  if (!mounted || !currentUser) return null;

  // Check if there is an active request in the store
  const userRequest = verifications?.find((r: any) => r.status === "Pending");

  const startCameraScan = () => {
    setCameraActive(true);
    setCameraCountdown(3);
  };

  const handleSubmitVerification = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!idCardFile) {
      showToast("Please provide a Government ID document URL or select a mock file first.", "warning");
      return;
    }
    setSubmitting(true);

    try {
      const finalSelfie = selfieFile || myProfile?.photos?.[0]?.url || "";
      
      await submitVerificationApi({
        documentType: "Aadhar",
        documentUrl: idCardFile,
        faceScanUrl: finalSelfie
      }).unwrap();

      addNotification({
        title: "Verification Documents Submitted",
        body: "Your profile verification request is pending moderator review. Expected resolution time: 2 hours.",
        type: "verification"
      });
    } catch (err) {
      console.error(err);
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <>
      <Navbar />

      <main className="flex-1 bg-[#F7F3EE] dark:bg-[#081626] py-10 px-4 sm:px-6 lg:px-8 text-foreground">
        <div className="mx-auto max-w-2xl bg-card border border-border/80 rounded-2xl p-8 shadow-sm">
          
          <div className="text-center mb-8 border-b border-border pb-6">
            <h1 className="font-serif text-3xl font-bold text-brand-navy dark:text-foreground flex items-center justify-center gap-2">
              <ShieldCheck className="h-8 w-8 text-brand-gold fill-brand-navy" /> Trust & Verification
            </h1>
            <p className="text-xs text-muted-foreground font-support mt-2 max-w-md mx-auto">
              Vikan is built on family safety. Complete selfie and ID verification to activate the blue verification badge on your profile.
            </p>
          </div>

          {/* Verification status indicator */}
          {currentUser.isVerified ? (
            <div className="p-6 bg-emerald-500/5 border border-emerald-500 rounded-xl flex items-center gap-4 mb-8">
              <CheckCircle2 className="h-10 w-10 text-emerald-500 shrink-0" />
              <div>
                <h3 className="text-xs font-bold text-emerald-600 uppercase font-support">Profile Verified</h3>
                <p className="text-xs text-muted-foreground font-support mt-0.5 leading-relaxed">
                  Congratulations! Your Vikan Verification Badge is active. You have full access to premium search matches and messaging features.
                </p>
              </div>
            </div>
          ) : userRequest?.status === "pending" ? (
            <div className="p-6 bg-brand-gold/5 border border-brand-gold rounded-xl flex items-center gap-4 mb-8">
              <RefreshCw className="h-10 w-10 text-brand-gold animate-spin shrink-0" />
              <div>
                <h3 className="text-xs font-bold text-brand-gold uppercase font-support">Review Pending</h3>
                <p className="text-xs text-muted-foreground font-support mt-0.5 leading-relaxed">
                  We have received your verification documents. A moderator will review and activate your profile badge shortly.
                </p>
                <div className="mt-3">
                  <Link href="/admin">
                    <Button variant="outline" size="sm" className="text-[10px] py-1 h-auto font-bold uppercase tracking-wider">
                      Go to Admin Portal to Approve Request →
                    </Button>
                  </Link>
                </div>
              </div>
            </div>
          ) : (
            <form onSubmit={handleSubmitVerification} className="space-y-6">
              
              {/* Form Block 1: ID Upload */}
              <div className="p-5 border border-border/80 rounded-xl bg-muted/5 space-y-4">
                <h3 className="font-serif text-base font-bold text-brand-navy dark:text-foreground flex items-center gap-2">
                  <FileCheck2 className="h-5 w-5 text-brand-gold" /> 1. Government Photo ID
                </h3>
                <p className="text-xs text-muted-foreground font-support">
                  Upload a scanned copy or passport picture of your national identity card (Aadhaar, Passport, or PAN card).
                </p>
                
                <Input
                  label="Document URL / Image Link"
                  placeholder="E.g. Paste mock document link (or type 'aadhaar-card-mock.jpg')"
                  required
                  value={idCardFile}
                  onChange={(e) => setIdCardFile(e.target.value)}
                />

                <div className="flex gap-2">
                  {[
                    { label: "Aadhaar Card", url: "https://images.unsplash.com/photo-1554774853-aae0a22c8aa4?w=600&auto=format&fit=crop&q=80" },
                    { label: "Passport Page", url: "https://images.unsplash.com/photo-1457369804613-52c61a468e7d?w=600&auto=format&fit=crop&q=80" }
                  ].map((mockVal) => (
                    <button
                      key={mockVal.label}
                      type="button"
                      onClick={() => setIdCardFile(mockVal.url)}
                      className="text-[10px] font-support font-semibold text-brand-gold border border-brand-gold/30 px-2.5 py-1 rounded bg-brand-gold/5 hover:bg-brand-gold hover:text-brand-navy transition-all cursor-pointer"
                    >
                      Use Mock: {mockVal.label}
                    </button>
                  ))}
                </div>
              </div>

              {/* Form Block 2: Selfie Check */}
              <div className="p-5 border border-border/80 rounded-xl bg-muted/5 space-y-4">
                <h3 className="font-serif text-base font-bold text-brand-navy dark:text-foreground flex items-center gap-2">
                  <Camera className="h-5 w-5 text-brand-gold" /> 2. Live Face Scan (Selfie Verification)
                </h3>
                <p className="text-xs text-muted-foreground font-support">
                  We match your selfie photo against your government ID using facial analysis algorithms.
                </p>

                {cameraActive ? (
                  <div className="h-44 w-full bg-[#0A1828] border border-brand-gold rounded-lg flex flex-col items-center justify-center relative overflow-hidden">
                    <span className="h-3 w-3 rounded-full bg-red-600 animate-ping absolute top-3 left-3" />
                    {cameraCountdown !== null && (
                      <span className="font-serif text-4xl text-brand-gold font-bold animate-pulse">
                        {cameraCountdown}
                      </span>
                    )}
                    <span className="text-[10px] text-[#F7F3EE]/60 font-support mt-2">
                      Live Feed Active - Face the lens
                    </span>
                  </div>
                ) : selfieFile ? (
                  <div className="flex flex-col items-center justify-center">
                    <div className="relative h-40 w-40 rounded-xl overflow-hidden border border-brand-gold shadow-md">
                      <img src={selfieFile} alt="Selfie" className="h-full w-full object-cover" />
                    </div>
                    <button
                      type="button"
                      onClick={startCameraScan}
                      className="text-xs text-brand-gold hover:underline mt-2 font-support font-semibold flex items-center gap-1 cursor-pointer"
                    >
                      <RefreshCw className="h-3.5 w-3.5" /> Retake Face Scan
                    </button>
                  </div>
                ) : (
                  <div className="flex justify-center py-4">
                    <Button
                      type="button"
                      variant="outline"
                      onClick={startCameraScan}
                      className="flex items-center gap-1.5 font-bold uppercase tracking-wider text-xs border-brand-gold text-brand-gold"
                    >
                      <Camera className="h-4 w-4" /> Start Selfie Scan
                    </Button>
                  </div>
                )}
              </div>

              {/* Submit CTA */}
              <div className="pt-4 border-t border-border flex justify-end">
                <Button
                  type="submit"
                  variant="gold"
                  className="font-bold uppercase tracking-wider px-10 py-3"
                  isLoading={submitting}
                >
                  Submit Verification Packet
                </Button>
              </div>

            </form>
          )}

        </div>
      </main>

      <Footer />
    </>
  );
}
