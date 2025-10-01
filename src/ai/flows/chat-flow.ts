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
// In a real app, you would use a database like Firestore.
// For now, we'll use a simple in-memory store.
// import { db } from '@/lib/firebase';
// import { collection, addDoc, serverTimestamp } from 'firebase/firestore';


const ChatInputSchema = z.object({
  query: z.string().describe('The user\'s message.'),
  language: z.enum(['en', 'ur']).describe('The language of the conversation.'),
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
    input: { schema: ChatInputSchema },
    output: { schema: ChatOutputSchema },
    prompt: `You are Madadgar, a helpful AI assistant for filling out forms in Pakistan. Your goal is to guide users through the form-filling process conversationally.

    The user is starting a conversation.
    - The user's query is: {{{query}}}
    - The conversation language is: {{{language}}}

    1.  **Analyze the query:** Determine if the user is asking to fill out a known form. Currently, you only know about the "passport application" form.
    2.  **Respond based on the query:**
        - If the user mentions "passport" or a similar term, respond in the user's language that you can help with the passport application and ask them to confirm if they want to start.
        - If the user asks about a form you don't know (e.g., "driving license"), politely tell them in their language that you can currently only help with passport applications.
        - For any other greeting or general question, provide a friendly, helpful response in their language, and gently guide them back to your purpose by asking what form they'd like to fill out.

    Generate a single, concise response to the user's query.
    `,
});

const chatFlow = ai.defineFlow(
  {
    name: 'chatFlow',
    inputSchema: ChatInputSchema,
    outputSchema: ChatOutputSchema,
  },
  async (input) => {

    // // Example of saving to Firestore (session handling)
    // try {
    //     await addDoc(collection(db, "chat_sessions", "some-session-id", "messages"), {
    //         role: "user",
    //         text: input.query,
    //         createdAt: serverTimestamp(),
    //     });
    // } catch (e) {
    //     console.error("Error adding document: ", e);
    // }

    const { output } = await chatPrompt(input);
    return output!;
  }
);
