"use client";

import React from "react";
import { motion } from "framer-motion";

interface MatchRingProps {
  percentage: number;
  size?: number;
  strokeWidth?: number;
  showText?: boolean;
}

export const MatchRing: React.FC<MatchRingProps> = ({
  percentage,
  size = 60,
  strokeWidth = 5,
  showText = true,
}) => {
  const radius = (size - strokeWidth) / 2;
  const circumference = radius * 2 * Math.PI;

  return (
    <div className="relative flex items-center justify-center" style={{ width: size, height: size }}>
      <svg width={size} height={size} className="transform -rotate-90">
        {/* Track */}
        <circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          fill="transparent"
          stroke="var(--border)"
          strokeWidth={strokeWidth}
          className="opacity-40"
        />
        {/* Fill */}
        <motion.circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          fill="transparent"
          stroke="var(--secondary)" // Antique Gold
          strokeWidth={strokeWidth}
          strokeDasharray={circumference}
          initial={{ strokeDashoffset: circumference }}
          animate={{ strokeDashoffset: circumference - (percentage / 100) * circumference }}
          transition={{ duration: 1.2, ease: "easeOut" }}
          strokeLinecap="round"
        />
      </svg>
      {showText && (
        <div className="absolute flex flex-col items-center justify-center">
          <span className="text-sm font-bold text-brand-navy dark:text-foreground">
            {percentage}%
          </span>
          <span className="text-[7px] font-support uppercase tracking-wider text-muted-foreground scale-90">
            Match
          </span>
        </div>
      )}
    </div>
  );
};
