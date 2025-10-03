"use client";

import { useState, useRef, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { 
  Send, 
  Paperclip, 
  Mic, 
  MicOff, 
  Square,
  Image as ImageIcon,
  FileText,
  X
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { Language, translations } from '@/lib/translations';
import { useRecorder } from '@/hooks/use-recorder';

interface ChatInputProps {
  onSendMessage: (content: string, attachments?: File[]) => void;
  language: Language;
  disabled?: boolean;
}

export function ChatInput({ onSendMessage, language, disabled = false }: ChatInputProps) {
  const [message, setMessage] = useState('');
  const [attachments, setAttachments] = useState<File[]>([]);
  const [isDragging, setIsDragging] = useState(false);
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const isUrdu = language === 'ur';
  const t = translations[language];

  const { recorderState, toggleRecording } = useRecorder((transcription) => {
    setMessage(prev => prev + (prev ? ' ' : '') + transcription);
  });

  const isRecording = recorderState === 'recording';
  const isProcessing = recorderState === 'processing';

  useEffect(() => {
    if (textareaRef.current) {
      textareaRef.current.style.height = 'auto';
      textareaRef.current.style.height = Math.min(textareaRef.current.scrollHeight, 120) + 'px';
    }
  }, [message]);

  const handleSend = () => {
    if (!disabled && (message.trim() || attachments.length > 0)) {
      onSendMessage(message.trim(), attachments);
      setMessage('');
      setAttachments([]);
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || []);
    setAttachments(prev => [...prev, ...files]);
  };

  const removeAttachment = (index: number) => {
    setAttachments(prev => prev.filter((_, i) => i !== index));
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    const files = Array.from(e.dataTransfer.files);
    setAttachments(prev => [...prev, ...files]);
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(true);
  };

  const handleDragLeave = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
  };

  const getFileIcon = (file: File) => {
    if (file.type.startsWith('image/')) {
      return <ImageIcon className="w-4 h-4" />;
    }
    return <FileText className="w-4 h-4" />;
  };

  return (
    <div className="space-y-3">
      {/* Attachments */}
      {attachments.length > 0 && (
        <div className="flex flex-wrap gap-2">
          {attachments.map((file, index) => (
            <div
              key={index}
              className="flex items-center gap-2 bg-gray-100 rounded-lg px-3 py-2 text-sm"
            >
              {getFileIcon(file)}
              <span className="truncate max-w-32">{file.name}</span>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => removeAttachment(index)}
                className="h-4 w-4 p-0 hover:bg-gray-200"
              >
                <X className="w-3 h-3" />
              </Button>
            </div>
          ))}
        </div>
      )}

      {/* Input Area */}
      <div
        className={cn(
          "relative border rounded-2xl bg-white transition-all duration-200",
          isDragging ? "border-blue-400 bg-blue-50" : "border-gray-200",
          "focus-within:border-blue-400 focus-within:shadow-sm"
        )}
        onDrop={handleDrop}
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
      >
        {isDragging && (
          <div className="absolute inset-0 bg-blue-50 border-2 border-dashed border-blue-400 rounded-2xl flex items-center justify-center z-10">
            <p className={cn("text-blue-600 font-medium", isUrdu && "font-urdu")} dir={isUrdu ? 'rtl' : 'ltr'}>
              {isUrdu ? 'فائل یہاں چھوڑیں' : 'Drop files here'}
            </p>
          </div>
        )}

        <div className="flex items-end gap-2 p-3">
          {/* Attachment Button */}
          <Button
            variant="ghost"
            size="sm"
            onClick={() => fileInputRef.current?.click()}
            className="flex-shrink-0 h-8 w-8 p-0 text-gray-500 hover:text-gray-700"
          >
            <Paperclip className="w-4 h-4" />
          </Button>

          {/* Text Input */}
          <Textarea
            ref={textareaRef}
            value={message}
            onChange={(e) => setMessage(e.target.value)}
            onKeyPress={handleKeyPress}
            placeholder={isUrdu ? 'یہاں ٹائپ کریں...' : 'Type a message...'}
            className={cn(
              "flex-1 min-h-[40px] max-h-[120px] resize-none border-0 focus-visible:ring-0 bg-transparent",
              isUrdu && "font-urdu text-right"
            )}
            dir={isUrdu ? 'rtl' : 'ltr'}
          />

          {/* Voice Button */}
          <Button
            variant="ghost"
            size="sm"
            onClick={toggleRecording}
            className={cn(
              "flex-shrink-0 h-8 w-8 p-0 transition-all duration-200",
              isRecording 
                ? "text-red-600 bg-red-50 hover:bg-red-100" 
                : "text-gray-500 hover:text-blue-600 hover:bg-blue-50"
            )}
            disabled={isProcessing}
          >
            {isRecording ? (
              <Square className="w-4 h-4 fill-current" />
            ) : isProcessing ? (
              <div className="w-4 h-4 border-2 border-blue-600 border-t-transparent rounded-full animate-spin" />
            ) : (
              <Mic className="w-4 h-4" />
            )}
          </Button>

          {/* Send Button */}
          <Button
            onClick={handleSend}
            disabled={disabled || (!message.trim() && attachments.length === 0)}
            size="sm"
            className="flex-shrink-0 h-8 w-8 p-0 bg-blue-500 hover:bg-blue-600 disabled:bg-gray-300"
          >
            <Send className="w-4 h-4" />
          </Button>
        </div>

        {/* Recording Indicator */}
        {isRecording && (
          <div className="absolute -top-12 left-1/2 transform -translate-x-1/2 bg-red-500 text-white px-3 py-1 rounded-full text-sm flex items-center gap-2">
            <div className="w-2 h-2 bg-white rounded-full animate-pulse" />
            <span className={isUrdu ? "font-urdu" : ""}>
              {isUrdu ? 'ریکارڈنگ...' : 'Recording...'}
            </span>
          </div>
        )}
      </div>

      {/* Hidden File Input */}
      <input
        ref={fileInputRef}
        type="file"
        multiple
        accept="image/*,.pdf,.doc,.docx,.txt"
        onChange={handleFileSelect}
        className="hidden"
      />
    </div>
  );
}