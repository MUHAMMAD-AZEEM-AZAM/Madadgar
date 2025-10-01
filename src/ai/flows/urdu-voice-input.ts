'use server';

/**
 * @fileOverview Allows users to input information using voice in Urdu or English.
 *
 * - urduVoiceInput - A function that handles voice input and returns the transcribed text.
 * - UrduVoiceInputOutput - The return type for the urduVoiceInput function.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';

const UrduVoiceInputOutputSchema = z.object({
  transcription: z.string().describe('The transcribed text from the user\'s voice input.'),
});
export type UrduVoiceInputOutput = z.infer<typeof UrduVoiceInputOutputSchema>;

export async function urduVoiceInput(audioDataUri: string): Promise<UrduVoiceInputOutput> {
  return urduVoiceInputFlow(audioDataUri);
}

const urduVoiceInputFlow = ai.defineFlow(
  {
    name: 'urduVoiceInputFlow',
    inputSchema: z.string(),
    outputSchema: UrduVoiceInputOutputSchema,
  },
  async audioDataUri => {
    const {text} = await ai.generate({
      prompt: [
        {
          media: {url: audioDataUri},
        },
        {
          text: 'Transcribe the audio. The audio may be in either English or Urdu.',
        },
      ],
      model: 'gemini-2.5-flash-image-preview',
      config: {
        responseModalities: ['TEXT'],
      },
    });
    return {transcription: text!};
  }
);
