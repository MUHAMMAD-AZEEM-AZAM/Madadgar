"use client";

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { VoiceInput } from '@/components/madadgar/VoiceInput';
import { Send, User } from 'lucide-react';
import { cn } from '@/lib/utils';
import { useAppContext } from '@/contexts/AppContext';
import { translations } from '@/lib/translations';
import { Logo } from '@/components/madadgar/Logo';
import { handleChat } from '@/ai/flows/chat-flow';

type Message = {
    id: string;
    text: string;
    sender: 'user' | 'bot';
};

// In a real app, this would be a dynamic session ID, perhaps tied to a user.
const SESSION_ID = "static-session-123";

export default function ChatPage() {
    const { state } = useAppContext();
    const { language } = state;
    const t = translations[language];
    const isUrdu = language === 'ur';

    const [messages, setMessages] = useState<Message[]>([
        {
            id: '1',
            text: t.chat.welcomeMessage,
            sender: 'bot'
        }
    ]);
    const [inputValue, setInputValue] = useState('');
    const [isProcessing, setIsProcessing] = useState(false);

    const handleSendMessage = async (text: string) => {
        if (!text.trim()) return;

        const userMessage: Message = { id: Date.now().toString(), text, sender: 'user' };
        setMessages(prev => [...prev, userMessage]);
        setInputValue('');
        setIsProcessing(true);

        try {
            const response = await handleChat({ 
                query: text, 
                language,
                sessionId: SESSION_ID,
            });
            const botMessage: Message = { id: (Date.now() + 1).toString(), text: response.reply, sender: 'bot' };
            setMessages(prev => [...prev, botMessage]);
        } catch (error) {
            console.error("Chat error:", error);
            const errorMessage: Message = { id: (Date.now() + 1).toString(), text: t.chat.errorMessage, sender: 'bot' };
            setMessages(prev => [...prev, errorMessage]);
        } finally {
            setIsProcessing(false);
        }
    };
    
    return (
        <div className="flex h-screen flex-col bg-background">
            <header className="sticky top-0 z-10 border-b bg-background/80 backdrop-blur-sm">
                <div className="container mx-auto flex h-16 items-center justify-center px-4">
                     <div className={`flex items-center gap-2 text-xl font-bold text-foreground ${isUrdu ? 'font-urdu' : ''}`}>
                        <Logo className="h-7 w-7 text-primary" />
                        <span>{t.appName}</span>
                    </div>
                </div>
            </header>
            <main className="flex-1 overflow-hidden">
                <ScrollArea className="h-full p-4">
                    <div className="mx-auto max-w-2xl space-y-6">
                        {messages.map((message) => (
                            <div
                                key={message.id}
                                className={cn(
                                    'flex items-start gap-4',
                                    message.sender === 'user' ? 'justify-end' : 'justify-start'
                                )}
                            >
                                {message.sender === 'bot' && (
                                    <Avatar className="h-8 w-8 border">
                                        <AvatarFallback><Logo className="h-5 w-5 text-muted-foreground"/></AvatarFallback>
                                    </Avatar>
                                )}
                                <div
                                    className={cn(
                                        'max-w-[75%] rounded-lg p-3 text-sm shadow-md',
                                        message.sender === 'user'
                                            ? 'bg-primary text-primary-foreground'
                                            : 'bg-card text-card-foreground',
                                        isUrdu ? 'font-urdu leading-loose' : 'leading-relaxed'
                                    )}
                                    dir={isUrdu ? 'rtl' : 'ltr'}
                                >
                                    {message.text}
                                </div>
                                {message.sender === 'user' && (
                                     <Avatar className="h-8 w-8 border">
                                        <AvatarFallback><User className="h-5 w-5 text-muted-foreground"/></AvatarFallback>
                                    </Avatar>
                                )}
                            </div>
                        ))}
                         {isProcessing && (
                            <div className="flex items-start gap-4 justify-start">
                                <Avatar className="h-8 w-8 border">
                                    <AvatarFallback><Logo className="h-5 w-5 text-muted-foreground"/></AvatarFallback>
                                </Avatar>
                                <div className="max-w-[75%] rounded-lg p-3 text-sm shadow-md bg-card text-card-foreground">
                                    <div className="flex items-center gap-2">
                                        <div className="h-2 w-2 animate-pulse rounded-full bg-muted-foreground" />
                                        <div className="h-2 w-2 animate-pulse rounded-full bg-muted-foreground [animation-delay:0.2s]" />
                                        <div className="h-2 w-2 animate-pulse rounded-full bg-muted-foreground [animation-delay:0.4s]" />
                                    </div>
                                </div>
                            </div>
                        )}
                    </div>
                </ScrollArea>
            </main>
            <footer className="border-t bg-background p-4">
                <div className="mx-auto max-w-2xl">
                    <div className="relative">
                        <Input
                            placeholder={t.chat.inputPlaceholder}
                            value={inputValue}
                            onChange={(e) => setInputValue(e.target.value)}
                            onKeyDown={(e) => e.key === 'Enter' && !isProcessing && handleSendMessage(inputValue)}
                            disabled={isProcessing}
                            className={cn('h-12 pr-24 text-base', isUrdu && 'font-urdu')}
                            dir={isUrdu ? 'rtl' : 'ltr'}
                        />
                        <div className="absolute right-1 top-1/2 -translate-y-1/2 flex items-center gap-1">
                           <VoiceInput onTranscription={handleSendMessage} disabled={isProcessing} />
                           <Button 
                              type="button" 
                              size="icon" 
                              onClick={() => handleSendMessage(inputValue)}
                              disabled={isProcessing || !inputValue.trim()}
                              className="h-10 w-10 bg-accent hover:bg-accent/90"
                            >
                                <Send className="h-5 w-5" />
                            </Button>
                        </div>
                    </div>
                </div>
            </footer>
        </div>
    );
}
