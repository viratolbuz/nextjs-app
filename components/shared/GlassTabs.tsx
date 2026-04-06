"use client";

import { useRef, useState, useEffect } from "react";
import { motion } from "framer-motion";
import { cn } from "@/lib/utils";
import { LucideIcon } from "lucide-react";

interface Tab {
  key: string;
  label: string;
  icon?: LucideIcon;
}

interface Props {
  tabs: Tab[];
  activeTab: string;
  onChange: (key: string) => void;
}

const GlassTabs = ({ tabs, activeTab, onChange }: Props) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const tabRefs = useRef<(HTMLButtonElement | null)[]>([]);
  const [indicator, setIndicator] = useState({ left: 0, width: 0 });
  const [hoverIndicator, setHoverIndicator] = useState<{ left: number; width: number } | null>(null);

  const activeIdx = tabs.findIndex((t) => t.key === activeTab);

  const calcPosition = (idx: number) => {
    const el = tabRefs.current[idx];
    if (el && containerRef.current) {
      const cr = containerRef.current.getBoundingClientRect();
      const er = el.getBoundingClientRect();
      return { left: er.left - cr.left, width: er.width };
    }
    return null;
  };

  useEffect(() => {
    const pos = calcPosition(activeIdx);
    if (pos) setIndicator(pos);
  }, [activeIdx, tabs]);

  const handleHover = (idx: number) => {
    const pos = calcPosition(idx);
    if (pos) setHoverIndicator(pos);
  };

  const displayIndicator = hoverIndicator || indicator;

  return (
    <div
      ref={containerRef}
      className="relative inline-flex items-center gap-1 rounded-full p-1.5"
      style={{
        background: "hsl(var(--foreground) / 0.05)",
        backdropFilter: "blur(40px)",
        // WebkitBackdropFilter: 'blur(40px)',
        border: "1px solid hsl(var(--foreground) / 0.1)",
        // boxShadow: 'inset 0 1px 3px hsl(var(--background) / 0.4), inset 0 -1px 2px hsl(var(--foreground) / 0.05), 0 8px 32px hsl(var(--foreground) / 0.08)',
      }}
      onMouseLeave={() => setHoverIndicator(null)}
    >
      {/* Glass pill indicator */}
      <motion.div
        className="absolute top-1.5 bottom-1.5 rounded-full"
        style={{
          background: "linear-gradient(135deg, hsl(var(--primary) / 0.12), hsl(var(--primary) / 0.06))",
          backdropFilter: "blur(30px)",
          WebkitBackdropFilter: "blur(30px)",
          border: !hoverIndicator ? "1.5px solid hsl(var(--primary) / 0.5)" : "1px solid hsl(var(--primary) / 0.15)",
          // boxShadow: !hoverIndicator
          //   ? '0 0 24px hsl(var(--primary) / 0.15), inset 0 1px 2px hsl(var(--background) / 0.5)'
          //   : '0 0 12px hsl(var(--primary) / 0.08), inset 0 1px 2px hsl(var(--background) / 0.3)',
        }}
        animate={{
          left: displayIndicator.left,
          width: displayIndicator.width,
          opacity: 1,
        }}
        transition={{
          type: "spring",
          stiffness: 400,
          damping: 28,
          mass: 0.8,
        }}
      />

      {tabs.map((tab, i) => {
        const Icon = tab.icon;
        const isActive = tab.key === activeTab;
        const isHovered = hoverIndicator && !isActive;
        return (
          <button
            key={tab.key}
            ref={(el) => {
              tabRefs.current[i] = el;
            }}
            onClick={() => onChange(tab.key)}
            onMouseEnter={() => handleHover(i)}
            className={cn(
              "relative z-10 flex items-center gap-2 px-5 py-2.5 rounded-full text-sm font-medium transition-colors duration-200",
              isActive ? "text-primary" : "text-muted-foreground hover:text-primary",
            )}
          >
            {Icon && <Icon className={cn("w-4 h-4 transition-all duration-200", isActive && "scale-110")} />}
            <span className="whitespace-nowrap">{tab.label}</span>
          </button>
        );
      })}
    </div>
  );
};

export default GlassTabs;
