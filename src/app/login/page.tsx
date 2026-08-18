"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useDispatch, useSelector } from "react-redux";
import { RootState } from "@/lib/redux/store";
import { setCredentials } from "@/lib/redux/slices/authSlice";
import { useLoginMutation, useRegisterMutation, useForgotPasswordSendOtpMutation, useResetPasswordMutation } from "@/lib/redux/api";
import { useAppStore } from "@/lib/store";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Navbar } from "@/components/layout/Navbar";
import { Footer } from "@/components/layout/Footer";
import { ShieldCheck, Phone, Mail, Lock } from "lucide-react";

export default function LoginPage() {
  const router = useRouter();
  const dispatch = useDispatch();
  const currentUser = useSelector((state: RootState) => state.auth.user);
  const [loginApi] = useLoginMutation();
  const [registerApi] = useRegisterMutation();

  const { showToast } = useAppStore();
  const [forgotPasswordSendOtpApi, { isLoading: isSendingForgotOtp }] = useForgotPasswordSendOtpMutation();
  const [resetPasswordApi, { isLoading: isResettingPassword }] = useResetPasswordMutation();

  const [loginMethod, setLoginMethod] = useState<"otp" | "password" | "forgot">("password");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  
  const [mobileNumber, setMobileNumber] = useState("");
  const [otpSent, setOtpSent] = useState(false);
  const [otpCode, setOtpCode] = useState("");
  
  // Forgot password states
  const [forgotEmail, setForgotEmail] = useState("");
  const [forgotOtp, setForgotOtp] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [forgotOtpSent, setForgotOtpSent] = useState(false);
  const [forgotCooldown, setForgotCooldown] = useState(0);
  const [successMessage, setSuccessMessage] = useState("");

  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    // If already logged in, redirect
    if (currentUser) {
      router.push(currentUser.email === "admin@vikan.com" ? "/admin" : "/dashboard");
    }
  }, [currentUser]);

  useEffect(() => {
    if (forgotCooldown > 0) {
      const timer = setTimeout(() => setForgotCooldown((prev) => prev - 1), 1000);
      return () => clearTimeout(timer);
    }
  }, [forgotCooldown]);

  const handleForgotSendOtp = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!forgotEmail.trim() || !forgotEmail.includes("@")) {
      setError("Please enter a valid email address.");
      return;
    }
    setError("");
    setSuccessMessage("");
    try {
      const res = await forgotPasswordSendOtpApi({ email: forgotEmail }).unwrap();
      setForgotOtpSent(true);
      setForgotCooldown(60);
      showToast(res.message || "Password reset code sent to your email!", "success");
    } catch (err: any) {
      setError(err?.data?.message || err?.data?.Message || "Failed to send reset code. Please try again.");
    }
  };

  const handleResetPassword = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!forgotOtp.trim() || forgotOtp.length < 6) {
      setError("Please enter the 6-digit verification code sent to your email.");
      return;
    }
    if (!newPassword || newPassword.length < 6) {
      setError("New password must be at least 6 characters.");
      return;
    }
    if (newPassword !== confirmPassword) {
      setError("Passwords do not match.");
      return;
    }
    setError("");
    try {
      await resetPasswordApi({
        email: forgotEmail,
        otp: forgotOtp,
        newPassword
      }).unwrap();
      showToast("Password reset successful! You can now log in.", "success");
      setSuccessMessage("Password reset successfully! Please log in with your new password.");
      setEmail(forgotEmail);
      setPassword("");
      setForgotOtpSent(false);
      setForgotOtp("");
      setNewPassword("");
      setConfirmPassword("");
      setLoginMethod("password");
    } catch (err: any) {
      setError(err?.data?.message || err?.data?.Message || "Failed to reset password. Please try again.");
    }
  };
 
  const handlePasswordLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email.trim() || !password.trim()) {
      setError("Please enter a valid email and password.");
      return;
    }
    setIsLoading(true);
    setError("");
 
    try {
      const response = await loginApi({ email, password }).unwrap();
      dispatch(setCredentials({ token: response.token, user: response.user }));
      router.push(response.user.email === "admin@vikan.com" ? "/admin" : "/dashboard");
    } catch (err: any) {
      setError(err?.data?.message || err?.data?.Message || "Invalid credentials. Please try again.");
    } finally {
      setIsLoading(false);
    }
  };

  const handleSendOtp = (e: React.FormEvent) => {
    e.preventDefault();
    if (!mobileNumber || mobileNumber.length < 10) {
      setError("Please enter a valid 10-digit mobile number.");
      return;
    }
    setIsLoading(true);
    setError("");

    setTimeout(() => {
      setIsLoading(false);
      setOtpSent(true);
      setError("");
    }, 1000);
  };

  const handleVerifyOtp = async (e: React.FormEvent) => {
    e.preventDefault();
    if (otpCode !== "1234") {
      setError("Incorrect OTP code. Try '1234' for demo verification.");
      return;
    }
    setIsLoading(true);
    setError("");

    const otpEmail = `otpuser_${mobileNumber}@vikan.com`;
    const defaultPassword = "Password123";

    try {
      const response = await loginApi({ email: otpEmail, password: defaultPassword }).unwrap();
      dispatch(setCredentials({ token: response.token, user: response.user }));
      router.push("/dashboard");
    } catch (err) {
      try {
        await registerApi({
          email: otpEmail,
          password: defaultPassword,
          name: "OTP User",
          gender: "Male",
          dateOfBirth: "1995-01-01",
          religion: "Hindu",
          community: "Rajput",
          motherTongue: "Hindi",
          maritalStatus: "Never Married",
          city: "Delhi",
          state: "Delhi"
        }).unwrap();

        const response = await loginApi({ email: otpEmail, password: defaultPassword }).unwrap();
        dispatch(setCredentials({ token: response.token, user: response.user }));
        router.push("/dashboard");
      } catch (regErr: any) {
        setError("Failed to verify session. Please try again.");
      }
    } finally {
      setIsLoading(false);
    }
  };

  const handleDemoLogin = async () => {
    setIsLoading(true);
    setError("");
    const demoEmail = "demo@vikan.com";
    const demoPassword = "Password123";

    try {
      const response = await loginApi({ email: demoEmail, password: demoPassword }).unwrap();
      dispatch(setCredentials({ token: response.token, user: response.user }));
      router.push("/dashboard");
    } catch (err) {
      try {
        await registerApi({
          email: demoEmail,
          password: demoPassword,
          name: "Vasanth Kumar",
          gender: "Male",
          dateOfBirth: "1995-08-15",
          religion: "Hindu",
          community: "Brahmin",
          motherTongue: "Tamil",
          maritalStatus: "Never Married",
          city: "Chennai",
          state: "Tamil Nadu"
        }).unwrap();

        const response = await loginApi({ email: demoEmail, password: demoPassword }).unwrap();
        dispatch(setCredentials({ token: response.token, user: response.user }));
        router.push("/dashboard");
      } catch (regErr: any) {
        setError("Failed to initialize demo session. Please register manually.");
      }
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <>
      <Navbar />

      <main className="flex-1 min-h-[85vh] flex items-center justify-center py-20 px-4 relative overflow-hidden bg-[#051121]">
        {/* Background Image with Blur */}
        <div className="absolute inset-0 bg-[url('/login_bg.png')] bg-cover bg-center opacity-30 blur-[2px] scale-105 z-0" />
        <div className="absolute inset-0 bg-gradient-to-b from-[#051121]/60 via-[#051121]/85 to-[#051121] z-0" />
        
        {/* Glassmorphic Form Container */}
        <div className="w-full max-w-md bg-[#081626]/55 backdrop-blur-xl border border-brand-gold/25 rounded-3xl shadow-2xl p-8 relative z-10 glass-premium">
          
          <div className="text-center mb-8">
            <h1 className="font-serif text-3xl font-bold text-foreground">
              {loginMethod === "forgot" ? "Reset Password" : "Welcome Back"}
            </h1>
            <p className="text-xs text-muted-foreground font-support mt-2">
              {loginMethod === "forgot"
                ? "Enter your email to receive a secure password reset code."
                : "Log in to search verified matches and access chat."}
            </p>
          </div>

          {/* Error Message */}
          {error && (
            <div className="mb-5 p-3 rounded-lg bg-destructive/10 border border-destructive text-destructive text-xs font-support font-semibold">
              {error}
            </div>
          )}

          {/* Success Message */}
          {successMessage && (
            <div className="mb-5 p-3 rounded-lg bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 text-xs font-support font-semibold">
              {successMessage}
            </div>
          )}

          {/* Toggle Login Option */}
          {!otpSent && loginMethod !== "forgot" && (
            <div className="flex bg-[#081626]/40 rounded-full p-1 border border-brand-gold/15 mb-6 gap-2">
              <button
                type="button"
                onClick={() => {
                  setLoginMethod("password");
                  setError("");
                  setSuccessMessage("");
                }}
                className={`flex-1 py-2 text-xs font-semibold rounded-full transition-all cursor-pointer ${
                  loginMethod === "password"
                    ? "bg-brand-gold text-brand-navy shadow-sm"
                    : "bg-transparent text-[#E5DCD0]/60 hover:text-white"
                }`}
              >
                Email & Password
              </button>
              <button
                type="button"
                onClick={() => {
                  setLoginMethod("otp");
                  setError("");
                  setSuccessMessage("");
                }}
                className={`flex-1 py-2 text-xs font-semibold rounded-full transition-all cursor-pointer ${
                  loginMethod === "otp"
                    ? "bg-brand-gold text-brand-navy shadow-sm"
                    : "bg-transparent text-[#E5DCD0]/60 hover:text-white"
                }`}
              >
                Mobile OTP
              </button>
            </div>
          )}

          {/* Password Form */}
          {loginMethod === "password" && (
            <form onSubmit={handlePasswordLogin} className="space-y-4">
              <Input
                label="Email address"
                type="email"
                required
                placeholder="you@example.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
              />
              <Input
                label="Password"
                type="password"
                required
                placeholder="••••••••"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
              />

              <div className="flex items-center justify-between mt-2">
                <label className="flex items-center gap-2 text-xs text-muted-foreground font-support cursor-pointer select-none">
                  <input type="checkbox" className="rounded text-brand-gold accent-brand-gold" />
                  Remember Me
                </label>
                <button
                  type="button"
                  onClick={() => {
                    setLoginMethod("forgot");
                    setError("");
                    setSuccessMessage("");
                    setForgotEmail(email);
                  }}
                  className="text-xs text-brand-gold hover:underline font-support font-semibold cursor-pointer"
                >
                  Forgot Password?
                </button>
              </div>

              <Button type="submit" variant="gold" className="w-full mt-6" isLoading={isLoading}>
                Log In
              </Button>
            </form>
          )}

          {/* Forgot Password Step 1: Send OTP */}
          {loginMethod === "forgot" && !forgotOtpSent && (
            <form onSubmit={handleForgotSendOtp} className="space-y-4">
              <p className="text-xs text-muted-foreground font-support text-left leading-relaxed">
                Enter your registered email address below. We will send you a 6-digit verification code to reset your password.
              </p>
              <Input
                label="Registered Email Address"
                type="email"
                required
                placeholder="you@example.com"
                value={forgotEmail}
                onChange={(e) => setForgotEmail(e.target.value)}
              />
              <Button type="submit" variant="gold" className="w-full mt-6" isLoading={isSendingForgotOtp}>
                Send Reset Code
              </Button>
              <div className="text-center pt-2">
                <button
                  type="button"
                  onClick={() => {
                    setLoginMethod("password");
                    setError("");
                  }}
                  className="text-xs text-muted-foreground hover:text-brand-gold font-support transition-colors cursor-pointer"
                >
                  ← Back to Login
                </button>
              </div>
            </form>
          )}

          {/* Forgot Password Step 2: Verify OTP & Reset Password */}
          {loginMethod === "forgot" && forgotOtpSent && (
            <form onSubmit={handleResetPassword} className="space-y-4">
              <div className="p-3 bg-brand-gold/10 border border-brand-gold/30 rounded-xl text-left text-xs font-support">
                <span className="text-brand-gold font-bold">Verification code sent!</span>
                <p className="text-muted-foreground text-[11px] mt-0.5">Please check your inbox at <strong className="text-foreground">{forgotEmail}</strong></p>
              </div>
              <Input
                label="6-Digit Verification Code"
                type="text"
                required
                maxLength={6}
                placeholder="123456"
                value={forgotOtp}
                onChange={(e) => setForgotOtp(e.target.value.replace(/\D/g, ""))}
                className="font-mono text-center tracking-[6px] text-sm font-bold"
              />
              <Input
                label="New Password"
                type="password"
                required
                placeholder="At least 6 characters"
                value={newPassword}
                onChange={(e) => setNewPassword(e.target.value)}
              />
              <Input
                label="Confirm New Password"
                type="password"
                required
                placeholder="Re-type new password"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
              />
              <div className="flex items-center justify-between text-xs font-support pt-1">
                <button
                  type="button"
                  onClick={handleForgotSendOtp}
                  disabled={isSendingForgotOtp || forgotCooldown > 0}
                  className="text-brand-gold hover:underline font-semibold disabled:opacity-50 cursor-pointer"
                >
                  {forgotCooldown > 0 ? `Resend Code (${forgotCooldown}s)` : "Resend Code"}
                </button>
              </div>
              <Button type="submit" variant="gold" className="w-full mt-6" isLoading={isResettingPassword}>
                Reset Password
              </Button>
              <div className="text-center pt-2">
                <button
                  type="button"
                  onClick={() => {
                    setLoginMethod("password");
                    setError("");
                    setForgotOtpSent(false);
                  }}
                  className="text-xs text-muted-foreground hover:text-brand-gold font-support transition-colors cursor-pointer"
                >
                  ← Back to Login
                </button>
              </div>
            </form>
          )}

          {/* OTP Send Form */}
          {loginMethod === "otp" && !otpSent && (
            <form onSubmit={handleSendOtp} className="space-y-4">
              <Input
                label="Registered Mobile Number"
                type="tel"
                required
                placeholder="Enter 10-digit number"
                value={mobileNumber}
                onChange={(e) => setMobileNumber(e.target.value.replace(/\D/g, "").slice(0, 10))}
                className="!border-brand-gold !rounded-full !bg-[#081626]/40 text-white placeholder-[#E5DCD0]/40 font-support px-6"
              />

              <p className="text-[10px] text-muted-foreground font-support leading-tight">
                By clicking send, we will verify your registration through a mock SMS text indicator.
              </p>

              <Button type="submit" variant="gold" className="w-full mt-6" isLoading={isLoading}>
                Send One-Time OTP
              </Button>
            </form>
          )}

          {/* OTP Verify Form */}
          {loginMethod === "otp" && otpSent && (
            <form onSubmit={handleVerifyOtp} className="space-y-4">
              <div className="text-center p-3.5 bg-brand-gold/5 border border-brand-gold/20 rounded-lg text-xs font-support text-brand-gold mb-4">
                We sent a mock code to **+91 {mobileNumber}**. <br />
                Enter **1234** to log in automatically.
              </div>

              <Input
                label="Enter 4-Digit OTP"
                type="text"
                required
                placeholder="1234"
                maxLength={4}
                value={otpCode}
                onChange={(e) => setOtpCode(e.target.value.replace(/\D/g, ""))}
              />

              <div className="flex justify-between items-center text-xs font-support">
                <button
                  type="button"
                  onClick={() => setOtpSent(false)}
                  className="text-muted-foreground hover:text-foreground hover:underline cursor-pointer"
                >
                  Change Mobile
                </button>
                <button
                  type="button"
                  onClick={() => setError("Demo feature: OTP resend has simulated another trigger.")}
                  className="text-brand-gold hover:underline cursor-pointer font-semibold"
                >
                  Resend OTP Code
                </button>
              </div>

              <Button type="submit" variant="gold" className="w-full mt-6" isLoading={isLoading}>
                Verify & Log In
              </Button>
            </form>
          )}



          <p className="text-xs text-muted-foreground text-center mt-6 font-support">
            Don't have an account?{" "}
            <Link href="/register" className="text-brand-gold font-bold hover:underline">
              Register Free
            </Link>
          </p>
        </div>
      </main>

      <Footer />
    </>
  );
}
