"use client";

import React, { useState, useEffect, useMemo } from "react";
import { useRouter } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import { useAppStore } from "@/lib/store";
import { Button } from "@/components/ui/button";
import { Input, Select, Textarea } from "@/components/ui/input";
import { Navbar } from "@/components/layout/Navbar";
import { Footer } from "@/components/layout/Footer";
import { Check, ArrowLeft, ArrowRight, UserPlus, Image, Shield, CheckCircle2 } from "lucide-react";
import { useDispatch } from "react-redux";
import { setCredentials } from "@/lib/redux/slices/authSlice";
import { useRegisterMutation, useLoginMutation, useUploadPhotoMutation, useGetCastesQuery, useUploadPhotoFileMutation, useUploadRegistrationPhotoMutation, useSendOtpMutation, useVerifyOtpMutation } from "@/lib/redux/api";

export default function RegisterPage() {
  const router = useRouter();
  const {
    currentUser,
    registrationStep,
    registrationDraft,
    updateDraft,
    setRegistrationStep,
    completeRegistration,
    showToast
  } = useAppStore();

  const [isLoading, setIsLoading] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const dispatch = useDispatch();
  const [registerApi] = useRegisterMutation();
  const [loginApi] = useLoginMutation();
  const [uploadPhotoApi] = useUploadPhotoMutation();
  const [uploadPhotoFile] = useUploadPhotoFileMutation();
  const [uploadRegistrationPhotoApi] = useUploadRegistrationPhotoMutation();
  const [sendOtpApi, { isLoading: isSendingOtp }] = useSendOtpMutation();
  const [verifyOtpApi, { isLoading: isVerifyingOtp }] = useVerifyOtpMutation();
  const { data: castes } = useGetCastesQuery();

  const [isRegisteredPendingApproval, setIsRegisteredPendingApproval] = useState(false);

  const [isEmailVerified, setIsEmailVerified] = useState(false);
  const [otpSent, setOtpSent] = useState(false);
  const [otpCode, setOtpCode] = useState("");
  const [otpError, setOtpError] = useState("");
  const [resendCooldown, setResendCooldown] = useState(0);
 
  const [photoFile, setPhotoFile] = useState<File | null>(null);
 
  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setPhotoFile(file);
    setPhotoUrl(URL.createObjectURL(file));
  };

  // Auto-saved draft helper
  const [draftName, setDraftName] = useState(registrationDraft.name || "");
  const [draftGender, setDraftGender] = useState<"female" | "male">(registrationDraft.gender === "male" ? "male" : "female");
  const [draftDob, setDraftDob] = useState(registrationDraft.dob || "");
  const [draftEmail, setDraftEmail] = useState(registrationDraft.email || "");
  const [draftPassword, setDraftPassword] = useState("");
  const [draftMobile, setDraftMobile] = useState(registrationDraft.mobile || "");

  // Step 2
  const [draftReligion, setDraftReligion] = useState(registrationDraft.religion || "");
  const [draftCommunity, setDraftCommunity] = useState(registrationDraft.community || "");
  const [draftTongue, setDraftTongue] = useState(registrationDraft.motherTongue || "");
  const [draftMarital, setDraftMarital] = useState(registrationDraft.maritalStatus || "");

  const communityOptions = useMemo(() => {
    if (!castes || !draftReligion) return [];
    const list = castes[draftReligion] || [];
    return [
      { value: "", label: "Select..." },
      ...list.map((c: string) => ({ value: c, label: c }))
    ];
  }, [castes, draftReligion]);

  useEffect(() => {
    if (communityOptions.length > 0) {
      const match = communityOptions.find(o => o.value === draftCommunity);
      if (!match) {
        setDraftCommunity("");
      }
    }
  }, [draftReligion, communityOptions]);

  // Step 3
  const [draftEdu, setDraftEdu] = useState(registrationDraft.education || "");
  const [draftOcc, setDraftOcc] = useState(registrationDraft.occupation || "");
  const [draftSal, setDraftSal] = useState(registrationDraft.salary || "");
  const [draftState, setDraftState] = useState(registrationDraft.state || "");
  const [draftCity, setDraftCity] = useState(registrationDraft.city || "");
  const [draftDiet, setDraftDiet] = useState(registrationDraft.diet || "");
  const [draftSmoking, setDraftSmoking] = useState(registrationDraft.smoking || "");
  const [draftDrinking, setDraftDrinking] = useState(registrationDraft.drinking || "");
  const [draftParentsNumber, setDraftParentsNumber] = useState(registrationDraft.parentsNumber || "");

  // Step 4
  const [draftFamType, setDraftFamType] = useState(registrationDraft.familyType || "");
  const [draftFamStatus, setDraftFamStatus] = useState(registrationDraft.familyStatus || "");
  const [draftFamValues, setDraftFamValues] = useState(registrationDraft.familyValues || "");
  const [draftFamDetails, setDraftFamDetails] = useState(registrationDraft.familyDetails || "");

  // Step 5 Partner
  const [draftPrefAgeMin, setDraftPrefAgeMin] = useState(registrationDraft.partnerPreferences?.ageMin || 21);
  const [draftPrefAgeMax, setDraftPrefAgeMax] = useState(registrationDraft.partnerPreferences?.ageMax || 35);
  const [draftPrefHeightMin, setDraftPrefHeightMin] = useState(registrationDraft.partnerPreferences?.heightMin || "");
  const [draftPrefHeightMax, setDraftPrefHeightMax] = useState(registrationDraft.partnerPreferences?.heightMax || "");

  // Step 6 Photos
  const [photoUrl, setPhotoUrl] = useState(registrationDraft.photos?.[0] || "");

  useEffect(() => {
    if (currentUser) {
      router.push("/dashboard");
    }
  }, [currentUser]);

  useEffect(() => {
    if (resendCooldown > 0) {
      const timer = setTimeout(() => setResendCooldown((prev) => prev - 1), 1000);
      return () => clearTimeout(timer);
    }
  }, [resendCooldown]);

  const handleSendOtp = async () => {
    if (!draftEmail.trim() || !draftEmail.includes("@")) {
      setErrors((prev) => ({ ...prev, email: "Enter a valid email before requesting OTP." }));
      return;
    }

    setOtpError("");
    setErrors((prev) => {
      const copy = { ...prev };
      delete copy.email;
      return copy;
    });

    try {
      const res = await sendOtpApi({ email: draftEmail }).unwrap();
      setOtpSent(true);
      setResendCooldown(60);
      showToast(res.message || "Verification code sent to your email!", "success");
    } catch (err: any) {
      const msg = err?.data?.message || err?.data?.Message || "Failed to send verification code. Please check your email configuration.";
      setErrors((prev) => ({ ...prev, email: msg }));
      showToast(msg, "error");
    }
  };

  const handleVerifyOtp = async () => {
    if (!otpCode.trim() || otpCode.length < 6) {
      setOtpError("Enter the 6-digit OTP code sent to your email.");
      return;
    }

    setOtpError("");
    try {
      await verifyOtpApi({ email: draftEmail, otp: otpCode }).unwrap();
      setIsEmailVerified(true);
      setOtpSent(false);
      setOtpCode("");
      setErrors((prev) => {
        const copy = { ...prev };
        delete copy.email;
        return copy;
      });
      showToast("Email verified successfully! ✓", "success");
    } catch (err: any) {
      const msg = err?.data?.message || err?.data?.Message || "Invalid or expired OTP. Please try again.";
      setOtpError(msg);
      showToast(msg, "error");
    }
  };

  // Save changes to Zustand draft store on input blur/change
  const saveStepData = () => {
    updateDraft({
      name: draftName,
      gender: draftGender as any,
      dob: draftDob,
      email: draftEmail,
      mobile: draftMobile,
      religion: draftReligion,
      community: draftCommunity,
      motherTongue: draftTongue,
      maritalStatus: draftMarital,
      education: draftEdu,
      occupation: draftOcc,
      salary: draftSal,
      state: draftState,
      city: draftCity,
      diet: draftDiet,
      smoking: draftSmoking as any,
      drinking: draftDrinking as any,
      parentsNumber: draftParentsNumber,
      familyType: draftFamType as any,
      familyStatus: draftFamStatus as any,
      familyValues: draftFamValues as any,
      familyDetails: draftFamDetails,
      photos: photoUrl ? [photoUrl] : [],
      partnerPreferences: {
        ageMin: Number(draftPrefAgeMin),
        ageMax: Number(draftPrefAgeMax),
        heightMin: draftPrefHeightMin,
        heightMax: draftPrefHeightMax,
        religions: [draftReligion],
        communities: [draftCommunity],
        education: [],
        occupations: [],
        diet: ["Vegetarian"],
        maritalStatus: [draftMarital]
      }
    });
  };

  const validateStep = () => {
    const stepErrors: Record<string, string> = {};
    if (registrationStep === 1) {
      if (!draftName.trim()) stepErrors.name = "Full name is required.";
      if (!draftEmail.trim() || !draftEmail.includes("@")) {
        stepErrors.email = "Enter a valid email.";
      } else if (!isEmailVerified) {
        stepErrors.email = "Please click the verify tick to validate your email with an OTP.";
      }
      if (!draftMobile.trim() || draftMobile.length < 10) stepErrors.mobile = "Enter a 10-digit mobile number.";
      if (!draftPassword || draftPassword.length < 6) stepErrors.password = "Password must be at least 6 characters.";
    }
    if (registrationStep === 2) {
      if (!draftCommunity.trim()) stepErrors.community = "Community/Caste is required.";
    }
    if (registrationStep === 3) {
      if (!draftCity.trim()) stepErrors.city = "City is required.";
    }
    if (registrationStep === 4) {
      if (draftParentsNumber.trim() && draftParentsNumber.length < 10) {
        stepErrors.parentsNumber = "Parents contact number must be a 10-digit number.";
      }
    }
    setErrors(stepErrors);
    return Object.keys(stepErrors).length === 0;
  };

  const handleNext = () => {
    if (validateStep()) {
      saveStepData();
      setRegistrationStep(registrationStep + 1);
    }
  };

  const handleBack = () => {
    saveStepData();
    setRegistrationStep(registrationStep - 1);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (validateStep()) {
      setIsLoading(true);
      setErrors({});
      saveStepData();

      try {
        let finalPhotoUrl = photoUrl;
        if (photoFile) {
          try {
            const formData = new FormData();
            formData.append("file", photoFile);
            const photoRes = await uploadRegistrationPhotoApi(formData).unwrap();
            if (photoRes?.url) {
              finalPhotoUrl = photoRes.url;
            }
          } catch (photoErr) {
            console.error("Photo upload failed:", photoErr);
          }
        }

        await registerApi({
          email: draftEmail,
          password: draftPassword,
          name: draftName,
          gender: draftGender === "male" ? "Male" : "Female",
          dateOfBirth: draftDob,
          religion: draftReligion,
          community: draftCommunity,
          motherTongue: draftTongue,
          maritalStatus: draftMarital,
          city: draftCity,
          state: draftState,
          phoneNumber: draftMobile,
          diet: draftDiet,
          smoking: draftSmoking,
          drinking: draftDrinking,
          parentsNumber: draftParentsNumber,
          education: draftEdu,
          occupation: draftOcc,
          salary: draftSal,
          familyType: draftFamType,
          familyStatus: draftFamStatus,
          familyValues: draftFamValues,
          familyDetails: draftFamDetails,
          partnerAgeMin: draftPrefAgeMin,
          partnerAgeMax: draftPrefAgeMax,
          photoUrl: finalPhotoUrl
        }).unwrap();

        completeRegistration();
        setIsRegisteredPendingApproval(true);
        showToast("Registration submitted for Superadmin approval!", "success");
      } catch (err: any) {
        setErrors({ submit: err?.data?.message || err?.data?.Message || "Registration failed. Please check your inputs." });
      } finally {
        setIsLoading(false);
      }
    }
  };

  const stepDetails = [
    { num: 1, title: "Basic Information" },
    { num: 2, title: "Religious Background" },
    { num: 3, title: "Career & Education" },
    { num: 4, title: "Family Alignment" },
    { num: 5, title: "Partner Preferences" },
    { num: 6, title: "Photo upload" }
  ];

  return (
    <>
      <Navbar />

      <main className="flex-1 min-h-[80vh] bg-[#F7F3EE] dark:bg-[#081626] py-16 px-4">
        {isRegisteredPendingApproval ? (
          <div className="max-w-xl mx-auto bg-card border border-brand-gold/40 rounded-2xl shadow-2xl p-8 md:p-10 text-center relative overflow-hidden">
            <div className="mx-auto w-16 h-16 rounded-full bg-emerald-500/10 border border-emerald-500/30 flex items-center justify-center text-emerald-400 mb-6">
              <CheckCircle2 className="w-8 h-8" />
            </div>
            
            <span className="inline-flex items-center gap-1.5 text-xs font-bold text-brand-gold bg-brand-gold/10 border border-brand-gold/30 px-3.5 py-1 rounded-full uppercase tracking-wider mb-4">
              <Shield className="h-3.5 w-3.5" /> Pending Superadmin Approval
            </span>
            
            <h1 className="font-serif text-2xl md:text-3xl font-bold text-foreground mb-3">
              Registration Submitted!
            </h1>
            
            <p className="text-sm text-muted-foreground font-support leading-relaxed mb-6">
              Thank you for joining Vikan Matrimony, <strong className="text-foreground">{draftName}</strong>. Your profile has been submitted to the Superadmin team for security verification and quality review.
            </p>
            
            <div className="p-4 bg-brand-gold/5 border border-brand-gold/20 rounded-xl text-left text-xs font-support space-y-2 mb-8">
              <div className="flex items-center gap-2 text-brand-gold font-bold">
                <span>📧 Approval Confirmation Email</span>
              </div>
              <p className="text-muted-foreground text-xs leading-relaxed">
                Once your account is reviewed and approved by the Superadmin team, an approval confirmation email will be sent to <strong className="text-foreground">{draftEmail}</strong>. You will then be able to log in and start connecting with verified matches.
              </p>
            </div>
            
            <div className="flex flex-col sm:flex-row gap-3 justify-center">
              <Button
                variant="gold"
                onClick={() => router.push("/login")}
                className="w-full sm:w-auto px-8 cursor-pointer"
              >
                Go to Login
              </Button>
              <Button
                variant="outline"
                onClick={() => router.push("/")}
                className="w-full sm:w-auto px-8 border-brand-gold/40 hover:bg-brand-gold/10 cursor-pointer"
              >
                Back to Home
              </Button>
            </div>
          </div>
        ) : (
          <div className="max-w-xl mx-auto bg-card border border-border/80 rounded-2xl shadow-xl p-8 overflow-hidden">
          
          {/* Progress Header */}
          <div className="mb-8">
            <div className="flex justify-between items-center text-xs font-support font-semibold text-muted-foreground uppercase tracking-wider mb-3">
              <span>Step {registrationStep} of 6</span>
              <span>{Math.round(((registrationStep - 1) / 5) * 100)}% Complete</span>
            </div>
            {/* Progress Bar */}
            <div className="h-1.5 w-full bg-muted/40 rounded-full overflow-hidden">
              <motion.div
                initial={{ width: 0 }}
                animate={{ width: `${((registrationStep) / 6) * 100}%` }}
                transition={{ duration: 0.4 }}
                className="h-full bg-brand-gold"
              />
            </div>
            <h1 className="font-serif text-2xl font-bold text-brand-navy dark:text-foreground mt-5">
              {stepDetails[registrationStep - 1].title}
            </h1>
          </div>

          {/* Error Banner */}
          {Object.keys(errors).length > 0 && (
            <div className="mb-6 p-3 rounded-lg bg-destructive/10 border border-destructive text-destructive text-xs font-support">
              Please fix the errors marked below to proceed.
            </div>
          )}

          {/* Form wizard wrapper */}
          <div className="min-h-[300px]">
            <AnimatePresence mode="wait">
              <motion.div
                key={registrationStep}
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
                transition={{ duration: 0.3 }}
              >
                {/* Step 1: Basic */}
                {registrationStep === 1 && (
                  <div className="space-y-4">
                    <Input
                      label="Full Name (As in Passport / ID)"
                      required
                      placeholder="E.g. Vasanth Kumar"
                      value={draftName}
                      onChange={(e) => setDraftName(e.target.value)}
                      error={errors.name}
                    />

                    <div className="flex flex-col gap-1.5">
                      <label className="text-xs font-support font-semibold tracking-wider text-muted-foreground uppercase">
                        Gender
                      </label>
                      <div className="grid grid-cols-2 gap-2">
                        {(["female", "male"] as const).map((g) => (
                          <button
                            key={g}
                            type="button"
                            onClick={() => setDraftGender(g)}
                            className={`py-2 rounded-lg text-xs font-bold border transition-all cursor-pointer ${
                              draftGender === g
                                ? "bg-primary text-primary-foreground border-brand-gold"
                                : "bg-card text-foreground border-[#3B6C9E] dark:border-[#3B6C9E] hover:border-brand-gold"
                            }`}
                          >
                            {g === "female" ? "Female (Bride)" : "Male (Groom)"}
                          </button>
                        ))}
                      </div>
                    </div>

                    <Input
                      label="Date of Birth"
                      type="date"
                      required
                      value={draftDob}
                      onChange={(e) => setDraftDob(e.target.value)}
                    />

                    <div className="space-y-2">
                      <div className="flex flex-col gap-1.5 text-left">
                        <div className="flex items-center justify-between">
                          <label className="text-xs font-support font-semibold tracking-wider text-muted-foreground uppercase">
                            Email Address <span className="text-destructive">*</span>
                          </label>
                          {isEmailVerified && (
                            <span className="inline-flex items-center gap-1 text-[11px] font-bold text-emerald-400 bg-emerald-500/10 border border-emerald-500/30 px-2.5 py-0.5 rounded-full">
                              <CheckCircle2 className="h-3 w-3" /> Verified
                            </span>
                          )}
                        </div>
                        <div className="relative flex items-center">
                          <input
                            type="email"
                            required
                            placeholder="name@example.com"
                            value={draftEmail}
                            disabled={isEmailVerified}
                            onChange={(e) => {
                              setDraftEmail(e.target.value);
                              if (isEmailVerified) setIsEmailVerified(false);
                              if (otpSent) setOtpSent(false);
                            }}
                            className={`w-full text-xs font-support bg-card border rounded-xl p-3 pr-24 text-foreground placeholder-muted-foreground focus:outline-none transition-all ${
                              errors.email
                                ? "border-destructive focus:border-destructive"
                                : isEmailVerified
                                ? "border-emerald-500/50 focus:border-emerald-500"
                                : "border-[#3B6C9E] dark:border-[#3B6C9E] hover:border-[#5284B9] focus:border-brand-gold"
                            }`}
                          />
                          {!isEmailVerified && (
                            <button
                              type="button"
                              onClick={handleSendOtp}
                              disabled={isSendingOtp || !draftEmail.trim() || resendCooldown > 0}
                              className="absolute right-2 px-3 py-1.5 rounded-lg bg-brand-gold text-brand-dark hover:bg-brand-gold/90 font-bold text-xs flex items-center gap-1 transition-all disabled:opacity-50 cursor-pointer"
                              title="Click tick to send OTP to email"
                            >
                              {isSendingOtp ? (
                                <div className="h-3.5 w-3.5 border-2 border-brand-dark border-t-transparent rounded-full animate-spin" />
                              ) : (
                                <>
                                  <Check className="h-3.5 w-3.5 stroke-[3]" />
                                  <span>{otpSent ? (resendCooldown > 0 ? `${resendCooldown}s` : "Resend") : "Verify"}</span>
                                </>
                              )}
                            </button>
                          )}
                        </div>
                        {errors.email && (
                          <span className="text-[11px] text-destructive font-support">{errors.email}</span>
                        )}
                      </div>

                      {/* OTP Input Card */}
                      {otpSent && !isEmailVerified && (
                        <div className="p-4 rounded-xl bg-brand-gold/5 border border-brand-gold/30 space-y-3">
                          <div className="flex items-center justify-between text-xs text-foreground font-support">
                            <span className="font-semibold text-brand-gold">Enter 6-Digit OTP</span>
                            <span className="text-muted-foreground text-[11px]">Sent to {draftEmail}</span>
                          </div>
                          <div className="flex gap-2">
                            <input
                              type="text"
                              maxLength={6}
                              placeholder="123456"
                              value={otpCode}
                              onChange={(e) => setOtpCode(e.target.value.replace(/\D/g, ""))}
                              className="flex-1 text-center tracking-[6px] font-mono text-sm font-bold bg-card border border-brand-gold/40 rounded-lg p-2 text-foreground focus:outline-none focus:border-brand-gold"
                            />
                            <button
                              type="button"
                              onClick={handleVerifyOtp}
                              disabled={isVerifyingOtp || otpCode.length < 6}
                              className="px-4 py-2 rounded-lg bg-brand-gold text-brand-dark font-bold text-xs flex items-center gap-1 hover:bg-brand-gold/90 transition-all disabled:opacity-50 cursor-pointer"
                            >
                              {isVerifyingOtp ? (
                                <div className="h-3.5 w-3.5 border-2 border-brand-dark border-t-transparent rounded-full animate-spin" />
                              ) : (
                                <>
                                  <Check className="h-4 w-4 stroke-[3]" />
                                  <span>Submit OTP</span>
                                </>
                              )}
                            </button>
                          </div>
                          {otpError && (
                            <span className="text-[11px] text-destructive font-support block">{otpError}</span>
                          )}
                        </div>
                      )}
                    </div>

                    <Input
                      label="Mobile Number"
                      type="tel"
                      required
                      placeholder="10 digit number"
                      value={draftMobile}
                      onChange={(e) => setDraftMobile(e.target.value.replace(/\D/g, ""))}
                      error={errors.mobile}
                    />

                    <Input
                      label="Create secure password"
                      type="password"
                      required
                      placeholder="••••••••"
                      value={draftPassword}
                      onChange={(e) => setDraftPassword(e.target.value)}
                      error={errors.password}
                    />
                  </div>
                )}

                {/* Step 2: Religious */}
                {registrationStep === 2 && (
                  <div className="space-y-4">
                    <Select
                      label="Religion"
                      value={draftReligion}
                      onChange={(e) => setDraftReligion(e.target.value)}
                      options={[
                        { value: "", label: "Select..." },
                        { value: "Hindu", label: "Hindu" },
                        { value: "Muslim", label: "Muslim" },
                        { value: "Christian", label: "Christian" },
                        { value: "Jain", label: "Jain" }
                      ]}
                    />

                    {communityOptions.length > 0 ? (
                      <Select
                        label="Community / Caste"
                        value={draftCommunity}
                        onChange={(e) => setDraftCommunity(e.target.value)}
                        options={communityOptions}
                        error={errors.community}
                      />
                    ) : (
                      <Input
                        label="Community / Caste"
                        required
                        placeholder="E.g. Brahmin / Rajput / Jat / Sunni"
                        value={draftCommunity}
                        onChange={(e) => setDraftCommunity(e.target.value)}
                        error={errors.community}
                      />
                    )}

                    <Select
                      label="Mother Tongue"
                      value={draftTongue}
                      onChange={(e) => setDraftTongue(e.target.value)}
                      options={[
                        { value: "", label: "Select..." },
                        { value: "Hindi", label: "Hindi" },
                        { value: "Punjabi", label: "Punjabi" },
                        { value: "Tamil", label: "Tamil" },
                        { value: "Telugu", label: "Telugu" },
                        { value: "Bengali", label: "Bengali" },
                        { value: "Marathi", label: "Marathi" },
                        { value: "Gujarati", label: "Gujarati" },
                        { value: "Malayalam", label: "Malayalam" },
                        { value: "Urdu", label: "Urdu" },
                        { value: "English", label: "English" }
                      ]}
                    />

                    <Select
                      label="Marital Status"
                      value={draftMarital}
                      onChange={(e) => setDraftMarital(e.target.value)}
                      options={[
                        { value: "", label: "Select..." },
                        { value: "Never Married", label: "Never Married" },
                        { value: "Divorced", label: "Divorced" },
                        { value: "Widowed", label: "Widowed" }
                      ]}
                    />
                  </div>
                )}

                {/* Step 3: Professional */}
                {registrationStep === 3 && (
                  <div className="space-y-4">
                    <Input
                      label="Highest Education Degree"
                      placeholder="E.g. B.Tech Computer Science (IIT Delhi)"
                      value={draftEdu}
                      onChange={(e) => setDraftEdu(e.target.value)}
                    />

                    <Input
                      label="Occupation / Designation"
                      placeholder="E.g. Senior Consultant (McKinsey)"
                      value={draftOcc}
                      onChange={(e) => setDraftOcc(e.target.value)}
                    />

                    <Select
                      label="Annual Income Level"
                      value={draftSal}
                      onChange={(e) => setDraftSal(e.target.value)}
                      options={[
                        { value: "", label: "Select..." },
                        { value: "7 LPA", label: "Under 10 LPA" },
                        { value: "12 LPA", label: "10 - 15 LPA" },
                        { value: "18 LPA", label: "15 - 25 LPA" },
                        { value: "35 LPA", label: "25 - 50 LPA" },
                        { value: "75 LPA", label: "50 LPA - 1 Crore" },
                        { value: "1.5 Crores+", label: "1 Crore+" }
                      ]}
                    />

                    <div className="grid grid-cols-2 gap-4">
                      <Input
                        label="Work State"
                        placeholder="E.g. Maharashtra"
                        value={draftState}
                        onChange={(e) => setDraftState(e.target.value)}
                      />
                      <Input
                        label="Work City"
                        placeholder="E.g. Mumbai"
                        value={draftCity}
                        onChange={(e) => setDraftCity(e.target.value)}
                        error={errors.city}
                      />
                    </div>

                    <Select
                      label="Diet / Food Habit"
                      value={draftDiet}
                      onChange={(e) => setDraftDiet(e.target.value)}
                      options={[
                        { value: "", label: "Select..." },
                        { value: "Vegetarian", label: "Vegetarian" },
                        { value: "Non-Vegetarian", label: "Non-Vegetarian" },
                        { value: "Eggetarian", label: "Eggetarian" },
                        { value: "Vegan", label: "Vegan" }
                      ]}
                    />

                    <div className="grid grid-cols-2 gap-4">
                      <Select
                        label="Smoking Habit"
                        value={draftSmoking}
                        onChange={(e) => setDraftSmoking(e.target.value as any)}
                        options={[
                          { value: "", label: "Select..." },
                          { value: "No", label: "No" },
                          { value: "Yes", label: "Yes" },
                          { value: "Occasionally", label: "Occasionally" }
                        ]}
                      />
                      <Select
                        label="Drinking Habit"
                        value={draftDrinking}
                        onChange={(e) => setDraftDrinking(e.target.value as any)}
                        options={[
                          { value: "", label: "Select..." },
                          { value: "No", label: "No" },
                          { value: "Yes", label: "Yes" },
                          { value: "Occasionally", label: "Occasionally" }
                        ]}
                      />
                    </div>
                  </div>
                )}

                {/* Step 4: Family */}
                {registrationStep === 4 && (
                  <div className="space-y-4">
                    <Select
                      label="Family Structure Type"
                      value={draftFamType}
                      onChange={(e) => setDraftFamType(e.target.value as any)}
                      options={[
                        { value: "", label: "Select..." },
                        { value: "Nuclear", label: "Nuclear Family" },
                        { value: "Joint", label: "Joint Family" }
                      ]}
                    />

                    <Select
                      label="Family Financial Status"
                      value={draftFamStatus}
                      onChange={(e) => setDraftFamStatus(e.target.value as any)}
                      options={[
                        { value: "", label: "Select..." },
                        { value: "Middle Class", label: "Middle Class" },
                        { value: "Upper Middle Class", label: "Upper Middle Class" },
                        { value: "Rich/Affluent", label: "Rich & Affluent" },
                        { value: "Elite", label: "Elite Luxury Status" }
                      ]}
                    />

                    <Select
                      label="Family Values"
                      value={draftFamValues}
                      onChange={(e) => setDraftFamValues(e.target.value as any)}
                      options={[
                        { value: "", label: "Select..." },
                        { value: "Moderate", label: "Moderate (Mix of Modern/Traditional)" },
                        { value: "Traditional", label: "Traditional" },
                        { value: "Liberal", label: "Liberal / Modern" }
                      ]}
                    />

                    <Input
                      label="Parents Contact Number"
                      type="tel"
                      placeholder="Enter 10-digit number"
                      value={draftParentsNumber}
                      onChange={(e) => setDraftParentsNumber(e.target.value.replace(/\D/g, "").slice(0, 10))}
                      error={errors.parentsNumber}
                    />

                    <Textarea
                      label="Tell us about your family background (Optional)"
                      placeholder="Explain your parents' profession, sibling counts, or lineage details..."
                      value={draftFamDetails}
                      onChange={(e) => setDraftFamDetails(e.target.value)}
                    />

                    <div className="text-right">
                      <button
                        type="button"
                        onClick={() => {
                          setDraftFamDetails("Belonging to an elite traditional background. Father is a retired corporate professional, mother is a homemaker. We value family integrity and respect.");
                          handleNext();
                        }}
                        className="text-xs text-brand-gold font-semibold hover:underline font-support"
                      >
                        Skip & Pre-populate
                      </button>
                    </div>
                  </div>
                )}

                {/* Step 5: Partner Preferences */}
                {registrationStep === 5 && (
                  <div className="space-y-4">
                    <div className="grid grid-cols-2 gap-4">
                      <Input
                        label="Min Partner Age"
                        type="number"
                        value={draftPrefAgeMin}
                        onChange={(e) => setDraftPrefAgeMin(Number(e.target.value))}
                      />
                      <Input
                        label="Max Partner Age"
                        type="number"
                        value={draftPrefAgeMax}
                        onChange={(e) => setDraftPrefAgeMax(Number(e.target.value))}
                      />
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                      <Input
                        label="Min Partner Height"
                        value={draftPrefHeightMin}
                        onChange={(e) => setDraftPrefHeightMin(e.target.value)}
                      />
                      <Input
                        label="Max Partner Height"
                        value={draftPrefHeightMax}
                        onChange={(e) => setDraftPrefHeightMax(e.target.value)}
                      />
                    </div>

                    <div className="p-3 bg-brand-gold/5 border border-brand-gold/20 rounded-lg text-xs font-support text-brand-gold">
                      ★ We will automatically match profiles that match these preferences. You can update this anytime.
                    </div>
                  </div>
                )}

                {/* Step 6: Photos */}
                {registrationStep === 6 && (
                  <div className="space-y-6 text-center">
                    <div className="flex flex-col items-center justify-center p-6 border-2 border-dashed border-[#3B6C9E] dark:border-[#3B6C9E] rounded-xl bg-muted/10">
                      {photoUrl ? (
                        <div className="relative h-44 w-44 rounded-xl overflow-hidden bg-muted mb-4 border border-brand-gold">
                          <img src={photoUrl} alt="Uploaded" className="h-full w-full object-cover" />
                        </div>
                      ) : (
                        <Image className="h-16 w-16 text-muted-foreground mb-4" />
                      )}
                      
                      <Input
                        label="Profile Portrait Photo URL (Stock / Web link)"
                        placeholder="Paste image link here"
                        value={photoUrl}
                        onChange={(e) => setPhotoUrl(e.target.value)}
                      />
                      
                      <div className="w-full flex items-center justify-center gap-2 mt-4 pt-4 border-t border-[#3B6C9E]/30">
                        <label className="text-xs font-semibold text-[#E5DCD0]/80 shrink-0">Or Upload File:</label>
                        <input
                          type="file"
                          accept="image/*"
                          onChange={handleFileChange}
                          className="block w-full text-xs text-slate-500
                            file:mr-4 file:py-1.5 file:px-3
                            file:rounded-full file:border-0
                            file:text-xs file:font-semibold
                            file:bg-brand-gold/10 file:text-brand-gold
                            hover:file:bg-brand-gold/20
                            cursor-pointer file:cursor-pointer"
                        />
                      </div>
                      
                      <span className="text-[10px] text-muted-foreground font-support mt-2 leading-tight">
                        Provide a clean portrait link. For testing, you can paste any image URL, or leave blank to auto-generate a luxury portrait.
                      </span>
                    </div>

                    <div className="flex items-center gap-2 text-xs text-muted-foreground font-support text-left p-3.5 bg-brand-gold/5 border border-brand-gold/20 rounded-lg">
                      <Shield className="h-5 w-5 text-brand-gold flex-shrink-0" />
                      <span>
                        **Privacy Seal**: Photo visibility can be locked to "Premium Only" or "Interests Accepted Only" inside security settings.
                      </span>
                    </div>
                  </div>
                )}
              </motion.div>
            </AnimatePresence>
          </div>

          {errors.submit && (
            <div className="bg-destructive/10 border border-destructive/20 text-destructive text-sm rounded-lg p-3.5 mt-4 text-center font-support">
              ⚠️ {errors.submit}
            </div>
          )}

          {/* Action Buttons */}
          <div className="flex items-center justify-between border-t border-border mt-8 pt-6">
            {registrationStep > 1 ? (
              <Button type="button" variant="outline" onClick={handleBack} className="flex items-center gap-2">
                <ArrowLeft className="h-4 w-4" /> Back
              </Button>
            ) : (
              <div />
            )}

            {registrationStep < 6 ? (
              <Button type="button" variant="primary" onClick={handleNext} className="flex items-center gap-2">
                Continue <ArrowRight className="h-4 w-4" />
              </Button>
            ) : (
              <Button
                type="button"
                variant="gold"
                onClick={handleSubmit}
                className="flex items-center gap-2 uppercase font-bold tracking-wider"
                isLoading={isLoading}
              >
                Complete Registration <Check className="h-4 w-4" />
              </Button>
            )}
          </div>
        </div>
      )}
    </main>

    <Footer />
  </>
);
}
