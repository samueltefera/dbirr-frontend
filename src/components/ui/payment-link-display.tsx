'use client';

import { Button } from "@/components/ui/button";
import { Copy } from "lucide-react";
import { toast } from "sonner";

interface PaymentLinkDisplayProps {
  link: string;
  className?: string;
}

export function PaymentLinkDisplay({ link, className = "" }: PaymentLinkDisplayProps) {
  const copyToClipboard = async () => {
    try {
      await navigator.clipboard.writeText(link);
      toast.success("Payment link copied!");
    } catch (err) {
      toast.error("Failed to copy link");
    }
  };

  return (
    <div className={`flex items-center justify-between bg-muted/50 px-3 py-2.5 rounded-lg ${className}`}>
      <code className="text-sm text-neutral-800 dark:text-neutral-200 font-mono truncate max-w-[80%]">
        {link}
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
  );
} 