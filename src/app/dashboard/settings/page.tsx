// app/dashboard/settings/page.tsx
'use client';

import React, { useState, useEffect } from 'react';
import { useAuth } from '@/lib/context/AuthContext';
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch"; // Use Switch instead of Toggle for on/off
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Check, Copy, Edit, Loader2, UserCircle, LogOut } from 'lucide-react';
import { Input } from '@/components/ui/input'; // For potentially editable fields later
import { toast } from 'sonner';
import api from '@/lib/api';
import { Skeleton } from '@/components/ui/skeleton';

// Define the available brand colors (similar to video)
// Use Tailwind color names or hex codes
const brandColors = [
  '#ef4444', // red-500
  '#f97316', // orange-500
  '#eab308', // yellow-500
  '#22c55e', // green-500
  '#0ea5e9', // sky-500
  '#3b82f6', // blue-500
  '#8b5cf6', // violet-500
  '#ec4899', // pink-500
];

export default function SettingsPage() {
  const { user, isLoading: isAuthLoading, updateUserLocally, refetchUser, logout } = useAuth();
  const [isSaving, setIsSaving] = useState(false);

  // State for editable settings - initialize with user data once loaded
  const [selectedBrandColor, setSelectedBrandColor] = useState<string>('');
  const [useDefaultTheme, setUseDefaultTheme] = useState<boolean>(true);
  const [toggleDarkMode, setToggleDarkMode] = useState<boolean>(true);
  const [useDevnet, setUseDevnet] = useState<boolean>(true);

  // Update local form state when user data loads or changes
  useEffect(() => {
    if (user) {
      setSelectedBrandColor(user.brandColor || brandColors[0]); // Default to first color if unset
      setUseDefaultTheme(user.useDefaultTheme);
      setToggleDarkMode(user.toggleDarkMode);
      setUseDevnet(user.useDevnet);
    }
  }, [user]);

  const getInitials = (firstName?: string, lastName?: string) => {
    return `${firstName?.[0] ?? ''}${lastName?.[0] ?? ''}`.toUpperCase() || <UserCircle size={20} />;
  };

  const handleSaveChanges = async () => {
    setIsSaving(true);
    try {
      const updatedSettings = {
        brandColor: selectedBrandColor,
        useDefaultTheme: useDefaultTheme,
        toggleDarkMode: toggleDarkMode,
        useDevnet: useDevnet,
        // Add other updatable fields here if needed (firstName, lastName?)
      };

      const response = await api.patch('/users/me', updatedSettings);

      // Update local AuthContext state immediately for responsiveness
      updateUserLocally(response.data);
      // Or uncomment below to refetch entirely from backend
      // await refetchUser();

      toast.success("Settings saved successfully!");

    } catch (error: any) {
      console.error("Failed to save settings:", error);
      const errorMessage = error.response?.data?.message || "Failed to save settings.";
      toast.error(errorMessage);
    } finally {
      setIsSaving(false);
    }
  };

  const copyToClipboard = (text: string) => {
      navigator.clipboard.writeText(text).then(() => {
          toast.success("Wallet address copied!");
      }, (err) => {
          toast.error("Failed to copy address.");
          console.error('Could not copy text: ', err);
      });
  };


  if (isAuthLoading || !user) {
    // Display loading skeletons while auth context or user data is loading
    return (
      <div className="space-y-6">
        <Skeleton className="h-9 w-48" />
        <Card>
          <CardHeader><Skeleton className="h-6 w-32" /></CardHeader>
          <CardContent className="space-y-4">
            <Skeleton className="h-10 w-full" />
            <Skeleton className="h-10 w-full" />
            <Skeleton className="h-10 w-full" />
            <Skeleton className="h-10 w-full" />
            <Skeleton className="h-10 w-full" />
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="space-y-6 max-w-3xl mx-auto"> {/* Limit width for better layout */}
      <h1 className="text-3xl font-bold tracking-tight">Account Settings</h1>

      {/* Profile Information Card */}
      <Card>
        <CardHeader>
          <CardTitle>Profile Information</CardTitle>
          <CardDescription>View and manage your personal details.</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center space-x-4">
            <Avatar className="h-16 w-16">
               {/* <AvatarImage src="/placeholder-user.jpg" /> */}
              <AvatarFallback className='text-xl bg-gradient-to-br from-cyan-200 to-blue-300 dark:from-cyan-800 dark:to-blue-800 text-gray-700 dark:text-white font-semibold'>
                {getInitials(user.firstName, user.lastName)}
              </AvatarFallback>
            </Avatar>
            <div>
              {/* Display Name - Consider adding an edit button later */}
              <p className="text-lg font-semibold">{user.firstName} {user.lastName}</p>
              <p className="text-sm text-muted-foreground">{user.email}</p>
            </div>
            {/* <Button variant="outline" size="icon" className="ml-auto"> <Edit className="h-4 w-4" /> </Button> */}
          </div>
          {/* Wallet Address */}
          <div className="space-y-1">
            <Label htmlFor="walletAddress">Wallet Address</Label>
            <div className="flex items-center space-x-2">
                <Input id="walletAddress" value={user.walletAddress} readOnly className="font-mono text-sm bg-gray-100 dark:bg-neutral-800 border-gray-300 dark:border-neutral-700"/>
                <Button variant="ghost" size="icon" onClick={() => copyToClipboard(user.walletAddress)}>
                    <Copy className="h-4 w-4"/>
                </Button>
            </div>
            <p className="text-xs text-muted-foreground">This address receives your payments.</p>
          </div>
        </CardContent>
      </Card>

      {/* Preferences Card */}
      <Card>
        <CardHeader>
          <CardTitle>Preferences</CardTitle>
          <CardDescription>Customize your application experience.</CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          {/* Brand Color Selection */}
          <div className="space-y-2">
            <Label>Select Brand Color</Label>
            <div className="flex flex-wrap gap-3">
              {brandColors.map((color) => (
                <button
                  key={color}
                  type="button"
                  onClick={() => setSelectedBrandColor(color)}
                  className={`h-8 w-8 rounded-full border-2 transition-all ${
                    selectedBrandColor === color ? 'border-blue-500 dark:border-cyan-400 ring-2 ring-offset-2 ring-blue-500 dark:ring-cyan-400 dark:ring-offset-neutral-950' : 'border-transparent hover:border-gray-400 dark:hover:border-gray-600'
                  }`}
                  style={{ backgroundColor: color }}
                  aria-label={`Select color ${color}`}
                >
                  {selectedBrandColor === color && <Check className="h-5 w-5 text-white mix-blend-difference mx-auto my-auto" strokeWidth={3}/>}
                </button>
              ))}
            </div>
             <p className="text-xs text-muted-foreground">Affects payment page appearance for your customers.</p>
          </div>

          {/* Use Default Theme Toggle */}
          <div className="flex items-center justify-between space-x-2 p-3 rounded-md border border-gray-200 dark:border-neutral-800">
            <div className='space-y-0.5'>
                 <Label htmlFor="default-theme" className="font-medium">Use Default Theme</Label>
                 <p className="text-[0.8rem] text-muted-foreground">
                     Toggle off to use your selected brand color.
                 </p>
            </div>
            <Switch
              id="default-theme"
              checked={useDefaultTheme}
              onCheckedChange={setUseDefaultTheme}
            />
          </div>

          {/* Toggle Dark Mode */}
          <div className="flex items-center justify-between space-x-2 p-3 rounded-md border border-gray-200 dark:border-neutral-800">
            <div className='space-y-0.5'>
                <Label htmlFor="dark-mode" className="font-medium">Enable Dark Mode</Label>
                <p className="text-[0.8rem] text-muted-foreground">
                    Sets the default appearance preference.
                 </p>
             </div>
            <Switch
              id="dark-mode"
              checked={toggleDarkMode}
              onCheckedChange={setToggleDarkMode}
              // Note: Actual theme switching needs a theme provider (e.g., next-themes)
            />
          </div>

          {/* Set to Devnet */}
          <div className="flex items-center justify-between space-x-2 p-3 rounded-md border border-gray-200 dark:border-neutral-800">
             <div className='space-y-0.5'>
                 <Label htmlFor="devnet-mode" className="font-medium">Use Solana Devnet</Label>
                  <p className="text-[0.8rem] text-muted-foreground">
                      Process transactions on the development network. Disable for Mainnet.
                  </p>
             </div>
            <Switch
              id="devnet-mode"
              checked={useDevnet}
              onCheckedChange={setUseDevnet}
            />
          </div>

        </CardContent>
      </Card>

      {/* Save Button */}
      <div className="flex justify-end">
        <Button onClick={handleSaveChanges} disabled={isSaving}>
          {isSaving && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
          Save Changes
        </Button>
      </div>

      {/* Logout Button - Visible on mobile */}
      <div className="md:hidden mt-6">
        <Button 
          variant="destructive" 
          className="w-full" 
          onClick={logout}
        >
          <LogOut className="mr-2 h-4 w-4" />
          Logout
        </Button>
      </div>
    </div>
  );
}