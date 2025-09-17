import { useState, useRef, useEffect } from "react";
import { MessageCircle, X, Send, Bot, User, Sparkles } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Card } from "@/components/ui/card";

interface Message {
  id: string;
  role: "user" | "assistant";
  content: string;
  timestamp: Date;
}

export const FinlyChat = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState<Message[]>([
    {
      id: "welcome",
      role: "assistant", 
      content: "Halo! Saya FinlyChat, asisten AI untuk konsultasi keuangan pribadi. Ada yang bisa saya bantu terkait perencanaan keuangan Anda?",
      timestamp: new Date()
    }
  ]);
  const [input, setInput] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const sendMessage = async () => {
    if (!input.trim() || isLoading) return;

    const userMessage: Message = {
      id: Date.now().toString(),
      role: "user",
      content: input,
      timestamp: new Date()
    };

    setMessages(prev => [...prev, userMessage]);
    setInput("");
    setIsLoading(true);

    try {
      const response = await fetch("https://openrouter.ai/api/v1/chat/completions", {
        method: "POST",
        headers: {
          "Authorization": "Bearer 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",
          "HTTP-Referer": window.location.origin,
          "X-Title": "Finly - Personal Finance App",
          "Content-Type": "application/json"
        },
        body: JSON.stringify({
          "model": "deepseek/deepseek-chat-v3.1:free",
          "messages": [
            {
              "role": "system",
              "content": "Kamu adalah FinlyChat, asisten AI untuk konsultasi keuangan pribadi dalam bahasa Indonesia. Berikan saran yang praktis, mudah dipahami, dan sesuai untuk rumah tangga dan karyawan Indonesia. Fokus pada perencanaan keuangan, budgeting, investasi sederhana, dan tips mengatur uang. Gunakan bahasa yang ramah dan tidak terlalu teknis."
            },
            ...messages.map(msg => ({
              role: msg.role,
              content: msg.content
            })),
            {
              "role": "user", 
              "content": input
            }
          ]
        })
      });

      const data = await response.json();
      
      if (data.choices && data.choices[0]?.message?.content) {
        const assistantMessage: Message = {
          id: (Date.now() + 1).toString(),
          role: "assistant",
          content: data.choices[0].message.content,
          timestamp: new Date()
        };
        setMessages(prev => [...prev, assistantMessage]);
      } else {
        throw new Error("Invalid response from AI");
      }
    } catch (error) {
      console.error("Error sending message:", error);
      const errorMessage: Message = {
        id: (Date.now() + 1).toString(),
        role: "assistant",
        content: "Maaf, terjadi kesalahan. Silakan coba lagi nanti.",
        timestamp: new Date()
      };
      setMessages(prev => [...prev, errorMessage]);
    } finally {
      setIsLoading(false);
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      sendMessage();
    }
  };

  return (
    <div className="fixed right-2 sm:right-4 chat-offset z-40">
      {/* Chat Window */}
      {isOpen && (
        <Card className="mb-4 w-[calc(100vw-1rem)] sm:w-80 max-w-[22rem] h-[28rem] sm:h-96 bg-card border-border shadow-lg animate-scale-in">
          <div className="flex flex-col h-full">
            {/* Header */}
            <div className="flex items-center justify-between p-3 sm:p-4 border-b border-border bg-gradient-to-r from-primary to-accent rounded-t-lg">
              <div className="flex items-center gap-2">
                <div className="relative">
                  <Bot className="h-5 w-5 text-primary-foreground" />
                  <Sparkles className="h-3 w-3 text-yellow-300 absolute -top-1 -right-1 animate-pulse" />
                </div>
                <span className="font-semibold text-primary-foreground text-sm sm:text-base">FinlyChat AI</span>
              </div>
              <Button 
                variant="ghost" 
                size="sm"
                onClick={() => setIsOpen(false)}
                className="text-primary-foreground hover:bg-white/20 h-8 w-8 p-0"
              >
                <X className="h-4 w-4" />
              </Button>
            </div>

            {/* Messages */}
            <ScrollArea className="flex-1 p-3 sm:p-4">
              <div className="space-y-3 sm:space-y-4">
                {messages.map((message) => (
                  <div
                    key={message.id}
                    className={`flex ${message.role === "user" ? "justify-end" : "justify-start"}`}
                  >
                    <div
                      className={`max-w-[75%] sm:max-w-[70%] rounded-lg p-2.5 sm:p-3 ${
                        message.role === "user"
                          ? "bg-primary text-primary-foreground"
                          : "bg-muted text-foreground"
                      }`}
                    >
                      <div className="flex items-start gap-1.5 sm:gap-2">
                        {message.role === "assistant" && (
                          <div className="relative flex-shrink-0">
                            <Bot className="h-3.5 w-3.5 sm:h-4 sm:w-4 mt-0.5" />
                            <div className="absolute -top-0.5 -right-0.5">
                              <div className="h-1.5 w-1.5 bg-green-500 rounded-full animate-pulse" />
                            </div>
                          </div>
                        )}
                        {message.role === "user" && (
                          <User className="h-3.5 w-3.5 sm:h-4 sm:w-4 mt-0.5 flex-shrink-0" />
                        )}
                        <p className="text-xs sm:text-sm leading-relaxed">{message.content}</p>
                      </div>
                    </div>
                  </div>
                ))}
                {isLoading && (
                  <div className="flex justify-start">
                    <div className="bg-muted rounded-lg p-3 max-w-[70%]">
                      <div className="flex items-center gap-2">
                        <Bot className="h-4 w-4" />
                        <div className="flex space-x-1">
                          <div className="w-2 h-2 bg-muted-foreground rounded-full animate-bounce"></div>
                          <div className="w-2 h-2 bg-muted-foreground rounded-full animate-bounce" style={{animationDelay: "0.1s"}}></div>
                          <div className="w-2 h-2 bg-muted-foreground rounded-full animate-bounce" style={{animationDelay: "0.2s"}}></div>
                        </div>
                      </div>
                    </div>
                  </div>
                )}
                <div ref={messagesEndRef} />
              </div>
            </ScrollArea>

            {/* Input */}
            <div className="p-3 sm:p-4 border-t border-border">
              <div className="flex gap-1.5 sm:gap-2">
                <Input
                  value={input}
                  onChange={(e) => setInput(e.target.value)}
                  onKeyPress={handleKeyPress}
                  placeholder="Tanya keuangan..."
                  disabled={isLoading}
                  className="flex-1 text-xs sm:text-sm h-8 sm:h-9"
                />
                <Button 
                  onClick={sendMessage}
                  disabled={!input.trim() || isLoading}
                  size="sm"
                  className="px-2 sm:px-3 h-8 sm:h-9"
                >
                  <Send className="h-3.5 w-3.5 sm:h-4 sm:w-4" />
                </Button>
              </div>
            </div>
          </div>
        </Card>
      )}

      {/* Chat Bubble with Virtual Assistant Icon */}
      <div className="relative">
        <Button
          onClick={() => setIsOpen(!isOpen)}
          className="h-12 w-12 sm:h-14 sm:w-14 rounded-full bg-gradient-to-r from-primary to-accent hover:from-primary-hover hover:to-accent shadow-lg hover:shadow-xl transition-all duration-300 hover:scale-105 relative"
        >
          {isOpen ? (
            <X className="h-5 w-5 sm:h-6 sm:w-6 text-primary-foreground" />
          ) : (
            <div className="relative">
              <MessageCircle className="h-5 w-5 sm:h-6 sm:w-6 text-primary-foreground" />
              <Sparkles className="h-3 w-3 sm:h-4 sm:w-4 text-yellow-300 absolute -top-1 -right-1 animate-pulse" />
            </div>
          )}
        </Button>
        {!isOpen && (
          <div className="absolute -top-1 -right-1 h-3 w-3 sm:h-3.5 sm:w-3.5 bg-green-500 border-2 border-background rounded-full animate-pulse" />
        )}
      </div>
    </div>
  );
};