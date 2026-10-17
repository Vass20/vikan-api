"use client";

import React, { useState, useEffect, useMemo } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { motion, AnimatePresence } from "framer-motion";
import { useAppStore } from "@/lib/store";
import { Button } from "@/components/ui/button";
import { Input, Select, Textarea } from "@/components/ui/input";
import { Navbar } from "@/components/layout/Navbar";
import { Footer } from "@/components/layout/Footer";
import { Check, ArrowLeft, ArrowRight, UserPlus, Image, Shield, CheckCircle2, ShieldCheck, FileText } from "lucide-react";
import { useDispatch } from "react-redux";
import { setCredentials } from "@/lib/redux/slices/authSlice";
import { useRegisterMutation, useLoginMutation, useUploadPhotoMutation, useGetCastesQuery, useUploadPhotoFileMutation, useUploadRegistrationPhotoMutation, useSendOtpMutation, useVerifyOtpMutation } from "@/lib/redux/api";
import { RELIGION_OPTIONS, DEFAULT_COMMUNITIES, MAIN_COMMUNITY_OPTIONS, MAIN_COMMUNITIES, GENERATION_CONFIGS, getBirthYear, getGenerationByYear, CHRISTIAN_DENOMINATION_OPTIONS, BLOOD_GROUP_OPTIONS, HOROSCOPE_MATCH_OPTIONS } from "@/lib/community-data";

