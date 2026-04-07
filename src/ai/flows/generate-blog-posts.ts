'use server';

/**
 * @fileOverview A flow for generating blog posts on digital marketing topics using AI.
 *
 * - generateBlogPost - A function that generates a blog post.
 * - GenerateBlogPostInput - The input type for the generateBlogPost function.
 * - GenerateBlogPostOutput - The return type for the generateBlogPost function.
 */

import OpenAI from 'openai';
import {z} from 'zod';

import {getAiEnclaveServiceRuntime} from '@/lib/ai-enclave/services';

const GenerateBlogPostInputSchema = z.object({
  topic: z.string().describe('The topic of the blog post.'),
});

export type GenerateBlogPostInput = z.infer<typeof GenerateBlogPostInputSchema>;

const GenerateBlogPostOutputSchema = z.object({
  title: z.string().describe('The title of the blog post.'),
  content: z.string().describe('The content of the blog post.'),
});

export type GenerateBlogPostOutput = z.infer<typeof GenerateBlogPostOutputSchema>;

function extractFirstJsonObject(text: string): string {
  const start = text.indexOf('{');
  const end = text.lastIndexOf('}');

  if (start === -1 || end === -1 || end <= start) {
    throw new Error('Model did not return valid JSON');
  }

  return text.slice(start, end + 1);
}

function unescapeJsonLikeString(value: string) {
  return value
    .replace(/\\"/g, '"')
    .replace(/\\n/g, '\n')
    .replace(/\\r/g, '\r')
    .replace(/\\t/g, '\t')
    .replace(/\\\\/g, '\\');
}

function parseBlogJsonPayload(text: string): GenerateBlogPostOutput {
  const jsonPayload = extractFirstJsonObject(text);

  try {
    return GenerateBlogPostOutputSchema.parse(JSON.parse(jsonPayload));
  } catch {
    const titleMatch = jsonPayload.match(/"title"\s*:\s*"([\s\S]*?)"\s*,\s*"content"\s*:/);
    const contentMatch = jsonPayload.match(/"content"\s*:\s*"([\s\S]*)"\s*}\s*$/);

    if (!titleMatch || !contentMatch) {
      throw new Error('Model did not return a parseable blog payload');
    }

    return GenerateBlogPostOutputSchema.parse({
      title: unescapeJsonLikeString(titleMatch[1].trim()),
      content: unescapeJsonLikeString(contentMatch[1].trim()),
    });
  }
}

export async function generateBlogPost(input: GenerateBlogPostInput): Promise<GenerateBlogPostOutput> {
  const {topic} = GenerateBlogPostInputSchema.parse(input);
  const {apiKey, baseURL, model} = getAiEnclaveServiceRuntime('blog-generator');

  const openai = new OpenAI({
    apiKey,
    baseURL,
    timeout: 25000,
  });

  const completion = await openai.chat.completions.create({
    model,
    temperature: 0.7,
    max_tokens: 1800,
    messages: [
      {
        role: 'system',
        content:
          'You are a senior digital marketing content strategist. Return valid JSON only with keys "title" and "content". Do not wrap the JSON in markdown fences. Write clear, original, SEO-aware blog content in Markdown. Use a strong intro, descriptive section headings, practical insights, and a short conclusion.',
      },
      {
        role: 'user',
        content:
          `Write a professional blog post about "${topic}" for DigiTantra readers. Keep it informative, actionable, and easy to scan.\n\n` +
          'Your response must be raw JSON in this shape: {"title":"...","content":"..."}',
      },
    ],
  });

  const content = completion.choices
    .map(choice => {
      const messageContent = choice.message.content as
        | string
        | Array<{text?: string}>
        | null;

      if (typeof messageContent === 'string') {
        return messageContent;
      }

      if (Array.isArray(messageContent)) {
        return messageContent
          .map(part => part.text ?? '')
          .join('\n');
      }

      return '';
    })
    .join('\n')
    .trim();

  return parseBlogJsonPayload(content);
}
