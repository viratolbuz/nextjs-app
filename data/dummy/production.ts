import type {
  Notification,
  PerformanceEntry,
  Platform,
  Project,
  Role,
  User,
} from "@/types";
import {
  ROLE_DISPLAY_ORDER,
  chartData as baseChartData,
  notifications as baseNotifications,
  performanceEntries as basePerformanceEntries,
  platformActiveUsers as basePlatformActiveUsers,
  platformChartData as basePlatformChartData,
  platforms as basePlatforms,
  projectChartData as baseProjectChartData,
  projects as baseProjects,
  roles as baseRoles,
  sortRolesByDisplayOrder,
  users as baseUsers,
} from "@/data/mockData";

const productionUsers: User[] = [
  ...baseUsers.map((u, index) => ({
    ...u,
    id: `p-${u.id}`,
    name: `${u.name} Pro`,
    email: u.email.replace("@adtorise.com", "@prod-adtorise.com"),
    avatar: u.avatar,
    projects: Math.max(1, u.projects + (index % 3)),
    lastLogin: index % 2 === 0 ? "Today" : "Yesterday",
  })),
  {
    id: "p-501",
    name: "Nora Blake",
    email: "nora.blake@prod-adtorise.com",
    role: "Manager",
    avatar: "NB",
    projects: 9,
    status: "Active",
    lastLogin: "Today",
    phone: "+91 90000 11111",
    department: "Management",
  },
  {
    id: "p-502",
    name: "Dev Patel",
    email: "dev.patel@prod-adtorise.com",
    role: "User",
    avatar: "DP",
    projects: 5,
    status: "Pending",
    lastLogin: "Never",
    phone: "+91 90000 22222",
    department: "Operations",
  },
];

const productionPlatforms: Platform[] = [
  ...basePlatforms.map((p, index) => ({
    ...p,
    id: `p-${p.id}`,
    spendMTD: p.spendMTD,
    avgROAS: p.avgROAS,
    projects: p.projects + (index % 4),
  })),
  {
    id: "p-901",
    name: "LinkedIn Ads",
    icon: "in",
    channels: ["Lead Gen", "Sponsored Content"],
    status: "Connected",
    projects: 11,
    spendMTD: "₹9.8L",
    avgROAS: "3.4x",
    color: "hsl(var(--chart-4))",
  },
  {
    id: "p-902",
    name: "TikTok Ads",
    icon: "t",
    channels: ["In-Feed", "Spark Ads"],
    status: "Expiring",
    projects: 7,
    spendMTD: "₹7.1L",
    avgROAS: "3.1x",
    color: "hsl(var(--chart-5))",
    tokenExpiry: "5 days",
  },
];

const productionProjects: Project[] = baseProjects.map((p, index) => {
  const platformMix =
    index % 5 === 0
      ? ["Google Ads", "Meta Ads", "LinkedIn Ads"]
      : index % 7 === 0
        ? ["Google Ads", "TikTok Ads"]
        : p.platforms;

  return {
    ...p,
    id: `p-${p.id}`,
    name: `${p.name} Pro`,
    client: `${p.client} Global`,
    manager: productionUsers[index % productionUsers.length]?.name ?? p.manager,
    platforms: platformMix,
    updatedAt: "2026-04-08",
  };
});

const productionPerformanceEntries: PerformanceEntry[] = basePerformanceEntries.map(
  (e, index) => ({
    ...e,
    id: `p-${e.id}`,
    project: productionProjects[index % productionProjects.length]?.name ?? e.project,
    platform:
      index % 5 === 0
        ? "LinkedIn Ads"
        : index % 7 === 0
          ? "TikTok Ads"
          : e.platform,
  }),
);

const productionRoles: Role[] = baseRoles.map((r) => ({ ...r }));

const productionNotifications: Notification[] = [
  ...baseNotifications.map((n, index) => ({
    ...n,
    id: `p-${n.id}`,
    message:
      index % 2 === 0
        ? `Production: ${n.message}`
        : `Live Account: ${n.message}`,
  })),
];

const productionChartData = {
  ...baseChartData,
  platformSpendShare: [
    { name: "Google Ads", value: 42, spend: "₹24.2L" },
    { name: "Meta Ads", value: 30, spend: "₹17.3L" },
    { name: "LinkedIn Ads", value: 18, spend: "₹10.4L" },
    { name: "TikTok Ads", value: 10, spend: "₹5.9L" },
  ],
};

const productionPlatformChartData = {
  ...basePlatformChartData,
};

const productionProjectChartData = {
  ...baseProjectChartData,
};

const productionPlatformActiveUsers: Record<string, number> = {
  ...basePlatformActiveUsers,
  "LinkedIn Ads": 4,
  "TikTok Ads": 3,
};

export const productionDummyData = {
  users: productionUsers,
  platforms: productionPlatforms,
  projects: productionProjects,
  performanceEntries: productionPerformanceEntries,
  roles: productionRoles,
  notifications: productionNotifications,
  chartData: productionChartData,
  platformChartData: productionPlatformChartData,
  projectChartData: productionProjectChartData,
  platformActiveUsers: productionPlatformActiveUsers,
  ROLE_DISPLAY_ORDER,
  sortRolesByDisplayOrder,
};
