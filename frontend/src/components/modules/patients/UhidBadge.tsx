import React, { useState } from "react";
import { Check, Copy, Shield } from "lucide-react";
import { cn } from "@/lib/utils";
import { toast } from "sonner";

interface UhidBadgeProps {
  uhid: string;
  className?: string;
}

export function UhidBadge({ uhid, className }: UhidBadgeProps) {
  const [copied, setCopied] = useState(false);

  const copyToClipboard = async () => {
    try {
      await navigator.clipboard.writeText(uhid);
      setCopied(true);
      toast.success("UHID copied to clipboard");
      setTimeout(() => setCopied(false), 2000);
    } catch (err) {
      toast.error("Failed to copy UHID");
    }
  };

  return (
    <div
      onClick={copyToClipboard}
      className={cn(
        "inline-flex cursor-pointer items-center gap-1.5 rounded-full border border-primary/20 bg-primary/5 px-3 py-1 font-mono text-xs font-semibold text-primary transition-all hover:bg-primary/10 active:scale-95",
        className
      )}
      title="Click to copy UHID"
    >
      <Shield className="size-3" />
      <span>{uhid}</span>
      {copied ? (
        <Check className="size-3 text-success animate-in fade-in zoom-in-75 duration-200" />
      ) : (
        <Copy className="size-3 opacity-60 hover:opacity-100" />
      )}
    </div>
  );
}
