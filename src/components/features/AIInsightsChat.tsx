import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { Bot, Send, Loader2, MessageSquare } from 'lucide-react';

interface Message {
  id: string;
  text: string;
  isUser: boolean;
  timestamp: Date;
}

interface AIInsightsChatProps {
  projectId: string;
}

export function AIInsightsChat({ projectId }: AIInsightsChatProps) {
  const [messages, setMessages] = useState<Message[]>([
    {
      id: '1',
      text: "Hi! I'm your AI analytics assistant. Ask me anything about your website data - like 'Which page has the highest bounce rate?' or 'Why did my traffic spike yesterday?'",
      isUser: false,
      timestamp: new Date(),
    }
  ]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const { toast } = useToast();

  const quickQuestions = [
    "Which pages have the highest bounce rate?",
    "What are my top traffic sources?",
    "How did my traffic change this week?",
    "What's my average session duration?",
    "Which countries send the most visitors?",
  ];

  const sendMessage = async (question: string = input) => {
    if (!question.trim() || loading) return;

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
          projectId 
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

  return (
    <Card className="h-96 flex flex-col">
      <CardHeader className="pb-3">
        <CardTitle className="flex items-center gap-2">
          <Bot className="w-5 h-5" />
          AI Insights Assistant
        </CardTitle>
        <CardDescription>
          Ask questions about your analytics data in natural language
        </CardDescription>
      </CardHeader>
      
      <CardContent className="flex-1 flex flex-col gap-3">
        {/* Quick Questions */}
        <div className="flex flex-wrap gap-1">
          {quickQuestions.map((question, idx) => (
            <Badge
              key={idx}
              variant="outline"
              className="cursor-pointer hover:bg-primary/10 text-xs px-2 py-1"
              onClick={() => sendMessage(question)}
            >
              {question}
            </Badge>
          ))}
        </div>

        {/* Messages */}
        <div className="flex-1 overflow-y-auto space-y-3 min-h-0">
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
                    <span className="text-xs font-medium">AI Assistant</span>
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
                  <span className="text-xs">AI is thinking...</span>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Input */}
        <form onSubmit={handleSubmit} className="flex gap-2">
          <Input
            value={input}
            onChange={(e) => setInput(e.target.value)}
            placeholder="Ask me about your analytics..."
            disabled={loading}
            className="flex-1"
          />
          <Button type="submit" size="sm" disabled={loading || !input.trim()}>
            <Send className="w-4 h-4" />
          </Button>
        </form>
      </CardContent>
    </Card>
  );
}