import {
  Briefcase,
  Code2,
  GraduationCap,
  Megaphone,
  type LucideIcon,
} from 'lucide-react';

export type AiEnclaveServiceStatus = 'Live now' | 'Coming soon';

export type AiEnclaveServiceId =
  | 'blog-generator'
  | 'resume-builder'
  | 'cover-letter-generator'
  | 'linkedin-optimizer'
  | 'sop-generator'
  | 'email-writer'
  | 'interview-prep-coach'
  | 'career-roadmap-generator'
  | 'course-recommender'
  | 'project-idea-generator'
  | 'assignment-helper'
  | 'notes-summarizer'
  | 'quiz-generator'
  | 'code-explainer'
  | 'debug-helper'
  | 'social-caption-generator'
  | 'ad-copy-generator'
  | 'landing-page-copy-generator'
  | 'seo-blog-outline-tool'
  | 'study-planner'
  | 'skill-gap-analyzer';

export type AiEnclaveService = {
  description: string;
  href?: string;
  id: AiEnclaveServiceId;
  name: string;
  pageContext: string;
  status: AiEnclaveServiceStatus;
};

export type AiEnclaveServiceSection = {
  description: string;
  eyebrow: string;
  icon: LucideIcon;
  services: AiEnclaveService[];
  title: string;
};

export type AiEnclaveServiceProviderRuntime = {
  apiKey: string;
  baseURL: string;
  extraBody?: Record<string, unknown>;
  maxTokens?: number;
  model: string;
  provider: 'nvidia';
  temperature?: number;
  topP?: number;
};

type AiEnclaveRuntimeProfileId = 'complex' | 'chat';

const COMPLEX_SERVICE_IDS = new Set<AiEnclaveServiceId>([
  'resume-builder',
  'cover-letter-generator',
  'linkedin-optimizer',
  'sop-generator',
  'interview-prep-coach',
  'career-roadmap-generator',
  'assignment-helper',
  'code-explainer',
  'debug-helper',
  'skill-gap-analyzer',
]);

const CHAT_SERVICE_IDS = new Set<AiEnclaveServiceId>([
  'email-writer',
  'course-recommender',
  'project-idea-generator',
  'notes-summarizer',
  'quiz-generator',
  'social-caption-generator',
  'ad-copy-generator',
  'landing-page-copy-generator',
  'seo-blog-outline-tool',
  'study-planner',
]);

function getAiEnclaveRuntimeProfileId(serviceId: AiEnclaveServiceId): AiEnclaveRuntimeProfileId {
  if (COMPLEX_SERVICE_IDS.has(serviceId)) {
    return 'complex';
  }

  if (CHAT_SERVICE_IDS.has(serviceId)) {
    return 'chat';
  }

  return 'complex';
}

function getAiEnclaveRuntimeProfile(
  profileId: AiEnclaveRuntimeProfileId
): AiEnclaveServiceProviderRuntime {
  if (profileId === 'chat') {
    const apiKey = process.env.AI_ENCLAVE_CHAT_API_KEY;

    if (!apiKey) {
      throw new Error('Missing AI_ENCLAVE_CHAT_API_KEY');
    }

    return {
      apiKey,
      baseURL: process.env.AI_ENCLAVE_CHAT_BASE_URL ?? 'https://integrate.api.nvidia.com/v1',
      model: process.env.AI_ENCLAVE_CHAT_MODEL ?? 'openai/gpt-oss-120b',
      provider: 'nvidia',
      temperature: 0.35,
      topP: 0.85,
      maxTokens: 1200,
    };
  }

  const apiKey = process.env.AI_ENCLAVE_COMPLEX_API_KEY;

  if (!apiKey) {
    throw new Error('Missing AI_ENCLAVE_COMPLEX_API_KEY');
  }

  return {
    apiKey,
    baseURL: process.env.AI_ENCLAVE_COMPLEX_BASE_URL ?? 'https://integrate.api.nvidia.com/v1',
    model: process.env.AI_ENCLAVE_COMPLEX_MODEL ?? 'openai/gpt-oss-120b',
    provider: 'nvidia',
    temperature: 0.45,
    topP: 0.85,
    maxTokens: 4096,
  };
}

