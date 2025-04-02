// app/auth/login/page.tsx
'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation'; // Use next/navigation
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Checkbox } from "@/components/ui/checkbox";
import Link from 'next/link';
import api from '@/lib/api';
import { useAuth } from '@/lib/context/AuthContext';
import { toast } from "sonner"; // Use sonner
import { Eye, EyeOff, Loader2 } from 'lucide-react'; // Import icons

export default function LoginPage() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [rememberMe, setRememberMe] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const { login } = useAuth();
  const router = useRouter();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    try {
      const response = await api.post('/auth/login', { email, password });
      login(response.data.access_token, response.data.user); // Pass user data too
      toast.success("Login Successful!");
      router.push('/dashboard'); // Redirect to dashboard after login
    } catch (error: any) {
      console.error("Login failed:", error);
      const errorMessage = error.response?.data?.message || "Login failed. Please check your credentials.";
      toast.error(errorMessage);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Card className="w-full max-w-sm bg-white/10 backdrop-blur-md border border-white/20 text-white">
      <CardHeader>
        <div className="flex items-center justify-between mb-4">
            {/* Replace with actual logo if available */}
             <span className="text-2xl font-bold bg-gradient-to-r from-cyan-400 to-blue-500 text-transparent bg-clip-text">dbirr</span>
             <CardTitle className="text-xl font-semibold">Login</CardTitle>
         </div>
         <CardDescription className="text-gray-300">Enter your credentials to access your account.</CardDescription>
      </CardHeader>
      <form onSubmit={handleSubmit}>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="email">Email</Label>
            <Input
              id="email"
              type="email"
              placeholder="m@example.com"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="bg-white/10 border-white/30 placeholder-gray-400 text-white focus:ring-cyan-500 focus:border-cyan-500"
            />
          </div>
          <div className="space-y-2 relative">
            <div className="flex items-center justify-between">
              <Label htmlFor="password">Password</Label>
              <Link href="/auth/forgot-password" // Add forgot password page later
                  className="text-sm font-medium text-cyan-400 hover:underline">
                 Forgot password?
               </Link>
            </div>
            <Input
              id="password"
              type={showPassword ? "text" : "password"}
              required
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="bg-white/10 border-white/30 placeholder-gray-400 text-white focus:ring-cyan-500 focus:border-cyan-500 pr-10" // Add padding for icon
            />
             <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-2 top-[calc(50%+8px)] -translate-y-1/2 text-gray-400 hover:text-white" // Adjust positioning
                aria-label={showPassword ? "Hide password" : "Show password"}
             >
                {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
             </button>
          </div>
           {/* <div className="flex items-center space-x-2">
             <Checkbox
               id="remember-me"
               checked={rememberMe}
               onCheckedChange={(checked) => setRememberMe(Boolean(checked))}
               className="border-white/50 data-[state=checked]:bg-cyan-500 data-[state=checked]:text-white"
             />
             <Label htmlFor="remember-me" className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70">
               Remember Me
             </Label>
           </div> */}
        </CardContent>
        <CardFooter className="flex flex-col space-y-3">
          <Button type="submit" className="w-full bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-600 hover:to-blue-700 text-white" disabled={isLoading}>
            {isLoading ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : "Login"}
          </Button>
          <Button variant="outline" className="w-full bg-transparent border-white/50 hover:bg-white/10 text-white" asChild>
             <Link href="/auth/register">Don't have an account? Register</Link>
           </Button>
        </CardFooter>
      </form>
    </Card>
  );
}