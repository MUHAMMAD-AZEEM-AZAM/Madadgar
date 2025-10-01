"use client";

import React, { useRef, useEffect } from 'react';
import { Mic, Zap, Loader, AlertCircle } from 'lucide-react';
import { useRecorder } from '@/hooks/use-recorder';
import { Button } from '@/components/ui/button';
import { useAppContext } from '@/contexts/AppContext';
import { translations } from '@/lib/translations';

interface VoiceInputProps {
  onTranscription: (text: string) => void;
  disabled?: boolean;
}

const AudioVisualizer = ({ analyser, isRecording }: { analyser: AnalyserNode | null, isRecording: boolean }) => {
    const canvasRef = useRef<HTMLCanvasElement>(null);

    useEffect(() => {
        if (!analyser || !canvasRef.current || !isRecording) return;

        const canvas = canvasRef.current;
        const canvasCtx = canvas.getContext('2d');
        if (!canvasCtx) return;

        analyser.fftSize = 256;
        const bufferLength = analyser.frequencyBinCount;
        const dataArray = new Uint8Array(bufferLength);

        const draw = () => {
            if (!isRecording) {
                canvasCtx.clearRect(0, 0, canvas.width, canvas.height);
                return;
            };

            requestAnimationFrame(draw);

            analyser.getByteTimeDomainData(dataArray);

            canvasCtx.fillStyle = 'hsl(var(--background))';
            canvasCtx.fillRect(0, 0, canvas.width, canvas.height);

            canvasCtx.lineWidth = 2;
            canvasCtx.strokeStyle = 'hsl(var(--primary))';

            canvasCtx.beginPath();

            const sliceWidth = canvas.width * 1.0 / bufferLength;
            let x = 0;

            for (let i = 0; i < bufferLength; i++) {
                const v = dataArray[i] / 128.0;
                const y = v * canvas.height / 2;

                if (i === 0) {
                    canvasCtx.moveTo(x, y);
                } else {
                    canvasCtx.lineTo(x, y);
                }

                x += sliceWidth;
            }

            canvasCtx.lineTo(canvas.width, canvas.height / 2);
            canvasCtx.stroke();
        };

        draw();

    }, [analyser, isRecording]);
    
    if (!isRecording) return null;

    return <canvas ref={canvasRef} className="w-full h-12 rounded-md border" />;
};


export function VoiceInput({ onTranscription, disabled }: VoiceInputProps) {
  const { recorderState, toggleRecording, analyserNode } = useRecorder(onTranscription);
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
    <div className="space-y-4">
        <Button
            type="button"
            variant="outline"
            className="w-full"
            onClick={toggleRecording}
            disabled={disabled || (recorderState !== 'idle' && recorderState !== 'recording')}
        >
            {getButtonContent()}
        </Button>
        <AudioVisualizer analyser={analyserNode} isRecording={recorderState === 'recording'} />
    </div>
  );
}