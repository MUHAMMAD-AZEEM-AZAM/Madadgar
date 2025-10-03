"use client";

import { useState, useEffect } from 'react';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { Button } from '@/components/ui/button';
import { Copy, Volume2, VolumeX, Globe, MousePointer, FileText, CheckCircle, XCircle } from 'lucide-react';
import { Logo } from '@/components/madadgar/Logo';
import { SearchIndicator } from './SearchIndicator';
import { cn } from '@/lib/utils';
import { Language } from '@/lib/translations';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';

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

interface ChatMessageProps {
  message: Message;
  language: Language;
}

export function ChatMessage({ message, language }: ChatMessageProps) {
  const [isPlaying, setIsPlaying] = useState(false);
  const isUrdu = language === 'ur';
  const isBot = message.role === 'bot';

  const handleSpeak = () => {
    if (isPlaying) {
      speechSynthesis.cancel();
      setIsPlaying(false);
      return;
    }

    const utterance = new SpeechSynthesisUtterance(message.content);
    utterance.lang = language === 'ur' ? 'ur-PK' : 'en-US';
    utterance.rate = 0.9;

    utterance.onstart = () => setIsPlaying(true);
    utterance.onend = () => setIsPlaying(false);
    utterance.onerror = () => setIsPlaying(false);

    speechSynthesis.speak(utterance);
  };

  const handleCopy = () => {
    navigator.clipboard.writeText(message.content);
  };

  if (message.isLoading) {
    return (
      <div className="flex gap-3 max-w-4xl mx-auto">
        <Avatar className="w-8 h-8 flex-shrink-0">
          <AvatarFallback className="bg-primary/10">
            <Logo className="w-4 h-4 text-primary" />
          </AvatarFallback>
        </Avatar>

        <div className="flex-1 space-y-2">
          {message.isSearching ? (
            <SearchIndicator language={language} />
          ) : (
            <div className="bg-white rounded-2xl px-4 py-3 shadow-sm border">
              <div className="flex space-x-1">
                <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce"></div>
                <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '0.1s' }}></div>
                <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '0.2s' }}></div>
              </div>
            </div>
          )}
        </div>
      </div>
    );
  }

  return (
    <div className={cn("flex gap-3 max-w-4xl mx-auto", !isBot && "flex-row-reverse")}>
      <Avatar className="w-8 h-8 flex-shrink-0">
        <AvatarFallback className={isBot ? "bg-primary/10" : "bg-blue-500"}>
          {isBot ? (
            <Logo className="w-4 h-4 text-primary" />
          ) : (
            <span className="text-white text-sm font-medium">
              {isUrdu ? 'آپ' : 'You'}
            </span>
          )}
        </AvatarFallback>
      </Avatar>

      <div className={cn("flex-1 space-y-2", !isBot && "flex flex-col items-end")}>
        {/* Attachments */}
        {message.attachments && message.attachments.length > 0 && (
          <div className={cn("space-y-2 max-w-[85%] md:max-w-[70%]", !isBot && "self-end")}>
            {message.attachments.map((file, index) => (
              <AttachmentPreview key={index} file={file} />
            ))}
          </div>
        )}

        {/* Message content */}
        {message.content && (
          <div className={cn(
            "rounded-2xl px-4 py-3 shadow-sm max-w-[85%] md:max-w-[70%]",
            isBot
              ? "bg-white border"
              : "bg-blue-500 text-white"
          )}>
            {isBot ? (
              <div className={cn(
                "prose prose-sm max-w-none",
                isUrdu && "font-urdu leading-loose",
                "prose-headings:text-gray-800 prose-p:text-gray-800 prose-strong:text-gray-900",
                "prose-ul:text-gray-800 prose-ol:text-gray-800 prose-li:text-gray-800"
              )} dir={isUrdu ? 'rtl' : 'ltr'}>
                <ReactMarkdown
                  remarkPlugins={[remarkGfm]}
                  components={{
                    h1: ({ children }) => <h1 className={cn("text-lg font-bold mb-2", isUrdu && "font-urdu")}>{children}</h1>,
                    h2: ({ children }) => <h2 className={cn("text-base font-semibold mb-2", isUrdu && "font-urdu")}>{children}</h2>,
                    h3: ({ children }) => <h3 className={cn("text-sm font-medium mb-1", isUrdu && "font-urdu")}>{children}</h3>,
                    p: ({ children }) => <p className={cn("text-sm leading-relaxed mb-2", isUrdu && "font-urdu leading-loose")}>{children}</p>,
                    ul: ({ children }) => <ul className="list-disc list-inside mb-2 space-y-1">{children}</ul>,
                    ol: ({ children }) => <ol className="list-decimal list-inside mb-2 space-y-1">{children}</ol>,
                    li: ({ children }) => <li className={cn("text-sm", isUrdu && "font-urdu")}>{children}</li>,
                    strong: ({ children }) => <strong className={cn("font-semibold", isUrdu && "font-urdu")}>{children}</strong>,
                    em: ({ children }) => <em className={cn("italic", isUrdu && "font-urdu")}>{children}</em>,
                    code: ({ children }) => <code className="bg-gray-100 px-1 py-0.5 rounded text-xs font-mono">{children}</code>,
                  }}
                >
                  {message.content}
                </ReactMarkdown>
              </div>
            ) : (
              <p className={cn(
                "text-sm leading-relaxed whitespace-pre-wrap text-white",
                isUrdu && "font-urdu leading-loose"
              )} dir={isUrdu ? 'rtl' : 'ltr'}>
                {message.content}
              </p>
            )}
          </div>
        )}

        {/* Function calls display */}
        {message.functionCalls && message.functionCalls.length > 0 && (
          <div className="mt-2 space-y-2 max-w-[85%] md:max-w-[70%]">
            <div className="bg-gray-50 rounded-lg p-3 border">
              <div className="flex items-center gap-2 mb-2">
                <MousePointer className="w-4 h-4 text-blue-600" />
                <span className={cn("text-xs font-semibold text-gray-700", isUrdu && "font-urdu")}>
                  {isUrdu ? 'انجام شدہ اعمال:' : 'Actions Performed:'}
                </span>
              </div>
              <div className="space-y-1">
                {message.functionCalls.map((call, i) => (
                  <div key={i} className="flex items-center gap-2 text-xs">
                    {getFunctionIcon(call.name)}
                    <span className="font-mono text-purple-600">{call.name}</span>
                    {call.result?.success ? (
                      <CheckCircle className="w-3 h-3 text-green-600" />
                    ) : (
                      <XCircle className="w-3 h-3 text-red-600" />
                    )}
                    {call.result?.message && (
                      <span className={cn("text-gray-600 truncate", isUrdu && "font-urdu")}>
                        {call.result.message}
                      </span>
                    )}
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* Paused for human indicator */}
        {message.pausedForHuman && (
          <div className="mt-2 p-2 bg-yellow-50 border border-yellow-200 rounded-lg text-sm max-w-[85%] md:max-w-[70%]">
            <p className={cn("font-semibold text-yellow-800", isUrdu && "font-urdu")} dir={isUrdu ? 'rtl' : 'ltr'}>
              {isUrdu ? '⏸️ انسانی مداخلت کی ضرورت' : '⏸️ Paused for human intervention'}
            </p>
          </div>
        )}

        {isBot && (
          <div className="flex items-center gap-1 px-2">
            <Button
              variant="ghost"
              size="sm"
              onClick={handleSpeak}
              className="h-7 px-2 text-gray-500 hover:text-gray-700"
            >
              {isPlaying ? (
                <VolumeX className="w-3 h-3" />
              ) : (
                <Volume2 className="w-3 h-3" />
              )}
            </Button>

            <Button
              variant="ghost"
              size="sm"
              onClick={handleCopy}
              className="h-7 px-2 text-gray-500 hover:text-gray-700"
            >
              <Copy className="w-3 h-3" />
            </Button>

            <span className="text-xs text-gray-400 ml-2">
              {message.timestamp.toLocaleTimeString([], {
                hour: '2-digit',
                minute: '2-digit'
              })}
            </span>
          </div>
        )}
      </div>
    </div>
  );
}

function AttachmentPreview({ file }: { file: File }) {
  const [preview, setPreview] = useState<string | null>(null);

  useEffect(() => {
    if (file.type.startsWith('image/')) {
      const reader = new FileReader();
      reader.onload = (e) => setPreview(e.target?.result as string);
      reader.readAsDataURL(file);
    }
    return () => {
      if (preview) URL.revokeObjectURL(preview);
    };
  }, [file]);

  if (file.type.startsWith('image/') && preview) {
    return (
      <div className="relative group">
        <img
          src={preview}
          alt={file.name}
          className="max-w-full max-h-64 rounded-lg shadow-sm border object-cover"
        />
        <div className="absolute bottom-2 left-2 bg-black/70 text-white text-xs px-2 py-1 rounded opacity-0 group-hover:opacity-100 transition-opacity">
          {file.name}
        </div>
      </div>
    );
  }

  return (
    <div className="flex items-center gap-2 bg-gray-100 rounded-lg px-3 py-2 text-sm border">
      <div className="w-8 h-8 bg-gray-200 rounded flex items-center justify-center">
        📄
      </div>
      <div className="flex-1 min-w-0">
        <p className="truncate font-medium">{file.name}</p>
        <p className="text-xs text-gray-500">{(file.size / 1024).toFixed(1)} KB</p>
      </div>
    </div>
  );
}

function getFunctionIcon(functionName: string) {
  switch (functionName) {
    case 'navigate_to_website':
      return <Globe className="w-3 h-3 text-blue-600" />;
    case 'fill_form':
      return <FileText className="w-3 h-3 text-green-600" />;
    case 'click_element':
      return <MousePointer className="w-3 h-3 text-purple-600" />;
    case 'extract_page_info':
      return <FileText className="w-3 h-3 text-orange-600" />;
    case 'check_for_captcha':
      return <CheckCircle className="w-3 h-3 text-yellow-600" />;
    case 'take_screenshot':
      return <FileText className="w-3 h-3 text-gray-600" />;
    default:
      return <MousePointer className="w-3 h-3 text-gray-600" />;
  }
}