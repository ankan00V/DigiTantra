'use server';

import OpenAI from 'openai';
import {z} from 'zod';

import {getAiEnclaveServiceRuntime, type AiEnclaveServiceId} from '@/lib/ai-enclave/services';
import {getAiEnclaveWorkbenchConfig} from '@/lib/ai-enclave/workbench';

const RunAiEnclaveServiceInputSchema = z.object({
  serviceId: z.string().describe('The AI Enclave service identifier.'),
  values: z.record(z.string(), z.string()).describe('Field values submitted by the user.'),
});

const RunAiEnclaveServiceOutputSchema = z.object({
  title: z.string(),
  content: z.string(),
});

export type RunAiEnclaveServiceInput = z.infer<typeof RunAiEnclaveServiceInputSchema>;
export type RunAiEnclaveServiceOutput = z.infer<typeof RunAiEnclaveServiceOutputSchema>;

const SERVICE_RESPONSE_CONTRACTS: Partial<
  Record<
    AiEnclaveServiceId,
    {
      requiredSections: string[];
      specificRules?: string[];
    }
  >
> = {
  'cover-letter-generator': {
    requiredSections: ['Subject Line', 'Greeting', 'Cover Letter', 'Closing'],
    specificRules: ['Keep the body to 4 to 6 concise paragraphs.'],
  },
  'linkedin-optimizer': {
    requiredSections: ['Headline', 'About Section', 'Experience Rewrite'],
  },
  'sop-generator': {
    requiredSections: ['Opening', 'Background', 'Motivation', 'Fit', 'Career Goals', 'Closing'],
  },
  'email-writer': {
    requiredSections: ['Subject Line', 'Email Draft'],
    specificRules: ['Include one optional short follow-up variant only if it adds value.'],
  },
  'interview-prep-coach': {
    requiredSections: ['Likely Questions', 'What Interviewers Are Testing', 'Sample Answers'],
  },
  'career-roadmap-generator': {
    requiredSections: ['Phase 1', 'Phase 2', 'Projects', 'Milestones'],
  },
  'course-recommender': {
    requiredSections: ['Best-Fit Track', 'Why It Fits', 'Learn First', 'Next Steps'],
  },
  'project-idea-generator': {
    requiredSections: ['Idea 1', 'Idea 2', 'Idea 3'],
  },
  'assignment-helper': {
    requiredSections: ['Concept Overview', 'Answer Outline', 'Draft Response'],
  },
  'notes-summarizer': {
    requiredSections: ['Overview', 'Key Takeaways', 'Revision Points'],
  },
  'quiz-generator': {
    requiredSections: ['Questions', 'Answer Key'],
  },
  'code-explainer': {
    requiredSections: ['High-Level Summary', 'Explanation', 'Key Takeaways'],
  },
  'debug-helper': {
    requiredSections: ['Most Likely Causes', 'What to Check First', 'Fix Path'],
  },
  'social-caption-generator': {
    requiredSections: ['Option 1', 'Option 2', 'Option 3'],
  },
  'ad-copy-generator': {
    requiredSections: ['Headline Options', 'Primary Copy', 'CTA Variants'],
  },
  'landing-page-copy-generator': {
    requiredSections: ['Hero Headline', 'Supporting Copy', 'Feature Blocks', 'CTAs'],
  },
  'seo-blog-outline-tool': {
    requiredSections: ['Primary Keyword Direction', 'Supporting Topics', 'Search Intent', 'Outline'],
  },
  'study-planner': {
    requiredSections: ['Weekly Structure', 'Daily Focus', 'Progress Checks'],
  },
  'skill-gap-analyzer': {
    requiredSections: ['Current Strengths', 'Skill Gaps', 'Priority Actions'],
  },
};

function collapseWhitespace(value: string) {
  return value.replace(/\s+/g, ' ').trim();
}

function ensureSentence(value: string) {
  const trimmed = collapseWhitespace(value).replace(/[.;:,]+$/g, '');

  if (!trimmed) {
    return '';
  }

  return /[.!?]$/.test(trimmed) ? trimmed : `${trimmed}.`;
}

function capitalizeFirst(value: string) {
  const trimmed = collapseWhitespace(value);

  if (!trimmed) {
    return '';
  }

  return trimmed.charAt(0).toUpperCase() + trimmed.slice(1);
}

