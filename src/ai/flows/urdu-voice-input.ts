'use server';

/**
 * @fileOverview Allows users to input information using voice in Urdu or English.
 *
 * - urduVoiceInput - A function that handles voice input and returns the transcribed text.
 * - UrduVoiceInputOutput - The return type for the urduVoiceInput function.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';
import {googleAI} from '@genkit-ai/google-genai';

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
          text: 'Transcribe the audio. The audio may be in either English or Urdu. It might contain a name, date, or a CNIC number. If it is a CNIC number, transcribe it as a sequence of digits, separated by hyphens if spoken that way (e.g., "12345-1234567-1").',
        },
      ],
      model: googleAI('gemini-1.5-flash-latest'),
    });
    
    return {transcription: text!};
  }
);
