"use client";

import React, { memo } from "react";

import { motion } from "framer-motion";

import { cn } from "@/shared/lib/utils";

interface DiscullaIconProps extends React.HTMLAttributes<HTMLDivElement> {
  size?: "small" | "medium" | "large";
}

export const DiscullaIcon: React.FC<DiscullaIconProps> = memo(
  ({
    className,
    size = "medium",
    ...props // 残りのHTML属性を受け取る
  }) => {
    const sizeConfig = {
      small: {
        fontSize: "text-xl",
        height: "h-10",
        glowSize: "0 0 10px",
        spacing: "tracking-wider",
      },
      medium: {
        fontSize: "text-4xl",
        height: "h-24",
        glowSize: "0 0 20px",
        spacing: "tracking-widest",
      },
      large: {
        fontSize: "text-7xl",
        height: "h-40",
        glowSize: "0 0 30px",
        spacing: "tracking-widest",
      },
    };

    const config = sizeConfig[size];

    const ANIMATION = {
      char: 0.1,
      ring: 0.3,
      cornerLeft: 1.2,
      cornerRight: 1.4,
    } as const;

    // 追加: パーティクル・リングの数を定数化
    const TECH_RING_COUNT = 3;

    return (
      <div
        className={cn("relative inline-flex items-center justify-center", className)}
        {...props} // onClick, id, style などを展開
      >
        {/* Outer glow ring - opacity調整 */}
        <motion.div
          className="absolute inset-0 rounded-full opacity-30" // 0.20 → 0.30
          style={{
            background: "radial-gradient(circle, rgba(14, 165, 233, 0.4) 0%, transparent 70%)",
          }}
          initial={{ scale: 0.8, opacity: 0 }}
          animate={{
            scale: [0.8, 1.2, 1],
            opacity: [0, 0.5, 0.4], // [0, 0.3, 0.2] → [0, 0.5, 0.4]
          }}
          transition={{
            duration: 2,
            ease: "easeOut",
          }}
        />

        {/* Main logo container */}
        <motion.div
          className={`relative ${config.height} flex items-center justify-center`}
          initial={{ opacity: 0, scale: 0.8 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{
            duration: 1.5,
            ease: "easeOut",
          }}
        >
          {/* Background tech pattern */}
          <div className="absolute inset-0 overflow-hidden opacity-10">
            {[...Array(TECH_RING_COUNT)].map((_, i) => (
              <motion.div
                key={i}
                className="absolute inset-0 border-2 border-sky-500 rounded-lg"
                initial={{ scale: 0.8, opacity: 0 }}
                animate={{
                  scale: [0.8, 1.2],
                  opacity: [0, 0.5, 0],
                }}
                transition={{
                  duration: 2,
                  delay: i * 0.3,
                  repeat: Infinity,
                  repeatDelay: 0.6,
                }}
              />
            ))}
          </div>

          {/* Disculla text */}
          <div className="relative">
            <motion.h1
              className={`${config.fontSize} ${config.spacing} select-none`}
              style={{
                fontFamily: "'Inter', system-ui, sans-serif",
                background: "linear-gradient(135deg, #0ea5e9 0%, #06b6d4 50%, #3b82f6 100%)",
                WebkitBackgroundClip: "text",
                WebkitTextFillColor: "transparent",
                backgroundClip: "text",
                filter: `drop-shadow(${config.glowSize} rgba(14, 165, 233, 0.5))`,
                letterSpacing: "0.15em",
              }}
              initial={{ opacity: 0, letterSpacing: "0.5em" }}
              animate={{
                opacity: 1,
                letterSpacing: "0.15em",
              }}
              transition={{
                duration: 1.5,
                ease: "easeOut",
              }}
            >
              {[..."DISCULLA"].map((char, i) => (
                <motion.span
                  key={i}
                  initial={{ opacity: 0, y: -20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{
                    duration: 0.5,
                    delay: i * 0.1,
                    ease: "easeOut",
                  }}
                  className="inline-block"
                >
                  {char}
                </motion.span>
              ))}
            </motion.h1>

            {/* Underline accent */}
            <motion.div
              className="absolute -bottom-2 left-0 right-0 h-0.5 bg-linear-to-r from-transparent via-sky-500 to-transparent"
              initial={{ scaleX: 0, opacity: 0 }}
              animate={{ scaleX: 1, opacity: 1 }}
              transition={{
                duration: 1,
                delay: 0.8,
                ease: "easeOut",
              }}
              style={{
                boxShadow: `0 0 10px rgba(14, 165, 233, 0.8)`,
              }}
            />

            {/* Corner accents */}
            {size === "large" && (
              <>
                <motion.div
                  className="absolute -top-4 -left-4 w-8 h-8 border-l-2 border-t-2 border-sky-500"
                  initial={{ opacity: 0, scale: 0 }}
                  animate={{ opacity: 0.6, scale: 1 }}
                  transition={{ duration: 0.8, delay: ANIMATION.cornerLeft }}
                  style={{
                    boxShadow: `0 0 10px rgba(14, 165, 233, 0.5)`,
                  }}
                />
                <motion.div
                  className="absolute -bottom-4 -right-4 w-8 h-8 border-r-2 border-b-2 border-cyan-500"
                  initial={{ opacity: 0, scale: 0 }}
                  animate={{ opacity: 0.6, scale: 1 }}
                  transition={{ duration: 0.8, delay: ANIMATION.cornerRight }}
                  style={{
                    boxShadow: `0 0 10px rgba(6, 182, 212, 0.5)`,
                  }}
                />
              </>
            )}
          </div>
        </motion.div>
      </div>
    );
  }
);

DiscullaIcon.displayName = "DiscullaIcon";