export const AI_ENCLAVE_SERVICE_SECTIONS: AiEnclaveServiceSection[] = [
  {
    eyebrow: 'Career AI',
    title: 'Job-ready tools for applications, profiles, and interviews.',
    description:
      'Everything a learner needs to move from exploration to outreach with cleaner documents, stronger positioning, and sharper interview prep.',
    icon: Briefcase,
    services: [
      {
        id: 'resume-builder',
        name: 'AI Resume Builder',
        description: 'Turn raw experience into ATS-friendly resumes tailored for tech roles.',
        status: 'Live now',
        href: '/ai-enclave/resume-builder',
        pageContext: 'AI Resume Builder',
      },
      {
        id: 'cover-letter-generator',
        name: 'AI Cover Letter Generator',
        description: 'Create role-specific cover letters directly from the target job description.',
        status: 'Live now',
        href: '/ai-enclave/cover-letter-generator',
        pageContext: 'AI Cover Letter Generator',
      },
      {
        id: 'linkedin-optimizer',
        name: 'AI LinkedIn Optimizer',
        description: 'Rewrite headlines, summaries, and experience sections for a stronger professional profile.',
        status: 'Live now',
        href: '/ai-enclave/linkedin-optimizer',
        pageContext: 'AI LinkedIn Optimizer',
      },
      {
        id: 'sop-generator',
        name: 'AI SOP Generator',
        description: 'Draft statements of purpose for courses, internships, scholarships, and higher studies.',
        status: 'Live now',
        href: '/ai-enclave/sop-generator',
        pageContext: 'AI SOP Generator',
      },
      {
        id: 'email-writer',
        name: 'AI Email Writer',
        description: 'Generate clean outreach, internship, networking, and follow-up emails in seconds.',
        status: 'Live now',
        href: '/ai-enclave/email-writer',
        pageContext: 'AI Email Writer',
      },
      {
        id: 'interview-prep-coach',
        name: 'AI Interview Prep Coach',
        description: 'Practice role-based interview questions with sample answers and coaching prompts.',
        status: 'Live now',
        href: '/ai-enclave/interview-prep-coach',
        pageContext: 'AI Interview Prep Coach',
      },
      {
        id: 'skill-gap-analyzer',
        name: 'AI Skill Gap Analyzer',
        description: 'Compare current skills against target roles and identify the fastest improvement path.',
        status: 'Live now',
        href: '/ai-enclave/skill-gap-analyzer',
        pageContext: 'AI Skill Gap Analyzer',
      },
    ],
  },
  {
    eyebrow: 'Learning AI',
    title: 'Study systems that turn confusion into clear next steps.',
    description:
      'Designed for learners who want structure, faster comprehension, and practical guidance across DigiTantra tracks and external resources.',
    icon: GraduationCap,
    services: [
      {
        id: 'career-roadmap-generator',
        name: 'AI Career Roadmap Generator',
        description: 'Build structured learning plans for Gen AI, Data Science, Full Stack, DevOps, and more.',
        status: 'Live now',
        href: '/ai-enclave/career-roadmap-generator',
        pageContext: 'AI Career Roadmap Generator',
      },
      {
        id: 'course-recommender',
        name: 'AI Course Recommender',
        description: 'Suggest the right DigiTantra track and outside resources based on goals and current level.',
        status: 'Live now',
        href: '/ai-enclave/course-recommender',
        pageContext: 'AI Course Recommender',
      },
      {
        id: 'assignment-helper',
        name: 'AI Assignment Helper',
        description: 'Break down concepts, generate outlines, and improve academic answer structure.',
        status: 'Live now',
        href: '/ai-enclave/assignment-helper',
        pageContext: 'AI Assignment Helper',
      },
      {
        id: 'notes-summarizer',
        name: 'AI Notes Summarizer',
        description: 'Convert long notes, articles, or study material into compact revision-ready summaries.',
        status: 'Live now',
        href: '/ai-enclave/notes-summarizer',
        pageContext: 'AI Notes Summarizer',
      },
      {
        id: 'quiz-generator',
        name: 'AI Quiz Generator',
        description: 'Create MCQs and topic-based practice questions for self-testing and revision.',
        status: 'Live now',
        href: '/ai-enclave/quiz-generator',
        pageContext: 'AI Quiz Generator',
      },
      {
        id: 'study-planner',
        name: 'AI Study Planner',
        description: 'Build realistic weekly study schedules around exams, projects, and daily commitments.',
        status: 'Live now',
        href: '/ai-enclave/study-planner',
        pageContext: 'AI Study Planner',
      },
    ],
  },
  {
    eyebrow: 'Content AI',
    title: 'Create faster with marketing, writing, and growth-ready generators.',
    description:
      'A production lane for students, creators, and founders who need content systems, campaign copy, and sharper message architecture.',
    icon: Megaphone,
    services: [
      {
        id: 'blog-generator',
        name: 'AI Blog Generator',
        description: 'Generate fresh blog ideas and full AI-assisted drafts from the DigiTantra blog workspace.',
        status: 'Live now',
        href: '/blog',
        pageContext: 'AI Blog Generator',
      },
      {
        id: 'social-caption-generator',
        name: 'AI Social Caption Generator',
        description: 'Create platform-ready captions for personal branding, launches, and educational content.',
        status: 'Live now',
        href: '/ai-enclave/social-caption-generator',
        pageContext: 'AI Social Caption Generator',
      },
      {
        id: 'ad-copy-generator',
        name: 'AI Ad Copy Generator',
        description: 'Write sharper hooks, headlines, and paid ad variations for campaigns and experiments.',
        status: 'Live now',
        href: '/ai-enclave/ad-copy-generator',
        pageContext: 'AI Ad Copy Generator',
      },
      {
        id: 'landing-page-copy-generator',
        name: 'AI Landing Page Copy Generator',
        description: 'Generate hero copy, feature sections, and CTA blocks for launch pages and offers.',
        status: 'Live now',
        href: '/ai-enclave/landing-page-copy-generator',
        pageContext: 'AI Landing Page Copy Generator',
      },
      {
        id: 'seo-blog-outline-tool',
        name: 'AI SEO Keyword + Blog Outline Tool',
        description: 'Pair keyword direction with structured blog outlines before full content generation.',
        status: 'Live now',
        href: '/ai-enclave/seo-blog-outline-tool',
        pageContext: 'AI SEO Keyword + Blog Outline Tool',
      },
    ],
  },
  {
    eyebrow: 'Builder AI',
    title: 'Developer-side helpers for portfolios, code understanding, and debugging.',
    description:
      'Focused on beginner-friendly technical support, practical project planning, and faster problem-solving during build workflows.',
    icon: Code2,
    services: [
      {
        id: 'project-idea-generator',
        name: 'AI Project Idea Generator',
        description: 'Get portfolio-ready project ideas with stack suggestions, features, and difficulty levels.',
        status: 'Live now',
        href: '/ai-enclave/project-idea-generator',
        pageContext: 'AI Project Idea Generator',
      },
      {
        id: 'code-explainer',
        name: 'AI Code Explainer',
        description: 'Translate code snippets into plain-language explanations that are easier to study and reuse.',
        status: 'Live now',
        href: '/ai-enclave/code-explainer',
        pageContext: 'AI Code Explainer',
      },
      {
        id: 'debug-helper',
        name: 'AI Debug Helper',
        description: 'Review beginner errors and suggest cleaner fixes, checks, and likely root causes.',
        status: 'Live now',
        href: '/ai-enclave/debug-helper',
        pageContext: 'AI Debug Helper',
      },
    ],
  },
];

export const AI_ENCLAVE_OVERVIEW_STATS = [
  { label: 'Total services', value: '21' },
  { label: 'Service tracks', value: '4' },
  { label: 'Live today', value: '21' },
];

const AI_ENCLAVE_SERVICE_MAP = new Map(
  AI_ENCLAVE_SERVICE_SECTIONS.flatMap((section) => section.services.map((service) => [service.id, service] as const))
);

export function getAiEnclaveService(serviceId: AiEnclaveServiceId) {
  const service = AI_ENCLAVE_SERVICE_MAP.get(serviceId);

  if (!service) {
    throw new Error(`Unknown AI Enclave service: ${serviceId}`);
  }

  return service;
}

export function getAiEnclaveServiceRuntime(serviceId: AiEnclaveServiceId) {
  const service = getAiEnclaveService(serviceId);
  const runtime =
    serviceId === 'blog-generator'
      ? getAiEnclaveRuntimeProfile('complex')
      : getAiEnclaveRuntimeProfile(getAiEnclaveRuntimeProfileId(serviceId));

  return {
    ...runtime,
    service,
  };
}
