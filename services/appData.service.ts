import { API_URL, USE_DUMMY } from "@/config/env";
import { developmentDummyData, productionDummyData } from "@/data";
import type {
  Notification,
  PerformanceEntry,
  Platform,
  Project,
  Role,
  User,
} from "@/types";

const getTargetDummyData = () => {
  if (!USE_DUMMY) return developmentDummyData;
  const envName =
    (typeof process !== "undefined" && process.env.NEXT_PUBLIC_ENV) ||
    process.env.NODE_ENV ||
    "development";
  return envName === "production" ? productionDummyData : developmentDummyData;
};

const useDummyData = () => USE_DUMMY;

const apiPlaceholder = <T>(resource: string, fallback: T): T => {
  void `${API_URL.replace(/\/$/, "")}/${resource}`;
  return fallback;
};

export const getUsers = (): User[] =>
  useDummyData()
    ? getTargetDummyData().users
    : apiPlaceholder("users", getTargetDummyData().users);
export const getPlatforms = (): Platform[] =>
  useDummyData()
    ? getTargetDummyData().platforms
    : apiPlaceholder("platforms", getTargetDummyData().platforms);
export const getProjects = (): Project[] =>
  useDummyData()
    ? getTargetDummyData().projects
    : apiPlaceholder("projects", getTargetDummyData().projects);
export const getPerformanceEntries = (): PerformanceEntry[] =>
  useDummyData()
    ? getTargetDummyData().performanceEntries
    : apiPlaceholder("performance", getTargetDummyData().performanceEntries);
export const getRoles = (): Role[] =>
  useDummyData()
    ? getTargetDummyData().roles
    : apiPlaceholder("roles", getTargetDummyData().roles);
export const getNotifications = (): Notification[] =>
  useDummyData()
    ? getTargetDummyData().notifications
    : apiPlaceholder("notifications", getTargetDummyData().notifications);

export const getChartData = () =>
  useDummyData()
    ? getTargetDummyData().chartData
    : apiPlaceholder("dashboard/charts", getTargetDummyData().chartData);
export const getPlatformChartData = () =>
  useDummyData()
    ? getTargetDummyData().platformChartData
    : apiPlaceholder("platforms/charts", getTargetDummyData().platformChartData);
export const getProjectChartData = () =>
  useDummyData()
    ? getTargetDummyData().projectChartData
    : apiPlaceholder("projects/charts", getTargetDummyData().projectChartData);
export const getPlatformActiveUsers = () =>
  useDummyData()
    ? getTargetDummyData().platformActiveUsers
    : apiPlaceholder(
        "platforms/active-users",
        getTargetDummyData().platformActiveUsers,
      );

export const users = getUsers();
export const platforms = getPlatforms();
export const projects = getProjects();
export const performanceEntries = getPerformanceEntries();
export const roles = getRoles();
export const notifications = getNotifications();
export const chartData = getChartData();
export const platformChartData = getPlatformChartData();
export const projectChartData = getProjectChartData();
export const platformActiveUsers = getPlatformActiveUsers();
export const ROLE_DISPLAY_ORDER = getTargetDummyData().ROLE_DISPLAY_ORDER;
export const sortRolesByDisplayOrder = getTargetDummyData().sortRolesByDisplayOrder;

export type { User, Platform, Project, PerformanceEntry, Role, Notification };
