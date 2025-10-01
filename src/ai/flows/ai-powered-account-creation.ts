'use server';

/**
 * @fileOverview AI-Powered Account Creation and Login Flow.
 *
 * This file defines a Genkit flow that uses AI to ask security questions in Urdu or English,
 * and uses the answers to verify the user's identity during future logins.
 *
 * - aiPoweredAccountCreation - A function that initiates the AI-powered account creation process.
 * - AIPoweredAccountCreationInput - The input type for the aiPoweredAccountCreation function.
 * - AIPoweredAccountCreationOutput - The return type for the aiPoweredAccountCreation function.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';

const AIPoweredAccountCreationInputSchema = z.object({
  language: z.enum(['en', 'ur']).describe('The language to use for security questions (en for English, ur for Urdu).'),
});
export type AIPoweredAccountCreationInput = z.infer<typeof AIPoweredAccountCreationInputSchema>;

const AIPoweredAccountCreationOutputSchema = z.object({
  securityQuestions: z.array(
    z.object({
      question: z.string().describe('The security question asked by the AI.'),
      answer: z.string().describe('The user provided answer to the security question.'),
    })
  ).describe('An array of security questions and answers.'),
});
export type AIPoweredAccountCreationOutput = z.infer<typeof AIPoweredAccountCreationOutputSchema>;

export async function aiPoweredAccountCreation(input: AIPoweredAccountCreationInput): Promise<AIPoweredAccountCreationOutput> {
  return aiPoweredAccountCreationFlow(input);
}

const securityQuestionPrompt = ai.definePrompt({
  name: 'securityQuestionPrompt',
  input: {
    schema: z.object({
      language: z.string().describe('The language to use for the security questions.'),
    }),
  },
  output: {
    schema: z.array(
      z.object({
        question: z.string().describe('A security question to ask the user.'),
      })
    ).describe('An array of security questions.'),
  },
  prompt: `You are an AI assistant that generates security questions for user account creation.

  Generate 3 security questions in {{{language}}} to help verify the user's identity during future logins.  The questions should be simple and the answers easy for the user to remember but difficult for others to guess.

  Return the questions as a JSON array.
  `,
});

const aiPoweredAccountCreationFlow = ai.defineFlow(
  {
    name: 'aiPoweredAccountCreationFlow',
    inputSchema: AIPoweredAccountCreationInputSchema,
    outputSchema: AIPoweredAccountCreationOutputSchema,
  },
  async input => {
    const {output} = await securityQuestionPrompt({
      language: input.language,
    });

    if (!output) {
      throw new Error('Failed to generate security questions.');
    }

    // A real implementation would collect the answers to the questions from the user.
    // This implementation just returns the questions.

    const questionsWithAnswers = output.map(q => ({
      question: q.question,
      answer: '', // The user will answer this later.
    }));

    return {
      securityQuestions: questionsWithAnswers,
    };
  }
);
