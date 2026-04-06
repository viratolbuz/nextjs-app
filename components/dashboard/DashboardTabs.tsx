"use client";

import { Users, Globe, FolderKanban } from 'lucide-react';
import GlassTabs from '@/components/shared/GlassTabs';

interface DashboardTabsProps {
  activeTab: 'users' | 'platforms' | 'projects';
  onChange: (tab: 'users' | 'platforms' | 'projects') => void;
}

const tabs = [
  { key: 'users' as const, label: 'Team Reports', icon: Users },
  { key: 'platforms' as const, label: 'Platform Reports', icon: Globe },
  { key: 'projects' as const, label: 'Project Reports', icon: FolderKanban },
];

const DashboardTabs = ({ activeTab, onChange }: DashboardTabsProps) => {
  return (
    <div className="flex justify-center">
      <GlassTabs
        tabs={tabs}
        activeTab={activeTab}
        onChange={(key) => onChange(key as 'users' | 'platforms' | 'projects')}
      />
    </div>
  );
};

export default DashboardTabs;
