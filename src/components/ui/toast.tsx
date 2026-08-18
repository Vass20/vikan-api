"use client";

import React, { useEffect } from "react";
import { useAppStore } from "@/lib/store";
import { CheckCircle2, AlertTriangle, AlertCircle, Info, X } from "lucide-react";

export function Toast() {
  const { toast, hideToast } = useAppStore();

  useEffect(() => {
    if (toast) {
      const timer = setTimeout(() => {
        hideToast();
      }, 5000); // Auto hide after 5 seconds
      return () => clearTimeout(timer);
    }
  }, [toast, hideToast]);

  if (!toast) return null;

  const { message, type } = toast;

  const config = {
    success: {
      bg: "bg-emerald-500/15 border-emerald-500/30 text-emerald-600 dark:text-emerald-400",
      icon: <CheckCircle2 className="h-5 w-5 text-emerald-500" />
    },
    error: {
      bg: "bg-destructive/10 border-destructive/30 text-destructive",
      icon: <AlertTriangle className="h-5 w-5 text-destructive" />
    },
    warning: {
      bg: "bg-amber-500/15 border-amber-500/30 text-amber-600 dark:text-amber-500",
      icon: <AlertCircle className="h-5 w-5 text-amber-500" />
    },
    info: {
      bg: "bg-[#0b1626]/90 border-brand-gold/30 text-brand-gold",
      icon: <Info className="h-5 w-5 text-brand-gold" />
    }
  };

  const currentConfig = config[type] || config.info;

  return (
    <div className="fixed top-4 right-4 z-[9999] animate-slideIn">
      <div
        className={`flex items-center gap-3 px-4 py-3 rounded-2xl border backdrop-blur-xl shadow-xl transition-all duration-300 ${currentConfig.bg}`}
        style={{
          boxShadow: "0 10px 30px -10px rgba(0, 0, 0, 0.3)"
        }}
      >
        <div className="shrink-0">{currentConfig.icon}</div>
        <p className="text-xs font-support font-semibold tracking-wide pr-4">
          {message}
        </p>
        <button
          onClick={hideToast}
          className="p-1 rounded-full hover:bg-black/5 dark:hover:bg-white/5 transition-colors focus:outline-none cursor-pointer text-muted-foreground hover:text-brand-gold"
        >
          <X className="h-3.5 w-3.5" />
        </button>
      </div>
    </div>
  );
}
