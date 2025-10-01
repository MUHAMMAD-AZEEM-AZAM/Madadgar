import {genkit} from 'genkit';
import {googleAI} from '@genkit-ai/google-genai';

const MODEL_NAME = 'googleai/gemini-2.5-flash';
console.log(`[AI] Initializing Genkit with model: ${MODEL_NAME}`);
export const ai = genkit({
  plugins: [googleAI()],
  model: MODEL_NAME,
});
