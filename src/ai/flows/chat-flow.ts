"use server";
import { ai } from '@/ai/genkit';  // ai is already an instance
import { z } from 'genkit';
import { getChatHistory, saveMessage } from '@/services/chat-service';
import { googleAI } from '@genkit-ai/google-genai';

// Possibly also import the google plugin (if needed) from your genkit setup
// But since ai is already created with that plugin, we just use `ai`.

const ChatHistoryMessageSchema = z.object({
  role: z.enum(['user', 'bot']),
  text: z.string(),
});

const ChatInputSchema = z.object({
  query: z.string(),
  language: z.enum(['en', 'ur']),
  sessionId: z.string(),
});
export type ChatInput = z.infer<typeof ChatInputSchema>;

const ChatOutputSchema = z.object({
  reply: z.string(),
});
export type ChatOutput = z.infer<typeof ChatOutputSchema>;

export async function handleChat(input: ChatInput): Promise<ChatOutput> {
  return chatFlow(input);
}

const chatPrompt = ai.definePrompt({
  name: 'chatPrompt',
  input: {
    schema: z.object({
      query: z.string(),
      language: z.string(),
      history: z.array(ChatHistoryMessageSchema),
    }),
  },
  output: { schema: ChatOutputSchema },
  tools: [
    // depending on how tools are exposed in your `ai`
    // e.g. maybe `ai.tools.googleSearch` or another path
    ai.tools?.googleSearch  // (or the correct tool reference)
  ].filter(Boolean),
  prompt: `You are Madadgar … (same prompt as before)`,
});

const chatFlow = ai.defineFlow(
  {
    name: 'chatFlow',
    inputSchema: ChatInputSchema,
    outputSchema: ChatOutputSchema,
  },
  async (input) => {
    const { sessionId, query, language } = input;

    await saveMessage(sessionId, { role: 'user', text: query });
    const history = await getChatHistory(sessionId);

    const { output } = await chatPrompt({ query, language, history });
    const reply = output!.reply;

    await saveMessage(sessionId, { role: 'bot', text: reply });
    return { reply };
  }
);
