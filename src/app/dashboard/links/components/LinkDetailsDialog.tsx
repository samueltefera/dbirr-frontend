'use client';

import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { ExternalLink } from 'lucide-react';
import { PaymentLinkDisplay } from "@/components/ui/payment-link-display";

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
            <PaymentLinkDisplay link={paymentLink} />
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