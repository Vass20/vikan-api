"use client";

import React, { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { useAppStore } from "@/lib/store";
import { Navbar } from "@/components/layout/Navbar";
import { useSelector } from "react-redux";
import { RootState } from "@/lib/redux/store";
import { useGetMyProfileQuery, useGetMembershipPlansQuery, useCreatePaymentOrderMutation, useVerifyPaymentMutation } from "@/lib/redux/api";
import { Footer } from "@/components/layout/Footer";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Dialog } from "@/components/ui/dialog";
import { Check, ShieldCheck, Heart, Sparkles, Award, Receipt, Star, CreditCard, AlertCircle, AlertTriangle, CheckCircle2 } from "lucide-react";

interface Plan {
  name: string;
  price: number;
  duration: string;
  features: string[];
  isPopular?: boolean;
}

export default function MembershipPage() {
  const router = useRouter();
  const authUser = useSelector((state: RootState) => state.auth.user);
  
  const { data: myProfile } = useGetMyProfileQuery(undefined, { skip: !authUser });
  const { data: plansList } = useGetMembershipPlansQuery();
  const [createPaymentOrder] = useCreatePaymentOrderMutation();
  const [verifyPayment] = useVerifyPaymentMutation();
  const [cancelMembershipApi] = useCancelMembershipMutation();

  const { addNotification, showToast } = useAppStore();
  const currentUser = myProfile;

  const [showCancelModal, setShowCancelModal] = useState(false);
  const [isCancelling, setIsCancelling] = useState(false);

  const isCurrentPlan = (plan: Plan) => {
    const userPlan = (currentUser?.membershipType || "Free").toLowerCase().trim();
    const targetPlan = plan.name.toLowerCase().trim();
    if (plan.price === 0 || targetPlan.includes("free")) {
      return userPlan.includes("free") || userPlan === "";
    }
    const cleanUserPlan = userPlan.replace(" member", "").replace(" package", "").trim();
    const cleanTargetPlan = targetPlan.replace(" member", "").replace(" package", "").trim();
    return cleanUserPlan.length > 0 && (cleanUserPlan.includes(cleanTargetPlan) || cleanTargetPlan.includes(cleanUserPlan));
  };

  // Custom luxury alert modal state
  const [alertModal, setAlertModal] = useState<{
    isOpen: boolean;
    title: string;
    message: string;
    type: "info" | "error" | "warning" | "success";
  }>({
    isOpen: false,
    title: "",
    message: "",
    type: "info"
  });

  const showAlert = (message: string, title = "Notice", type: "info" | "error" | "warning" | "success" = "info") => {
    setAlertModal({ isOpen: true, title, message, type });
  };

  const [mounted, setMounted] = useState(false);
  const [selectedPlan, setSelectedPlan] = useState<Plan | null>(null);
  const [showCheckout, setShowCheckout] = useState(false);

  // Discount code coupon states
  const [promoCode, setPromoCode] = useState("");
  const [discountAmount, setDiscountAmount] = useState(0);
  const [promoError, setPromoError] = useState("");
  const [promoApplied, setPromoApplied] = useState(false);

  // Form states
  const [isLoading, setIsLoading] = useState(false);
  const [paymentSuccess, setPaymentSuccess] = useState(false);
  const [invoiceNumber, setInvoiceNumber] = useState("");

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

  if (!mounted || !currentUser) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[#F7F3EE] dark:bg-[#081626]">
        <div className="h-10 w-10 border-4 border-brand-gold border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  const plans: Plan[] = (plansList || []).map((p: any) => ({
    ...p,
    isPopular: p.name === "Gold Member"
  }));

  const handleSelectPlan = (plan: Plan) => {
    if (plan.price === 0) {
      showAlert("Free package is already active by default for all registered accounts.", "Free Package Active", "info");
      return;
    }
    if (!currentUser) {
      showAlert("Please log in or register to purchase a membership plan.", "Login Required", "warning");
      router.push("/login");
      return;
    }
    setSelectedPlan(plan);
    setDiscountAmount(0);
    setPromoApplied(false);
    setPromoError("");
    setPromoCode("");
    setPaymentSuccess(false);
    setShowCheckout(true);
  };

  const applyPromo = () => {
    setPromoError("");
    const code = promoCode.trim().toUpperCase();
    if (code === "VIKANWELCOME") {
      const discount = Math.round((selectedPlan?.price || 0) * 0.2); // 20% off
      setDiscountAmount(discount);
      setPromoApplied(true);
    } else {
      setPromoError("Invalid promo code. Try 'VIKANWELCOME' for a 20% discount.");
    }
  };

  const handleCheckoutSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedPlan) return;
    setIsLoading(true);

    try {
      // 1. Create order on backend (strip out spaces or "Member" suffix from plan name)
      const rawPlanName = selectedPlan.name.replace(" Member", "").trim();
      const orderRes = await createPaymentOrder({ planName: rawPlanName }).unwrap();

      const calculatedAmount = selectedPlan.price - discountAmount;
      const amountInPaise = calculatedAmount * 100;

      // 2. Load Razorpay script
      const res = await loadRazorpayScript();
      if (!res) {
        showAlert("Failed to load payment gateway. Please check your network connection.", "Payment Error", "error");
        setIsLoading(false);
        return;
      }

      // 3. Configure Razorpay options
      const options = {
        key: orderRes.keyId,
        amount: amountInPaise,
        currency: orderRes.currency,
        name: "Vikan Matrimony",
        description: `Upgrade to ${selectedPlan.name} Plan`,
        order_id: orderRes.orderId,
        handler: async function (response: any) {
          setIsLoading(true);
          try {
            // 4. Verify payment on backend
            await verifyPayment({
              razorpayOrderId: response.razorpay_order_id,
              razorpayPaymentId: response.razorpay_payment_id,
              razorpaySignature: response.razorpay_signature || "",
            }).unwrap();

            const invoice = `VIK-INV-${Math.floor(100000 + Math.random() * 900000)}`;
            setInvoiceNumber(invoice);
            setPaymentSuccess(true);

            addNotification({
              title: "Membership Purchase Completed",
              body: `Thank you! Your upgrade to ${selectedPlan.name} was successful. Invoice: ${invoice}`,
              type: "system"
            });
          } catch (err: any) {
            console.error(err);
            showAlert(err?.data?.message || "Payment verification failed.", "Payment Error", "error");
          } finally {
            setIsLoading(false);
          }
        },
        prefill: {
          name: currentUser.name,
          email: authUser?.email,
          contact: currentUser.parentsNumber || "",
        },
        notes: {
          profile_id: currentUser.id,
          plan: selectedPlan.name
        },
        theme: {
          color: "#D4AF37"
        }
      };

      // 5. Open checkout
      const rzp = new (window as any).Razorpay(options);
      rzp.on("payment.failed", function (response: any) {
        showAlert(response.error.description || "Payment failed.", "Transaction Failed", "error");
      });
      rzp.open();
    } catch (err: any) {
      console.error(err);
      showAlert(err?.data?.message || "Failed to initiate transaction.", "Transaction Error", "error");
    } finally {
      setIsLoading(false);
    }
  };

  const handleCancelMembership = async () => {
    setIsCancelling(true);
    try {
      const res = await cancelMembershipApi().unwrap();
      showToast(res.message || "Membership cancelled successfully", "info");
      setShowCancelModal(false);
    } catch (err: any) {
      console.error(err);
      showAlert(err?.data?.message || "Failed to cancel membership.", "Error", "error");
    } finally {
      setIsCancelling(false);
    }
  };

  return (
    <>
      <Navbar />

      <main className="flex-1 bg-[#F7F3EE] dark:bg-[#081626] py-16 px-4 sm:px-6 lg:px-8 text-foreground">
        <div className="mx-auto max-w-7xl">
          <div className="text-center mb-12">
            <span className="font-support text-xs font-bold text-brand-gold uppercase tracking-widest block mb-2">
              Membership Packages
            </span>
            <h1 className="font-serif text-3xl md:text-5xl font-bold text-brand-navy dark:text-foreground">
              Elite Matchmaking Plans
            </h1>
            <p className="text-xs text-muted-foreground font-support mt-2 max-w-md mx-auto">
              Upgrade to premium models to obtain direct contacts, highlights, and direct communication logs.
            </p>
          </div>

          {/* Pricing Grid */}
          <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-5 gap-6 items-stretch">
            {plans.map((plan) => (
              <div
                key={plan.name}
                className={`bg-card rounded-2xl border flex flex-col justify-between p-6 shadow-sm transition-all duration-300 relative ${
                  plan.isPopular
                    ? "border-brand-gold ring-1 ring-brand-gold scale-[1.03] luxury-shadow"
                    : "border-border/80 hover:border-brand-gold/60"
                }`}
              >
                {plan.isPopular && (
                  <span className="absolute top-[-12px] left-1/2 transform -translate-x-1/2 bg-brand-gold text-brand-navy text-[9px] font-bold px-3 py-0.5 rounded-full uppercase tracking-wider font-support">
                    Most Popular
                  </span>
                )}

                <div>
                  <h3 className="font-serif text-base font-bold text-brand-navy dark:text-foreground">
                    {plan.name}
                  </h3>
                  <div className="mt-4 flex items-baseline text-brand-navy dark:text-foreground">
                    <span className="font-serif text-2xl font-bold">₹</span>
                    <span className="font-sans text-3xl font-extrabold tracking-tight">
                      {plan.price.toLocaleString("en-IN")}
                    </span>
                    <span className="ml-1 text-xs text-muted-foreground font-support">
                      /{plan.duration}
                    </span>
                  </div>

                  <ul className="mt-6 space-y-3.5 text-xs text-muted-foreground font-support border-t border-border/40 pt-5">
                    {plan.features.map((feat) => (
                      <li key={feat} className="flex items-start gap-2.5">
                        <Check className="h-4 w-4 text-brand-gold shrink-0 mt-0.5" />
                        <span>{feat}</span>
                      </li>
                    ))}
                  </ul>
                </div>

                <div className="mt-8 space-y-2">
                  {isCurrentPlan(plan) ? (
                    <div className="space-y-2">
                      <div className="w-full uppercase font-bold tracking-wider text-xs py-2.5 rounded-xl border border-emerald-500/40 bg-emerald-500/10 text-emerald-500 dark:text-emerald-400 flex items-center justify-center gap-1.5 shadow-sm font-support">
                        <CheckCircle2 className="h-4 w-4" />
                        <span>Current Plan</span>
                      </div>
                      {plan.price > 0 && (
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => setShowCancelModal(true)}
                          className="w-full text-[11px] border-destructive/40 text-destructive hover:bg-destructive/10 hover:!text-destructive uppercase font-bold tracking-wider font-support py-2 cursor-pointer"
                        >
                          Cancel Membership
                        </Button>
                      )}
                    </div>
                  ) : (
                    <Button
                      variant={plan.isPopular ? "gold" : "outline"}
                      className="w-full uppercase font-bold tracking-wider text-xs py-2.5"
                      onClick={() => handleSelectPlan(plan)}
                    >
                      Select Plan
                    </Button>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>
      </main>

      {/* CHECKOUT SYSTEM DIALOG */}
      <Dialog isOpen={showCheckout} onClose={() => setShowCheckout(false)} title="Luxury Plan Checkout" size="lg">
        {paymentSuccess ? (
          <div className="space-y-6 font-support text-xs">
            <div className="text-center p-6 bg-emerald-500/5 border border-emerald-500 rounded-xl flex flex-col items-center">
              <ShieldCheck className="h-12 w-12 text-emerald-500 mb-2" />
              <h3 className="text-sm font-bold text-emerald-600 uppercase">Payment Completed Successfully</h3>
              <p className="text-muted-foreground mt-1 leading-relaxed max-w-sm">
                Your profile is now upgraded to **{selectedPlan?.name}**. Access credits have been preloaded.
              </p>
            </div>

            {/* Print Invoice Container */}
            <div className="border border-border/80 rounded-xl p-5 space-y-4 bg-muted/5 font-mono">
              <div className="flex items-center justify-between border-b border-border pb-3">
                <span className="font-bold">VIKAN MATRIMONY RECEIPT</span>
                <span>{invoiceNumber}</span>
              </div>
              <div className="space-y-1.5">
                <div className="flex justify-between">
                  <span>Client Name:</span>
                  <span className="font-bold">{currentUser?.name}</span>
                </div>
                <div className="flex justify-between">
                  <span>Plan Purchased:</span>
                  <span className="font-bold">{selectedPlan?.name}</span>
                </div>
                <div className="flex justify-between">
                  <span>Tax Invoice Code:</span>
                  <span className="font-bold">GSTIN-27AAVIK8877M</span>
                </div>
                <div className="flex justify-between">
                  <span>Payment Method:</span>
                  <span className="font-bold">CREDIT CARD (MOCK)</span>
                </div>
              </div>
              
              <div className="border-t border-dashed border-border pt-3 space-y-1 text-right">
                <div className="flex justify-between">
                  <span>Subtotal:</span>
                  <span>₹{(selectedPlan?.price || 0).toLocaleString("en-IN")}.00</span>
                </div>
                {discountAmount > 0 && (
                  <div className="flex justify-between text-emerald-600 font-bold">
                    <span>Discount (20% off):</span>
                    <span>-₹{discountAmount.toLocaleString("en-IN")}.00</span>
                  </div>
                )}
                <div className="flex justify-between text-sm font-bold border-t border-border pt-1">
                  <span>Total Amount Paid:</span>
                  <span>₹{((selectedPlan?.price || 0) - discountAmount).toLocaleString("en-IN")}.00</span>
                </div>
              </div>
            </div>

            <div className="flex justify-end pt-3 gap-2">
              <Button type="button" variant="outline" onClick={() => window.print()}>
                Print Invoice
              </Button>
              <Button type="button" variant="primary" onClick={() => setShowCheckout(false)}>
                Back to Account
              </Button>
            </div>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-12 gap-8 font-support text-xs items-start">
            {/* Left side billing summary */}
            <div className="md:col-span-5 space-y-4 border border-border p-4 rounded-xl bg-muted/5">
              <h3 className="font-serif text-sm font-bold text-brand-navy dark:text-foreground border-b border-border pb-2">
                Order Summary
              </h3>
              <div className="space-y-2">
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Base Plan Price:</span>
                  <span>₹{(selectedPlan?.price || 0).toLocaleString("en-IN")}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Membership:</span>
                  <span className="font-bold">{selectedPlan?.name}</span>
                </div>
                {promoApplied && (
                  <div className="flex justify-between text-emerald-600 font-bold">
                    <span>Coupon Discount:</span>
                    <span>-₹{discountAmount.toLocaleString("en-IN")}</span>
                  </div>
                )}
                <div className="flex justify-between font-bold text-sm border-t border-border pt-2">
                  <span>Grand Total:</span>
                  <span>₹{((selectedPlan?.price || 0) - discountAmount).toLocaleString("en-IN")}</span>
                </div>
              </div>

              {/* Promo box */}
              <div className="pt-4 border-t border-border space-y-2">
                <Input
                  label="Have a promo coupon?"
                  placeholder="Try 'VIKANWELCOME'"
                  value={promoCode}
                  onChange={(e) => setPromoCode(e.target.value)}
                  error={promoError}
                />
                <Button type="button" variant="outline" size="sm" onClick={applyPromo} className="w-full">
                  Apply Coupon Code
                </Button>
                {promoApplied && (
                  <span className="text-[10px] text-emerald-600 font-semibold block text-center">
                    ✓ Code Applied successfully (20% off)
                  </span>
                )}
              </div>
            </div>

            {/* Right side payment gateway info */}
            <div className="md:col-span-7 space-y-6">
              <h3 className="font-serif text-sm font-bold text-brand-navy dark:text-foreground flex items-center gap-1.5 border-b border-border pb-2">
                <CreditCard className="h-5 w-5 text-brand-gold" /> Payment Method
              </h3>
              
              <div className="p-5 border border-brand-gold/20 rounded-xl bg-brand-gold/5 space-y-2">
                <h4 className="text-xs font-bold text-brand-gold">
                  Razorpay Secure Checkout
                </h4>
                <p className="text-[10px] text-muted-foreground leading-relaxed">
                  UPI (Google Pay, PhonePe, Paytm), Netbanking, Credit/Debit Cards, and mobile wallets are supported. Payments are processed securely without card details being stored on our servers.
                </p>
              </div>

              <div className="pt-4 flex gap-2">
                <Button type="button" variant="outline" className="flex-1" onClick={() => setShowCheckout(false)}>
                  Cancel
                </Button>
                <Button type="button" variant="secondary" className="flex-1 uppercase font-bold tracking-wider text-xs" onClick={handleCheckoutSubmit} isLoading={isLoading}>
                  Pay with Razorpay
                </Button>
              </div>
            </div>
          </div>
        )}
      </Dialog>

      {/* CUSTOM LUXURY ALERT MODAL */}
      <Dialog
        isOpen={alertModal.isOpen}
        onClose={() => setAlertModal((prev) => ({ ...prev, isOpen: false }))}
        title={alertModal.title}
        size="sm"
        zIndex={100}
      >
        <div className="flex flex-col items-center gap-4 text-center p-3 bg-[#0B1A2F]/95 rounded-xl border border-brand-gold/30 shadow-2xl">
          <div className={`h-14 w-14 rounded-full flex items-center justify-center border shadow-lg ${
            alertModal.type === 'error' 
              ? 'bg-red-500/10 border-red-500/30 text-red-500' 
              : alertModal.type === 'warning'
              ? 'bg-amber-500/10 border-amber-500/30 text-amber-500'
              : 'bg-brand-gold/10 border-brand-gold/30 text-brand-gold'
          }`}>
            {alertModal.type === 'error' ? (
              <AlertCircle className="h-7 w-7 animate-pulse" />
            ) : alertModal.type === 'warning' ? (
              <AlertTriangle className="h-7 w-7 animate-pulse" />
            ) : (
              <Sparkles className="h-7 w-7 text-brand-gold" />
            )}
          </div>
          
          <div className="space-y-1.5">
            <h3 className="text-base font-serif font-bold text-white tracking-wide">
              {alertModal.title}
            </h3>
            <p className="text-xs text-[#E5DCD0]/80 font-support leading-relaxed max-w-xs">
              {alertModal.message}
            </p>
          </div>

          <Button
            type="button"
            onClick={() => setAlertModal((prev) => ({ ...prev, isOpen: false }))}
            className="gold-gradient text-brand-navy font-bold text-xs uppercase tracking-wider px-8 py-2.5 rounded-xl shadow-md hover:scale-105 transition-transform"
          >
            Got It
          </Button>
        </div>
      </Dialog>

      {/* CANCEL MEMBERSHIP CONFIRMATION DIALOG */}
      <Dialog isOpen={showCancelModal} onClose={() => setShowCancelModal(false)} title="Cancel Active Membership">
        <div className="space-y-5 text-center font-support p-2">
          <div className="mx-auto h-12 w-12 rounded-full bg-destructive/15 text-destructive flex items-center justify-center border border-destructive/30">
            <AlertCircle className="h-6 w-6" />
          </div>
          <div>
            <h3 className="text-base font-serif font-bold text-foreground">
              Are you sure you want to cancel your membership?
            </h3>
            <p className="text-xs text-muted-foreground mt-2 leading-relaxed max-w-sm mx-auto">
              Your account is currently on <span className="font-bold text-brand-gold">{currentUser?.membershipType}</span>. Cancelling will revert your account to the <span className="font-bold text-foreground">Free Member Plan</span> and remove active premium perks.
            </p>
          </div>

          <div className="flex gap-3 pt-2">
            <Button
              variant="outline"
              className="flex-1 text-xs uppercase font-bold"
              onClick={() => setShowCancelModal(false)}
              disabled={isCancelling}
            >
              Keep Membership
            </Button>
            <Button
              variant="primary"
              className="flex-1 text-xs uppercase font-bold bg-destructive hover:bg-destructive/90 text-white border-none"
              onClick={handleCancelMembership}
              isLoading={isCancelling}
            >
              Yes, Cancel Membership
            </Button>
          </div>
        </div>
      </Dialog>

      <Footer />
    </>
  );
}

const loadRazorpayScript = () => {
  return new Promise((resolve) => {
    if (typeof window !== "undefined" && (window as any).Razorpay) {
      resolve(true);
      return;
    }
    const script = document.createElement("script");
    script.src = "https://checkout.razorpay.com/v1/checkout.js";
    script.onload = () => resolve(true);
    script.onerror = () => resolve(false);
    document.body.appendChild(script);
  });
};
