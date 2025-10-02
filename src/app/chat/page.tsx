"use client";

import { useState, useRef } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { VoiceInput } from '@/components/madadgar/VoiceInput';
import { Send, User, Paperclip } from 'lucide-react';
import { cn } from '@/lib/utils';
import { useAppContext } from '@/contexts/AppContext';
import { translations } from '@/lib/translations';
import { Logo } from '@/components/madadgar/Logo';
import { handleChat } from '@/ai/flows/chat-flow';
import { extractInfoFromDocument } from '@/ai/flows/extract-info-from-document-flow';
import { useToast } from '@/hooks/use-toast';

type Message = {
    id: string;
    text: string;
    sender: 'user' | 'bot';
};

// In a real app, this would be a dynamic session ID, perhaps tied to a user.
const SESSION_ID = "static-session-123";

export default function ChatPage() {
    const { state, dispatch } = useAppContext();
    const { language } = state;
    const t = translations[language];
    const isUrdu = language === 'ur';
    const { toast } = useToast();

    const [messages, setMessages] = useState<Message[]>([
        {
            id: '1',
            text: t.chat.welcomeMessage,
            sender: 'bot'
        }
    ]);
    const [inputValue, setInputValue] = useState('');
    const [isProcessing, setIsProcessing] = useState(false);
    const fileInputRef = useRef<HTMLInputElement>(null);

    const addMessage = (text: string, sender: 'user' | 'bot') => {
        const newMessage = { id: Date.now().toString(), text, sender };
        setMessages(prev => [...prev, newMessage]);
        if (sender === 'bot') {
            saveMessage(SESSION_ID, { role: 'bot', text });
        }
    };

    const handleSendMessage = async (text: string) => {
        if (!text.trim()) return;

        addMessage(text, 'user');
        setInputValue('');
        setIsProcessing(true);

        try {
            const response = await handleChat({ 
                query: text, 
                language,
                sessionId: SESSION_ID,
            });
            addMessage(response.reply, 'bot');
        } catch (error) {
            console.error("Chat error:", error);
            addMessage(t.chat.errorMessage, 'bot');
        } finally {
            setIsProcessing(false);
        }
    };

    const handleFileChange = async (event: React.ChangeEvent<HTMLInputElement>) => {
        const file = event.target.files?.[0];
        if (!file) return;

        // Reset the file input so the same file can be uploaded again
        event.target.value = '';

        if (!file.type.startsWith('image/')) {
            toast({
                variant: 'destructive',
                title: 'Invalid File Type',
                description: 'Please upload an image file.',
            });
            return;
        }

        setIsProcessing(true);
        addMessage(`Uploading ${file.name}...`, 'user');

        const reader = new FileReader();
        reader.readAsDataURL(file);
        reader.onloadend = async () => {
            const base64Image = reader.result as string;
            try {
                const result = await extractInfoFromDocument({ documentImageUri: base64Image });
                const { extractedInfo, summary } = result;
                
                // Update app context with extracted data
                dispatch({ type: 'UPDATE_FORM_DATA', payload: extractedInfo });

                // Inform the user what was found
                addMessage(summary, 'bot');
                
                // Follow up with a message asking the user to confirm
                const confirmationQuery = `I've extracted Name: ${extractedInfo.name}, CNIC: ${extractedInfo.cnic}, and DOB: ${extractedInfo.dob}. Is this correct? Please continue the conversation.`;
                 const response = await handleChat({ 
                    query: confirmationQuery, 
                    language,
                    sessionId: SESSION_ID,
                });
                addMessage(response.reply, 'bot');

            } catch (error) {
                console.error("Document extraction error:", error);
                addMessage(t.chat.errorMessage, 'bot');
            } finally {
                setIsProcessing(false);
            }
        };
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
                                    {message.text.split('\n').map((line, i) => <p key={i}>{line}</p>)}
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
                            className={cn('h-12 pr-36 text-base', isUrdu && 'font-urdu')}
                            dir={isUrdu ? 'rtl' : 'ltr'}
                        />
                        <div className="absolute right-1 top-1/2 -translate-y-1/2 flex items-center gap-1">
                           <input type="file" ref={fileInputRef} onChange={handleFileChange} className="hidden" accept="image/*" />
                           <Button 
                              type="button" 
                              variant="outline"
                              size="icon" 
                              onClick={() => fileInputRef.current?.click()}
                              disabled={isProcessing}
                              className="h-10 w-10"
                            >
                                <Paperclip className="h-5 w-5" />
                           </Button>
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
