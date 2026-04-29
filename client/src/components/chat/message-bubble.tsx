import { cn } from "@/lib/utils";
import { Message } from "@shared/schema";
import { motion } from "framer-motion";
import { Sparkles, User } from "lucide-react";

interface MessageBubbleProps {
  message: Message;
}

function renderInline(text: string, key: string | number): React.ReactNode {
  const parts: React.ReactNode[] = [];
  const boldRegex = /\*\*(.+?)\*\*/g;
  let last = 0;
  let match: RegExpExecArray | null;

  while ((match = boldRegex.exec(text)) !== null) {
    if (match.index > last) {
      parts.push(text.slice(last, match.index));
    }
    parts.push(
      <strong key={`b-${key}-${match.index}`} className="font-semibold text-white">
        {match[1]}
      </strong>
    );
    last = match.index + match[0].length;
  }
  if (last < text.length) {
    parts.push(text.slice(last));
  }
  if (parts.length === 0) return null;
  if (parts.length === 1 && typeof parts[0] === "string") return parts[0];
  return <>{parts}</>;
}

function renderMarkdown(content: string): React.ReactNode {
  const lines = content.split("\n");
  const elements: React.ReactNode[] = [];
  let i = 0;

  while (i < lines.length) {
    const line = lines[i];

    // Bullet list group
    if (/^[-*] /.test(line)) {
      const items: React.ReactNode[] = [];
      while (i < lines.length && /^[-*] /.test(lines[i])) {
        const text = lines[i].replace(/^[-*] /, "");
        items.push(
          <li key={i} className="leading-relaxed">
            {renderInline(text, i)}
          </li>
        );
        i++;
      }
      elements.push(
        <ul key={`ul-${i}`} className="list-disc list-outside pl-4 mb-2 space-y-1">
          {items}
        </ul>
      );
      continue;
    }

    // Ordered list group
    if (/^\d+\. /.test(line)) {
      const items: React.ReactNode[] = [];
      while (i < lines.length && /^\d+\. /.test(lines[i])) {
        const text = lines[i].replace(/^\d+\. /, "");
        items.push(
          <li key={i} className="leading-relaxed">
            {renderInline(text, i)}
          </li>
        );
        i++;
      }
      elements.push(
        <ol key={`ol-${i}`} className="list-decimal list-outside pl-4 mb-2 space-y-1">
          {items}
        </ol>
      );
      continue;
    }

    // Empty line → small gap between paragraphs
    if (line.trim() === "") {
      elements.push(<div key={`gap-${i}`} className="h-1" />);
      i++;
      continue;
    }

    // Regular paragraph line
    elements.push(
      <p key={`p-${i}`} className="mb-1 leading-relaxed">
        {renderInline(line, i)}
      </p>
    );
    i++;
  }

  return <>{elements}</>;
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
          "max-w-[80%] md:max-w-[70%] rounded-2xl px-5 py-3.5 shadow-md text-sm md:text-base",
          isAssistant
            ? "bg-white/10 backdrop-blur-md border border-white/10 text-white/90 rounded-tl-none"
            : "bg-gradient-to-br from-pink-600 to-purple-600 text-white rounded-tr-none shadow-pink-500/20"
        )}
      >
        {isAssistant ? (
          <div>{renderMarkdown(message.content)}</div>
        ) : (
          <p className="whitespace-pre-wrap leading-relaxed">{message.content}</p>
        )}
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
