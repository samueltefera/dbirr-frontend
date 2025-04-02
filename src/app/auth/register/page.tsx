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
     <Card className="w-full max-w-sm bg-white/10 backdrop-blur-md border border-white/20 text-white">
         <CardHeader>
              <div className="flex items-center justify-between mb-4">
                  <span className="text-2xl font-bold bg-gradient-to-r from-cyan-400 to-blue-500 text-transparent bg-clip-text">dbirr</span>
                  <CardTitle className="text-xl font-semibold">Register</CardTitle>
              </div>
              <CardDescription className="text-gray-300">Create your merchant account.</CardDescription>
         </CardHeader>
         <form onSubmit={handleSubmit}>
            <CardContent className="space-y-3">
                 {/* First Name */}
                 <div className="space-y-1">
                     <Label htmlFor="firstName">First Name</Label>
                     <Input id="firstName" required value={firstName} onChange={(e) => setFirstName(e.target.value)} className="bg-white/10 border-white/30 placeholder-gray-400 text-white"/>
                 </div>
                 {/* Last Name */}
                 <div className="space-y-1">
                     <Label htmlFor="lastName">Last Name</Label>
                     <Input id="lastName" required value={lastName} onChange={(e) => setLastName(e.target.value)} className="bg-white/10 border-white/30 placeholder-gray-400 text-white"/>
                 </div>
                 {/* Email */}
                 <div className="space-y-1">
                     <Label htmlFor="email">Email Address</Label>
                     <Input id="email" type="email" placeholder="you@example.com" required value={email} onChange={(e) => setEmail(e.target.value)} className="bg-white/10 border-white/30 placeholder-gray-400 text-white"/>
                 </div>
                 {/* Wallet Address */}
                 <div className="space-y-1">
                     <Label htmlFor="walletAddress">Solana Wallet Address</Label>
                     <Input id="walletAddress" placeholder="Your public Solana address" required value={walletAddress} onChange={(e) => setWalletAddress(e.target.value)} className="bg-white/10 border-white/30 placeholder-gray-400 text-white"/>
                     <p className="text-xs text-gray-400">This is where you'll receive payments.</p>
                 </div>
                  {/* Password */}
                 <div className="space-y-1 relative">
                     <Label htmlFor="password">Password</Label>
                       <Input
                         id="password"
                         type={showPassword ? "text" : "password"}
                         required
                         minLength={6}
                         value={password}
                         onChange={(e) => setPassword(e.target.value)}
                         className="bg-white/10 border-white/30 placeholder-gray-400 text-white focus:ring-cyan-500 focus:border-cyan-500 pr-10"
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
             </CardContent>
             <CardFooter className="flex flex-col space-y-3">
                  <Button type="submit" className="w-full bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-600 hover:to-blue-700 text-white" disabled={isLoading}>
                     {isLoading ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : "Register"}
                  </Button>
                  <Button variant="outline" className="w-full bg-transparent border-white/50 hover:bg-white/10 text-white" asChild>
                     <Link href="/auth/login">Already have an account? Login</Link>
                   </Button>
             </CardFooter>
         </form>
     </Card>
  );
}