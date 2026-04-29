import { useEffect, useRef, useState } from "react";
import { useCurrentUser, useChatHistory, useSendMessage } from "@/hooks/use-oracool";
import { MessageBubble } from "@/components/chat/message-bubble";
import { TypingIndicator } from "@/components/chat/typing-indicator";
import { GlassCard } from "@/components/ui/glass-card";
import { Input } from "@/components/ui/input";
import { CosmicButton } from "@/components/ui/cosmic-button";
import { SendHorizontal, Sparkles, LogOut } from "lucide-react";
import { useLocation } from "wouter";
import { motion, AnimatePresence } from "framer-motion";

const SUGGESTIONS = [
  "What's my big 3?",
  "Career advice for 2026",
  "Love compatibility",
  "Hidden talents",
];

export default function Chat() {
  const userId = useCurrentUser();
  const [, setLocation] = useLocation();
  const [message, setMessage] = useState("");
  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!userId) {
      setLocation("/");
    }
  }, [userId, setLocation]);

  const { data: history = [], isLoading: isLoadingHistory } = useChatHistory(userId);
  const sendMessage = useSendMessage();

  const handleSend = async (e?: React.FormEvent, text?: string) => {
    e?.preventDefault();
    const toSend = text ?? message;
    if (!toSend.trim() || !userId) return;

    setMessage("");
    sendMessage.mutate({
      userId,
      message: toSend,
    });
  };

  const handleSuggestionClick = (suggestion: string) => {
    if (sendMessage.isPending) return;
    handleSend(undefined, suggestion);
  };

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [history, sendMessage.isPending]);

  const handleLogout = () => {
    localStorage.removeItem("oracool_user_id");
    setLocation("/");
  };

  if (!userId) return null;

  return (
    <div className="h-screen flex flex-col overflow-hidden relative">
      {/* Background Ambience */}
      <div className="absolute inset-0 bg-[url('https://images.unsplash.com/photo-1534796636912-3b95b3ab5986?w=1920&q=80')] bg-cover bg-center opacity-10 pointer-events-none mix-blend-overlay" />

      {/* Header */}
      <header className="flex-shrink-0 px-6 py-4 border-b border-white/10 bg-black/20 backdrop-blur-md z-20 flex justify-between items-center">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-purple-600 to-pink-600 flex items-center justify-center shadow-lg shadow-purple-500/20">
            <Sparkles className="w-5 h-5 text-white" />
          </div>
          <div>
            <h1 className="text-xl font-bold text-white tracking-tight">Oracool</h1>
            <p className="text-xs text-white/50">Your Cosmic Guide</p>
          </div>
        </div>
        <button
          onClick={handleLogout}
          data-testid="button-logout"
          className="p-2 rounded-full hover:bg-white/10 text-white/60 hover:text-white transition-colors"
          title="Restart Journey"
        >
          <LogOut className="w-5 h-5" />
        </button>
      </header>

      {/* Messages Area */}
      <div
        ref={scrollRef}
        className="flex-1 overflow-y-auto p-4 md:p-6 space-y-4 scroll-smooth"
      >
        <div className="max-w-3xl mx-auto w-full pb-4">
          {history.length === 0 && !isLoadingHistory && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="text-center py-20 px-6"
            >
              <h3 className="text-2xl font-bold text-white mb-2">Welcome, Stargazer ✨</h3>
              <p className="text-white/60">
                Your chart has been cast. Ask me anything about your planetary alignment,
                relationships, or what the future holds.
              </p>
            </motion.div>
          )}

          <AnimatePresence initial={false}>
            {history.map((msg) => (
              <MessageBubble key={msg.id} message={msg} />
            ))}
          </AnimatePresence>

          {sendMessage.isPending && <TypingIndicator />}
        </div>
      </div>

      {/* Input Area */}
      <div className="flex-shrink-0 p-4 md:p-6 pt-2 z-20">
        <div className="max-w-3xl mx-auto w-full space-y-3">
          {/* Suggestion Chips */}
          <div className="flex gap-2 overflow-x-auto pb-1 scrollbar-hide">
            {SUGGESTIONS.map((suggestion) => (
              <button
                key={suggestion}
                data-testid={`chip-suggestion-${suggestion.replace(/\s+/g, "-").toLowerCase()}`}
                onClick={() => handleSuggestionClick(suggestion)}
                disabled={sendMessage.isPending}
                className="flex-shrink-0 px-4 py-2 rounded-full bg-white/5 border border-white/10 text-sm text-white/75 hover:bg-white/10 hover:text-white hover:border-white/20 hover:scale-105 active:scale-95 transition-all duration-150 backdrop-blur-sm disabled:opacity-40 disabled:cursor-not-allowed whitespace-nowrap"
              >
                {suggestion}
              </button>
            ))}
          </div>

          {/* Input Bar */}
          <GlassCard className="p-2 md:p-3 flex items-center gap-2 rounded-[24px]">
            <Input
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && handleSend()}
              placeholder="Ask the stars anything..."
              data-testid="input-chat-message"
              className="border-0 bg-transparent focus-visible:ring-0 text-base h-12 px-4 placeholder:text-white/30"
              disabled={sendMessage.isPending}
              autoFocus
            />
            <CosmicButton
              onClick={() => handleSend()}
              disabled={!message.trim() || sendMessage.isPending}
              data-testid="button-send-message"
              className="w-12 h-12 rounded-full p-0 flex-shrink-0"
              variant="primary"
            >
              <SendHorizontal className="w-5 h-5 ml-0.5" />
            </CosmicButton>
          </GlassCard>

          <div className="text-center">
            <p className="text-[10px] uppercase tracking-widest text-white/20">
              Powered by Cosmic Intelligence
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
