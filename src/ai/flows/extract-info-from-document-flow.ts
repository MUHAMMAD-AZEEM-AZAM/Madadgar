'use server';

/**
 * @fileOverview Extracts information from a user-provided document image.
 *
 * - extractInfoFromDocument - A function that handles the document analysis.
 * - ExtractInfoInput - The input type for the extractInfoFromDocument function.
 * - ExtractInfoOutput - The return type for the extractInfoFromDocument function.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';

const ExtractInfoInputSchema = z.object({
  documentImageUri: z
    .string()
    .describe(
      "An image of a document, as a data URI that must include a MIME type and use Base64 encoding. Expected format: 'data:<mimetype>;base64,<encoded_data>'."
    ),
});
export type ExtractInfoInput = z.infer<typeof ExtractInfoInputSchema>;

const ExtractedInfoSchema = z.object({
  name: z.string().optional().describe('The full name of the person found in the document.'),
  cnic: z.string().optional().describe('The CNIC number found in the document.'),
  dob: z.string().optional().describe('The date of birth found in the document.'),
});

const ExtractInfoOutputSchema = z.object({
  extractedInfo: ExtractedInfoSchema.describe('The information extracted from the document.'),
  summary: z.string().describe('A brief summary of the information that was extracted to show to the user.')
});
export type ExtractInfoOutput = z.infer<typeof ExtractInfoOutputSchema>;

export async function extractInfoFromDocument(input: ExtractInfoInput): Promise<ExtractInfoOutput> {
  return extractInfoFromDocumentFlow(input);
}

const extractInfoPrompt = ai.definePrompt({
  name: 'extractInfoPrompt',
  input: {schema: ExtractInfoInputSchema},
  output: {schema: ExtractInfoOutputSchema},
  prompt: `You are an AI assistant that extracts information from images of official documents, like a Pakistani CNIC (Computerized National Identity Card).

Analyze the provided image and extract the following fields if they are present:
- Full Name
- CNIC Number (It is a 13-digit number, often formatted as XXXXX-XXXXXXX-X)
- Date of Birth

The user has uploaded this image: {{media url=documentImageUri}}

Return the extracted data in the 'extractedInfo' object.

Also, provide a short, user-friendly 'summary' of what you found. For example: "I found a name, CNIC number, and date of birth in the document." or "I found a name and CNIC number." If you find nothing, say that. Do not include the actual data in the summary.
`,
});

const extractInfoFromDocumentFlow = ai.defineFlow(
  {
    name: 'extractInfoFromDocumentFlow',
    inputSchema: ExtractInfoInputSchema,
    outputSchema: ExtractInfoOutputSchema,
  },
  async input => {
    const {output} = await extractInfoPrompt(input);
    return output!;
  }
);
