"use client";

import { useAuth } from "@/contexts/AuthContext";
import { Badge } from "@/components/ui/badge";
import KpiCards from "@/components/dashboard/KpiCards";
import ChartSection from "@/components/dashboard/ChartSection";
import InfoGrids from "@/components/dashboard/InfoGrids";
import SwitchUserDropdown from "@/components/shared/SwitchUserDropdown";

const Dashboard = () => {
  const { currentUser, proxyUser, proxyLogin, exitProxy } = useAuth();
  const activeUser = proxyUser || currentUser;

  return (
    <div className="space-y-6 animate-fade-in">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div className="min-w-0">
          <h1 className="text-xl sm:text-2xl md:text-3xl font-display font-bold tracking-tight">Dashboard</h1>
          <p className="text-sm sm:text-base text-muted-foreground">
            Welcome back, <span className="font-semibold text-foreground">{activeUser?.name}</span>!{" "}
            <Badge variant="default" className="ml-1 text-[10px]">
              {activeUser?.role}
            </Badge>
          </p>
        </div>
        {proxyUser && (
          <SwitchUserDropdown
            currentProxyUser={proxyUser}
            onSwitchUser={(u) => proxyLogin(u.id)}
            onBackToAdmin={exitProxy}
          />
        )}
      </div>
      <KpiCards />
      <ChartSection />
      <InfoGrids />
    </div>
  );
};

export default Dashboard;
