import { Loader2 } from "lucide-react";
import { cn } from "@/lib/utils";

interface LoaderProps {
  size?: number;
  className?: string;
}

export function Loader({ size = 24, className }: LoaderProps) {
  return (
    <Loader2 
      className={cn("animate-spin", className)} 
      size={size} 
    />
  );
}

export function FullPageLoader() {
  return (
    <div className="flex items-center justify-center h-[70vh]">
      <Loader size={36} className="text-primary" />
    </div>
  );
}