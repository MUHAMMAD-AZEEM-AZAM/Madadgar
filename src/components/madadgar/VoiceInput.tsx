"use client";

import React from 'react';
import { Mic, Zap, Loader, AlertCircle } from 'lucide-react';
import { useRecorder } from '@/hooks/use-recorder';
import { Button } from '@/components/ui/button';
import { useAppContext } from '@/contexts/AppContext';
import { translations } from '@/lib/translations';

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
            <span className="relative flex h-3 w-3">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-destructive opacity-75"></span>
              <span className="relative inline-flex rounded-full h-3 w-3 bg-destructive/90"></span>
            </span>
            <span className="ml-2">{t.voiceInput.recording}</span>
          </>
        );
      case 'processing':
        return (
          <>
            <Loader className="animate-spin" />
            <span className="ml-2">{t.voiceInput.processing}</span>
          </>
        );
       case 'error':
        return (
            <>
                <AlertCircle />
                <span className="ml-2">{t.voiceInput.error}</span>
            </>
        );
      case 'permission_pending':
      case 'idle':
      default:
        return (
          <>
            <Mic />
            <span className="ml-2">{t.voiceInput.speakNow}</span>
          </>
        );
    }
  };

  return (
    <Button
      type="button"
      variant="outline"
      className="w-full"
      onClick={toggleRecording}
      disabled={disabled || (recorderState !== 'idle' && recorderState !== 'recording')}
    >
      {getButtonContent()}
    </Button>
  );
}
