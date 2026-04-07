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
      <div className="flex items-center justify-between flex-wrap gap-3">
        <div>
          <h1 className="text-2xl font-display font-bold">Dashboard</h1>
          <p className="text-sm text-muted-foreground">
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
