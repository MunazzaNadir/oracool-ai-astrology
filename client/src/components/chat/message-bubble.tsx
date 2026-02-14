import { cn } from "@/lib/utils";
import { Message } from "@shared/schema";
import { motion } from "framer-motion";
import { Sparkles, User } from "lucide-react";

interface MessageBubbleProps {
  message: Message;
}

export function MessageBubble({ message }: MessageBubbleProps) {
  const isAssistant = message.role === "assistant";

  return (
    <motion.div
      initial={{ opacity: 0, y: 10, scale: 0.95 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      transition={{ duration: 0.3 }}
      className={cn(
        "flex w-full gap-3 md:gap-4 mb-6",
        isAssistant ? "justify-start" : "justify-end"
      )}
    >
      {/* Avatar (Assistant only) */}
      {isAssistant && (
        <div className="flex-shrink-0 w-8 h-8 md:w-10 md:h-10 rounded-full bg-gradient-to-br from-purple-500 to-pink-500 flex items-center justify-center shadow-lg shadow-purple-500/20 mt-1">
          <Sparkles className="w-4 h-4 md:w-5 md:h-5 text-white" />
        </div>
      )}

      {/* Bubble */}
      <div
        className={cn(
          "max-w-[80%] md:max-w-[70%] rounded-2xl px-5 py-3.5 shadow-md text-sm md:text-base leading-relaxed",
          isAssistant
            ? "bg-white/10 backdrop-blur-md border border-white/10 text-white rounded-tl-none"
            : "bg-gradient-to-br from-pink-600 to-purple-600 text-white rounded-tr-none shadow-pink-500/20"
        )}
      >
        <p className="whitespace-pre-wrap">{message.content}</p>
      </div>

      {/* Avatar (User only) */}
      {!isAssistant && (
        <div className="flex-shrink-0 w-8 h-8 md:w-10 md:h-10 rounded-full bg-white/10 flex items-center justify-center border border-white/10 mt-1">
          <User className="w-4 h-4 md:w-5 md:h-5 text-white/70" />
        </div>
      )}
    </motion.div>
  );
}