function splitSentences(value: string) {
  return value
    .replace(/\r\n/g, '\n')
    .split(/\n+/)
    .flatMap((chunk) => chunk.split(/(?<=[.!?])\s+/))
    .map((sentence) => collapseWhitespace(sentence))
    .filter(Boolean);
}

function splitListItems(value: string) {
  return value
    .replace(/\band\b/gi, ',')
    .split(',')
    .map((item) => collapseWhitespace(item).replace(/^[•*-]\s*/, ''))
    .filter(Boolean);
}

function titleizeProjectName(value: string) {
  const cleaned = collapseWhitespace(value)
    .replace(/^(a|an|the)\s+/i, '')
    .replace(/[.;:,]+$/g, '');

  return cleaned
    .split(/\s+/)
    .map((word) => {
      if (/^[A-Z0-9+./-]+$/.test(word)) {
        return word;
      }

      return word.charAt(0).toUpperCase() + word.slice(1);
    })
    .join(' ');
}

function extractSkills(experience: string) {
  const skillMatch = experience.match(
    /\b(?:strong in|skills include|proficient in|experienced with)\b\s*([^.\n]+)/i
  );

  if (!skillMatch) {
    return [];
  }

  return Array.from(
    new Set(
      splitListItems(skillMatch[1]).map((skill) =>
        skill.replace(/[.;:]+$/g, '').replace(/\b(etc|and more)\b/gi, '').trim()
      )
    )
  ).filter(Boolean);
}

function extractProjectItems(experience: string) {
  const projectMatch = experience.match(
    /\b(?:built|developed|created|designed|implemented)\b\s+([^.\n]+)/i
  );

  if (!projectMatch) {
    return [];
  }

  return splitListItems(projectMatch[1]).map((item) => item.replace(/[.;:]+$/g, ''));
}

function extractAchievements(achievements: string) {
  return splitListItems(achievements)
    .map((item) => item.replace(/^(with|and)\s+/i, ''))
    .map(capitalizeFirst)
    .map(ensureSentence)
    .filter(Boolean);
}

function buildResumeDraft(values: Record<string, string>): RunAiEnclaveServiceOutput {
  const targetRole = collapseWhitespace(values.targetRole ?? '');
  const experience = collapseWhitespace(values.experience ?? '');
  const achievements = collapseWhitespace(values.achievements ?? '');
  const sentences = splitSentences(experience);
  const educationLines = sentences.filter((sentence) =>
    /\b(b\.?tech|bachelor|master|student|university|college|school|degree|education)\b/i.test(
      sentence
    )
  );
  const skills = extractSkills(experience);
  const projectItems = extractProjectItems(experience);
  const achievementItems = extractAchievements(achievements);

  const summaryParts = [
    targetRole ? `Targeting ${targetRole} roles` : '',
    educationLines[0] ? educationLines[0].replace(/[.]$/, '') : '',
    projectItems.length
      ? `Hands-on work across ${projectItems
          .map((item) => item.replace(/^(react\s+\+\s+firebase|mongodb-backed)\s+/i, '$1 '))
          .join(', ')}`
      : '',
    skills.length ? `Core stack includes ${skills.join(', ')}` : '',
  ].filter(Boolean);

  const sections: string[] = [];

  if (targetRole) {
    sections.push(`Target Role\n${targetRole}`);
  }

  if (summaryParts.length) {
    sections.push(`Professional Summary\n• ${ensureSentence(summaryParts.join('. '))}`);
  }

  if (skills.length) {
    sections.push(`Core Skills\n• ${skills.join(', ')}`);
  }

  if (projectItems.length) {
    sections.push(
      `Projects\n${projectItems
        .map((item) => `${titleizeProjectName(item)}\n• ${ensureSentence(`Built ${item}`)}`)
        .join('\n\n')}`
    );
  }

  if (educationLines.length) {
    sections.push(`Education\n${educationLines.map((line) => `• ${ensureSentence(line)}`).join('\n')}`);
  }

  if (achievementItems.length) {
    sections.push(`Achievements & Strengths\n${achievementItems.map((item) => `• ${item}`).join('\n')}`);
  }

  if (!sections.length) {
    sections.push(
      'Professional Summary\n• Not enough information was provided to build a resume draft yet.'
    );
  }

  return {
    title: targetRole ? `${targetRole} Resume Draft` : 'Resume Draft',
    content: sections.join('\n\n'),
  };
}

