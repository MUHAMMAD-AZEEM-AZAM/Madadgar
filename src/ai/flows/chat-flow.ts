"use server";
import { ai } from '@/ai/genkit';
import { z } from 'genkit';
import { getChatHistory, saveMessage } from '@/services/chat-service';

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

    // Create the prompt with proper format
    const promptText = `You are Madadgar, a friendly and helpful AI assistant designed to help users, particularly those in Pakistan who may have low literacy, fill out official forms. Your primary language for interaction is Urdu, but you can also communicate in English if the user prefers.

Current Conversation History:
${history.map(msg => `- ${msg.role}: ${msg.text}`).join('\n')}

New User Query: "${query}"

Your Task:
1. Understand the user's request, which will be related to filling out a form (e.g., passport application, CNIC renewal).
2. Use your extensive knowledge to provide helpful answers about Pakistani government forms and procedures.
3. Provide information about official Pakistani government websites like NADRA (nadra.gov.pk), passport office, or other authoritative sources.
4. If the user wants to start filling a form and you need their personal details (like name, CNIC, DOB), you can simplify the process by suggesting they upload a picture of their CNIC.
5. Engage in a natural, step-by-step conversation. Ask one question at a time.
6. Your responses should be in the user's selected language (${language}). For Urdu, use Urdu script.
7. Be polite, patient, and encouraging throughout the conversation.

Based on the new query and the history, provide the next appropriate response.`;

    const response = await ai.generate({
      model: 'googleai/gemini-2.5-flash',
      prompt: promptText
    });

    const reply = response.text;
    await saveMessage(sessionId, { role: 'bot', text: reply });
    return { reply };
  }
);
