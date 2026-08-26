"use client";

import React, { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Shield, Settings, Check, X } from "lucide-react";
import { Dialog } from "@/components/ui/dialog";

interface CookiePreferences {
  necessary: boolean;
  analytics: boolean;
  marketing: boolean;
}

export const CookieConsentBanner: React.FC = () => {
  const [isVisible, setIsVisible] = useState(false);
  const [showPreferencesModal, setShowPreferencesModal] = useState(false);
  const [preferences, setPreferences] = useState<CookiePreferences>({
    necessary: true,
    analytics: true,
    marketing: true
  });

  useEffect(() => {
    // 1. Check if consent has already been given
    const consent = localStorage.getItem("vikan_cookie_consent");
    if (!consent) {
      // Delay showing the banner slightly for better entry animation
      const timer = setTimeout(() => setIsVisible(true), 1500);
      return () => clearTimeout(timer);
    } else {
      try {
        setPreferences(JSON.parse(consent));
      } catch (e) {
        console.error("Error parsing cookie consent", e);
      }
    }
  }, []);

  // 2. Listen to custom event to reopen preferences from the footer
  useEffect(() => {
    const handleOpenPreferences = () => {
      setShowPreferencesModal(true);
    };

    window.addEventListener("open-cookie-preferences", handleOpenPreferences);
    return () => {
      window.removeEventListener("open-cookie-preferences", handleOpenPreferences);
    };
  }, []);

  const handleAcceptAll = () => {
    const allAccepted: CookiePreferences = {
      necessary: true,
      analytics: true,
      marketing: true
    };
    localStorage.setItem("vikan_cookie_consent", JSON.stringify(allAccepted));
    setPreferences(allAccepted);
    setIsVisible(false);
  };

  const handleDeclineAll = () => {
    const allDeclined: CookiePreferences = {
      necessary: true,
      analytics: false,
      marketing: false
    };
    localStorage.setItem("vikan_cookie_consent", JSON.stringify(allDeclined));
    setPreferences(allDeclined);
    setIsVisible(false);
  };

  const handleSavePreferences = () => {
    localStorage.setItem("vikan_cookie_consent", JSON.stringify(preferences));
    setIsVisible(false);
    setShowPreferencesModal(false);
  };

  if (!isVisible && !showPreferencesModal) return null;

  return (
    <>
      {/* FLOATING CONSENT BANNER */}
      {isVisible && (
        <div className="fixed bottom-4 left-4 right-4 md:left-auto md:right-4 md:max-w-md bg-[#0b1626] border border-brand-gold/30 rounded-2xl shadow-2xl p-5 z-40 animate-in slide-in-from-bottom-8 duration-300 font-support">
          <div className="flex items-start gap-3">
            <div className="p-2 bg-brand-gold/10 text-brand-gold rounded-xl shrink-0 mt-0.5">
              <Shield className="h-5 w-5" />
            </div>
            <div className="space-y-1">
              <h4 className="font-serif text-sm font-bold text-[#F7F3EE]">
                Cookie Privacy Preferences
              </h4>
              <p className="text-[10px] text-muted-foreground leading-relaxed">
                We use cookies to secure session tokens, analyze system performance, and personalize matchmaking lists. Choosing 'Accept' consents to all cookies.
              </p>
            </div>
          </div>

          <div className="mt-4 flex items-center justify-end gap-2 flex-wrap text-[10px]">
            <Button
              variant="outline"
              size="sm"
              onClick={() => {
                setShowPreferencesModal(true);
                setIsVisible(false);
              }}
              className="px-3.5 py-1 text-[10px] hover:border-brand-gold/50 cursor-pointer"
            >
              <Settings className="h-3.5 w-3.5 mr-1" /> Preferences
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={handleDeclineAll}
              className="px-3.5 py-1 text-[10px] cursor-pointer"
            >
              Decline All
            </Button>
            <Button
              variant="secondary"
              size="sm"
              onClick={handleAcceptAll}
              className="px-4 py-1 text-[10px] font-bold cursor-pointer"
            >
              Accept All
            </Button>
          </div>
        </div>
      )}

      {/* PREFERENCES CUSTOMIZATION DIALOG */}
      <Dialog
        isOpen={showPreferencesModal}
        onClose={() => {
          setShowPreferencesModal(false);
          // If they haven't saved and closed banner, keep banner visible
          if (!localStorage.getItem("vikan_cookie_consent")) {
            setIsVisible(true);
          }
        }}
        title="Privacy Preferences Customizer"
        size="md"
      >
        <div className="space-y-6 font-support text-xs">
          <p className="text-muted-foreground leading-relaxed">
            Specify which categories of cookies you consent to use during your matchmaking sessions. Essential cookies cannot be turned off.
          </p>

          <div className="space-y-4 border-t border-b border-border/40 py-4">
            {/* Category 1: Necessary */}
            <div className="flex items-start justify-between gap-4">
              <div className="space-y-1">
                <span className="font-bold text-[#F7F3EE] block">Strictly Necessary Cookies</span>
                <p className="text-[10px] text-muted-foreground leading-relaxed">
                  Required to authenticate user logins, store secure API state tokens, and prevent CSRF. Cannot be disabled.
                </p>
              </div>
              <div className="flex items-center gap-1 bg-emerald-500/10 text-emerald-500 font-bold px-2 py-0.5 rounded-full text-[9px] uppercase tracking-wider font-sans border border-emerald-500/20 mt-1">
                <Check className="h-3 w-3" /> Always On
              </div>
            </div>

            {/* Category 2: Analytics */}
            <div className="flex items-start justify-between gap-4 border-t border-border/20 pt-4">
              <div className="space-y-1">
                <span className="font-bold text-[#F7F3EE] block">Analytics & Performance Cookies</span>
                <p className="text-[10px] text-muted-foreground leading-relaxed">
                  Allows us to log response times, track search filter usage statistics, and capture frontend load speed metrics.
                </p>
              </div>
              <label className="relative inline-flex items-center cursor-pointer mt-1 select-none">
                <input
                  type="checkbox"
                  checked={preferences.analytics}
                  onChange={(e) => setPreferences({ ...preferences, analytics: e.target.checked })}
                  className="sr-only peer"
                />
                <div className="w-9 h-5 bg-border rounded-full peer peer-focus:ring-1 peer-focus:ring-brand-gold/40 peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-4 after:w-4 after:transition-all peer-checked:bg-brand-gold"></div>
              </label>
            </div>

            {/* Category 3: Marketing */}
            <div className="flex items-start justify-between gap-4 border-t border-border/20 pt-4">
              <div className="space-y-1">
                <span className="font-bold text-[#F7F3EE] block">Personalization & Highlight Cookies</span>
                <p className="text-[10px] text-muted-foreground leading-relaxed">
                  Remembers matching configurations, shortlists, and partner preferences to recommend suitable matches on your home dashboard.
                </p>
              </div>
              <label className="relative inline-flex items-center cursor-pointer mt-1 select-none">
                <input
                  type="checkbox"
                  checked={preferences.marketing}
                  onChange={(e) => setPreferences({ ...preferences, marketing: e.target.checked })}
                  className="sr-only peer"
                />
                <div className="w-9 h-5 bg-border rounded-full peer peer-focus:ring-1 peer-focus:ring-brand-gold/40 peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-4 after:w-4 after:transition-all peer-checked:bg-brand-gold"></div>
              </label>
            </div>
          </div>

          <div className="flex justify-end gap-2 pt-2">
            <Button
              type="button"
              variant="outline"
              onClick={() => {
                setShowPreferencesModal(false);
                if (!localStorage.getItem("vikan_cookie_consent")) {
                  setIsVisible(true);
                }
              }}
              className="cursor-pointer"
            >
              Cancel
            </Button>
            <Button
              type="button"
              variant="secondary"
              onClick={handleSavePreferences}
              className="font-bold uppercase tracking-wider cursor-pointer"
            >
              Save Preferences
            </Button>
          </div>
        </div>
      </Dialog>
    </>
  );
};
