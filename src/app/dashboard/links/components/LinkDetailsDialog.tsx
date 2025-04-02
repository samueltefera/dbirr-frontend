'use client';

import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Copy, ExternalLink } from 'lucide-react';
import { useState } from 'react';
import { toast } from 'sonner';

interface LinkDetailsDialogProps {
  isOpen: boolean;
  onClose: () => void;
  link: {
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
  };
}

export function LinkDetailsDialog({ isOpen, onClose, link }: LinkDetailsDialogProps) {
  const paymentLink = `${window.location.origin}/pay/${link.linkId}`;

  const copyToClipboard = async () => {
    try {
      await navigator.clipboard.writeText(paymentLink);
      toast.success("Payment link copied!");
    } catch (err) {
      toast.error("Failed to copy link");
    }
  };

  // Helper to determine badge variant based on status
  const getStatusVariant = (status: string): "default" | "secondary" | "destructive" | "outline" | "success" => {
    switch (status.toLowerCase()) {
      case 'paid': return 'success';
      case 'active': return 'default';
      case 'expired': return 'outline';
      case 'inactive': return 'secondary';
      default: return 'secondary';
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={() => onClose()}>
      <DialogContent className="sm:max-w-md p-6">
        <DialogHeader className="space-y-3">
          <DialogTitle className="text-xl">{link.productName}</DialogTitle>
          <DialogDescription className="text-muted-foreground">
            {link.productDescription}
          </DialogDescription>
        </DialogHeader>

        <div className="mt-4 space-y-4">
          {/* Payment Details */}
          <div className="space-y-2">
            <h3 className="font-medium">Payment Details</h3>
            <div className="grid grid-cols-2 gap-2 text-sm">
              <div className="text-muted-foreground">Amount:</div>
              <div>{link.amountFiat} {link.fiatCurrencyCode}</div>
              <div className="text-muted-foreground">Currency:</div>
              <div>{link.currency}</div>
              <div className="text-muted-foreground">Status:</div>
              <div>
                <Badge variant={getStatusVariant(link.status)} className="capitalize">
                  {link.status}
                </Badge>
              </div>
              <div className="text-muted-foreground">Created:</div>
              <div>{new Date(link.createdAt).toLocaleDateString()}</div>
              {link.remark && (
                <>
                  <div className="text-muted-foreground">Remark:</div>
                  <div>{link.remark}</div>
                </>
              )}
            </div>
          </div>

          {/* Payment Link */}
          <div className="space-y-2">
            <h3 className="font-medium">Payment Link</h3>
            <div className="flex items-center justify-between bg-muted/50 px-3 py-2.5 rounded-lg">
              <code className="text-sm text-neutral-800 dark:text-neutral-200 font-mono truncate max-w-[80%]">
                {paymentLink}
              </code>
              <Button
                variant="ghost"
                size="icon"
                onClick={copyToClipboard}
                className="h-8 w-8 shrink-0"
              >
                <Copy className="h-4 w-4" />
              </Button>
            </div>
          </div>
        </div>

        <div className="flex flex-col gap-2 mt-6">
          <Button
            variant="outline"
            className="w-full"
            onClick={() => window.open(paymentLink, '_blank')}
          >
            <ExternalLink className="mr-2 h-4 w-4" />
            Preview Link
          </Button>
          <Button
            variant="secondary"
            className="w-full"
            onClick={onClose}
          >
            Close
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
} 