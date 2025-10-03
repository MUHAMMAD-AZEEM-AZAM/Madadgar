"use client";

import { useState, useRef, useEffect } from 'react';
import { useAppContext } from '@/contexts/AppContext';
import { translations } from '@/lib/translations';
import { ChatMessage } from '@/components/chat/ChatMessage';
import { ChatInput } from '@/components/chat/ChatInput';
import { ChatHeader } from '@/components/chat/ChatHeader';
import { handleChat } from '@/ai/flows/chat-flow';
import { v4 as uuidv4 } from 'uuid';

interface Message {
  id: string;
  role: 'user' | 'bot';
  content: string;
  timestamp: Date;
  isLoading?: boolean;
  attachments?: File[];
  isSearching?: boolean;
  functionCalls?: any[];
  pausedForHuman?: boolean;
}

export default function ChatPage() {
  const { state } = useAppContext();
  const { language } = state;
  const t = translations[language];

  const [messages, setMessages] = useState<Message[]>([
    {
      id: '1',
      role: 'bot',
      content: language === 'ur'
        ? `**السلام علیکم! میں مددگار ہوں۔** 🤖

میں آپ کی **آن لائن فارم بھرنے** میں مدد کر سکتا ہوں۔ 

**میں کیا کر سکتا ہوں:**
- عام سوالات کا جواب دینا
- فارم بھرنے کی رہنمائی
- ویب سائٹس پر جا کر خودکار فارم بھرنا

**مثالیں:**
- "NADRA کا فارم کیسے بھرتے ہیں؟" (معلومات)
- "NADRA کی ویب سائٹ پر جا کر میرا فارم بھریں" (خودکار)`
        : `**Hello! I'm Madadgar.** 🤖

I can help you with **online form filling** automatically.

**What I can do:**
- Answer general questions
- Provide form filling guidance  
- Navigate websites and fill forms automatically

**Examples:**
- "How to fill NADRA form?" (information)
- "Go to NADRA website and fill my form" (automation)`,
      timestamp: new Date(),
    }
  ]);

  const [sessionId] = useState(() => uuidv4());
  const [isPaused, setIsPaused] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const handleSendMessage = async (content: string, attachments?: File[]) => {
    const userMessage: Message = {
      id: uuidv4(),
      role: 'user',
      content,
      timestamp: new Date(),
      attachments: attachments || [],
    };

    const loadingMessage: Message = {
      id: uuidv4(),
      role: 'bot',
      content: '',
      timestamp: new Date(),
      isLoading: true,
      isSearching: false,
    };

    setMessages(prev => [...prev, userMessage, loadingMessage]);

    try {
      // Use Gemini Agent API for web automation
      const response = await fetch('/api/gemini-agent/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          sessionId,
          message: content
        })
      });

      const data = await response.json();

      if (data.status === 'success') {
        setMessages(prev =>
          prev.map(msg =>
            msg.id === loadingMessage.id
              ? {
                ...msg,
                content: data.response,
                isLoading: false,
                isSearching: false,
                functionCalls: data.functionCalls,
                pausedForHuman: data.pausedForHuman
              }
              : msg
          )
        );
        setIsPaused(data.pausedForHuman || false);
      } else {
        throw new Error(data.error || 'Unknown error');
      }
    } catch (error) {
      console.error('Error sending message:', error);
      setMessages(prev =>
        prev.map(msg =>
          msg.id === loadingMessage.id
            ? {
              ...msg,
              content: language === 'ur'
                ? 'معافی، کچھ غلط ہو گیا۔ براہ کرم دوبارہ کوشش کریں۔'
                : 'Sorry, something went wrong. Please try again.',
              isLoading: false,
              isSearching: false
            }
            : msg
        )
      );
    }
  };

  const handleContinue = async () => {
    setIsPaused(false);

    try {
      const response = await fetch('/api/gemini-agent/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          sessionId,
          action: 'continue'
        })
      });

      const data = await response.json();

      if (data.status === 'success') {
        const continueMessage: Message = {
          id: uuidv4(),
          role: 'bot',
          content: data.response,
          timestamp: new Date(),
          functionCalls: data.functionCalls,
          pausedForHuman: data.pausedForHuman
        };

        setMessages(prev => [...prev, continueMessage]);
        setIsPaused(data.pausedForHuman || false);
      }
    } catch (error) {
      console.error('Error continuing:', error);
    }
  };

  return (
    <div className="flex flex-col h-screen bg-gray-50">
      <ChatHeader />

      <div className="flex-1 overflow-hidden flex flex-col">
        <div className="flex-1 overflow-y-auto px-4 py-6 space-y-4">
          {messages.map((message) => (
            <ChatMessage
              key={message.id}
              message={message}
              language={language}
            />
          ))}
          <div ref={messagesEndRef} />
        </div>

        <div className="border-t bg-white p-4">
          {isPaused && (
            <div className="mb-3 p-3 bg-yellow-50 border border-yellow-200 rounded-lg text-sm">
              <div className="flex items-center gap-2 mb-2">
                <div className="w-2 h-2 bg-yellow-500 rounded-full animate-pulse"></div>
                <span className={`font-semibold text-yellow-800 ${language === 'ur' ? 'font-urdu' : ''}`}>
                  {language === 'ur' ? '⏸️ انسانی مداخلت کی ضرورت' : '⏸️ Human intervention needed'}
                </span>
              </div>
              <p className={`text-yellow-700 mb-2 ${language === 'ur' ? 'font-urdu' : ''}`} dir={language === 'ur' ? 'rtl' : 'ltr'}>
                {language === 'ur'
                  ? 'براؤزر ونڈو میں CAPTCHA حل کریں، پھر جاری رکھیں۔'
                  : 'Please solve the CAPTCHA in the browser window, then continue.'
                }
              </p>
              <button
                onClick={handleContinue}
                className={`px-3 py-1 bg-yellow-500 text-white rounded text-xs hover:bg-yellow-600 ${language === 'ur' ? 'font-urdu' : ''}`}
              >
                {language === 'ur' ? 'جاری رکھیں' : 'Continue'}
              </button>
            </div>
          )}
          <ChatInput
            onSendMessage={handleSendMessage}
            language={language}
            disabled={isPaused}
          />
        </div>
      </div>
    </div>
  );
}