"use client";

import { ReactNode, useState, useRef, useEffect } from 'react';
import { useRouter, usePathname } from 'next/navigation';
import { DateRangePicker } from '@/contexts/DateRangeContext';
import { Sidebar } from './Sidebar';
import { useAuth } from '@/contexts/AuthContext';
import { useTheme } from '@/contexts/ThemeContext';
import { useAppSelector, useAppDispatch } from '@/store';
import { markAllAsRead } from '@/store/slices/notificationsSlice';
import { Bell, Search, Moon, Sun } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import NotificationToast from '@/components/shared/NotificationToast';

export const AppLayout = ({ children }: { children: ReactNode }) => {
  const { proxyUser, exitProxy, currentUser } = useAuth();
  const { theme, toggleTheme } = useTheme();
  const router = useRouter();
  const pathname = usePathname();
  const showDashboardDateRange = pathname === '/dashboard';
  const dispatch = useAppDispatch();
  const notifications = useAppSelector(state => state.notifications.list);
  const [showNotifs, setShowNotifs] = useState(false);
  const notifRef = useRef<HTMLDivElement>(null);
  const unread = notifications.filter(n => !n.read).length;

  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (notifRef.current && !notifRef.current.contains(e.target as Node)) setShowNotifs(false);
    };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, []);

  const typeIcon = (type: string) => {
    switch (type) {
      case 'warning': return '⚠️';
      case 'error': return '🔴';
      case 'success': return '✅';
      default: return 'ℹ️';
    }
  };

  return (
    <div className="flex min-h-screen bg-background">
      <Sidebar />
      <NotificationToast />
      <div className="flex-1 flex flex-col min-w-0">
        {proxyUser && (
          <div className="bg-warning text-warning-foreground px-4 py-2 text-sm flex items-center justify-between">
            <span>👁 Viewing as <strong>{proxyUser.name}</strong> ({proxyUser.role})</span>
            <button onClick={exitProxy} className="underline font-medium">Exit Proxy</button>
          </div>
        )}
        <header className="sticky top-0 z-30 bg-background/80 backdrop-blur border-b border-border px-6 py-3 flex items-center gap-4">
          <div className="flex-1 flex items-center gap-3">
            {/* <div className="relative max-w-md flex-1">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
              <input
                type="text"
                placeholder="Search projects, users, platforms..."
                className="w-full pl-10 pr-4 py-2 rounded-lg bg-muted border-0 text-sm focus:outline-none focus:ring-2 focus:ring-ring"
              />
            </div> */}
          </div>
          {showDashboardDateRange && (
            <DateRangePicker compact className="h-9 text-xs shrink-0 max-w-[220px]" />
          )}
          <button onClick={toggleTheme} className="p-2 rounded-lg hover:bg-muted transition-colors" title="Toggle theme">
            {theme === 'light' ? <Moon className="w-5 h-5" /> : <Sun className="w-5 h-5" />}
          </button>
          <div className="relative" ref={notifRef}>
            <button onClick={() => setShowNotifs(!showNotifs)} className="relative p-2 rounded-lg hover:bg-muted transition-colors">
              <Bell className="w-5 h-5" />
              {unread > 0 && (
                <span className="absolute -top-0.5 -right-0.5 w-4 h-4 bg-destructive text-destructive-foreground rounded-full text-[12px] flex items-center justify-center">{unread}</span>
              )}
            </button>
            {showNotifs && (
              <div className="absolute right-0 top-12 w-96 bg-card border border-border rounded-xl shadow-xl z-50">
                <div className="p-3 border-b border-border flex items-center justify-between">
                  <h3 className="font-display font-semibold text-sm">Notifications</h3>
                  <Badge variant="secondary" className="text-[12px]">{unread} unread</Badge>
                </div>
                <div className="max-h-80 overflow-y-auto scrollbar-themed">
                  {notifications.map(n => (
                    <div key={n.id} className={`p-3 border-b border-border last:border-0 text-sm flex items-start gap-2 ${!n.read ? 'bg-muted/50' : ''}`}>
                      <span className="text-base mt-0.5">{typeIcon(n.type)}</span>
                      <div className="flex-1">
                        <p className="text-sm">{n.message}</p>
                        <p className="text-xs text-muted-foreground mt-1">{n.time}</p>
                      </div>
                      {!n.read && <div className="w-2 h-2 rounded-full bg-primary mt-1.5 shrink-0" />}
                    </div>
                  ))}
                </div>
                <div className="p-2 border-t border-border text-center">
                  <button onClick={() => dispatch(markAllAsRead())} className="text-xs text-primary hover:underline">Mark all as read</button>
                </div>
              </div>
            )}
          </div>
          <button
            onClick={() => router.push('/settings')}
            className="flex items-center gap-2 p-1.5 rounded-lg hover:bg-muted transition-colors"
          >
            <div className="w-8 h-8 rounded-full bg-primary flex items-center justify-center text-primary-foreground text-xs font-bold">
              {currentUser?.avatar || 'U'}
            </div>
          </button>
        </header>
        <main className="flex-1 p-6 overflow-auto scrollbar-themed">
          {children}
        </main>
      </div>
    </div>
  );
};
