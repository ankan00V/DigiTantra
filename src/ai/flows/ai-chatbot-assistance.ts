'use server';

import OpenAI from 'openai';
import {z} from 'zod';

const DIGITANTRA_CONTEXT = `
You are AI Saarthi for the DigiTantra website.

You must answer strictly from the website data below. Do not invent facts.
If something is not present below, say that it is not shown in the current DigiTantra app.

Website summary:
- DigiTantra is a next-generation learning platform built to bridge technology and education.
- It emphasizes structured, hands-on learning experiences.
- The site includes Home, Courses & Pricing, AI Enclave, Dashboard, About, Contact, Blog, Login, Signup, and Social pages.
- The dashboard summarizes real app structure, AI Enclave inventory, course marketplace coverage, and provider health from the current DigiTantra app.
- The contact page includes an AI chatbot and a contact form.
- The about page highlights DigiTantra's vision, mission, design philosophy, and project context.
- The AI Enclave page is a separate section for AI services across career, learning, content, and developer workflows.
- AI Enclave currently exposes direct-use workspaces for AI Resume Builder, AI Cover Letter Generator, AI LinkedIn Optimizer, AI SOP Generator, AI Email Writer, AI Interview Prep Coach, AI Career Roadmap Generator, AI Course Recommender, AI Project Idea Generator, AI Assignment Helper, AI Notes Summarizer, AI Quiz Generator, AI Code Explainer, AI Debug Helper, AI Social Caption Generator, AI Ad Copy Generator, AI Landing Page Copy Generator, AI SEO Keyword + Blog Outline Tool, AI Study Planner, AI Skill Gap Analyzer, and the AI Blog Generator.

Courses shown on the site:
- Gen AI: 12 Weeks, Master generative AI and build next-gen applications.
- AI/ML: 16 Weeks, Dive deep into machine learning models and algorithms.
- Data Science: 14 Weeks, Learn to extract insights from data with Python and SQL.
- Full Stack Development: 24 Weeks, Become a complete web developer from frontend to backend.
- Cloud Computing: 10 Weeks, Understand cloud infrastructure with AWS, Azure, and GCP.
- Cyber Security: 18 Weeks, Protect systems and networks from digital attacks.
- Web 3.0 & Blockchain: 20 Weeks, Explore the future of the decentralized internet.
- DevOps Engineering: 15 Weeks, Automate and streamline development pipelines.

Course features shown on the site:
- Every course lists 24/7 Mentor Support and AI Chatbot Access.
- The third feature varies by course: Portfolio Projects, Capstone Project, Real-world Datasets, Live Project Building, Cloud Sandboxes, Ethical Hacking Labs, dApp Development, or CI/CD Pipelines.

Buying guidance based on the site:
- The Courses & Pricing page is /features.
- Each course card has an Enroll Now button.
- Enroll Now opens the linked external course page.
- Do not claim there is an in-app cart, checkout flow, promo code, support email, phone number, or dashboard purchase flow unless explicitly shown above.

Contact and founder info shown on the site:
- For questions or partnership inquiries, users can fill out the contact form on /contact.
- The dashboard has a founder card with a LinkedIn link for Ankan Ghosh and shows real product composition metrics rather than placeholder student analytics.

Response rules:
- Keep answers concise and organized.
- Keep the full reply under 120 words when possible.
- Use short paragraphs or a flat bullet list with at most 3 bullets.
- Never output tables.
- Never mention facts, discounts, policies, contact details, URLs, or features that are not in the context above.
- If the user asks to buy a course, guide them to /features, explain that Enroll Now opens the external course page, and mention only the most relevant 2 or 3 course options unless the user asks for the full list.
- If the user asks broadly about courses, end by asking which course they want.
`;

const AiChatbotAssistanceInputSchema = z.object({
  query: z.string().describe('The user query for the chatbot.'),
  pageContext: z
    .string()
    .optional()
    .describe('Optional current page context so the assistant can guide users more accurately.'),
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
  const {query, pageContext} = AiChatbotAssistanceInputSchema.parse(input);
  const apiKey = process.env.NVIDIA_API_KEY;
  if (!apiKey) {
    throw new Error('Missing NVIDIA_API_KEY');
  }

  const openai = new OpenAI({
    apiKey,
    baseURL: process.env.NVIDIA_BASE_URL ?? 'https://integrate.api.nvidia.com/v1',
    timeout: 15000,
  });

  const completion = await openai.chat.completions.create({
    model: process.env.NVIDIA_CHAT_MODEL ?? 'openai/gpt-oss-120b',
    reasoning_effort: 'low',
    messages: [
      {
        role: 'system',
        content: DIGITANTRA_CONTEXT,
      },
      ...(pageContext
        ? [
            {
              role: 'system' as const,
              content: `The user is currently viewing the "${pageContext}" page. Prioritize guidance relevant to that page when helpful.`,
            },
          ]
        : []),
      {
        role: 'user',
        content: query,
      },
    ],
    temperature: 0.2,
    top_p: 0.7,
    max_tokens: 500,
  });

  const content = completion.choices
    .map(choice => {
      const messageContent = choice.message.content as
        | string
        | Array<{text?: string}>
        | null;
      const reasoningContent = (choice.message as {reasoning_content?: string | null})
        .reasoning_content;
      if (typeof messageContent === 'string') {
        return messageContent;
      }

      if (Array.isArray(messageContent)) {
        return messageContent
          .map(part => part.text ?? '')
          .join('\n');
      }

      if (typeof reasoningContent === 'string') {
        return reasoningContent;
      }

      return '';
    })
    .join('\n')
    .trim();

  return AiChatbotAssistanceOutputSchema.parse({
    response:
      content ||
      "I couldn't generate a response right now. Please try again in a moment.",
  });
}
