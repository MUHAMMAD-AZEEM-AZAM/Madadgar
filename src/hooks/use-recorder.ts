"use client";

import { useState, useRef, useCallback } from 'react';
import { useToast } from './use-toast';
import { urduVoiceInput } from '@/ai/flows/urdu-voice-input';

type RecorderState = 'idle' | 'permission_pending' | 'recording' | 'processing' | 'error';

export const useRecorder = (onTranscriptionComplete: (text: string) => void) => {
  const { toast } = useToast();
  const [recorderState, setRecorderState] = useState<RecorderState>('idle');
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const audioChunksRef = useRef<Blob[]>([]);
  const audioContextRef = useRef<AudioContext | null>(null);
  const analyserNodeRef = useRef<AnalyserNode | null>(null);
  const [analyserNode, setAnalyserNode] = useState<AnalyserNode | null>(null);
  const streamRef = useRef<MediaStream | null>(null);


  const startRecording = async () => {
    setRecorderState('permission_pending');
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      streamRef.current = stream;
      mediaRecorderRef.current = new MediaRecorder(stream);
      
      // Setup audio analysis
      if (!audioContextRef.current) {
          audioContextRef.current = new (window.AudioContext || (window as any).webkitAudioContext)();
      }
      const source = audioContextRef.current.createMediaStreamSource(stream);
      const analyser = audioContextRef.current.createAnalyser();
      source.connect(analyser);
      analyserNodeRef.current = analyser;
      setAnalyserNode(analyser);


      mediaRecorderRef.current.ondataavailable = (event) => {
        if (event.data.size > 0) {
          audioChunksRef.current.push(event.data);
        }
      };
      
      mediaRecorderRef.current.onstop = async () => {
        setRecorderState('processing');
        setAnalyserNode(null); // Stop visualizer
        const audioBlob = new Blob(audioChunksRef.current, { type: 'audio/webm' });
        audioChunksRef.current = [];
        
        // Convert Blob to Data URI
        const reader = new FileReader();
        reader.readAsDataURL(audioBlob);
        reader.onloadend = async () => {
          const base64Audio = reader.result as string;
          try {
            const { transcription } = await urduVoiceInput(base64Audio);
            if (transcription) {
              onTranscriptionComplete(transcription);
              setRecorderState('idle');
            } else {
              throw new Error("Empty transcription");
            }
          } catch (error) {
            console.error('Transcription error:', error);
            toast({ variant: 'destructive', description: "Sorry, I couldn't catch that. Please try again." });
            setRecorderState('error');
            setTimeout(() => setRecorderState('idle'), 2000);
          }
        };
        // Stop all tracks on the stream to turn off the mic indicator
        stream.getTracks().forEach(track => track.stop());
        streamRef.current = null;
      };
      
      mediaRecorderRef.current.start();
      setRecorderState('recording');
    } catch (error) {
      console.error('Error accessing microphone:', error);
      toast({ variant: 'destructive', description: "Microphone permission is denied. Please enable it in your browser settings." });
      setRecorderState('error');
      setTimeout(() => setRecorderState('idle'), 2000);
    }
  };

  const stopRecording = useCallback(() => {
    if (mediaRecorderRef.current && mediaRecorderRef.current.state === 'recording') {
      mediaRecorderRef.current.stop();
    }
  }, []);

  const toggleRecording = useCallback(() => {
    if (recorderState === 'recording') {
      stopRecording();
    } else {
      startRecording();
    }
  }, [recorderState, stopRecording]);

  return {
    recorderState,
    toggleRecording,
    analyserNode,
  };
};