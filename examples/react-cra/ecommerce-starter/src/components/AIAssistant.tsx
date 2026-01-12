import { useEffect, useRef, useState } from "react";
import { useStore } from "@tanstack/react-store";
import { Send, X } from "lucide-react";
import { Streamdown } from "streamdown";

import { useMotorcycleChat } from "@/lib/ai-hook";
import type { ChatMessages } from "@/lib/ai-hook";
import { showAIAssistant } from "@/store/assistant";

import MotorcycleRecommendation from "./MotorcycleRecommendation";

function Messages({ messages }: { messages: ChatMessages }) {
  const messagesContainerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (messagesContainerRef.current) {
      messagesContainerRef.current.scrollTop =
        messagesContainerRef.current.scrollHeight;
    }
  }, [messages]);

  if (!messages.length) {
    return (
      <div className="flex-1 flex items-center justify-center text-gray-400 text-sm">
        Ask me about your next motorcycle.
      </div>
    );
  }

  return (
    <div ref={messagesContainerRef} className="flex-1 overflow-y-auto">
      {messages.map(({ id, role, parts }) => (
        <div
          key={id}
          className={`py-3 ${
            role === "assistant"
              ? "bg-linear-to-r from-orange-500/5 to-red-600/5"
              : "bg-transparent"
          }`}
        >
          {parts.map((part, index) => {
            if (part.type === "text" && part.content) {
              return (
                <div key={index} className="flex items-start gap-2 px-4">
                  {role === "assistant" ? (
                    <div className="w-6 h-6 rounded-lg bg-linear-to-r from-orange-500 to-red-600 flex items-center justify-center text-xs font-medium text-white flex-shrink-0">
                      AI
                    </div>
                  ) : (
                    <div className="w-6 h-6 rounded-lg bg-gray-700 flex items-center justify-center text-xs font-medium text-white flex-shrink-0">
                      Y
                    </div>
                  )}
                  <div className="flex-1 min-w-0 text-white prose dark:prose-invert max-w-none prose-sm">
                    <Streamdown>{part.content}</Streamdown>
                  </div>
                </div>
              );
            }
            if (
              part.type === "tool-call" &&
              part.name === "recommendMotorcycle" &&
              part.output
            ) {
              return (
                <div key={part.id} className="max-w-[80%] mx-auto">
                  <MotorcycleRecommendation id={String(part.output?.id)} />
                </div>
              );
            }
          })}
        </div>
      ))}
    </div>
  );
}

export default function AIAssistant() {
  const isOpen = useStore(showAIAssistant);
  const { messages, sendMessage } = useMotorcycleChat();
  const [input, setInput] = useState("");

  return (
    <div className="relative z-50">
      <button
        onClick={() => showAIAssistant.setState((state) => !state)}
        className="flex items-center gap-2 px-4 py-2 rounded-lg bg-black/90 text-white hover:bg-black/80 transition-all border border-orange-500/20 shadow-lg shadow-orange-500/10"
      >
        <div className="w-5 h-5 rounded-lg bg-linear-to-r from-orange-500 to-red-600 flex items-center justify-center text-xs font-medium">
          AI
        </div>
        Motorcycle Expert
      </button>

      {isOpen && (
        <div className="absolute top-full right-0 mt-2 w-[700px] h-[600px] bg-black/95 rounded-lg shadow-2xl border border-orange-500/20 flex flex-col backdrop-blur-sm">
          <div className="flex items-center justify-between p-4 border-b border-orange-500/20 bg-linear-to-r from-orange-500/5 to-red-600/5">
            <h3 className="font-semibold text-white flex items-center gap-2">
              <span className="w-6 h-6 rounded-lg bg-linear-to-r from-orange-500 to-red-600 flex items-center justify-center text-xs">
                AI
              </span>
              Motorcycle Expert
            </h3>
            <button
              onClick={() => showAIAssistant.setState((state) => !state)}
              className="text-gray-400 hover:text-white transition-colors"
            >
              <X className="w-4 h-4" />
            </button>
          </div>

          <Messages messages={messages} />

          <div className="p-4 border-t border-orange-500/20 bg-linear-to-r from-orange-500/5 to-red-600/5">
            <form
              onSubmit={(e) => {
                e.preventDefault();
                if (input.trim()) {
                  sendMessage(input);
                  setInput("");
                }
              }}
            >
              <div className="relative">
                <textarea
                  value={input}
                  onChange={(e) => setInput(e.target.value)}
                  placeholder="Ask about our motorcycles..."
                  className="w-full rounded-lg border border-orange-500/20 bg-black/50 pl-3 pr-10 py-3 text-sm text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-orange-500/30 focus:border-transparent resize-none overflow-hidden shadow-inner"
                  rows={1}
                  style={{ minHeight: "44px", maxHeight: "120px" }}
                  onInput={(e) => {
                    const target = e.target as HTMLTextAreaElement;
                    target.style.height = "auto";
                    target.style.height =
                      Math.min(target.scrollHeight, 120) + "px";
                  }}
                  onKeyDown={(e) => {
                    if (e.key === "Enter" && !e.shiftKey && input.trim()) {
                      e.preventDefault();
                      sendMessage(input);
                      setInput("");
                    }
                  }}
                />
                <button
                  type="submit"
                  disabled={!input.trim()}
                  className="absolute right-2 top-1/2 -translate-y-1/2 p-2 text-orange-500 hover:text-orange-400 disabled:text-gray-500 transition-colors focus:outline-none"
                >
                  <Send className="w-4 h-4" />
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
