"use client";

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Users, Search, ArrowLeft } from 'lucide-react';
import { users } from '@/services/appData.service';
import type { User } from '@/services/appData.service';

interface Props {
  currentProxyUser: User;
  onSwitchUser: (user: User) => void;
  onBackToAdmin: () => void;
}

const SwitchUserDropdown = ({ currentProxyUser, onSwitchUser, onBackToAdmin }: Props) => {
  const [open, setOpen] = useState(false);
  const [search, setSearch] = useState('');

  const filtered = users.filter(u =>
    u.id !== currentProxyUser.id &&
    (u.name.toLowerCase().includes(search.toLowerCase()) || u.email.toLowerCase().includes(search.toLowerCase()))
  );

  return (
    <div className="flex items-center gap-3">
      <div className="flex items-center gap-2">
        <p className="text-sm text-muted-foreground">
          Viewing as <strong className="text-foreground">{currentProxyUser.name}</strong>
        </p>
        <Badge variant="outline">{currentProxyUser.role}</Badge>
      </div>

      <Popover open={open} onOpenChange={setOpen}>
        <PopoverTrigger asChild>
          <Button size="sm" className="bg-primary text-primary-foreground hover:bg-primary/90 rounded-full px-4">
            <Users className="w-4 h-4 mr-1.5" />
            Switch User
          </Button>
        </PopoverTrigger>
        <PopoverContent className="w-[320px] p-0" align="end">
          <div className="p-3 border-b border-border">
            <div className="flex items-center gap-2 mb-2">
              <Users className="w-4 h-4 text-muted-foreground" />
              <span className="text-sm font-semibold">Select User to Switch To</span>
            </div>
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-muted-foreground" />
              <Input
                placeholder="Search users..."
                value={search}
                onChange={e => setSearch(e.target.value)}
                className="pl-9 h-9 text-sm"
              />
            </div>
          </div>
          <div className="max-h-[280px] overflow-y-auto">
            {filtered.map(u => (
              <button
                key={u.id}
                onClick={() => { onSwitchUser(u); setOpen(false); setSearch(''); }}
                className="w-full flex items-center gap-3 px-3 py-2.5 hover:bg-muted/50 transition-colors text-left border-b border-border/50 last:border-0"
              >
                <div className="w-8 h-8 rounded-full bg-muted flex items-center justify-center text-xs font-bold shrink-0">
                  {u.avatar}
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium truncate">{u.name}</p>
                  <p className="text-xs text-muted-foreground truncate">{u.email}</p>
                </div>
                <Badge variant="secondary" className="text-[12px] shrink-0">{u.role}</Badge>
              </button>
            ))}
          </div>
        </PopoverContent>
      </Popover>

      <Button size="sm" variant="outline" onClick={onBackToAdmin} className="rounded-full">
        <ArrowLeft className="w-3.5 h-3.5 mr-1" />
        Admin Dashboard
      </Button>
    </div>
  );
};

export default SwitchUserDropdown;
