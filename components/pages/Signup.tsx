"use client";

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent } from '@/components/ui/card';
import { useTheme } from '@/contexts/ThemeContext';
import { Moon, Sun, Eye, EyeOff, Upload, CheckCircle2, ShieldAlert } from 'lucide-react';
import { useSearchParams, useRouter } from 'next/navigation';
import { useUserStore, parseInviteToken } from '@/store/userStore';

const Signup = () => {
  const searchParams = useSearchParams();
  const router = useRouter();
  const { theme, toggleTheme } = useTheme();

  const inviteToken = searchParams.get('token');
  const paramEmail = searchParams.get('email')?.trim().toLowerCase() || '';

  const tokenData = parseInviteToken(inviteToken);
  const inviteEmail = tokenData?.email || paramEmail;
  const assignedRole = tokenData?.role || 'User';
  const tokenExpired = tokenData?.expired ?? true;
  const tokenValid = Boolean(tokenData) && !tokenExpired;

  const storeInvite = useUserStore(s => s.getInviteByEmail)(inviteEmail);
  const finalRole = storeInvite?.role || assignedRole;

  const isRegistered = useUserStore(s => s.isEmailRegistered)(inviteEmail);
  const registerUser = useUserStore(s => s.registerUser);

  const [submitted, setSubmitted] = useState(false);
  const [showPw, setShowPw] = useState(false);
  const [showCpw, setShowCpw] = useState(false);
  const [error, setError] = useState('');
  const [formData, setFormData] = useState({
    fullName: '',
    email: inviteEmail,
    password: '',
    confirmPassword: '',
    mobile: '',
    profilePicture: null as File | null,
  });
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);

  const hasInviteParams = Boolean(inviteEmail || inviteToken);

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setFormData(f => ({ ...f, profilePicture: file }));
      setPreviewUrl(URL.createObjectURL(file));
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.fullName.trim()) { setError('Full name is required'); return; }
    if (formData.password.length < 6) { setError('Password must be at least 6 characters'); return; }
    if (formData.password !== formData.confirmPassword) { setError('Passwords do not match'); return; }

    let profilePicBase64: string | null = null;
    if (formData.profilePicture) {
      profilePicBase64 = await new Promise<string>((resolve) => {
        const reader = new FileReader();
        reader.onloadend = () => resolve(reader.result as string);
        reader.readAsDataURL(formData.profilePicture!);
      });
    }

    registerUser({
      fullName: formData.fullName,
      email: formData.email,
      mobile: formData.mobile,
      profilePicture: profilePicBase64,
      password: formData.password,
      role: finalRole,
    });

    setSubmitted(true);
  };

  if (hasInviteParams && isRegistered && !submitted) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background p-4 relative">
        <button onClick={toggleTheme} className="absolute top-4 right-4 p-2 rounded-lg hover:bg-muted">
          {theme === 'light' ? <Moon className="w-5 h-5" /> : <Sun className="w-5 h-5" />}
        </button>
        <Card className="w-full max-w-md shadow-2xl">
          <CardContent className="p-8 text-center space-y-6">
            <div className="w-20 h-20 rounded-full bg-emerald-100 dark:bg-emerald-900/30 flex items-center justify-center mx-auto">
              <CheckCircle2 className="w-10 h-10 text-emerald-600" />
            </div>
            <div>
              <h1 className="text-[28px] font-display font-bold text-foreground">Already Registered</h1>
              <p className="text-sm text-muted-foreground mt-2">
                <span className="font-semibold text-foreground">{inviteEmail}</span> is already registered. You can sign in now.
              </p>
            </div>
            <Button className="w-full" onClick={() => router.push('/login')}>Go to Sign In</Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  if (hasInviteParams && !tokenValid && !submitted) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background p-4 relative">
        <button onClick={toggleTheme} className="absolute top-4 right-4 p-2 rounded-lg hover:bg-muted">
          {theme === 'light' ? <Moon className="w-5 h-5" /> : <Sun className="w-5 h-5" />}
        </button>
        <Card className="w-full max-w-md shadow-2xl">
          <CardContent className="p-8 text-center space-y-6">
            <div className="w-20 h-20 rounded-full bg-red-100 dark:bg-red-900/30 flex items-center justify-center mx-auto">
              <ShieldAlert className="w-10 h-10 text-red-600" />
            </div>
            <div>
              <h1 className="text-[28px] font-display font-bold text-foreground">Invalid Invitation</h1>
              <p className="text-sm text-muted-foreground mt-2">
                This signup link is invalid or expired. Please contact your admin for a new invitation.
              </p>
            </div>
            <Button variant="outline" className="w-full" onClick={() => router.push('/login')}>Back to Sign In</Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  if (!hasInviteParams && !submitted) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background p-4 relative">
        <button onClick={toggleTheme} className="absolute top-4 right-4 p-2 rounded-lg hover:bg-muted">
          {theme === 'light' ? <Moon className="w-5 h-5" /> : <Sun className="w-5 h-5" />}
        </button>
        <Card className="w-full max-w-md shadow-2xl">
          <CardContent className="p-8 text-center space-y-6">
            <div className="w-20 h-20 rounded-full bg-blue-100 dark:bg-blue-900/30 flex items-center justify-center mx-auto">
              <ShieldAlert className="w-10 h-10 text-blue-600" />
            </div>
            <div>
              <h1 className="text-[28px] font-display font-bold text-foreground">Invitation Required</h1>
              <p className="text-sm text-muted-foreground mt-2">You need a valid invitation link to sign up.</p>
            </div>
            <Button variant="outline" className="w-full" onClick={() => router.push('/login')}>Back to Sign In</Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  if (submitted) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background p-4 relative">
        <button onClick={toggleTheme} className="absolute top-4 right-4 p-2 rounded-lg hover:bg-muted">
          {theme === 'light' ? <Moon className="w-5 h-5" /> : <Sun className="w-5 h-5" />}
        </button>
        <Card className="w-full max-w-md shadow-2xl">
          <CardContent className="p-8 text-center space-y-6">
            <div className="relative mx-auto w-24 h-24">
              <div className="absolute inset-0 rounded-full border-4 border-emerald-400 animate-pulse" />
              <div className="absolute inset-2 rounded-full bg-emerald-100 dark:bg-emerald-900/30 flex items-center justify-center">
                <CheckCircle2 className="w-10 h-10 text-emerald-600" />
              </div>
            </div>
            <div>
              <h1 className="text-[28px] font-display font-bold text-foreground">Account Created!</h1>
              <p className="text-sm text-muted-foreground mt-2">
                Your account is <span className="font-bold text-emerald-600">active</span> with the <span className="font-bold text-foreground">{finalRole}</span> role.
              </p>
            </div>
            <div className="space-y-2">
              <div className="flex items-center gap-2 text-sm text-muted-foreground">
                <CheckCircle2 className="w-4 h-4 text-emerald-500" /><span>Account created</span>
              </div>
              <div className="flex items-center gap-2 text-sm text-muted-foreground">
                <CheckCircle2 className="w-4 h-4 text-emerald-500" /><span>Role: <strong>{finalRole}</strong></span>
              </div>
              <div className="flex items-center gap-2 text-sm text-emerald-600">
                <CheckCircle2 className="w-4 h-4" /><span className="font-bold">Ready to sign in</span>
              </div>
            </div>
            <Button className="w-full" onClick={() => router.push('/login')}>Sign In Now</Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-background p-4 relative">
      <button onClick={toggleTheme} className="absolute top-4 right-4 p-2 rounded-lg hover:bg-muted">
        {theme === 'light' ? <Moon className="w-5 h-5" /> : <Sun className="w-5 h-5" />}
      </button>

      <Card className="w-full max-w-md shadow-2xl">
        <CardContent className="p-8">
          <div className="text-center mb-6">
            <div className="w-16 h-16 rounded-2xl bg-primary flex items-center justify-center text-primary-foreground font-bold text-2xl mx-auto mb-4 font-display">A</div>
            <h1 className="text-[28px] font-display font-bold">Create Your Account</h1>
            <p className="text-sm text-muted-foreground mt-1">Complete your profile to get started</p>
            <p className="text-[13px] text-primary font-semibold mt-2">You'll be assigned the <strong>{finalRole}</strong> role</p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="flex justify-center">
              <label className="relative cursor-pointer group">
                <div className="w-20 h-20 rounded-full bg-muted border-2 border-dashed border-border flex items-center justify-center overflow-hidden group-hover:border-primary transition-colors">
                  {previewUrl ? (
                    <img src={previewUrl} alt="Profile" className="w-full h-full object-cover" />
                  ) : (
                    <Upload className="w-6 h-6 text-muted-foreground group-hover:text-primary transition-colors" />
                  )}
                </div>
                <input type="file" accept="image/*" className="hidden" onChange={handleImageChange} />
                <span className="text-[12px] text-muted-foreground block text-center mt-1">Upload Photo</span>
              </label>
            </div>

            <div>
              <label className="text-[14px] font-bold mb-1 block">Full Name <span className="text-destructive">*</span></label>
              <Input value={formData.fullName} onChange={e => { setFormData(f => ({ ...f, fullName: e.target.value })); setError(''); }} placeholder="Enter your full name" />
            </div>

            <div>
              <label className="text-[14px] font-bold mb-1 block">Email <span className="text-destructive">*</span></label>
              <Input type="email" value={formData.email} readOnly className="bg-muted cursor-not-allowed" />
              <p className="text-[12px] text-muted-foreground mt-0.5">Email is set from your invitation link</p>
            </div>

            <div>
              <label className="text-[14px] font-bold mb-1 block">Password <span className="text-destructive">*</span></label>
              <div className="relative">
                <Input type={showPw ? 'text' : 'password'} value={formData.password} onChange={e => { setFormData(f => ({ ...f, password: e.target.value })); setError(''); }} placeholder="Min 6 characters" />
                <button type="button" onClick={() => setShowPw(!showPw)} className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground">
                  {showPw ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
            </div>

            <div>
              <label className="text-[14px] font-bold mb-1 block">Confirm Password <span className="text-destructive">*</span></label>
              <div className="relative">
                <Input type={showCpw ? 'text' : 'password'} value={formData.confirmPassword} onChange={e => { setFormData(f => ({ ...f, confirmPassword: e.target.value })); setError(''); }} placeholder="Re-enter password" />
                <button type="button" onClick={() => setShowCpw(!showCpw)} className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground">
                  {showCpw ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
            </div>

            <div>
              <label className="text-[14px] font-bold mb-1 block">Mobile Number</label>
              <Input value={formData.mobile} onChange={e => setFormData(f => ({ ...f, mobile: e.target.value }))} placeholder="+91 98765 43210" />
            </div>

            {error && <p className="text-sm text-destructive font-medium">{error}</p>}

            <Button type="submit" className="w-full">Sign Up</Button>
          </form>

          <p className="text-[13px] text-muted-foreground text-center mt-4">
            Already have an account?{' '}
            <button onClick={() => router.push('/login')} className="text-primary font-semibold hover:underline">Sign In</button>
          </p>
        </CardContent>
      </Card>
    </div>
  );
};

export default Signup;