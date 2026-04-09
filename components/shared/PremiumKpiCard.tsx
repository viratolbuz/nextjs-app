"use client";

import { Card } from "@/components/ui/card";
import { LucideIcon } from "lucide-react";
import { cn } from "@/lib/utils";

export interface KpiCardData {
  label: string;
  value: string | number;
  subtitle?: string;
  icon: LucideIcon;
  trend?: number;
  accent?:
    | "blue"
    | "emerald"
    | "orange"
    | "purple"
    | "cyan"
    | "pink"
    | "red"
    | "amber"
    | "teal"
    | "indigo";
}

const accentStyles: Record<
  string,
  {
    gradient: string;
    iconBg: string;
    iconText: string;
    trendBg: string;
    bar: string;
  }
> = {
  blue: {
    gradient:
      "from-blue-500/8 to-blue-500/2 dark:from-blue-500/15 dark:to-blue-500/5",
    iconBg: "bg-blue-100 dark:bg-blue-500/20",
    iconText: "text-blue-600 dark:text-blue-400",
    trendBg: "bg-blue-100 text-blue-700 dark:bg-blue-500/20 dark:text-blue-300",
    bar: "from-blue-400 to-blue-600",
  },
  emerald: {
    gradient:
      "from-emerald-500/8 to-emerald-500/2 dark:from-emerald-500/15 dark:to-emerald-500/5",
    iconBg: "bg-emerald-100 dark:bg-emerald-500/20",
    iconText: "text-emerald-600 dark:text-emerald-400",
    trendBg:
      "bg-emerald-100 text-emerald-700 dark:bg-emerald-500/20 dark:text-emerald-300",
    bar: "from-emerald-400 to-emerald-600",
  },
  orange: {
    gradient:
      "from-orange-500/8 to-orange-500/2 dark:from-orange-500/15 dark:to-orange-500/5",
    iconBg: "bg-orange-100 dark:bg-orange-500/20",
    iconText: "text-orange-600 dark:text-orange-400",
    trendBg:
      "bg-orange-100 text-orange-700 dark:bg-orange-500/20 dark:text-orange-300",
    bar: "from-orange-400 to-orange-600",
  },
  purple: {
    gradient:
      "from-purple-500/8 to-purple-500/2 dark:from-purple-500/15 dark:to-purple-500/5",
    iconBg: "bg-purple-100 dark:bg-purple-500/20",
    iconText: "text-purple-600 dark:text-purple-400",
    trendBg:
      "bg-purple-100 text-purple-700 dark:bg-purple-500/20 dark:text-purple-300",
    bar: "from-purple-400 to-purple-600",
  },
  cyan: {
    gradient:
      "from-cyan-500/8 to-cyan-500/2 dark:from-cyan-500/15 dark:to-cyan-500/5",
    iconBg: "bg-cyan-100 dark:bg-cyan-500/20",
    iconText: "text-cyan-600 dark:text-cyan-400",
    trendBg: "bg-cyan-100 text-cyan-700 dark:bg-cyan-500/20 dark:text-cyan-300",
    bar: "from-cyan-400 to-cyan-600",
  },
  pink: {
    gradient:
      "from-pink-500/8 to-pink-500/2 dark:from-pink-500/15 dark:to-pink-500/5",
    iconBg: "bg-pink-100 dark:bg-pink-500/20",
    iconText: "text-pink-600 dark:text-pink-400",
    trendBg: "bg-pink-100 text-pink-700 dark:bg-pink-500/20 dark:text-pink-300",
    bar: "from-pink-400 to-pink-600",
  },
  red: {
    gradient:
      "from-red-500/8 to-red-500/2 dark:from-red-500/15 dark:to-red-500/5",
    iconBg: "bg-red-100 dark:bg-red-500/20",
    iconText: "text-red-600 dark:text-red-400",
    trendBg: "bg-red-100 text-red-700 dark:bg-red-500/20 dark:text-red-300",
    bar: "from-red-400 to-red-600",
  },
  amber: {
    gradient:
      "from-amber-500/8 to-amber-500/2 dark:from-amber-500/15 dark:to-amber-500/5",
    iconBg: "bg-amber-100 dark:bg-amber-500/20",
    iconText: "text-amber-600 dark:text-amber-400",
    trendBg:
      "bg-amber-100 text-amber-700 dark:bg-amber-500/20 dark:text-amber-300",
    bar: "from-amber-400 to-amber-600",
  },
  teal: {
    gradient:
      "from-teal-500/8 to-teal-500/2 dark:from-teal-500/15 dark:to-teal-500/5",
    iconBg: "bg-teal-100 dark:bg-teal-500/20",
    iconText: "text-teal-600 dark:text-teal-400",
    trendBg: "bg-teal-100 text-teal-700 dark:bg-teal-500/20 dark:text-teal-300",
    bar: "from-teal-400 to-teal-600",
  },
  indigo: {
    gradient:
      "from-indigo-500/8 to-indigo-500/2 dark:from-indigo-500/15 dark:to-indigo-500/5",
    iconBg: "bg-indigo-100 dark:bg-indigo-500/20",
    iconText: "text-indigo-600 dark:text-indigo-400",
    trendBg:
      "bg-indigo-100 text-indigo-700 dark:bg-indigo-500/20 dark:text-indigo-300",
    bar: "from-indigo-400 to-indigo-600",
  },
};

const defaultAccents: KpiCardData["accent"][] = [
  "blue",
  "emerald",
  "orange",
  "purple",
  "cyan",
  "pink",
  "red",
  "amber",
  "teal",
  "indigo",
];

interface PremiumKpiCardProps {
  card: KpiCardData;
  index?: number;
}

const PremiumKpiCard = ({ card, index = 0 }: PremiumKpiCardProps) => {
  const accent = card.accent || defaultAccents[index % defaultAccents.length]!;
  const styles = accentStyles[accent];
  const Icon = card.icon;
  const trendPositive = card.trend !== undefined ? card.trend >= 0 : undefined;

  return (
    <Card
      className={cn(
        "relative overflow-hidden border-border/50 shadow-md hover:shadow-xl transition-all duration-300 hover:-translate-y-0.5 group",
        `bg-gradient-to-br ${styles.gradient}`,
      )}
    >
      <div
        className={cn(
          "absolute right-0 top-2 bottom-2 w-1 rounded-l-full bg-gradient-to-b opacity-60 group-hover:opacity-100 transition-opacity",
          styles.bar,
        )}
      />

      <div className="p-4 sm:p-5 gap-5 flex justify-between items-start w-full">
        <div
          className={cn(
            "flex h-12 w-12 items-center justify-center rounded-xl shrink-0",
            styles.iconBg,
          )}
        >
          <Icon className={cn("h-5 w-5", styles.iconText)} />
        </div>

        <div className="flex flex-col gap-2 justify-end items-end text-right">
          <h3 className="text-md font-medium whitespace-nowrap overflow-hidden text-ellipsis">
            {card.label}
          </h3>

          <p className="text-2xl font-display font-bold text-foreground leading-tight">
            {card.value}
          </p>
        </div>
      </div>
    </Card>
  );
};

export default PremiumKpiCard;