function buildCoverLetterDraft(values: Record<string, string>): RunAiEnclaveServiceOutput {
  const roleAndCompany = collapseWhitespace(values.roleAndCompany ?? '');
  const jobDescription = ensureSentence(values.jobDescription ?? '');
  const background = ensureSentence(values.background ?? '');
  const [rolePart, companyPart] = roleAndCompany.split(/\bat\b/i).map((part) => collapseWhitespace(part));
  const subject = roleAndCompany ? `Application for ${roleAndCompany}` : 'Application';
  const greeting = companyPart ? `Dear ${companyPart} Hiring Team,` : 'Dear Hiring Team,';
  const bodyParagraphs = [
    background ||
      'I am writing to express interest in this opportunity and to share the most relevant parts of my background.',
    jobDescription
      ? `This opportunity stands out because the role calls for ${jobDescription.charAt(0).toLowerCase()}${jobDescription.slice(
          1
        )}`
      : '',
    rolePart
      ? `I would value the opportunity to contribute as a ${rolePart} and bring a practical, execution-focused mindset to the team.`
      : 'I would value the opportunity to contribute and bring a practical, execution-focused mindset to the team.',
  ].filter(Boolean);

  return {
    title: 'Cover Letter',
    content: [
      'Subject Line',
      subject,
      '',
      'Greeting',
      greeting,
      '',
      'Cover Letter',
      bodyParagraphs.join('\n\n'),
      '',
      'Closing',
      'Sincerely,',
    ].join('\n'),
  };
}

function buildDebugReport(values: Record<string, string>): RunAiEnclaveServiceOutput {
  const symptom = ensureSentence(values.errorOrSymptom ?? '');
  const context = ensureSentence(values.codeOrRelevantContext ?? '');
  const expected = ensureSentence(values.expectedBehavior ?? '');
  const likelyCauses: string[] = [];
  const checks: string[] = [];
  const fixSteps: string[] = [];
  const lowerContext = `${symptom} ${context} ${expected}`.toLowerCase();

  if (lowerContext.includes('overflow-y-auto')) {
    likelyCauses.push('The scroll rule is applied to an inner element, but the parent layout is not height-constrained.');
    checks.push('Confirm that the scrollable container sits inside a flex column with a bounded height.');
  }

  if (lowerContext.includes('min-h-0')) {
    likelyCauses.push('A missing min-h-0 on a flex child can prevent the inner panel from shrinking enough to scroll.');
    checks.push('Check whether the scrollable flex child has min-h-0 so it can actually become scrollable.');
  }

  if (lowerContext.includes('flex')) {
    checks.push('Verify which element should stay fixed and which element should own the scroll behavior.');
  }

  if (lowerContext.includes('small') || lowerContext.includes('screen') || lowerContext.includes('modal')) {
    likelyCauses.push('The component likely behaves differently at smaller heights because the modal content is expanding instead of delegating overflow to the intended list area.');
    checks.push('Test the modal at mobile and tablet heights to see which wrapper starts exceeding the viewport.');
  }

  fixSteps.push('Keep the modal shell at a fixed or max viewport height instead of letting the full content expand.');
  fixSteps.push('Make the modal body a flex column and assign the scrolling behavior to the inner content panel.');
  fixSteps.push('Apply min-h-0 and flex-1 to the scrollable child so it can shrink and then scroll as intended.');

  if (expected) {
    fixSteps.push(`Retest until the observed behavior matches this expectation: ${expected}`);
  }

  if (!likelyCauses.length) {
    likelyCauses.push(symptom || 'The current layout logic is allowing the wrong element to control overflow.');
  }

  if (!checks.length) {
    checks.push(context || 'Inspect the container hierarchy and identify which wrapper currently owns the height and overflow rules.');
  }

  return {
    title: 'Debug Report',
    content: [
      'Most Likely Causes',
      ...likelyCauses.map((item) => `• ${item}`),
      '',
      'What to Check First',
      ...checks.map((item) => `• ${item}`),
      '',
      'Fix Path',
      ...fixSteps.map((item, index) => `${index + 1}. ${item}`),
    ].join('\n'),
  };
}

function extractFirstJsonObject(text: string): string {
  const start = text.indexOf('{');
  const end = text.lastIndexOf('}');

  if (start === -1 || end === -1 || end <= start) {
    throw new Error('Model did not return valid JSON');
  }

  return text.slice(start, end + 1);
}

