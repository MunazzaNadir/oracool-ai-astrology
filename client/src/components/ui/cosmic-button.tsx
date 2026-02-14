import { ButtonHTMLAttributes, forwardRef } from "react";
import { cn } from "@/lib/utils";
import { Loader2 } from "lucide-react";
import { motion } from "framer-motion";

interface CosmicButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  isLoading?: boolean;
  variant?: "primary" | "secondary" | "ghost";
}

export const CosmicButton = forwardRef<HTMLButtonElement, CosmicButtonProps>(
  ({ className, children, isLoading, variant = "primary", disabled, ...props }, ref) => {
    
    const baseStyles = "relative inline-flex items-center justify-center rounded-xl px-8 py-3.5 font-semibold transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed overflow-hidden group";
    
    const variants = {
      primary: "bg-gradient-to-r from-purple-600 via-pink-600 to-blue-600 text-white shadow-lg shadow-pink-500/25 hover:shadow-pink-500/40 hover:scale-[1.02] active:scale-[0.98]",
      secondary: "bg-white/10 text-white border border-white/10 hover:bg-white/20 backdrop-blur-md hover:border-white/20",
      ghost: "text-white/70 hover:text-white hover:bg-white/5",
    };

    return (
      <motion.button
        ref={ref}
        whileTap={{ scale: 0.98 }}
        className={cn(baseStyles, variants[variant], className)}
        disabled={isLoading || disabled}
        {...props}
      >
        {/* Shimmer effect for primary buttons */}
        {variant === "primary" && (
          <div className="absolute inset-0 -translate-x-full group-hover:animate-[shimmer_1.5s_infinite] bg-gradient-to-r from-transparent via-white/20 to-transparent" />
        )}
        
        {isLoading ? (
          <>
            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
            <span>Aligning Stars...</span>
          </>
        ) : (
          children
        )}
      </motion.button>
    );
  }
);

CosmicButton.displayName = "CosmicButton";
