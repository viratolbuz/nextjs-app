"use client";

import { useState } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { useAuth } from '@/contexts/AuthContext';
import { useTheme } from '@/contexts/ThemeContext';
import { Moon, Sun, Save, Camera, Mail, Phone, Building, User } from 'lucide-react';
import { toast } from '@/hooks/use-toast';

const SettingsPage = () => {
  const { currentUser } = useAuth();
  const { theme, toggleTheme } = useTheme();
  const [profile, setProfile] = useState({
    name: currentUser?.name || '',
    email: currentUser?.email || '',
    phone: currentUser?.phone || '',
    department: currentUser?.department || '',
  });

  const handleSave = () => {
    toast({ title: 'Profile Updated', description: 'Your profile details have been saved successfully.' });
  };

  return (
    <div className="space-y-6 animate-fade-in max-w-3xl">
      <div>
        <h1 className="text-[28px] font-display font-bold">Profile & Settings</h1>
        <p className="text-[15px] text-muted-foreground">Manage your account details and preferences</p>
      </div>

      {/* Profile Card */}
      <Card>
        <CardContent className="p-6">
          <h3 className="font-semibold mb-6">Profile Information</h3>
          <div className="flex items-start gap-6 mb-6">
            <div className="relative">
              <div className="w-20 h-20 rounded-full bg-primary flex items-center justify-center text-primary-foreground text-2xl font-bold">
                {currentUser?.avatar || 'U'}
              </div>
              <button className="absolute -bottom-1 -right-1 w-7 h-7 rounded-full bg-card border border-border flex items-center justify-center hover:bg-muted transition-colors">
                <Camera className="w-3.5 h-3.5" />
              </button>
            </div>
            <div>
              <p className="font-display font-bold text-lg">{currentUser?.name}</p>
              <p className="text-[15px] text-muted-foreground">{currentUser?.role}</p>
              <p className="text-[13px] text-muted-foreground mt-1">{currentUser?.email}</p>
            </div>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="text-[14px] font-semibold mb-1.5 flex items-center gap-1.5"><User className="w-3.5 h-3.5" /> Full Name</label>
              <Input value={profile.name} onChange={e => setProfile(p => ({ ...p, name: e.target.value }))} />
            </div>
            <div>
              <label className="text-[14px] font-semibold mb-1.5 flex items-center gap-1.5"><Mail className="w-3.5 h-3.5" /> Email</label>
              <Input value={profile.email} onChange={e => setProfile(p => ({ ...p, email: e.target.value }))} />
            </div>
            <div>
              <label className="text-[14px] font-semibold mb-1.5 flex items-center gap-1.5"><Phone className="w-3.5 h-3.5" /> Phone</label>
              <Input value={profile.phone} onChange={e => setProfile(p => ({ ...p, phone: e.target.value }))} />
            </div>
            <div>
              <label className="text-[14px] font-semibold mb-1.5 flex items-center gap-1.5"><Building className="w-3.5 h-3.5" /> Department</label>
              <Input value={profile.department} onChange={e => setProfile(p => ({ ...p, department: e.target.value }))} />
            </div>
          </div>
          <Button className="mt-6" onClick={handleSave}><Save className="w-4 h-4 mr-1" />Save Changes</Button>
        </CardContent>
      </Card>

      {/* Password Change */}
      <Card>
        <CardContent className="p-6">
          <h3 className="font-semibold mb-4">Change Password</h3>
          <div className="space-y-4 max-w-sm">
            <div><label className="text-[14px] font-semibold mb-1 block">Current Password</label><Input type="password" placeholder="••••••••" /></div>
            <div><label className="text-[14px] font-semibold mb-1 block">New Password</label><Input type="password" placeholder="••••••••" /></div>
            <div><label className="text-[14px] font-semibold mb-1 block">Confirm New Password</label><Input type="password" placeholder="••••••••" /></div>
          </div>
          <Button className="mt-4" variant="outline">Update Password</Button>
        </CardContent>
      </Card>

      {/* Theme */}
      <Card>
        <CardContent className="p-6">
          <h3 className="font-semibold mb-4">Appearance</h3>
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium">Theme</p>
              <p className="text-[13px] text-muted-foreground">{theme === 'light' ? 'Olbuz Light (Burnt Orange)' : 'AdtoRise Dark (Coral Pink + Midnight Navy)'}</p>
            </div>
            <Button variant="outline" onClick={toggleTheme}>
              {theme === 'light' ? <Moon className="w-4 h-4 mr-2" /> : <Sun className="w-4 h-4 mr-2" />}
              {theme === 'light' ? 'Dark Mode' : 'Light Mode'}
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default SettingsPage;
