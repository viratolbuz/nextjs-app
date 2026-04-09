"use client";

/**
 * Animated notification toast that shows when new notifications arrive.
 * Uses framer-motion for smooth entrance/exit animations.
 */
import { useEffect, useRef, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useAppSelector } from '@/store';
import { Bell, X, AlertTriangle, CheckCircle2, Info, XCircle } from 'lucide-react';
import type { Notification } from '@/types';

const typeConfig: Record<string, { icon: typeof Bell; gradient: string; border: string }> = {
  info: { icon: Info, gradient: 'from-info/20 to-info/5', border: 'border-info/40' },
  warning: { icon: AlertTriangle, gradient: 'from-warning/20 to-warning/5', border: 'border-warning/40' },
  success: { icon: CheckCircle2, gradient: 'from-success/20 to-success/5', border: 'border-success/40' },
  error: { icon: XCircle, gradient: 'from-destructive/20 to-destructive/5', border: 'border-destructive/40' },
};

const NotificationToast = () => {
  const notifications = useAppSelector(state => state.notifications.list);
  const [visible, setVisible] = useState<Notification[]>([]);
  const prevCountRef = useRef(notifications.length);

  useEffect(() => {
    if (notifications.length > prevCountRef.current) {
      const newOnes = notifications.slice(0, notifications.length - prevCountRef.current);
      setVisible(prev => [...newOnes, ...prev].slice(0, 3));

      newOnes.forEach(n => {
        setTimeout(() => {
          setVisible(prev => prev.filter(v => v.id !== n.id));
        }, 5000);
      });
    }
    prevCountRef.current = notifications.length;
  }, [notifications.length]);

  const dismiss = (id: string) => {
    setVisible(prev => prev.filter(v => v.id !== id));
  };

  return (
    <div className="fixed top-4 right-4 z-[100] flex flex-col gap-2 pointer-events-none max-w-sm w-full">
      <AnimatePresence mode="popLayout">
        {visible.map(n => {
          const config = typeConfig[n.type] || typeConfig.info;
          const Icon = config.icon;
          return (
            <motion.div
              key={n.id}
              initial={{ opacity: 0, x: 100, scale: 0.9 }}
              animate={{ opacity: 1, x: 0, scale: 1 }}
              exit={{ opacity: 0, x: 100, scale: 0.9, transition: { duration: 0.2 } }}
              transition={{ type: 'spring', stiffness: 400, damping: 30 }}
              className={`pointer-events-auto bg-gradient-to-r ${config.gradient} backdrop-blur-xl border ${config.border} rounded-xl p-4 shadow-xl flex items-start gap-3`}
            >
              <div className="shrink-0 mt-0.5">
                <Icon className="w-5 h-5 text-foreground" />
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium text-foreground leading-snug">{n.message}</p>
                <p className="text-[11px] text-muted-foreground mt-1">{n.time}</p>
              </div>
              <button
                onClick={() => dismiss(n.id)}
                className="shrink-0 p-1 rounded-full hover:bg-muted/50 transition-colors"
              >
                <X className="w-3.5 h-3.5 text-muted-foreground" />
              </button>
            </motion.div>
          );
        })}
      </AnimatePresence>
    </div>
  );
};

export default NotificationToast;
