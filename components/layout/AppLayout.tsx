"use client";

import { ReactNode, useState, useRef, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Sidebar } from './Sidebar';
import { useAuth } from '@/contexts/AuthContext';
import { useTheme } from '@/contexts/ThemeContext';
import { useAppSelector, useAppDispatch } from '@/store';
import { markAllAsRead } from '@/store/slices/notificationsSlice';
import { Bell, Moon, Sun, Menu } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Sheet, SheetContent } from '@/components/ui/sheet';
import NotificationToast from '@/components/shared/NotificationToast';

export const AppLayout = ({ children }: { children: ReactNode }) => {
  const { proxyUser, exitProxy, currentUser } = useAuth();
  const { theme, toggleTheme } = useTheme();
  const router = useRouter();
  const dispatch = useAppDispatch();
  const notifications = useAppSelector(state => state.notifications.list);
  const [showNotifs, setShowNotifs] = useState(false);
  const [mobileNavOpen, setMobileNavOpen] = useState(false);
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
    <div className="flex h-screen bg-background overflow-hidden">
      <Sidebar className="hidden md:flex" />
      <Sheet open={mobileNavOpen} onOpenChange={setMobileNavOpen}>
        <SheetContent side="left" className="p-0 w-[min(100vw,280px)] sm:max-w-[280px] border-r-0 overflow-y-auto">
          <Sidebar inDrawer onNavigate={() => setMobileNavOpen(false)} />
        </SheetContent>
      </Sheet>
      <NotificationToast />
      <div className="flex-1 flex flex-col min-w-0">
           <header className="sticky top-0 z-30 bg-background/80 backdrop-blur border-b border-border px-4 sm:px-6 py-3 flex flex-wrap items-center gap-2 sm:gap-4">
          <Button
            type="button"
            variant="outline"
            size="icon"
            className="md:hidden shrink-0 h-9 w-9 touch-manipulation"
            aria-label="Open menu"
            onClick={() => setMobileNavOpen(true)}
          >
            <Menu className="w-5 h-5" />
          </Button>
          <div className="flex-1 flex items-center gap-3 min-w-0">
        </div>
          {showDashboardDateRange && (
            <DateRangePicker compact className="h-9 text-xs shrink-0 w-full max-w-[220px] sm:w-auto" />
          )}
          <button type="button" onClick={toggleTheme} className="p-2 rounded-lg hover:bg-muted transition-colors shrink-0 touch-manipulation" title="Toggle theme">
            {theme === 'light' ? <Moon className="w-5 h-5" /> : <Sun className="w-5 h-5" />}
          </button>
          <div className="relative shrink-0" ref={notifRef}>
            <button type="button" onClick={() => setShowNotifs(!showNotifs)} className="relative p-2 rounded-lg hover:bg-muted transition-colors touch-manipulation">
              <Bell className="w-5 h-5" />
              {unread > 0 && (
                <span className="absolute -top-0.5 -right-0.5 w-4 h-4 bg-destructive text-destructive-foreground rounded-full text-[12px] flex items-center justify-center">{unread}</span>
              )}
            </button>
            {showNotifs && (
              <div className="absolute right-0 top-12 w-[min(calc(100vw-2rem),24rem)] max-w-sm bg-card border border-border rounded-xl shadow-xl z-50">
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
            type="button"
            onClick={() => router.push('/settings')}
            className="flex items-center gap-2 p-1.5 rounded-lg hover:bg-muted transition-colors shrink-0 touch-manipulation"
          >
            <div className="w-8 h-8 rounded-full bg-primary flex items-center justify-center text-primary-foreground text-xs font-bold">
              {currentUser?.avatar || 'U'}
            </div>
          </button>
        </header>
        <main className="flex-1 p-4 sm:p-5 md:p-6 overflow-x-hidden overflow-y-auto scrollbar-themed max-w-full">
          {children}
        </main>
      </div>
    </div>
  );
};
