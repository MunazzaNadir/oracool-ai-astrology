import { motion } from "framer-motion";
import { Sparkles } from "lucide-react";

export function TypingIndicator() {
  return (
    <div className="flex w-full gap-3 md:gap-4 mb-6 justify-start">
      <div className="flex-shrink-0 w-8 h-8 md:w-10 md:h-10 rounded-full bg-gradient-to-br from-purple-500 to-pink-500 flex items-center justify-center shadow-lg shadow-purple-500/20 mt-1">
        <Sparkles className="w-4 h-4 md:w-5 md:h-5 text-white" />
      </div>

      <div className="bg-white/10 backdrop-blur-md border border-white/10 text-white rounded-2xl rounded-tl-none px-5 py-4 flex items-center gap-1.5">
        <motion.div
          animate={{ scale: [1, 1.2, 1], opacity: [0.5, 1, 0.5] }}
          transition={{ duration: 0.6, repeat: Infinity, delay: 0 }}
          className="w-2 h-2 rounded-full bg-pink-400"
        />
        <motion.div
          animate={{ scale: [1, 1.2, 1], opacity: [0.5, 1, 0.5] }}
          transition={{ duration: 0.6, repeat: Infinity, delay: 0.2 }}
          className="w-2 h-2 rounded-full bg-purple-400"
        />
        <motion.div
          animate={{ scale: [1, 1.2, 1], opacity: [0.5, 1, 0.5] }}
          transition={{ duration: 0.6, repeat: Infinity, delay: 0.4 }}
          className="w-2 h-2 rounded-full bg-blue-400"
        />
      </div>
    </div>
  );
}
