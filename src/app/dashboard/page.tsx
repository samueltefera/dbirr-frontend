// app/dashboard/page.tsx
'use client';

import React from 'react';
import { useAuth } from '@/lib/context/AuthContext';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton"; // For loading states later
import { ArrowLeftRight, Link2, CreditCard } from 'lucide-react'; // Icons

export default function DashboardOverviewPage() {
  const { user, isLoading } = useAuth(); // Use isLoading from context

  // TODO: Fetch actual data (balances, counts) from backend endpoints later
  const solBalance = '---'; // Placeholder
  const usdcBalance = '---'; // Placeholder
  const transactionCount = '---'; // Placeholder
  const linkCount = '---'; // Placeholder
  const isLoadingData = true; // Simulate loading data state

  return (
    <div className="space-y-6">
      <h1 className="text-3xl font-bold tracking-tight">
        Welcome back, {isLoading ? <Skeleton className="h-8 w-32 inline-block" /> : user?.firstName}!
      </h1>

      {/* Top Row: Assets/Wallet Summary (Simplified) */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-2">
         <Card>
           <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
             <CardTitle className="text-sm font-medium">
               Wallet Address
             </CardTitle>
              <CreditCard className="h-4 w-4 text-muted-foreground" />
           </CardHeader>
           <CardContent>
             <div className="text-xs md:text-sm font-mono break-all">
                {isLoading ? <Skeleton className="h-5 w-full" /> : user?.walletAddress}
             </div>
             <p className="text-xs text-muted-foreground mt-1">
               Your primary Solana address for receiving payments.
             </p>
           </CardContent>
         </Card>
         <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Current Assets (Example)</CardTitle>
               {/* Placeholder for maybe a link to explorer or asset details */}
            </CardHeader>
            <CardContent className="space-y-1">
                {/* Simulating loading */}
                {isLoadingData ? (
                     <>
                       <Skeleton className="h-6 w-24 mb-1" />
                       <Skeleton className="h-6 w-20" />
                     </>
                ) : (
                     <>
                        <div className="text-2xl font-bold">{solBalance} SOL</div>
                        <div className="text-lg text-muted-foreground">{usdcBalance} USDC</div>
                     </>
                 )}
                 <p className="text-xs text-muted-foreground pt-1">
                     Approximate balance. Fetching real balance is next.
                 </p>
             </CardContent>
         </Card>
      </div>

      {/* Second Row: Counts */}
      <div className="grid gap-4 md:grid-cols-2">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Transactions</CardTitle>
            <ArrowLeftRight className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
             {isLoadingData ? <Skeleton className="h-8 w-16"/> : <div className="text-2xl font-bold">{transactionCount}</div>}
            <p className="text-xs text-muted-foreground">
              Successful payments received.
            </p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Active Payment Links</CardTitle>
            <Link2 className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
             {isLoadingData ? <Skeleton className="h-8 w-16"/> : <div className="text-2xl font-bold">{linkCount}</div>}
            <p className="text-xs text-muted-foreground">
              Links generated for payments.
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Add "Create Wallet" button logic if needed, or quick actions */}
      {/* Example: <Button>Create New Payment Link</Button> */}

    </div>
  );
}