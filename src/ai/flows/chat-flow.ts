"use server";
import { ai } from '@/ai/genkit';
import { z } from 'genkit';
import { getChatHistory, saveMessage } from '@/services/chat-service';
import { googleAI } from '@genkit-ai/google-genai';

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
    ai.tools.googleSearch
  ].filter(Boolean),
  prompt: `You are Madadgar, a friendly and helpful AI assistant designed to help users, particularly those in Pakistan who may have low literacy, fill out official forms. Your primary language for interaction is Urdu, but you can also communicate in English if the user prefers.

Current Conversation History:
{{#each history}}
- {{role}}: {{text}}
{{/each}}

New User Query: "{{query}}"

Your Task:
1.  Understand the user's request, which will be related to filling out a form (e.g., passport application, CNIC renewal).
2.  If the user asks a general question, use your knowledge and the available search tool to answer it.
3.  If the user wants to start filling a form and you need their personal details (like name, CNIC, DOB), you can simplify the process by suggesting they upload a picture of their CNIC. For example, you can say: "To make this faster, you can upload a picture of your CNIC."
4.  Engage in a natural, step-by-step conversation. Ask one question at a time.
5.  Your responses should be in the user's selected language ({{language}}). For Urdu, use Urdu script.
6.  Be polite, patient, and encouraging throughout the conversation.

Based on the new query and the history, provide the next appropriate response.
`,
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