function formatSubmittedValues(
  values: Record<string, string>,
  fields: Array<{label: string; name: string}>
) {
  return fields
    .map((field) => `${field.label}:\n${values[field.name]?.trim() || '(not provided)'}`)
    .join('\n\n');
}

function normalizeDisplayText(text: string) {
  return text
    .replace(/\r\n/g, '\n')
    .replace(/\[([^\]]+)\]\((https?:\/\/[^)]+)\)/gi, '$1: $2')
    .replace(/^\s*```[a-zA-Z0-9_-]*\s*$/gm, '')
    .replace(/^\s*---+\s*$/gm, '')
    .replace(/^\s{0,3}#{1,6}\s*/gm, '')
    .replace(/\*\*([^*]+)\*\*/g, '$1')
    .replace(/\*([^*\n]+)\*/g, '$1')
    .replace(/`([^`]+)`/g, '$1')
    .replace(/^\s*[-*]\s+/gm, '• ')
    .replace(/\n{3,}/g, '\n\n')
    .trim();
}

function normalizeResult(result: RunAiEnclaveServiceOutput): RunAiEnclaveServiceOutput {
  return {
    title: normalizeDisplayText(result.title).replace(/\n+/g, ' ').trim(),
    content: normalizeDisplayText(result.content),
  };
}

function countPresentSections(content: string, sections: string[]) {
  const lowerContent = content.toLowerCase();

  return sections.filter((section) => {
    const words = section.toLowerCase().split(/\s+/).filter(Boolean);

    return words.every((word) => lowerContent.includes(word));
  }).length;
}

function includesUnprovidedContactDetails(content: string, submittedInput: string) {
  const lowerInput = submittedInput.toLowerCase();
  const checks = [
    {pattern: /https?:\/\/|www\./i, allowed: /https?:\/\/|www\./i.test(lowerInput)},
    {pattern: /github\.com|linkedin\.com/i, allowed: /github\.com|linkedin\.com/i.test(lowerInput)},
    {pattern: /\b[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}\b/i, allowed: /\b[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}\b/i.test(lowerInput)},
    {pattern: /\b(?:phone|mobile|email|location|portfolio|linkedin|github)\b/i, allowed: /\b(?:phone|mobile|email|location|portfolio|linkedin|github)\b/i.test(lowerInput)},
  ];

  return checks.some((check) => !check.allowed && check.pattern.test(content));
}

function isLowQualityResponse(
  result: RunAiEnclaveServiceOutput,
  serviceId: AiEnclaveServiceId,
  values: Record<string, string>
) {
  const normalizedContent = result.content.replace(/\s+/g, ' ').trim();
  const submittedInput = Object.values(values).join('\n');
  const hasMarkdownArtifacts =
    /^\s{0,3}#{1,6}\s/m.test(result.content) ||
    /\*\*|`{1,3}|\[[^\]]+\]\((https?:\/\/[^)]+)\)/i.test(result.content);
  const contract = SERVICE_RESPONSE_CONTRACTS[serviceId];
  const hasPlaceholders =
    /\[[^[\]\n]{2,}\]/.test(result.content) ||
    /\b(?:tbd|to be added|your name|email address|phone number|insert here)\b/i.test(result.content);

  if (hasMarkdownArtifacts) {
    return true;
  }

  if (hasPlaceholders) {
    return true;
  }

  if (/not provided by user|\[not provided\]/i.test(result.content)) {
    return true;
  }

  if (serviceId === 'resume-builder') {
    const normalizedTargetRole = values.targetRole?.trim().toLowerCase();

    if (includesUnprovidedContactDetails(result.content, submittedInput)) {
      return true;
    }

    if (normalizedTargetRole && !normalizedContent.toLowerCase().includes(normalizedTargetRole)) {
      return true;
    }
  }

  if (contract && countPresentSections(normalizedContent, contract.requiredSections) < 1) {
    return true;
  }

  return (
    result.title.trim().length < 8 ||
    normalizedContent.length < 180 ||
    /lorem ipsum/i.test(normalizedContent) ||
    /as an ai language model/i.test(normalizedContent)
  );
}

async function requestServiceCompletion({
  apiKey,
  baseURL,
  config,
  model,
  serviceId,
  serviceName,
  values,
  retry,
}: {
  apiKey: string;
  baseURL: string;
  config: NonNullable<ReturnType<typeof getAiEnclaveWorkbenchConfig>>;
  model: string;
  serviceId: AiEnclaveServiceId;
  retry?: boolean;
  serviceName: string;
  values: Record<string, string>;
}) {
  const contract = SERVICE_RESPONSE_CONTRACTS[serviceId];
  const openai = new OpenAI({
    apiKey,
    baseURL,
    timeout: 25000,
  });

  return openai.chat.completions.create({
    model,
    temperature: retry ? 0.25 : 0.4,
    top_p: 0.8,
    max_tokens: 1800,
    messages: [
      {
        role: 'system',
        content:
          `${config.systemPrompt}\n\n` +
          `Tool context: ${serviceName} from DigiTantra AI Enclave.\n` +
          `Output requirement: ${config.outputGuide}\n\n` +
          (contract
            ? `Response contract:\n` +
              `- Use plain text only.\n` +
              `- Use these section labels exactly: ${contract.requiredSections.join(', ')}.\n` +
              `${(contract.specificRules ?? []).map((rule) => `- ${rule}\n`).join('')}\n`
            : '') +
          'Professional response rules:\n' +
          '- Stay strictly inside the purpose of this service.\n' +
          '- Use only the user inputs that are actually provided.\n' +
          '- If something important is missing, omit it unless the service explicitly needs it.\n' +
          '- Write in a polished, practical, professional tone.\n' +
          '- Avoid filler, generic motivational fluff, and vague statements.\n' +
          '- Do not output gibberish, placeholders, or meta commentary.\n' +
          '- Use plain text section labels and the bullet character "•" where bullets are needed.\n' +
          '- Do not use Markdown headings, bold syntax, tables, or code fences.\n' +
          '- Do not use placeholders such as [Your Name], [Email], TBD, or generic bracketed tokens.\n' +
          '- Return valid JSON only with keys "title" and "content".\n' +
          '- Do not wrap the JSON in markdown fences.',
      },
      {
        role: 'user',
        content:
          `Generate output for ${serviceName} using the following user inputs:\n\n` +
      `${formatSubmittedValues(values, config.fields)}\n\n` +
          'Make the response directly usable without extra cleanup by the user. Every factual statement must be grounded in the submitted inputs only.',
      },
      ...(retry
        ? [
            {
              role: 'user' as const,
              content:
                'The previous response was invalid or too weak. Regenerate it with tighter structure, more relevance to the service, and strictly valid JSON only.',
            },
          ]
        : []),
    ],
  });
}

export async function runAiEnclaveService(
  input: RunAiEnclaveServiceInput
): Promise<RunAiEnclaveServiceOutput> {
  const {serviceId, values} = RunAiEnclaveServiceInputSchema.parse(input);

  if (serviceId === 'resume-builder') {
    return buildResumeDraft(values);
  }

  if (serviceId === 'cover-letter-generator') {
    return buildCoverLetterDraft(values);
  }

  if (serviceId === 'debug-helper') {
    return buildDebugReport(values);
  }

  const config = getAiEnclaveWorkbenchConfig(serviceId as AiEnclaveServiceId);

  if (!config) {
    throw new Error('This service is handled through its dedicated workspace.');
  }

  const {apiKey, baseURL, model, service} = getAiEnclaveServiceRuntime(serviceId as AiEnclaveServiceId);

  for (const retry of [false, true]) {
    const completion = await requestServiceCompletion({
      apiKey,
      baseURL,
      config,
      model,
      serviceId: serviceId as AiEnclaveServiceId,
      retry,
      serviceName: service.name,
      values,
    });

    const content = completion.choices
      .map((choice) => {
        const messageContent = choice.message.content as string | Array<{text?: string}> | null;

        if (typeof messageContent === 'string') {
          return messageContent;
        }

        if (Array.isArray(messageContent)) {
          return messageContent.map((part) => part.text ?? '').join('\n');
        }

        return '';
      })
      .join('\n')
      .trim();

    try {
        const parsed = RunAiEnclaveServiceOutputSchema.parse(JSON.parse(extractFirstJsonObject(content)));

      if (!isLowQualityResponse(parsed, serviceId as AiEnclaveServiceId, values)) {
        return normalizeResult(parsed);
      }
    } catch {
      // Retry once with stronger constraints.
    }
  }

  throw new Error(`Failed to generate a valid ${service.name} response.`);
}
