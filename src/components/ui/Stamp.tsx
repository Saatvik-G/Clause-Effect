"use client";
import { motion } from "framer-motion";

interface StampProps {
  children: React.ReactNode;
  color?: "red" | "blue" | "green" | "orange";
  size?: "sm" | "md" | "lg";
  rotate?: number;
  animate?: boolean;
  className?: string;
}

const COLOR_MAP = {
  red: "text-[#E23B2E] border-[#E23B2E]",
  blue: "text-[#2340E8] border-[#2340E8]",
  green: "text-[#23A26D] border-[#23A26D]",
  orange: "text-[#F08A24] border-[#F08A24]",
};

const SIZE_MAP = {
  sm: "text-[0.6rem] px-2 py-0.5 border-2",
  md: "text-xs px-3 py-1 border-[2.5px]",
  lg: "text-sm px-4 py-1.5 border-[3px]",
};

export function Stamp({ children, color = "red", size = "md", rotate = -3, animate = false, className = "" }: StampProps) {
  const content = (
    <span className={`inline-flex items-center justify-center font-mono font-bold tracking-[0.15em] uppercase rounded-sm ${SIZE_MAP[size]} ${COLOR_MAP[color]} ${className}`}>
      {children}
    </span>
  );
  if (animate) {
    return (
      <motion.div initial={{ scale: 1.8, opacity: 0, rotate: rotate - 5 }}
        animate={{ scale: 1, opacity: 0.85, rotate, transition: { type: "spring", stiffness: 600, damping: 20 } }}
        className="inline-block" aria-live="assertive">
        {content}
      </motion.div>
    );
  }
  return <div className="inline-block" style={{ transform: `rotate(${rotate}deg)`, opacity: 0.85 }}>{content}</div>;
}