async function compressImage(file: File, maxDim = 1600, quality = 0.82): Promise<File> {
  if (!file.type.startsWith("image/")) {
    return file;
  }
  return new Promise((resolve) => {
    const reader = new FileReader();
    reader.onload = (e) => {
      const img = new (window as any).Image();
      img.onload = () => {
        let width = img.width;
        let height = img.height;
        if (width > maxDim || height > maxDim) {
          if (width > height) {
            height = Math.round((height * maxDim) / width);
            width = maxDim;
          } else {
            width = Math.round((width * maxDim) / height);
            height = maxDim;
          }
        }
        const canvas = document.createElement("canvas");
        canvas.width = width;
        canvas.height = height;
        const ctx = canvas.getContext("2d");
        if (!ctx) {
          resolve(file);
          return;
        }
        ctx.drawImage(img, 0, 0, width, height);
        canvas.toBlob(
          (blob) => {
            if (!blob) {
              resolve(file);
              return;
            }
            const cleanName = file.name.replace(/\.[^/.]+$/, "") + ".jpg";
            const compressedFile = new File([blob], cleanName, {
              type: "image/jpeg",
              lastModified: Date.now(),
            });
            resolve(compressedFile);
          },
          "image/jpeg",
          quality
        );
      };
      img.onerror = () => resolve(file);
      img.src = e.target?.result as string;
    };
    reader.onerror = () => resolve(file);
    reader.readAsDataURL(file);
  });
}

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
  const [draftIdProofType, setDraftIdProofType] = useState<string>("Aadhaar Card");
  const [idProofFile, setIdProofFile] = useState<File | null>(null);
  const [idProofUrl, setIdProofUrl] = useState<string>("");
  const [idProofPreview, setIdProofPreview] = useState<string>("");

  const MAX_FILE_SIZE_BYTES = 5 * 1024 * 1024; // 5 MB max upload size

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    if (file.size > MAX_FILE_SIZE_BYTES) {
      showToast(`Photo size (${(file.size / (1024 * 1024)).toFixed(1)} MB) exceeds 5 MB limit. Please select a smaller photo.`, "error");
      return;
    }
    setPhotoFile(file);
    setPhotoUrl(URL.createObjectURL(file));
  };

  const handleIdProofFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    if (file.size > MAX_FILE_SIZE_BYTES) {
      const err = `ID Proof file size (${(file.size / (1024 * 1024)).toFixed(1)} MB) exceeds the 5 MB limit. Please upload a file under 5 MB.`;
      setErrors((prev) => ({ ...prev, idProof: err }));
      showToast(err, "error");
      return;
    }
    setErrors((prev) => {
      const copy = { ...prev };
      delete copy.idProof;
      return copy;
    });
    setIdProofFile(file);
    if (file.type.startsWith("image/")) {
      setIdProofPreview(URL.createObjectURL(file));
    } else {
      setIdProofPreview("");
    }
  };

  // Auto-saved draft helper
  const [draftName, setDraftName] = useState(registrationDraft.name || "");
  const [draftGender, setDraftGender] = useState<"female" | "male">(registrationDraft.gender === "male" ? "male" : "female");
  const [draftDob, setDraftDob] = useState(registrationDraft.dob || "");
  const initialBirthYear = getBirthYear(registrationDraft.dob || "");
  const initialGen = initialBirthYear ? (getGenerationByYear(initialBirthYear) || "") : ((registrationDraft as any).generation || "");
  const [draftGeneration, setDraftGeneration] = useState(initialGen || "");

  const generationOptions = useMemo(() => {
    const birthYear = getBirthYear(draftDob);
    if (birthYear) {
      const gen = getGenerationByYear(birthYear);
      if (gen) {
        const conf = GENERATION_CONFIGS.find((c) => c.key === gen);
        return [
          { value: gen, label: conf ? conf.label : gen }
        ];
      }
    }
    return [
      { value: "", label: "Select Generation..." },
      ...GENERATION_CONFIGS.map((g) => ({ value: g.key, label: g.label }))
    ];
  }, [draftDob]);

  useEffect(() => {
    const birthYear = getBirthYear(draftDob);
    if (birthYear) {
      const gen = getGenerationByYear(birthYear);
      if (gen && draftGeneration !== gen) {
        setDraftGeneration(gen);
      }
    }
  }, [draftDob]);
  const [draftEmail, setDraftEmail] = useState(registrationDraft.email || "");
  const [draftPassword, setDraftPassword] = useState("");
  const [draftMobile, setDraftMobile] = useState(registrationDraft.mobile || "");

  const passwordStrength = useMemo(() => {
    if (!draftPassword) return { score: 0, label: "", color: "", bg: "" };
    let score = 0;
    if (draftPassword.length >= 6) score += 1;
    if (draftPassword.length >= 8) score += 1;
    if (/[A-Z]/.test(draftPassword) && /[a-z]/.test(draftPassword)) score += 1;
    if (/\d/.test(draftPassword)) score += 1;
    if (/[^A-Za-z0-9]/.test(draftPassword)) score += 1;

    if (score <= 2) {
      return { score: 1, label: "Weak", color: "text-rose-400", bg: "bg-rose-500" };
    } else if (score <= 3) {
      return { score: 2, label: "Fair", color: "text-amber-400", bg: "bg-amber-500" };
    } else if (score <= 4) {
      return { score: 3, label: "Good", color: "text-sky-400", bg: "bg-sky-500" };
    } else {
      return { score: 4, label: "Strong", color: "text-emerald-400", bg: "bg-emerald-500" };
    }
  }, [draftPassword]);

  // Step 2
  const initialComm = registrationDraft.community || "";
  const initialParts = initialComm.split(" - ");
  const [draftReligion, setDraftReligion] = useState(registrationDraft.religion || "");
  const [draftCommunity, setDraftCommunity] = useState(() => {
    if (!initialComm) return "";
    if (initialComm.startsWith("Caste No Bar")) return "Caste No Bar";
    return initialParts[0] || "";
  });
  const [draftCaste, setDraftCaste] = useState(() => {
    if (registrationDraft.caste) return registrationDraft.caste;
    if (registrationDraft.subCommunity) return registrationDraft.subCommunity;
    if (initialComm.startsWith("Caste No Bar (") && initialComm.endsWith(")")) {
      return initialComm.slice("Caste No Bar (".length, -1);
    }
    if (initialParts.length > 1) return initialParts.slice(1).join(" - ");
    return "";
  });
  const [customCommunity, setCustomCommunity] = useState("");
  const [draftChurchDenomination, setDraftChurchDenomination] = useState(
    (registrationDraft as any).churchDenomination || ""
  );
  const [customChurchDenomination, setCustomChurchDenomination] = useState("");
  const [draftTongue, setDraftTongue] = useState(registrationDraft.motherTongue || "");
  const [draftMarital, setDraftMarital] = useState(registrationDraft.maritalStatus || "");
  const [draftBloodGroup, setDraftBloodGroup] = useState((registrationDraft as any).bloodGroup || "");
  const [draftAstroStarDetails, setDraftAstroStarDetails] = useState((registrationDraft as any).astroStarDetails || "");
  const [draftHoroscopeMatch, setDraftHoroscopeMatch] = useState((registrationDraft as any).horoscopeMatch || "Not Required");

  const communityOptions = useMemo(() => {
    if (!draftReligion) return [];
    return [
      { value: "", label: "Select Community..." },
      ...MAIN_COMMUNITY_OPTIONS
    ];
  }, [draftReligion]);

  const casteSuggestions = useMemo(() => {
    if (!draftReligion || draftReligion.toLowerCase() === "christian") return [];
    const apiList: string[] = castes?.[draftReligion] || [];
    const defaultList: string[] = DEFAULT_COMMUNITIES[draftReligion] || [];

    const set = new Set<string>();
    [...defaultList, ...apiList].forEach((c) => {
      const trimmed = c.trim();
      if (trimmed && !/^(others?|caste no bar)$/i.test(trimmed)) {
        set.add(trimmed);
      }
    });

    return Array.from(set).sort((a, b) => a.localeCompare(b));
  }, [castes, draftReligion]);

  const isCasteNoBar = (comm: string) => /caste\s*no\s*bar/i.test(comm.trim());
  const isOtherCommunity = (comm: string) => /^(other\s*community|others?)$/i.test(comm.trim());

  const getEffectiveChurchDenomination = () => {
    if (draftReligion !== "Christian") return "";
    if (draftChurchDenomination === "Other") {
      return customChurchDenomination.trim() || "Other";
    }
    return draftChurchDenomination.trim();
  };

  const getEffectiveCommunity = () => {
    let comm = draftCommunity.trim();
    if (isOtherCommunity(comm)) {
      comm = customCommunity.trim() || "Other Community";
    }
    return comm;
  };

  useEffect(() => {
    if (draftReligion && communityOptions.length > 0 && draftCommunity) {
      const match = communityOptions.find(
        (o) =>
          o.value.toLowerCase() === draftCommunity.toLowerCase() ||
          o.label.toLowerCase() === draftCommunity.toLowerCase() ||
          o.value.toLowerCase().includes(`(${draftCommunity.toLowerCase()})`) ||
          o.label.toLowerCase().includes(`(${draftCommunity.toLowerCase()})`)
      );
      if (match && match.value !== draftCommunity && !isOtherCommunity(draftCommunity)) {
        setDraftCommunity(match.value);
      } else if (!match && !isOtherCommunity(draftCommunity)) {
        setCustomCommunity(draftCommunity);
        setDraftCommunity("Other Community");
      }
    }
  }, [draftReligion, communityOptions, draftCommunity]);

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
    const finalCommunity = getEffectiveCommunity();
    updateDraft({
      name: draftName,
      gender: draftGender as any,
      dob: draftDob,
      generation: draftGeneration,
      email: draftEmail,
      mobile: draftMobile,
      religion: draftReligion,
      churchDenomination: getEffectiveChurchDenomination(),
      community: finalCommunity,
      subCommunity: draftCaste.trim(),
      caste: draftCaste.trim(),
      motherTongue: draftTongue,
      maritalStatus: draftMarital,
      bloodGroup: draftBloodGroup,
      astroStarDetails: draftAstroStarDetails,
      horoscopeMatch: draftHoroscopeMatch,
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
        communities: [finalCommunity],
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
      if (!draftDob.trim()) stepErrors.dob = "Date of birth is required.";
      if (!draftGeneration.trim()) stepErrors.generation = "Generation is required.";
      if (!draftEmail.trim() || !draftEmail.includes("@")) {
        stepErrors.email = "Enter a valid email.";
      } else if (!isEmailVerified) {
        stepErrors.email = "Please click the verify tick to validate your email with an OTP.";
      }
      if (!draftMobile.trim() || draftMobile.length !== 10) stepErrors.mobile = "Enter a 10-digit mobile number.";
      if (!draftPassword || draftPassword.length < 6) stepErrors.password = "Password must be at least 6 characters.";
    }
    if (registrationStep === 2) {
      if (!draftReligion.trim()) {
        stepErrors.religion = "Please select your religion.";
      }
      if (draftReligion === "Christian") {
        if (!draftChurchDenomination.trim()) {
          stepErrors.churchDenomination = "Please select your church / denomination.";
        } else if (draftChurchDenomination === "Other" && !customChurchDenomination.trim()) {
          stepErrors.customChurchDenomination = "Please enter your church / denomination.";
        }
      }
      if (!draftCommunity.trim()) {
        stepErrors.community = "Please select your community.";
      } else if (isOtherCommunity(draftCommunity) && !customCommunity.trim()) {
        stepErrors.customCommunity = "Please enter your community name.";
      }
    }
    if (registrationStep === 3) {
      if (!draftCity.trim()) stepErrors.city = "City is required.";
    }
    if (registrationStep === 4) {
      if (draftParentsNumber.trim() && draftParentsNumber.length !== 10) {
        stepErrors.parentsNumber = "Parents contact number must be a 10-digit number.";
      }
    }
    if (registrationStep === 6) {
      if (!idProofFile && !idProofUrl.trim()) {
        stepErrors.idProof = "Please upload a Government ID proof document for account verification.";
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
            const compressedPhoto = await compressImage(photoFile);
            const formData = new FormData();
            formData.append("file", compressedPhoto);
            const photoRes = await uploadRegistrationPhotoApi(formData).unwrap();
            const uploadedPhotoUrl = (photoRes as any)?.url || (photoRes as any)?.Url || (photoRes as any)?.fileUrl || "";
            if (uploadedPhotoUrl) {
              finalPhotoUrl = uploadedPhotoUrl;
            }
          } catch (photoErr) {
            console.error("Photo upload failed:", photoErr);
          }
        }

        let finalIdProofUrl = idProofUrl;
        if (idProofFile) {
          try {
            const compressedId = idProofFile.type.startsWith("image/") ? await compressImage(idProofFile) : idProofFile;
            const idFormData = new FormData();
            idFormData.append("file", compressedId);
            const idRes = await uploadRegistrationPhotoApi(idFormData).unwrap();
            const uploadedIdUrl = (idRes as any)?.url || (idRes as any)?.Url || (idRes as any)?.fileUrl || "";
            if (uploadedIdUrl) {
              finalIdProofUrl = uploadedIdUrl;
            } else {
              throw new Error("Server returned an empty document URL.");
            }
          } catch (idErr: any) {
            console.error("ID proof upload failed:", idErr);
            const errorMsg = idErr?.data?.message || idErr?.data?.Message || idErr?.message || "Failed to upload ID proof document. Please check the file and try again.";
            setIsLoading(false);
            setErrors((prev) => ({ ...prev, idProof: errorMsg }));
            showToast(errorMsg, "error");
            return;
          }
        }

        if (!finalIdProofUrl) {
          setIsLoading(false);
          setErrors((prev) => ({ ...prev, idProof: "A Government ID proof document is mandatory for account verification." }));
          showToast("Please attach a valid Government ID document before submitting.", "error");
          return;
        }

        const finalCommunity = getEffectiveCommunity();
        await registerApi({
          email: draftEmail,
          password: draftPassword,
          name: draftName,
          gender: draftGender === "male" ? "Male" : "Female",
          dateOfBirth: draftDob,
          generation: draftGeneration,
          religion: draftReligion,
          churchDenomination: getEffectiveChurchDenomination(),
          community: finalCommunity,
          caste: draftCaste.trim(),
          motherTongue: draftTongue,
          maritalStatus: draftMarital,
          bloodGroup: draftBloodGroup,
          astroStarDetails: draftAstroStarDetails,
          horoscopeMatch: draftHoroscopeMatch,
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
          partnerHeightMin: draftPrefHeightMin || "5' 0\"",
          partnerHeightMax: draftPrefHeightMax || "6' 0\"",
          photoUrl: finalPhotoUrl,
          idProofType: draftIdProofType,
          idProofUrl: finalIdProofUrl
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
    { num: 2, title: "Religious & Astrological Background" },
    { num: 3, title: "Career & Education" },
    { num: 4, title: "Family Alignment" },
    { num: 5, title: "Partner Preferences" },
    { num: 6, title: "Photo & ID Verification" }
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
              Thank you for joining Vikan Matrimony, <strong className="text-foreground">{draftName}</strong>. Your profile details and Government ID proof have been submitted to the Superadmin moderation team for verification and approval.
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

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      <Input
                        label="Date of Birth"
                        type="date"
                        required
                        value={draftDob}
                        onChange={(e) => {
                          const val = e.target.value;
                          setDraftDob(val);
                          const year = getBirthYear(val);
                          if (year) {
                            const gen = getGenerationByYear(year);
                            if (gen) setDraftGeneration(gen);
                          }
                          if (errors.dob || errors.generation) {
                            setErrors((prev) => {
                              const copy = { ...prev };
                              delete copy.dob;
                              delete copy.generation;
                              return copy;
                            });
                          }
                        }}
                        error={errors.dob}
                      />

                      <div>
                        <Select
                          label="Generation"
                          value={draftGeneration}
                          onChange={(e) => {
                            setDraftGeneration(e.target.value);
                            if (errors.generation) {
                              setErrors((prev) => {
                                const copy = { ...prev };
                                delete copy.generation;
                                return copy;
                              });
                            }
                          }}
                          options={generationOptions}
                          error={errors.generation}
                        />
                        {getBirthYear(draftDob) && draftGeneration && (
                          <span className="text-[11px] text-brand-gold font-support mt-1 block">
                            ✨ Auto-matched: {draftGeneration} (Born {getBirthYear(draftDob)})
                          </span>
                        )}
                      </div>
                    </div>

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
                      inputMode="numeric"
                      pattern="[0-9]*"
                      maxLength={10}
                      required
                      placeholder="10 digit number"
                      value={draftMobile}
                      onChange={(e) => {
                        const val = e.target.value.replace(/\D/g, "").slice(0, 10);
                        setDraftMobile(val);
                        if (errors.mobile) {
                          setErrors((prev) => {
                            const copy = { ...prev };
                            delete copy.mobile;
                            return copy;
                          });
                        }
                      }}
                      error={errors.mobile}
                    />

                    <div>
                      <Input
                        label="Create secure password"
                        type="password"
                        required
                        placeholder="••••••••"
                        value={draftPassword}
                        onChange={(e) => {
                          setDraftPassword(e.target.value);
                          if (errors.password) {
                            setErrors((prev) => {
                              const copy = { ...prev };
                              delete copy.password;
                              return copy;
                            });
                          }
                        }}
                        error={errors.password}
                      />

                      {draftPassword && (
                        <div className="mt-2.5 p-3 rounded-xl bg-[#081626]/60 border border-brand-gold/20 space-y-2 animate-fadeIn">
                          {/* Segmented Strength Bar & Status */}
                          <div className="flex items-center justify-between text-xs">
                            <span className="text-muted-foreground font-medium text-[11px]">Password Strength:</span>
                            <span className={`font-bold tracking-wide text-xs ${passwordStrength.color}`}>
                              {passwordStrength.label}
                            </span>
                          </div>

                          <div className="grid grid-cols-4 gap-1.5 h-1.5 w-full">
                            <div className={`h-full rounded-full transition-all duration-300 ${passwordStrength.score >= 1 ? passwordStrength.bg : "bg-white/10"}`} />
                            <div className={`h-full rounded-full transition-all duration-300 ${passwordStrength.score >= 2 ? passwordStrength.bg : "bg-white/10"}`} />
                            <div className={`h-full rounded-full transition-all duration-300 ${passwordStrength.score >= 3 ? passwordStrength.bg : "bg-white/10"}`} />
                            <div className={`h-full rounded-full transition-all duration-300 ${passwordStrength.score >= 4 ? passwordStrength.bg : "bg-white/10"}`} />
                          </div>

                          {/* Requirement Chips */}
                          <div className="grid grid-cols-2 gap-1.5 pt-1 text-[11px]">
                            <span className={`flex items-center gap-1.5 ${draftPassword.length >= 8 ? "text-emerald-400 font-medium" : "text-muted-foreground/60"}`}>
                              <span className={`w-3.5 h-3.5 rounded-full flex items-center justify-center text-[9px] font-bold ${draftPassword.length >= 8 ? "bg-emerald-500/20 text-emerald-400" : "bg-white/5 text-muted-foreground/50"}`}>
                                {draftPassword.length >= 8 ? "✓" : "○"}
                              </span>
                              At least 8 characters
                            </span>
                            <span className={`flex items-center gap-1.5 ${/[A-Z]/.test(draftPassword) && /[a-z]/.test(draftPassword) ? "text-emerald-400 font-medium" : "text-muted-foreground/60"}`}>
                              <span className={`w-3.5 h-3.5 rounded-full flex items-center justify-center text-[9px] font-bold ${/[A-Z]/.test(draftPassword) && /[a-z]/.test(draftPassword) ? "bg-emerald-500/20 text-emerald-400" : "bg-white/5 text-muted-foreground/50"}`}>
                                {/[A-Z]/.test(draftPassword) && /[a-z]/.test(draftPassword) ? "✓" : "○"}
                              </span>
                              Uppercase & lowercase
                            </span>
                            <span className={`flex items-center gap-1.5 ${/\d/.test(draftPassword) ? "text-emerald-400 font-medium" : "text-muted-foreground/60"}`}>
                              <span className={`w-3.5 h-3.5 rounded-full flex items-center justify-center text-[9px] font-bold ${/\d/.test(draftPassword) ? "bg-emerald-500/20 text-emerald-400" : "bg-white/5 text-muted-foreground/50"}`}>
                                {/\d/.test(draftPassword) ? "✓" : "○"}
                              </span>
                              At least 1 number
                            </span>
                            <span className={`flex items-center gap-1.5 ${/[^A-Za-z0-9]/.test(draftPassword) ? "text-emerald-400 font-medium" : "text-muted-foreground/60"}`}>
                              <span className={`w-3.5 h-3.5 rounded-full flex items-center justify-center text-[9px] font-bold ${/[^A-Za-z0-9]/.test(draftPassword) ? "bg-emerald-500/20 text-emerald-400" : "bg-white/5 text-muted-foreground/50"}`}>
                                {/[^A-Za-z0-9]/.test(draftPassword) ? "✓" : "○"}
                              </span>
                              At least 1 symbol (@$!%)
                            </span>
                          </div>
                        </div>
                      )}
                    </div>
                  </div>
                )}

                {/* Step 2: Religious */}
                {registrationStep === 2 && (
                  <div className="space-y-4">
                    <Select
                      label="Religion"
                      value={draftReligion}
                      onChange={(e) => {
                        const val = e.target.value;
                        setDraftReligion(val);
                        if (val !== "Christian") {
                          setDraftChurchDenomination("");
                          setCustomChurchDenomination("");
                        }
                        setDraftCommunity("");
                        setCustomCommunity("");
                        setDraftCaste("");
                        if (errors.religion || errors.churchDenomination || errors.customChurchDenomination || errors.community || errors.customCommunity || errors.caste) {
                          setErrors((prev) => {
                            const copy = { ...prev };
                            delete copy.religion;
                            delete copy.churchDenomination;
                            delete copy.customChurchDenomination;
                            delete copy.community;
                            delete copy.customCommunity;
                            delete copy.caste;
                            return copy;
                          });
                        }
                      }}
                      options={RELIGION_OPTIONS}
                      error={errors.religion}
                    />

                    {draftReligion === "Christian" && (
                      <motion.div
                        initial={{ opacity: 0, y: -6 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.2 }}
                        className="space-y-4"
                      >
                        <Select
                          label="Church / Denomination"
                          value={draftChurchDenomination}
                          onChange={(e) => {
                            const val = e.target.value;
                            setDraftChurchDenomination(val);
                            if (val !== "Other") {
                              setCustomChurchDenomination("");
                            }
                            if (errors.churchDenomination || errors.customChurchDenomination) {
                              setErrors((prev) => {
                                const copy = { ...prev };
                                delete copy.churchDenomination;
                                delete copy.customChurchDenomination;
                                return copy;
                              });
                            }
                          }}
                          options={CHRISTIAN_DENOMINATION_OPTIONS}
                          error={errors.churchDenomination}
                        />

                        {draftChurchDenomination === "Other" && (
                          <motion.div
                            initial={{ opacity: 0, y: -6 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ duration: 0.2 }}
                          >
                            <Input
                              label="Specify Church / Denomination"
                              required
                              placeholder="Enter your church / denomination name"
                              value={customChurchDenomination}
                              onChange={(e) => {
                                setCustomChurchDenomination(e.target.value);
                                if (errors.customChurchDenomination) {
                                  setErrors((prev) => {
                                    const copy = { ...prev };
                                    delete copy.customChurchDenomination;
                                    return copy;
                                  });
                                }
                              }}
                              error={errors.customChurchDenomination}
                            />
                          </motion.div>
                        )}
                      </motion.div>
                    )}

                    {draftReligion && (
                      <motion.div
                        initial={{ opacity: 0, y: -6 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.2 }}
                        className="space-y-4"
                      >
                        <Select
                          label="Community"
                          value={draftCommunity}
                          onChange={(e) => {
                            const val = e.target.value;
                            setDraftCommunity(val);
                            if (!isOtherCommunity(val)) {
                              setCustomCommunity("");
                            }
                            if (isCasteNoBar(val)) {
                              setDraftCaste("");
                            }
                            if (errors.community || errors.customCommunity || errors.caste) {
                              setErrors((prev) => {
                                const copy = { ...prev };
                                delete copy.community;
                                delete copy.customCommunity;
                                delete copy.caste;
                                return copy;
                              });
                            }
                          }}
                          options={communityOptions}
                          error={errors.community}
                        />

                        {isOtherCommunity(draftCommunity) && (
                          <motion.div
                            initial={{ opacity: 0, y: -6 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ duration: 0.2 }}
                          >
                            <Input
                              label="Specify Community"
                              required
                              placeholder="Enter your community"
                              value={customCommunity}
                              onChange={(e) => {
                                setCustomCommunity(e.target.value);
                                if (errors.customCommunity) {
                                  setErrors((prev) => {
                                    const copy = { ...prev };
                                    delete copy.customCommunity;
                                    return copy;
                                  });
                                }
                              }}
                              error={errors.customCommunity}
                            />
                          </motion.div>
                        )}

                        {draftCommunity && !isCasteNoBar(draftCommunity) && draftCommunity !== "Prefer Not to Say" && (
                          <motion.div
                            initial={{ opacity: 0, y: -6 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ duration: 0.2 }}
                          >
                            <Input
                              label="Caste"
                              list={draftReligion === "Christian" ? undefined : "caste-suggestions"}
                              placeholder={draftReligion === "Christian" ? "Enter caste (optional)" : "Enter your caste (e.g. Kallar, Vanniyar, Brahmin, Nadar, Mudaliyar, etc.)"}
                              value={draftCaste}
                              onChange={(e) => {
                                setDraftCaste(e.target.value);
                                if (errors.caste) {
                                  setErrors((prev) => {
                                    const copy = { ...prev };
                                    delete copy.caste;
                                    return copy;
                                  });
                                }
                              }}
                              error={errors.caste}
                            />
                            {draftReligion !== "Christian" && (
                              <datalist id="caste-suggestions">
                                {(casteSuggestions || []).map((c) => (
                                  <option key={c} value={c} />
                                ))}
                              </datalist>
                            )}
                          </motion.div>
                        )}
                      </motion.div>
                    )}

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      <Select
                        label="Mother Tongue"
                        value={draftTongue}
                        onChange={(e) => setDraftTongue(e.target.value)}
                        options={[
                          { value: "", label: "Select..." },
                          { value: "Tamil", label: "Tamil" },
                          { value: "Telugu", label: "Telugu" },
                          { value: "Hindi", label: "Hindi" },
                          { value: "Malayalam", label: "Malayalam" },
                          { value: "Kannada", label: "Kannada" },
                          { value: "Punjabi", label: "Punjabi" },
                          { value: "Bengali", label: "Bengali" },
                          { value: "Marathi", label: "Marathi" },
                          { value: "Gujarati", label: "Gujarati" },
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

                    <Select
                      label="Blood Group"
                      value={draftBloodGroup}
                      onChange={(e) => setDraftBloodGroup(e.target.value)}
                      options={BLOOD_GROUP_OPTIONS}
                    />

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      <Input
                        label="Astro Star Details"
                        placeholder="E.g. Ashwini, Bharani / Nadi: Manglik (No)"
                        value={draftAstroStarDetails}
                        onChange={(e) => setDraftAstroStarDetails(e.target.value)}
                      />
                      <Select
                        label="Horoscope Match"
                        value={draftHoroscopeMatch}
                        onChange={(e) => setDraftHoroscopeMatch(e.target.value)}
                        options={HOROSCOPE_MATCH_OPTIONS}
                      />
                    </div>
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
                      inputMode="numeric"
                      pattern="[0-9]*"
                      maxLength={10}
                      placeholder="Enter 10-digit number"
                      value={draftParentsNumber}
                      onChange={(e) => {
                        const val = e.target.value.replace(/\D/g, "").slice(0, 10);
                        setDraftParentsNumber(val);
                        if (errors.parentsNumber) {
                          setErrors((prev) => {
                            const copy = { ...prev };
                            delete copy.parentsNumber;
                            return copy;
                          });
                        }
                      }}
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

                {/* Step 6: Photo & ID Verification */}
                {registrationStep === 6 && (
                  <div className="space-y-6 text-left">
                    {/* Section 1: Profile Photo */}
                    <div className="p-5 rounded-2xl bg-card border border-border/70 space-y-4">
                      <div className="flex items-center gap-2">
                        <div className="p-1.5 rounded-lg bg-brand-gold/10 text-brand-gold">
                          <Image className="h-4 w-4" />
                        </div>
                        <div>
                          <h3 className="font-serif text-sm font-bold text-foreground">1. Profile Portrait Photo</h3>
                          <p className="text-[11px] text-muted-foreground font-support">
                            Upload your profile picture (Max file size: 5 MB).
                          </p>
                        </div>
                      </div>

                      <div className="flex flex-col sm:flex-row items-center gap-4 p-4 border border-dashed border-[#3B6C9E]/50 rounded-xl bg-muted/10">
                        {photoUrl ? (
                          <div className="relative h-24 w-24 rounded-xl overflow-hidden bg-muted border border-brand-gold shrink-0">
                            <img src={photoUrl} alt="Portrait Preview" className="h-full w-full object-cover" />
                          </div>
                        ) : (
                          <div className="h-24 w-24 rounded-xl bg-muted/20 border border-border flex items-center justify-center shrink-0 text-muted-foreground">
                            <Image className="h-8 w-8 opacity-40" />
                          </div>
                        )}

                        <div className="flex-1 w-full space-y-2.5">
                          <label className="block text-xs font-semibold text-foreground font-support">
                            Choose Portrait Photo File <span className="text-muted-foreground font-normal">(Max 5 MB)</span>
                          </label>
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
                          <div className="pt-2 border-t border-border/40">
                            <Input
                              label="Or Paste Portrait Image Link"
                              placeholder="https://..."
                              value={photoUrl}
                              onChange={(e) => setPhotoUrl(e.target.value)}
                            />
                          </div>
                        </div>
                      </div>
                    </div>

                    {/* Section 2: Government ID Proof */}
                    <div className="p-5 rounded-2xl bg-card border border-brand-gold/40 shadow-md space-y-4">
                      <div className="flex items-center gap-2">
                        <div className="p-1.5 rounded-lg bg-brand-gold/15 text-brand-gold">
                          <ShieldCheck className="h-4 w-4" />
                        </div>
                        <div>
                          <div className="flex items-center gap-2">
                            <h3 className="font-serif text-sm font-bold text-foreground">2. Government ID Proof</h3>
                            <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-brand-gold/15 text-brand-gold uppercase tracking-wider">
                              Required
                            </span>
                          </div>
                          <p className="text-[11px] text-muted-foreground font-support">
                            Mandatory for Superadmin identity verification before account approval.
                          </p>
                        </div>
                      </div>

                      <div className="space-y-4">
                        <Select
                          label="ID Document Type"
                          value={draftIdProofType}
                          onChange={(e) => {
                            setDraftIdProofType(e.target.value);
                            if (errors.idProofType) {
                              setErrors((prev) => {
                                const copy = { ...prev };
                                delete copy.idProofType;
                                return copy;
                              });
                            }
                          }}
                          options={[
                            { value: "Aadhaar Card", label: "Aadhaar Card" },
                            { value: "PAN Card", label: "PAN Card" },
                            { value: "Driving License", label: "Driving License" },
                            { value: "Voter ID", label: "Voter ID" },
                            { value: "Passport", label: "Passport" }
                          ]}
                          error={errors.idProofType}
                        />

                        {/* ID Upload Dropzone */}
                        <div className={`p-4 border-2 border-dashed rounded-xl transition-all ${
                          errors.idProof
                            ? "border-destructive bg-destructive/5"
                            : idProofFile || idProofUrl
                            ? "border-emerald-500/50 bg-emerald-500/5"
                            : "border-[#3B6C9E]/50 hover:border-brand-gold/60 bg-muted/10"
                        }`}>
                          {idProofFile || idProofUrl ? (
                            <div className="flex flex-col sm:flex-row items-center gap-4">
                              {idProofPreview ? (
                                <div className="relative h-24 w-32 rounded-lg overflow-hidden bg-muted border border-brand-gold/40 shrink-0">
                                  <img src={idProofPreview} alt="ID Document Preview" className="h-full w-full object-cover" />
                                </div>
                              ) : (
                                <div className="h-24 w-32 rounded-lg bg-emerald-500/10 border border-emerald-500/30 flex flex-col items-center justify-center shrink-0 text-emerald-400">
                                  <FileText className="h-8 w-8 mb-1" />
                                  <span className="text-[10px] font-bold">Document</span>
                                </div>
                              )}

                              <div className="flex-1 min-w-0 space-y-1 text-left">
                                <div className="flex items-center gap-2">
                                  <span className="text-xs font-bold text-emerald-400 flex items-center gap-1">
                                    <Check className="h-3.5 w-3.5 stroke-[3]" /> Document Attached
                                  </span>
                                  <span className="text-[10px] font-semibold px-2 py-0.5 rounded bg-brand-gold/15 text-brand-gold">
                                    {draftIdProofType}
                                  </span>
                                </div>
                                <p className="text-xs font-mono font-medium text-foreground truncate max-w-xs">
                                  {idProofFile?.name || idProofUrl}
                                </p>
                                {idProofFile && (
                                  <p className="text-[11px] text-muted-foreground font-support">
                                    Size: {(idProofFile.size / (1024 * 1024)).toFixed(2)} MB
                                  </p>
                                )}
                                <div className="pt-2">
                                  <button
                                    type="button"
                                    onClick={() => {
                                      setIdProofFile(null);
                                      setIdProofUrl("");
                                      setIdProofPreview("");
                                    }}
                                    className="text-xs text-rose-400 hover:text-rose-300 font-semibold underline cursor-pointer"
                                  >
                                    Remove &amp; Choose Another
                                  </button>
                                </div>
                              </div>
                            </div>
                          ) : (
                            <div className="text-center py-4 space-y-2">
                              <ShieldCheck className="h-10 w-10 text-brand-gold mx-auto opacity-70" />
                              <div className="space-y-1">
                                <label className="block text-xs font-bold text-foreground font-support">
                                  Upload Government ID Proof
                                </label>
                                <p className="text-[11px] text-muted-foreground font-support">
                                  Accepted file types: JPG, PNG, WEBP, PDF • <strong className="text-foreground">Max upload size: 5 MB</strong>
                                </p>
                              </div>
                              <div className="pt-2 max-w-xs mx-auto">
                                <input
                                  type="file"
                                  accept="image/jpeg,image/png,image/webp,application/pdf"
                                  onChange={handleIdProofFileChange}
                                  className="block w-full text-xs text-slate-500
                                    file:mr-4 file:py-1.5 file:px-3
                                    file:rounded-full file:border-0
                                    file:text-xs file:font-semibold
                                    file:bg-brand-gold/15 file:text-brand-gold
                                    hover:file:bg-brand-gold/25
                                    cursor-pointer file:cursor-pointer"
                                />
                              </div>
                            </div>
                          )}

                          {errors.idProof && (
                            <span className="text-xs text-destructive font-support font-medium mt-2 block">
                              {errors.idProof}
                            </span>
                          )}
                        </div>

                        {/* Optional ID URL Fallback */}
                        {!idProofFile && (
                          <div className="pt-2">
                            <Input
                              label="Or Document Image URL (Optional)"
                              placeholder="https://... (or choose a file above)"
                              value={idProofUrl}
                              onChange={(e) => {
                                setIdProofUrl(e.target.value);
                                if (errors.idProof) {
                                  setErrors((prev) => {
                                    const copy = { ...prev };
                                    delete copy.idProof;
                                    return copy;
                                  });
                                }
                              }}
                            />
                          </div>
                        )}
                      </div>
                    </div>

                    <div className="flex items-center gap-2.5 text-xs text-muted-foreground font-support text-left p-3.5 bg-brand-gold/5 border border-brand-gold/20 rounded-xl">
                      <Shield className="h-5 w-5 text-brand-gold flex-shrink-0" />
                      <span>
                        <strong>🔒 Privacy &amp; Encryption</strong>: Your Government ID proof is encrypted and exclusively accessible by the Superadmin moderation team to review and approve your account. It is never displayed on your public profile.
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
          <p className="text-[11px] text-muted-foreground text-center font-support mt-4">
            By creating an account, you agree to Vikan Matrimony&apos;s{" "}
            <Link href="/terms" className="text-brand-gold hover:underline font-semibold">Terms &amp; Conditions</Link>,{" "}
            <Link href="/privacy" className="text-brand-gold hover:underline font-semibold">Privacy Policy</Link>, and{" "}
            <Link href="/refund-policy" className="text-brand-gold hover:underline font-semibold">Refund Policy</Link>.
          </p>
        </div>
      )}
    </main>

    <Footer />
  </>
);
}
