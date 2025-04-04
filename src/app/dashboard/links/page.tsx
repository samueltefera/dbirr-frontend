// app/dashboard/links/page.tsx
'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import api from '@/lib/api';
import { useAuth } from '@/lib/context/AuthContext';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { toast } from 'sonner';
import { PlusCircle, Link2, ListX, Plus, Loader2 } from 'lucide-react';
import { LinkDetailsDialog } from './components/LinkDetailsDialog';

// Helper function to format date
const formatDate = (dateString: string) => {
    try {
        return new Date(dateString).toLocaleString(undefined, {
            dateStyle: 'medium',
            timeStyle: 'short',
        });
    } catch (e) {
        return 'Invalid Date';
    }
};

// Helper function for currency formatting (basic)
const formatCurrency = (amount: number | string, currencyCode: string) => {
    try {
        const numAmount = typeof amount === 'string' ? parseFloat(amount) : amount;
        return new Intl.NumberFormat(undefined, { style: 'currency', currency: currencyCode }).format(numAmount);
    } catch (e) {
        return `${amount} ${currencyCode}`;
    }
}

// Helper to copy text
const copyToClipboard = (text: string, message: string = "Copied to clipboard!") => {
    navigator.clipboard.writeText(text).then(() => {
        toast.success(message);
    }, (err) => {
        toast.error("Failed to copy.");
        console.error('Could not copy text: ', err);
    });
};

// Helper to construct the full payment URL (adjust base URL if needed)
const getPaymentUrl = (linkId: string): string => {
    // Assuming your payment page is at /pay/[linkId] on the same domain
    // If it's a different domain/subdomain, adjust accordingly
    if (typeof window !== 'undefined') {
        return `${window.location.origin}/pay/${linkId}`;
    }
    // Fallback or placeholder for SSR/initial render (less ideal)
    return `/pay/${linkId}`;
};

interface PaymentLink {
  id: string;
  linkId: string;
  productName: string;
  productDescription?: string;
  amountFiat: number;
  currency: string;
  fiatCurrencyCode: string;
  status: string;
  createdAt: string;
  remark?: string;
}

export default function PaymentLinksPage() {
  const { user } = useAuth();
  const router = useRouter();
  const [links, setLinks] = useState<PaymentLink[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedLink, setSelectedLink] = useState<PaymentLink | null>(null);

  useEffect(() => {
    const fetchLinks = async () => {
      if (!user) return; // Don't fetch if user isn't loaded

      setIsLoading(true);
      setError(null);
      try {
        const response = await api.get<PaymentLink[]>('/payments/links');
        // Sort by creation date, newest first
        const sortedLinks = response.data.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
        setLinks(sortedLinks);
      } catch (err: any) {
        console.error("Failed to fetch payment links:", err);
        setError("Could not load payment links. Please try again.");
        toast.error("Could not load payment links.");
      } finally {
        setIsLoading(false);
      }
    };

    fetchLinks();
  }, [user]); // Refetch when user context changes

  // Function to determine badge variant based on status
  const getStatusVariant = (status: PaymentLink['status']): "default" | "secondary" | "destructive" | "outline" | "success" => {
    switch (status) {
      case 'paid': return 'success'; // Assuming you add a 'success' variant or use 'default'
      case 'active': return 'default'; // Or 'secondary'
      case 'expired': return 'outline';
      case 'inactive': return 'secondary';
      default: return 'secondary';
    }
  };

  const handleLinkClick = (link: PaymentLink) => {
    setSelectedLink(link);
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-bold tracking-tight">Payment Links</h1>
        <Button onClick={() => router.push('/dashboard/links/request')}>
          <Plus className="mr-2 h-4 w-4" /> Create New Link
        </Button>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Generated Links</CardTitle>
          <CardDescription>View and manage your payment links.</CardDescription>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <div className="flex items-center justify-center h-64">
              <Loader2 className="h-8 w-8 animate-spin" />
            </div>
          ) : error ? (
            // Error State
            <div className="text-center py-10 text-red-600 dark:text-red-500">
              <p>{error}</p>
              {/* Optional: Add a retry button */}
            </div>
          ) : links.length === 0 ? (
            // Empty State
            <div className="text-center py-10 text-gray-500 dark:text-gray-400">
               <ListX className="mx-auto h-12 w-12 text-gray-400 dark:text-gray-500 mb-4" />
               <p className="font-medium">No payment links found.</p>
               <p className="text-sm mb-4">Create your first payment link to start receiving payments.</p>
               <Button size="sm" onClick={() => router.push('/dashboard/links/request')}>
                  <Plus className="mr-2 h-4 w-4" /> Create New Link
                </Button>
            </div>
          ) : (
            // Table Display
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Product</TableHead>
                  <TableHead>Amount</TableHead>
                  <TableHead className="hidden sm:table-cell">Created</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {links.map((link) => (
                  <TableRow 
                    key={link.id}
                    className="cursor-pointer hover:bg-muted/50"
                    onClick={() => handleLinkClick(link)}
                  >
                    <TableCell className="font-medium max-w-[200px] truncate">
                        {link.productName}
                        {link.productDescription && (
                            <p className='text-xs text-muted-foreground truncate'>{link.productDescription}</p>
                        )}
                    </TableCell>
                    <TableCell>
                      <div>{link.amountFiat} {link.fiatCurrencyCode}</div>
                      <div className="text-xs text-muted-foreground">
                        {formatCurrency(link.amountFiat, link.fiatCurrencyCode)}
                      </div>
                    </TableCell>
                    <TableCell className="hidden sm:table-cell">{formatDate(link.createdAt)}</TableCell>
                    <TableCell>
                      <Badge variant={getStatusVariant(link.status)} className="capitalize">
                        {link.status}
                      </Badge>
                    </TableCell>
                    <TableCell className="text-right space-x-1">
                       <Button
                         variant="ghost"
                         size="icon"
                         title="View Details"
                         onClick={(e) => {
                           e.stopPropagation();
                           handleLinkClick(link);
                         }}
                        >
                          <Link2 className="h-4 w-4" />
                       </Button>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>

      {selectedLink && (
        <LinkDetailsDialog
          isOpen={!!selectedLink}
          onClose={() => setSelectedLink(null)}
          link={selectedLink}
        />
      )}
    </div>
  );
}