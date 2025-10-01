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
  console.log('[AI] Starting account creation flow with input:', input);
  try {
    const result = await aiPoweredAccountCreationFlow(input);
    console.log('[AI] Account creation flow result:', result);
    return result;
  } catch (error) {
    console.error('[AI] Error in account creation flow:', error);
    throw error;
  }
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
  prompt: `You are an AI assistant for account creation.

  Only ask for the following details if the user wants to save their information:
  - Full name
  - CNIC number
  - Date of birth

  If the language is 'en', return the following questions as a JSON array:
  [
    {"question": "What is your full name?"},
    {"question": "What is your CNIC number?"},
    {"question": "What is your date of birth?"}
  ]

  If the language is 'ur', return the following questions as a JSON array, written in Urdu script:
  [
    {"question": "آپ کا پورا نام کیا ہے؟"},
    {"question": "آپ کا شناختی کارڈ نمبر کیا ہے؟"},
    {"question": "آپ کی تاریخ پیدائش کیا ہے؟"}
  ]

  Do not generate any other questions. Do not use any other language or script. Only return the JSON array as shown above, matching the language requested.
  For Urdu, ensure there is extra space (e.g., a blank line or margin) between the heading and the question text to avoid overlap in UI.
  If the user does not want to save details, do not ask these questions and proceed directly to chat.
  `,
});

const aiPoweredAccountCreationFlow = ai.defineFlow(
  {
    name: 'aiPoweredAccountCreationFlow',
    inputSchema: AIPoweredAccountCreationInputSchema,
    outputSchema: AIPoweredAccountCreationOutputSchema,
  },
  async input => {
    console.log('[AI] Generating security questions with input:', input);
    let output;
    try {
      const result = await securityQuestionPrompt({
        language: input.language,
      });
      output = result.output;
      console.log('[AI] Security questions generated:', output);
    } catch (error) {
      console.error('[AI] Error generating security questions:', error);
      throw error;
    }

    if (!output) {
      console.error('[AI] No output from securityQuestionPrompt');
      throw new Error('Failed to generate security questions.');
    }

    // A real implementation would collect the answers to the questions from the user.
    // This implementation just returns the questions.

    const questionsWithAnswers = output.map(q => ({
      question: q.question,
      answer: '', // The user will answer this later.
    }));

    console.log('[AI] Returning questions with empty answers:', questionsWithAnswers);
    return {
      securityQuestions: questionsWithAnswers,
    };
  }
);
