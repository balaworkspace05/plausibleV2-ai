import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { Bot, Send, Loader2, MessageCircle, X, TrendingUp, Users, Lightbulb, Leaf } from 'lucide-react';

interface Message {
  id: string;
  text: string;
  isUser: boolean;
  timestamp: Date;
}

interface FloatingChatbotProps {
  selectedProject?: any;
}

export function FloatingChatbot({ selectedProject }: FloatingChatbotProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState<Message[]>([
    {
      id: '1',
      text: "Hi 👋 I'm your Analytics Assistant. What do you want to know today?",
      isUser: false,
      timestamp: new Date(),
    }
  ]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const { toast } = useToast();

  const quickReplies = [
    { label: 'Top Pages', icon: TrendingUp, query: 'Show me today\'s top pages' },
    { label: 'Traffic Source', icon: Users, query: 'What are my main traffic sources today?' },
    { label: 'Conversion Tips', icon: Lightbulb, query: 'Give me conversion optimization tips based on my data' },
    { label: 'Eco Report', icon: Leaf, query: 'How is my website\'s carbon footprint looking?' },
  ];

  const sendMessage = async (question: string = input) => {
    if (!question.trim() || loading) return;

    if (!selectedProject) {
      toast({
        title: "No Project Selected",
        description: "Please select a project to chat about your analytics.",
        variant: "destructive",
      });
      return;
    }

    // Add user message
    const userMessage: Message = {
      id: Date.now().toString(),
      text: question,
      isUser: true,
      timestamp: new Date(),
    };

    setMessages(prev => [...prev, userMessage]);
    setInput('');
    setLoading(true);

    try {
      const { data, error } = await supabase.functions.invoke('ai-insights', {
        body: { 
          question: question.trim(),
          projectId: selectedProject.id 
        }
      });

      if (error) throw error;

      // Add AI response
      const aiMessage: Message = {
        id: (Date.now() + 1).toString(),
        text: data.answer || "I couldn't process your request. Please try again.",
        isUser: false,
        timestamp: new Date(),
      };

      setMessages(prev => [...prev, aiMessage]);

    } catch (error) {
      console.error('AI Chat error:', error);
      toast({
        title: "Chat Error",
        description: "Failed to get AI response. Please try again.",
        variant: "destructive",
      });

      // Add error message
      const errorMessage: Message = {
        id: (Date.now() + 1).toString(),
        text: "Sorry, I'm having trouble processing your request right now. Please try again later.",
        isUser: false,
        timestamp: new Date(),
      };

      setMessages(prev => [...prev, errorMessage]);
    }

    setLoading(false);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    sendMessage();
  };

  const handleQuickReply = (query: string) => {
    sendMessage(query);
  };

  return (
    <>
      {/* Floating Chat Button */}
      <div className="fixed bottom-6 right-6 z-50">
        {!isOpen && (
          <Button
            onClick={() => setIsOpen(true)}
            size="lg"
            className="rounded-full w-14 h-14 shadow-lg hover:shadow-xl transition-all duration-300 bg-primary hover:bg-primary/90"
          >
            <MessageCircle className="w-6 h-6" />
          </Button>
        )}

        {/* Chat Panel */}
        {isOpen && (
          <Card className="w-80 sm:w-96 h-96 shadow-2xl border-0 bg-background/95 backdrop-blur-sm">
            {/* Header */}
            <div className="flex items-center justify-between p-4 border-b">
              <div className="flex items-center gap-2">
                <Bot className="w-5 h-5 text-primary" />
                <span className="font-semibold text-sm">Analytics Assistant</span>
              </div>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setIsOpen(false)}
                className="h-8 w-8 p-0"
              >
                <X className="w-4 h-4" />
              </Button>
            </div>

            <CardContent className="flex flex-col h-80 p-0">
              {/* Messages */}
              <div className="flex-1 overflow-y-auto p-4 space-y-3">
                {messages.map((message) => (
                  <div
                    key={message.id}
                    className={`flex ${message.isUser ? 'justify-end' : 'justify-start'}`}
                  >
                    <div
                      className={`max-w-[80%] rounded-lg p-3 text-sm ${
                        message.isUser
                          ? 'bg-primary text-primary-foreground'
                          : 'bg-muted'
                      }`}
                    >
                      {!message.isUser && (
                        <div className="flex items-center gap-1 mb-1">
                          <Bot className="w-3 h-3" />
                          <span className="text-xs font-medium">AI</span>
                        </div>
                      )}
                      <p className="whitespace-pre-wrap">{message.text}</p>
                      <p className="text-xs opacity-70 mt-1">
                        {message.timestamp.toLocaleTimeString([], { 
                          hour: '2-digit', 
                          minute: '2-digit' 
                        })}
                      </p>
                    </div>
                  </div>
                ))}
                
                {loading && (
                  <div className="flex justify-start">
                    <div className="bg-muted rounded-lg p-3 text-sm">
                      <div className="flex items-center gap-2">
                        <Loader2 className="w-3 h-3 animate-spin" />
                        <span className="text-xs">Analyzing your data...</span>
                      </div>
                    </div>
                  </div>
                )}

                {/* Quick Replies - Show only at the start */}
                {messages.length === 1 && (
                  <div className="space-y-2">
                    <p className="text-xs text-muted-foreground">Quick questions:</p>
                    <div className="grid grid-cols-2 gap-2">
                      {quickReplies.map((reply, idx) => {
                        const Icon = reply.icon;
                        return (
                          <Badge
                            key={idx}
                            variant="outline"
                            className="cursor-pointer hover:bg-primary/10 text-xs p-2 h-auto flex items-center gap-1 justify-start"
                            onClick={() => handleQuickReply(reply.query)}
                          >
                            <Icon className="w-3 h-3" />
                            {reply.label}
                          </Badge>
                        );
                      })}
                    </div>
                  </div>
                )}
              </div>

              {/* Input */}
              <div className="p-4 border-t">
                <form onSubmit={handleSubmit} className="flex gap-2">
                  <Input
                    value={input}
                    onChange={(e) => setInput(e.target.value)}
                    placeholder="Ask about your analytics..."
                    disabled={loading || !selectedProject}
                    className="flex-1 text-sm"
                  />
                  <Button 
                    type="submit" 
                    size="sm" 
                    disabled={loading || !input.trim() || !selectedProject}
                    className="px-3"
                  >
                    <Send className="w-4 h-4" />
                  </Button>
                </form>
                {!selectedProject && (
                  <p className="text-xs text-muted-foreground mt-1">
                    Select a project to start chatting
                  </p>
                )}
              </div>
            </CardContent>
          </Card>
        )}
      </div>
    </>
  );
}