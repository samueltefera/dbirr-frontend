// app/dashboard/transactions/page.tsx
'use client';

import React, { useState, useEffect } from 'react';
import api from '@/lib/api';
import { useAuth } from '@/lib/context/AuthContext';
import { Transaction } from '@/lib/types'; // Import the type
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { toast } from 'sonner';
import { ArrowLeftRight, Copy, ExternalLink, ListX } from 'lucide-react'; // Import necessary icons
import { cn } from '@/lib/utils';

// Re-use helpers or centralize them
const formatDate = (dateString: string) => { /* ... same as before ... */
    try { return new Date(dateString).toLocaleString(undefined, { dateStyle: 'medium', timeStyle: 'short' }); } catch (e) { return 'Invalid Date'; }
};
const formatCurrency = (amount: number | string, currencyCode: string) => { /* ... same as before ... */
    try {
        const numAmount = typeof amount === 'string' ? parseFloat(amount) : amount;
        if (currencyCode === 'SOL' || currencyCode === 'USDC') { return `${numAmount.toFixed(currencyCode === 'SOL' ? 9 : 6)} ${currencyCode}`; }
        return new Intl.NumberFormat(undefined, { style: 'currency', currency: currencyCode }).format(numAmount);
    } catch (e) { return `${amount} ${currencyCode}`; }
};
const copyToClipboard = (text: string, message: string = "Copied!") => { /* ... same as before ... */
    navigator.clipboard.writeText(text).then(() => toast.success(message), () => toast.error("Failed to copy."));
};

// Function to get explorer URL (adjust base URLs as needed)
const getExplorerUrl = (signature: string | null, network: 'mainnet-beta' | 'devnet' | 'testnet' | 'local' = 'local'): string | null => {
    if (!signature) return null;

    // Determine the base URL based on network (you might get this from user settings or env)
    // For simplicity, we'll hardcode for now. A real app might need more dynamic logic.
    // Using Solscan links:
    let baseUrl = '';
    if (network === 'mainnet-beta') {
        baseUrl = 'https://solscan.io/tx/';
    } else if (network === 'devnet') {
        baseUrl = 'https://solscan.io/tx/'; // Solscan supports devnet too
        // Optionally add cluster query param: ?cluster=devnet
        // return `${baseUrl}${signature}?cluster=devnet`;
         return `https://explorer.solana.com/tx/${signature}?cluster=devnet`; // Alternative: Solana Explorer
    } else if (network === 'testnet') {
         return `https://explorer.solana.com/tx/${signature}?cluster=testnet`;
    } else {
        // No standard public explorer for local test validator
        return null;
    }

    return `${baseUrl}${signature}`;
};


export default function TransactionsPage() {
  const { user } = useAuth(); // Use user.useDevnet later for explorer link?
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchTransactions = async () => {
      if (!user) return;

      setIsLoading(true);
      setError(null);
      try {
        // Assuming your backend sorts transactions already (newest first)
        const response = await api.get<Transaction[]>('/payments/transactions');
        setTransactions(response.data);
      } catch (err: any) {
        console.error("Failed to fetch transactions:", err);
        setError("Could not load transactions. Please try again.");
        toast.error("Could not load transactions.");
      } finally {
        setIsLoading(false);
      }
    };

    fetchTransactions();
  }, [user]);

  // Function to determine badge variant based on status
  const getStatusVariant = (status: Transaction['status']): "default" | "secondary" | "destructive" | "outline" | "success" => {
    switch (status) {
      case 'confirmed': return 'success';
      case 'pending': return 'default'; // Or 'secondary'/'outline'
      case 'failed': return 'destructive';
      case 'refunded': return 'outline'; // Or maybe 'secondary'
      default: return 'secondary';
    }
  };

  // Determine network for explorer link (example using user setting)
  const explorerNetwork = user?.useDevnet ? 'devnet' : 'mainnet-beta'; // Adjust if mainnet is target

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-bold tracking-tight">Transactions</h1>
        {/* Optional: Add filters or export button here later */}
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Transaction History</CardTitle>
          <CardDescription>A record of all payments received via your links.</CardDescription>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            // Loading Skeletons
            <div className="space-y-2">
              <Skeleton className="h-10 w-full" />
              <Skeleton className="h-12 w-full" />
              <Skeleton className="h-12 w-full" />
              <Skeleton className="h-12 w-full" />
            </div>
          ) : error ? (
            // Error State
            <div className="text-center py-10 text-red-600 dark:text-red-500">
              <p>{error}</p>
            </div>
          ) : transactions.length === 0 ? (
            // Empty State
            <div className="text-center py-10 text-gray-500 dark:text-gray-400">
                <ListX className="mx-auto h-12 w-12 text-gray-400 dark:text-gray-500 mb-4" />
                <p className="font-medium">No transactions found.</p>
                <p className="text-sm">Payments received will appear here once confirmed.</p>
            </div>
          ) : (
            // Table Display
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Date</TableHead>
                  <TableHead>Amount</TableHead>
                  <TableHead className="hidden md:table-cell">Signature / ID</TableHead>
                  <TableHead className="hidden sm:table-cell">Customer</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {transactions.map((tx) => {
                  const explorerUrl = getExplorerUrl(tx.blockchainTransactionId, explorerNetwork);
                  return (
                    <TableRow key={tx.id}>
                      <TableCell className="text-xs">
                          {formatDate(tx.createdAt)}
                      </TableCell>
                      <TableCell className="font-medium">
                          {formatCurrency(tx.amountPaid, tx.currency)}
                      </TableCell>
                      <TableCell className="hidden md:table-cell font-mono text-xs max-w-[150px] truncate">
                        {tx.blockchainTransactionId ? (
                             <Button variant="ghost" size="sm" className='h-auto px-1 py-0.5 text-xs' onClick={() => tx.blockchainTransactionId && copyToClipboard(tx.blockchainTransactionId)}>
                                {tx.blockchainTransactionId.substring(0, 8)}...
                             </Button>
                         ) : (
                             <span className='text-muted-foreground'>N/A</span>
                         )}
                      </TableCell>
                      <TableCell className="hidden sm:table-cell text-xs max-w-[150px] truncate">
                        {tx.customerName || tx.customerEmail || tx.customerPhone || <span className='text-muted-foreground'>None</span>}
                      </TableCell>
                      <TableCell>
                        <Badge variant={getStatusVariant(tx.status)} className="capitalize">
                          {tx.status}
                        </Badge>
                      </TableCell>
                      <TableCell className="text-right">
                        {tx.blockchainTransactionId && explorerUrl && (
                            <Button variant="ghost" size="icon" title="View on Explorer" asChild>
                                <a href={explorerUrl} target="_blank" rel="noopener noreferrer">
                                    <ExternalLink className="h-4 w-4" />
                                </a>
                           </Button>
                        )}
                         {/* Optional: Add View Details Button Later */}
                       {/* <Button variant="ghost" size="icon" title="View Details"> <MoreHorizontal className="h-4 w-4" /> </Button> */}
                      </TableCell>
                    </TableRow>
                  );
                })}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>
    </div>
  );
}