// app/auth/register/page.tsx
'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import Link from 'next/link';
import api from '@/lib/api';
import { toast } from "sonner";
import { Eye, EyeOff, Loader2 } from 'lucide-react';

export default function RegisterPage() {
  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [walletAddress, setWalletAddress] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const router = useRouter();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    try {
      // Basic Solana address validation (length) - add more robust validation if needed
      if (walletAddress.length < 32 || walletAddress.length > 44) {
          toast.error("Please enter a valid Solana wallet address.");
          setIsLoading(false);
          return;
      }

      await api.post('/auth/register', {
        firstName,
        lastName,
        email,
        password,
        walletAddress,
      });
      toast.success("Registration Successful! Please log in.");
      router.push('/auth/login'); // Redirect to login after registration
    } catch (error: any) {
      console.error("Registration failed:", error);
      const errorMessage = error.response?.data?.message || "Registration failed. Please try again.";
      toast.error(errorMessage);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Card className="w-full bg-white/95 dark:bg-neutral-950/95 shadow-xl border-0">
      <CardHeader className="space-y-4">
        <div className="flex items-center justify-between">
          <span className="text-2xl font-bold bg-gradient-to-r from-cyan-400 to-blue-500 text-transparent bg-clip-text">dbirr</span>
          <CardTitle className="text-xl font-semibold">Register</CardTitle>
        </div>
        <CardDescription className="text-muted-foreground">Create your merchant account.</CardDescription>
      </CardHeader>
      <form onSubmit={handleSubmit}>
        <CardContent className="space-y-4">
          {/* First Name */}
          <div className="space-y-2">
            <Label htmlFor="firstName">First Name</Label>
            <Input 
              id="firstName" 
              required 
              value={firstName} 
              onChange={(e) => setFirstName(e.target.value)} 
              className="h-10"
            />
          </div>
          {/* Last Name */}
          <div className="space-y-2">
            <Label htmlFor="lastName">Last Name</Label>
            <Input 
              id="lastName" 
              required 
              value={lastName} 
              onChange={(e) => setLastName(e.target.value)} 
              className="h-10"
            />
          </div>
          {/* Email */}
          <div className="space-y-2">
            <Label htmlFor="email">Email Address</Label>
            <Input 
              id="email" 
              type="email" 
              placeholder="you@example.com" 
              required 
              value={email} 
              onChange={(e) => setEmail(e.target.value)} 
              className="h-10"
            />
          </div>
          {/* Wallet Address */}
          <div className="space-y-2">
            <Label htmlFor="walletAddress">Solana Wallet Address</Label>
            <Input 
              id="walletAddress" 
              placeholder="Your public Solana address" 
              required 
              value={walletAddress} 
              onChange={(e) => setWalletAddress(e.target.value)} 
              className="h-10"
            />
            <p className="text-xs text-muted-foreground">This is where you'll receive payments.</p>
          </div>
          {/* Password */}
          <div className="space-y-2">
            <Label htmlFor="password">Password</Label>
            <div className="relative">
              <Input
                id="password"
                type={showPassword ? "text" : "password"}
                required
                minLength={6}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="h-10 pr-10"
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
                aria-label={showPassword ? "Hide password" : "Show password"}
              >
                {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
              </button>
            </div>
          </div>
        </CardContent>
        <CardFooter className="flex flex-col space-y-3">
          <Button 
            type="submit" 
            className="w-full h-10 bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-600 hover:to-blue-700" 
            disabled={isLoading}
          >
            {isLoading ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : "Register"}
          </Button>
          <Button 
            variant="outline" 
            className="w-full h-10" 
            asChild
          >
            <Link href="/auth/login">Already have an account? Login</Link>
          </Button>
        </CardFooter>
      </form>
    </Card>
  );
}