"use client";

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/contexts/AuthContext';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent } from '@/components/ui/card';
import { useTheme } from '@/contexts/ThemeContext';
import { Moon, Sun, Eye, EyeOff } from 'lucide-react';

const Login = () => {
  const router = useRouter();
  const [email, setEmail] = useState('super-admin@adtorise.com');
  const [password, setPassword] = useState('admin123');
  const [showPw, setShowPw] = useState(false);
  const [error, setError] = useState('');
  const { login, isLoggedIn } = useAuth();
  const { theme, toggleTheme } = useTheme();

  useEffect(() => {
    if (isLoggedIn) router.replace("/dashboard");
  }, [isLoggedIn, router]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!email || !password) { setError('Please fill in all fields'); return; }

    const success = login(email.trim(), password);
    if (!success) {
      setError('Invalid email or password.');
      return;
    }

    router.replace('/dashboard');
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-background p-4 relative">
      <button onClick={toggleTheme} className="absolute top-4 right-4 p-2 rounded-lg hover:bg-muted">
        {theme === 'light' ? <Moon className="w-5 h-5" /> : <Sun className="w-5 h-5" />}
      </button>

      <Card className="w-full max-w-md shadow-2xl">
        <CardContent className="p-8">
          <div className="text-center mb-8">
            <div className="w-16 h-16 rounded-2xl bg-primary flex items-center justify-center text-primary-foreground font-bold text-2xl mx-auto mb-4 font-display">
              A
            </div>
            <h1 className="text-[28px] font-display font-bold">AdtoRise PMS</h1>
            <p className="text-[15px] text-muted-foreground mt-1">Performance Management System</p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="text-[14px] font-semibold mb-1.5 block">Email</label>
              <Input
                type="email"
                value={email}
                onChange={e => { setEmail(e.target.value); setError(''); }}
                placeholder="your@email.com"
              />
            </div>
            <div>
              <label className="text-[14px] font-semibold mb-1.5 block">Password</label>
              <div className="relative">
                <Input
                  type={showPw ? 'text' : 'password'}
                  value={password}
                  onChange={e => { setPassword(e.target.value); setError(''); }}
                  placeholder="••••••••"
                />
                <button type="button" onClick={() => setShowPw(!showPw)} className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground">
                  {showPw ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
            </div>

            {error && (
              <p className="text-sm text-destructive font-medium">{error}</p>
            )}

            <Button type="submit" className="w-full">Sign In</Button>
          </form>

          <p className="text-[13px] text-muted-foreground text-center mt-6">
            Demo: Use pre-filled credentials to log in
          </p>
        </CardContent>
      </Card>
    </div>
  );
};

export default Login;