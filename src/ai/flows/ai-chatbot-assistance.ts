'use server';

/**
 * @fileOverview Provides an AI chatbot assistance flow for DigiTantra website visitors.
 *
 * - aiChatbotAssistance - A function that handles the chatbot assistance process.
 * - AiChatbotAssistanceInput - The input type for the aiChatbotAssistance function.
 * - AiChatbotAssistanceOutput - The return type for the aiChatbotAssistance function.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';

const AiChatbotAssistanceInputSchema = z.object({
  query: z.string().describe('The user query for the chatbot.'),
});
export type AiChatbotAssistanceInput = z.infer<
  typeof AiChatbotAssistanceInputSchema
>;

const AiChatbotAssistanceOutputSchema = z.object({
  response: z.string().describe('The chatbot response to the user query.'),
});
export type AiChatbotAssistanceOutput = z.infer<
  typeof AiChatbotAssistanceOutputSchema
>;

export async function aiChatbotAssistance(
  input: AiChatbotAssistanceInput
): Promise<AiChatbotAssistanceOutput> {
  return aiChatbotAssistanceFlow(input);
}

const prompt = ai.definePrompt({
  name: 'aiChatbotAssistancePrompt',
  input: {schema: AiChatbotAssistanceInputSchema},
  output: {schema: AiChatbotAssistanceOutputSchema},
  prompt: `You are a helpful AI chatbot assisting visitors on the DigiTantra website.

  DigiTantra is an online learning platform that helps people learn tech skills.

  Answer the following user query based on the information about DigiTantra:

  Query: {{{query}}}
  `,
});

const aiChatbotAssistanceFlow = ai.defineFlow(
  {
    name: 'aiChatbotAssistanceFlow',
    inputSchema: AiChatbotAssistanceInputSchema,
    outputSchema: AiChatbotAssistanceOutputSchema,
  },
  async input => {
    const {output} = await prompt(input);
    return output!;
  }
);
