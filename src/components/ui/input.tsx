"use client";

import React from "react";
import { Eye, EyeOff, ChevronDown } from "lucide-react";

interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  label?: string;
  error?: string;
}

export const Input = React.forwardRef<HTMLInputElement, InputProps>(
  ({ className = "", label, error, type = "text", ...props }, ref) => {
    const [showPassword, setShowPassword] = React.useState(false);
    const isPasswordType = type === "password";
    const inputType = isPasswordType ? (showPassword ? "text" : "password") : type;

    return (
      <div className="w-full flex flex-col gap-1.5">
        {label && (
          <label className="text-xs font-support font-semibold tracking-wider text-muted-foreground uppercase">
            {label}
          </label>
        )}
        <div className="relative w-full">
          <input
            type={inputType}
            ref={ref}
            className={`w-full px-4 py-2.5 rounded-lg border border-[#3B6C9E] dark:border-[#3B6C9E] hover:border-[#5284B9] dark:hover:border-[#5284B9] bg-card text-foreground font-sans placeholder-muted-foreground/60 transition-all duration-200 outline-none focus:border-brand-gold focus:ring-1 focus:ring-brand-gold disabled:opacity-50 disabled:bg-muted/10 ${
              isPasswordType ? "pr-10" : ""
            } ${
              error ? "border-destructive focus:border-destructive focus:ring-destructive" : ""
            } ${className}`}
            {...props}
          />
          {isPasswordType && (
            <button
              type="button"
              onClick={() => setShowPassword(!showPassword)}
              className="absolute right-4 top-1/2 transform -translate-y-1/2 text-muted-foreground hover:text-brand-gold transition-colors focus:outline-none cursor-pointer"
            >
              {showPassword ? (
                <EyeOff className="h-5 w-5" />
              ) : (
                <Eye className="h-5 w-5" />
              )}
            </button>
          )}
        </div>
        {error && (
          <span className="text-xs text-destructive font-support font-medium mt-0.5">
            {error}
          </span>
        )}
      </div>
    );
  }
);

Input.displayName = "Input";

interface SelectProps extends React.SelectHTMLAttributes<HTMLSelectElement> {
  label?: string;
  error?: string;
  options: { value: string; label: string }[];
}

export const Select = React.forwardRef<HTMLSelectElement, SelectProps>(
  ({ className = "", label, error, options, ...props }, ref) => {
    return (
      <div className="w-full flex flex-col gap-1.5">
        {label && (
          <label className="text-xs font-support font-semibold tracking-wider text-muted-foreground uppercase">
            {label}
          </label>
        )}
        <div className="relative w-full">
          <select
            ref={ref}
            className={`w-full px-4 py-2.5 rounded-lg border border-[#3B6C9E] dark:border-[#3B6C9E] hover:border-[#5284B9] dark:hover:border-[#5284B9] bg-card text-foreground font-sans appearance-none pr-10 transition-all duration-200 outline-none focus:border-brand-gold focus:ring-1 focus:ring-brand-gold disabled:opacity-50 ${
              error ? "border-destructive focus:border-destructive" : ""
            } ${className}`}
            {...props}
          >
            {options.map((opt) => (
              <option key={opt.value} value={opt.value} className="bg-card">
                {opt.label}
              </option>
            ))}
          </select>
          <ChevronDown className="absolute right-4 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground pointer-events-none" />
        </div>
        {error && (
          <span className="text-xs text-destructive font-support font-medium mt-0.5">
            {error}
          </span>
        )}
      </div>
    );
  }
);

Select.displayName = "Select";

interface TextareaProps extends React.TextareaHTMLAttributes<HTMLTextAreaElement> {
  label?: string;
  error?: string;
}

export const Textarea = React.forwardRef<HTMLTextAreaElement, TextareaProps>(
  ({ className = "", label, error, rows = 3, ...props }, ref) => {
    return (
      <div className="w-full flex flex-col gap-1.5">
        {label && (
          <label className="text-xs font-support font-semibold tracking-wider text-muted-foreground uppercase">
            {label}
          </label>
        )}
        <textarea
          ref={ref}
          rows={rows}
          className={`w-full px-4 py-2.5 rounded-lg border border-[#3B6C9E] dark:border-[#3B6C9E] hover:border-[#5284B9] dark:hover:border-[#5284B9] bg-card text-foreground font-sans placeholder-muted-foreground/60 transition-all duration-200 outline-none focus:border-brand-gold focus:ring-1 focus:ring-brand-gold disabled:opacity-50 ${
            error ? "border-destructive focus:border-destructive" : ""
          } ${className}`}
          {...props}
        />
        {error && (
          <span className="text-xs text-destructive font-support font-medium mt-0.5">
            {error}
          </span>
        )}
      </div>
    );
  }
);

Textarea.displayName = "Textarea";
