"use server";
/**
 * @fileOverview A conversational AI flow for handling form-filling requests.
 *
 * - handleChat - A function that takes user input and returns a conversational response.
 * - ChatInput - The input type for the handleChat function.
 * - ChatOutput - The return type for the handleChat function.
 */

import { ai } from '@/ai/genkit';
import { z } from 'genkit';
import { getChatHistory, saveMessage, type ChatMessage } from '@/services/chat-service';
import {googleSearch} from '@genkit-ai/google-genai/tools';


const ChatHistoryMessageSchema = z.object({
    role: z.enum(['user', 'bot']),
    text: z.string(),
});

const ChatInputSchema = z.object({
  query: z.string().describe('The user\'s message.'),
  language: z.enum(['en', 'ur']).describe('The language of the conversation.'),
  sessionId: z.string().describe('The unique ID for the chat session.'),
});
export type ChatInput = z.infer<typeof ChatInputSchema>;

const ChatOutputSchema = z.object({
  reply: z.string().describe('The AI\'s response to the user.'),
});
export type ChatOutput = z.infer<typeof ChatOutputSchema>;

export async function handleChat(input: ChatInput): Promise<ChatOutput> {
  return chatFlow(input);
}

const chatPrompt = ai.definePrompt({
    name: 'chatPrompt',
    input: { schema: z.object({
        query: z.string(),
        language: z.string(),
        history: z.array(ChatHistoryMessageSchema),
    }) },
    output: { schema: ChatOutputSchema },
    tools: [googleSearch],
    prompt: `You are Madadgar, a helpful AI assistant for filling out forms in Pakistan. Your goal is to guide users through the form-filling process conversationally.

    The user is continuing a conversation. Here is the history so far:
    {{#each history}}
      {{#if (eq role 'user')}}User: {{text}}{{/if}}
      {{#if (eq role 'bot')}}Madadgar: {{text}}{{/if}}
    {{/each}}
    
    The user's new message is: {{{query}}}
    - The conversation language is: {{{language}}}

    1.  **Analyze the query:** Determine if the user is asking to fill out a known form. Currently, you only know about the "passport application" form.
    2.  **Respond based on the query:**
        - If the user mentions "passport" or a similar term, respond in the user's language that you can help with the passport application and ask them to confirm if they want to start.
        - If the user asks about a form you don't know (e.g., "driving license"), politely tell them in their language that you can currently only help with passport applications.
        - For any other greeting or general question, provide a friendly, helpful response in their language, and gently guide them back to your purpose by asking what form they'd like to fill out.
        - If the user asks a question you don't know the answer to, use the provided search tool to find the information and answer their question.

    Generate a single, concise response to the user's query based on the history and the new message.
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
    
    // Save user message
    await saveMessage(sessionId, { role: "user", text: query });
    
    // Fetch history
    const history = await getChatHistory(sessionId);

    const { output } = await chatPrompt({ query, language, history });
    const reply = output!.reply;

    // Save bot reply
    await saveMessage(sessionId, { role: "bot", text: reply });
    
    return { reply };
  }
);
