"use client";

import React from 'react';
import { Mic, Loader, AlertCircle } from 'lucide-react';
import { useRecorder } from '@/hooks/use-recorder';
import { Button } from '@/components/ui/button';
import { useAppContext } from '@/contexts/AppContext';
import { translations } from '@/lib/translations';
import { cn } from '@/lib/utils';

interface VoiceInputProps {
  onTranscription: (text: string) => void;
  disabled?: boolean;
}

export function VoiceInput({ onTranscription, disabled }: VoiceInputProps) {
  const { recorderState, toggleRecording } = useRecorder(onTranscription);
  const { state } = useAppContext();
  const t = translations[state.language];

  const getButtonContent = () => {
    switch (recorderState) {
      case 'recording':
        return (
          <>
            <span className="relative flex h-4 w-4">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-red-500 opacity-75"></span>
              <span className="relative inline-flex rounded-full h-4 w-4 bg-red-600"></span>
            </span>
            <span className="ml-3 text-base font-medium">{t.voiceInput.recording}</span>
          </>
        );
      case 'processing':
        return (
          <>
            <Loader className="animate-spin h-5 w-5 text-blue-600" />
            <span className="ml-3 text-base font-medium">{t.voiceInput.processing}</span>
          </>
        );
       case 'error':
        return (
            <>
                <AlertCircle className="h-5 w-5 text-red-600" />
                <span className="ml-3 text-base font-medium">{t.voiceInput.error}</span>
            </>
        );
      case 'permission_pending':
      case 'idle':
      default:
        return (
          <>
            <Mic className="h-5 w-5 text-blue-600" />
            <span className="ml-3 text-base font-medium">{t.voiceInput.speakNow}</span>
          </>
        );
    }
  };

  return (
    <Button
        type="button"
        variant={recorderState === 'recording' ? 'destructive' : 'outline'}
        size="lg"
        className={cn(
          "w-full h-14 text-base font-medium transition-all duration-200 border-2 shadow-sm",
          state.language === 'ur' && "font-urdu",
          recorderState === 'recording' && "bg-red-50 border-red-300 text-red-700 hover:bg-red-100 shadow-red-100",
          recorderState === 'idle' && "border-blue-300 text-blue-700 hover:bg-blue-50 hover:border-blue-400 shadow-blue-100",
          recorderState === 'processing' && "border-blue-300 text-blue-700 bg-blue-50 shadow-blue-100"
        )}
        onClick={toggleRecording}
        disabled={disabled || (recorderState !== 'idle' && recorderState !== 'recording')}
    >
        {getButtonContent()}
    </Button>
  );
}
