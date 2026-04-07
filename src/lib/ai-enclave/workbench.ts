import type {AiEnclaveServiceId} from '@/lib/ai-enclave/services';

export type AiEnclaveFieldConfig = {
  defaultValue: string;
  label: string;
  name: string;
  placeholder: string;
  rows?: number;
  type: 'input' | 'textarea';
};

export type AiEnclaveWorkbenchConfig = {
  ctaLabel: string;
  helperPoints: string[];
  intro: string;
  outputGuide: string;
  systemPrompt: string;
  title: string;
  fields: AiEnclaveFieldConfig[];
};

type NonBlogServiceId = Exclude<AiEnclaveServiceId, 'blog-generator'>;

export const AI_ENCLAVE_WORKBENCH_CONFIG: Record<NonBlogServiceId, AiEnclaveWorkbenchConfig> = {
  'resume-builder': {
    title: 'Build an ATS-friendly resume draft',
    intro:
      'Turn rough experience notes into a cleaner tech resume with stronger summaries, skill grouping, and impact-oriented bullet points.',
    ctaLabel: 'Generate Resume Draft',
    outputGuide:
      'Return a polished ATS-style resume draft in plain text. Use concise section labels, compact recruiter-friendly phrasing, and bullet points that begin with the bullet character "•". Do not use Markdown syntax, tables, or placeholder contact details.',
    systemPrompt:
      'You are an expert resume strategist for top-tier technology internships and early-career roles. Rewrite only the details the user actually provides into a modern ATS-friendly resume draft with precise action verbs, clean sectioning, and concise MAANG-level phrasing. Never invent companies, dates, metrics, links, contact details, locations, technologies, or projects. If a detail is missing, omit it instead of adding placeholders.',
    helperPoints: [
      'Reframes raw experience into recruiter-friendly language.',
      'Keeps structure compact and suitable for ATS scanning.',
      'Useful for internship, fresher, and early-career tech roles.',
    ],
    fields: [
      {
        name: 'targetRole',
        label: 'Target role',
        placeholder: 'e.g. Data Analyst Intern or Frontend Developer',
        defaultValue: 'Frontend Developer Intern',
        type: 'input',
      },
      {
        name: 'experience',
        label: 'Experience, projects, and education',
        placeholder: 'Paste your raw background, projects, internships, and education details...',
        defaultValue:
          'B.Tech Computer Science student. Built a React + Firebase attendance dashboard, a portfolio website, and a MongoDB-backed learning platform. Strong in HTML, CSS, JavaScript, React, and Git.',
        type: 'textarea',
        rows: 8,
      },
      {
        name: 'achievements',
        label: 'Achievements or strengths',
        placeholder: 'Mention leadership, hackathons, certifications, or standout strengths...',
        defaultValue: 'Won 2 college hackathons, led a 4-person project team, and completed multiple UI/UX freelance builds.',
        type: 'textarea',
        rows: 5,
      },
    ],
  },
  'cover-letter-generator': {
    title: 'Write a role-specific cover letter',
    intro:
      'Generate a sharper, more tailored cover letter from the role, company, and raw background you already have.',
    ctaLabel: 'Generate Cover Letter',
    outputGuide:
      'Return a professional cover letter in plain text with the section labels Subject Line, Greeting, Cover Letter, and Closing. Keep the body concise, specific, and directly usable.',
    systemPrompt:
      'You are an expert cover-letter writer for technology and digital roles. Write concise, tailored cover letters that sound human, specific, and confident. Avoid generic filler.',
    helperPoints: [
      'Tailors messaging around the exact role and company context.',
      'Balances professionalism with direct, readable language.',
      'Good for internships, full-time roles, and campus applications.',
    ],
    fields: [
      {
        name: 'roleAndCompany',
        label: 'Role and company',
        placeholder: 'e.g. Software Engineering Intern at Atlassian',
        defaultValue: 'Software Engineering Intern at Atlassian',
        type: 'input',
      },
      {
        name: 'jobDescription',
        label: 'Job description or expectations',
        placeholder: 'Paste the important lines from the job description...',
        defaultValue:
          'Looking for a student developer with strong frontend foundations, collaboration skills, and interest in product thinking.',
        type: 'textarea',
        rows: 6,
      },
      {
        name: 'background',
        label: 'Your background',
        placeholder: 'Summarize your experience, projects, and motivation...',
        defaultValue:
          'Computer science student with React projects, design-focused frontend work, and experience building polished web experiences end to end.',
        type: 'textarea',
        rows: 6,
      },
    ],
  },
  'linkedin-optimizer': {
    title: 'Upgrade your LinkedIn positioning',
    intro:
      'Improve your headline, About section, and experience framing so your profile looks clearer and more valuable to recruiters.',
    ctaLabel: 'Optimize LinkedIn Copy',
    outputGuide:
      'Return polished LinkedIn copy in plain text with the section labels Headline, About Section, and Experience Rewrite.',
    systemPrompt:
      'You are a LinkedIn profile strategist for students and early-career professionals in technology. Optimize for clarity, credibility, and discoverability without sounding inflated.',
    helperPoints: [
      'Improves visibility and profile clarity for recruiters.',
      'Useful for internships, freelance work, and campus hiring.',
      'Rewrites profile sections in a clean, professional voice.',
    ],
    fields: [
      {
        name: 'targetDirection',
        label: 'Target direction',
        placeholder: 'e.g. Full Stack Developer roles or Data Science internships',
        defaultValue: 'Frontend and full stack developer roles',
        type: 'input',
      },
      {
        name: 'currentProfile',
        label: 'Current LinkedIn copy',
        placeholder: 'Paste your current headline, About section, or experience summary...',
        defaultValue:
          'Headline: Student | Web Developer\nAbout: I like coding and creating websites. I know React and JavaScript. Looking for opportunities.',
        type: 'textarea',
        rows: 7,
      },
      {
        name: 'proofPoints',
        label: 'Key proof points',
        placeholder: 'Projects, wins, tools, certifications, or domains you want highlighted...',
        defaultValue: 'Built multiple React products, strong UI implementation, Firebase + MongoDB experience, hackathon participation.',
        type: 'textarea',
        rows: 5,
      },
    ],
  },
  'sop-generator': {
    title: 'Draft a stronger statement of purpose',
    intro:
      'Shape your motivation, background, and goals into a cleaner SOP for study, internships, scholarships, or career transitions.',
    ctaLabel: 'Generate SOP',
    outputGuide:
      'Return a polished SOP in plain text with the section labels Opening, Background, Motivation, Fit, Career Goals, and Closing.',
    systemPrompt:
      'You are an expert statement-of-purpose writer. Craft reflective but credible SOPs that feel personal, specific, and goal-oriented. Avoid exaggerated claims.',
    helperPoints: [
      'Turns scattered motivation into a coherent narrative.',
      'Useful for admissions, scholarships, and structured applications.',
      'Balances personal story with academic and career goals.',
    ],
    fields: [
      {
        name: 'programOrOpportunity',
        label: 'Program or opportunity',
        placeholder: 'e.g. MS in Data Science or internship application',
        defaultValue: 'MS in Data Science',
        type: 'input',
      },
      {
        name: 'background',
        label: 'Academic and project background',
        placeholder: 'Share your study background, projects, and strengths...',
        defaultValue:
          'Computer science background with strong interest in analytics, machine learning, and product-focused problem solving.',
        type: 'textarea',
        rows: 6,
      },
      {
        name: 'motivationAndGoals',
        label: 'Motivation and future goals',
        placeholder: 'Explain why this path matters to you and what you want to do next...',
        defaultValue:
          'I want to build stronger analytical depth and eventually work on AI-driven products with measurable social and business impact.',
        type: 'textarea',
        rows: 6,
      },
    ],
  },
  'email-writer': {
    title: 'Write cleaner professional emails',
    intro:
      'Draft sharper outreach, internship, collaboration, or follow-up emails with a clearer structure and more professional tone.',
    ctaLabel: 'Generate Email',
    outputGuide:
      'Return a concise professional email in plain text with the section labels Subject Line and Email Draft. Include a shorter variant only if it adds value.',
    systemPrompt:
      'You are a professional email writer for academic, recruiting, and career outreach. Keep emails concise, human, and action-oriented.',
    helperPoints: [
      'Good for cold outreach, follow-ups, and application communication.',
      'Keeps the message short without sounding abrupt.',
      'Can adapt to formal, warm, or direct tones.',
    ],
    fields: [
      {
        name: 'emailGoal',
        label: 'Email goal',
        placeholder: 'e.g. Internship outreach, follow-up after interview, partnership request',
        defaultValue: 'Internship outreach',
        type: 'input',
      },
      {
        name: 'recipientContext',
        label: 'Recipient and context',
        placeholder: 'Who is this for and what is the situation?',
        defaultValue: 'Engineering manager at a product company I admire.',
        type: 'textarea',
        rows: 4,
      },
      {
        name: 'keyPoints',
        label: 'Key points to include',
        placeholder: 'Add your background, ask, and any proof points...',
        defaultValue:
          'CS student, frontend projects, strong interest in product engineering, asking for internship consideration and portfolio review.',
        type: 'textarea',
        rows: 6,
      },
    ],
  },
  'interview-prep-coach': {
    title: 'Prepare for interviews with better questions and answers',
    intro:
      'Generate role-specific interview practice material with realistic questions, guidance, and sample answers you can refine.',
    ctaLabel: 'Generate Interview Prep',
    outputGuide:
      'Return interview prep in plain text with the section labels Likely Questions, What Interviewers Are Testing, and Sample Answers.',
    systemPrompt:
      'You are an interview coach for technology roles. Create practical interview prep material that helps the user think clearly and answer with structure, not memorized fluff.',
    helperPoints: [
      'Targets the actual role instead of generic interview advice.',
      'Useful for technical, behavioral, and project discussion rounds.',
      'Produces practice-ready material users can rehearse from.',
    ],
    fields: [
      {
        name: 'targetRole',
        label: 'Target role',
        placeholder: 'e.g. DevOps Intern, Data Analyst, UI Engineer',
        defaultValue: 'Frontend Developer Intern',
        type: 'input',
      },
      {
        name: 'levelAndContext',
        label: 'Level and interview context',
        placeholder: 'e.g. fresher, campus placement, internship round 1',
        defaultValue: 'Fresher internship interview',
        type: 'input',
      },
      {
        name: 'skillsOrTopics',
        label: 'Skills or topics to focus on',
        placeholder: 'Mention technologies, projects, or areas you expect to be asked about...',
        defaultValue: 'React, JavaScript, UI performance, projects, teamwork, and problem solving.',
        type: 'textarea',
        rows: 6,
      },
    ],
  },
  'career-roadmap-generator': {
    title: 'Build a practical learning roadmap',
    intro:
      'Turn a broad career target into a phased plan with skills, projects, milestones, and sequencing you can actually follow.',
    ctaLabel: 'Generate Roadmap',
    outputGuide:
      'Return a step-by-step roadmap in plain text with the section labels Phase 1, Phase 2, Projects, and Milestones.',
    systemPrompt:
      'You are a pragmatic tech career strategist. Build realistic, staged roadmaps with clear priorities, skill sequencing, and project milestones.',
    helperPoints: [
      'Turns vague learning goals into a structured path.',
      'Balances concepts, implementation, and portfolio building.',
      'Useful across AI, data, web, cloud, and DevOps tracks.',
    ],
    fields: [
      {
        name: 'targetPath',
        label: 'Target path',
        placeholder: 'e.g. Data Science, Gen AI Engineer, Full Stack Developer',
        defaultValue: 'Data Science',
        type: 'input',
      },
      {
        name: 'currentLevel',
        label: 'Current level',
        placeholder: 'Describe what you already know...',
        defaultValue: 'Comfortable with Python basics, SQL basics, and beginner statistics.',
        type: 'textarea',
        rows: 5,
      },
      {
        name: 'timeline',
        label: 'Timeline and availability',
        placeholder: 'How much time do you have and by when do you want results?',
        defaultValue: '6 months, around 10 hours per week.',
        type: 'textarea',
        rows: 4,
      },
    ],
  },
  'course-recommender': {
    title: 'Get a clearer course recommendation',
    intro:
      'Use goals, current skill level, and learning constraints to identify the most suitable DigiTantra direction and practical next steps.',
    ctaLabel: 'Recommend Courses',
    outputGuide:
      'Return a recommendation in plain text with the section labels Best-Fit Track, Why It Fits, Learn First, and Next Steps.',
    systemPrompt:
      'You are a course advisor for DigiTantra users. Recommend learning tracks based on goals, current level, pace, and constraints. Be specific and practical.',
    helperPoints: [
      'Matches users to a clearer direction instead of giving too many options.',
      'Helps connect goals with track selection and immediate actions.',
      'Useful for beginners, switchers, and focused upskilling decisions.',
    ],
    fields: [
      {
        name: 'goal',
        label: 'Learning goal',
        placeholder: 'What role, domain, or outcome are you aiming for?',
        defaultValue: 'Become job-ready for a frontend developer internship.',
        type: 'textarea',
        rows: 4,
      },
      {
        name: 'currentBackground',
        label: 'Current background',
        placeholder: 'What do you already know?',
        defaultValue: 'Good HTML/CSS/JS basics, some React, limited backend and deployment experience.',
        type: 'textarea',
        rows: 5,
      },
      {
        name: 'constraints',
        label: 'Constraints',
        placeholder: 'Budget, schedule, preferred learning style, or other constraints...',
        defaultValue: 'Need a practical path with portfolio projects and around 8 hours per week.',
        type: 'textarea',
        rows: 4,
      },
    ],
  },
  'project-idea-generator': {
    title: 'Generate portfolio-ready project ideas',
    intro:
      'Create project ideas with the right difficulty, stack direction, and feature scope for your current level and target domain.',
    ctaLabel: 'Generate Project Ideas',
    outputGuide:
      'Return 3 to 5 project ideas in plain text using clearly labeled sections such as Idea 1, Idea 2, and Idea 3, with stack, scope, and portfolio value.',
    systemPrompt:
      'You are a portfolio strategist for students and early-career developers. Suggest practical projects that are differentiated, achievable, and valuable in hiring conversations.',
    helperPoints: [
      'Produces projects that are credible, not generic tutorial clones.',
      'Balances difficulty with portfolio signal value.',
      'Useful for web, AI, data, cloud, and DevOps paths.',
    ],
    fields: [
      {
        name: 'targetDomain',
        label: 'Target domain',
        placeholder: 'e.g. Gen AI, Data Science, Full Stack, DevOps',
        defaultValue: 'Full Stack Development',
        type: 'input',
      },
      {
        name: 'skillLevel',
        label: 'Current skill level',
        placeholder: 'Describe your current level and tools...',
        defaultValue: 'Intermediate with React and basic Node.js, beginner with databases and deployment.',
        type: 'textarea',
        rows: 4,
      },
      {
        name: 'interestsOrConstraints',
        label: 'Interests or constraints',
        placeholder: 'What kinds of products or problems interest you?',
        defaultValue: 'Interested in education, productivity, and AI-assisted tools.',
        type: 'textarea',
        rows: 4,
      },
    ],
  },
  'assignment-helper': {
    title: 'Structure assignments more clearly',
    intro:
      'Break down complex topics and turn assignment prompts into clean outlines, explanations, and stronger first drafts.',
    ctaLabel: 'Generate Assignment Help',
    outputGuide:
      'Return assignment support in plain text with the section labels Concept Overview, Answer Outline, and Draft Response.',
    systemPrompt:
      'You are an academic support assistant. Help the user understand the topic, create structure, and improve clarity without presenting fabricated citations or pretending certainty.',
    helperPoints: [
      'Useful for clarifying prompts and organizing answers faster.',
      'Focuses on structure, understanding, and flow.',
      'Works well for technical, analytical, and theory-heavy tasks.',
    ],
    fields: [
      {
        name: 'assignmentTopic',
        label: 'Assignment topic or prompt',
        placeholder: 'Paste the assignment prompt...',
        defaultValue: 'Explain the role of machine learning in predictive analytics and discuss two real-world applications.',
        type: 'textarea',
        rows: 5,
      },
      {
        name: 'requirements',
        label: 'Requirements',
        placeholder: 'Mention word count, format, or evaluation criteria...',
        defaultValue: 'Around 800 words, simple academic tone, needs clear structure.',
        type: 'textarea',
        rows: 4,
      },
      {
        name: 'currentUnderstanding',
        label: 'Current understanding',
        placeholder: 'What do you already know or want clarified?',
        defaultValue: 'I understand the basic idea of ML but need help structuring the answer and choosing applications.',
        type: 'textarea',
        rows: 4,
      },
    ],
  },
  'notes-summarizer': {
    title: 'Summarize long notes into usable revision material',
    intro:
      'Condense bulky notes into sharper summaries, key takeaways, and review-ready points without losing the main ideas.',
    ctaLabel: 'Summarize Notes',
    outputGuide:
      'Return a revision-friendly summary in plain text with the section labels Overview, Key Takeaways, and Revision Points.',
    systemPrompt:
      'You are a study summarization assistant. Distill the most important ideas, remove repetition, and make the output revision-friendly.',
    helperPoints: [
      'Ideal for lecture notes, concept summaries, and article condensation.',
      'Focuses on clarity and retention rather than paraphrase-only output.',
      'Creates something the user can actually revise from later.',
    ],
    fields: [
      {
        name: 'topic',
        label: 'Topic',
        placeholder: 'e.g. Cloud computing fundamentals or SQL joins',
        defaultValue: 'Cloud computing fundamentals',
        type: 'input',
      },
      {
        name: 'notes',
        label: 'Paste the notes',
        placeholder: 'Paste your notes, lecture material, or text to summarize...',
        defaultValue:
          'Cloud computing delivers computing services over the internet, including servers, storage, databases, networking, and software. Core characteristics include on-demand self-service, broad network access, resource pooling, rapid elasticity, and measured service...',
        type: 'textarea',
        rows: 10,
      },
      {
        name: 'summaryPreference',
        label: 'Preferred summary depth',
        placeholder: 'e.g. quick revision, detailed summary, exam-focused points',
        defaultValue: 'Exam-focused summary with key takeaways.',
        type: 'input',
      },
    ],
  },
  'quiz-generator': {
    title: 'Generate a focused practice quiz',
    intro:
      'Create MCQs and answer keys around any topic so users can self-test and revise without manually building questions.',
    ctaLabel: 'Generate Quiz',
    outputGuide:
      'Return a quiz in plain text with the section labels Questions and Answer Key. Use numbered MCQs with 4 options each.',
    systemPrompt:
      'You are a quiz generator for tech and academic topics. Create clear, fair, and appropriately challenging MCQs with one best answer.',
    helperPoints: [
      'Useful for revision, mock practice, and quick knowledge checks.',
      'Supports beginner to intermediate difficulty levels.',
      'Outputs ready-to-use questions with answer keys.',
    ],
    fields: [
      {
        name: 'topic',
        label: 'Quiz topic',
        placeholder: 'e.g. React hooks, data visualization, cybersecurity basics',
        defaultValue: 'React hooks',
        type: 'input',
      },
      {
        name: 'difficulty',
        label: 'Difficulty',
        placeholder: 'e.g. beginner, intermediate, advanced',
        defaultValue: 'Intermediate',
        type: 'input',
      },
      {
        name: 'coverage',
        label: 'Coverage and count',
        placeholder: 'Mention subtopics and preferred number of questions...',
        defaultValue: '10 questions covering useState, useEffect, controlled inputs, and rendering behavior.',
        type: 'textarea',
        rows: 4,
      },
    ],
  },
  'code-explainer': {
    title: 'Explain code in plain language',
    intro:
      'Help users understand unfamiliar code faster by breaking logic, flow, and patterns into easier language.',
    ctaLabel: 'Explain Code',
    outputGuide:
      'Return a code explanation in plain text with the section labels High-Level Summary, Explanation, and Key Takeaways.',
    systemPrompt:
      'You are a senior developer explaining code to a learner. Make complex code understandable without dumbing down the logic or inventing behavior that is not present.',
    helperPoints: [
      'Useful for reading team code, assignments, and interview snippets.',
      'Balances plain-language explanation with technical accuracy.',
      'Helps learners reason about flow and architecture, not just syntax.',
    ],
    fields: [
      {
        name: 'languageOrContext',
        label: 'Language or context',
        placeholder: 'e.g. Next.js component, Python script, SQL query',
        defaultValue: 'Next.js React component',
        type: 'input',
      },
      {
        name: 'code',
        label: 'Code snippet',
        placeholder: 'Paste the code you want explained...',
        defaultValue:
          'const [count, setCount] = useState(0);\nuseEffect(() => {\n  const id = setInterval(() => setCount((value) => value + 1), 1000);\n  return () => clearInterval(id);\n}, []);',
        type: 'textarea',
        rows: 10,
      },
      {
        name: 'focus',
        label: 'What do you want to understand most?',
        placeholder: 'e.g. hooks, control flow, architecture, performance',
        defaultValue: 'How the hook flow and cleanup work.',
        type: 'input',
      },
    ],
  },
  'debug-helper': {
    title: 'Diagnose bugs with clearer fixes',
    intro:
      'Feed in errors, symptoms, and code context to get a more structured diagnosis and likely resolution path.',
    ctaLabel: 'Analyze Issue',
    outputGuide:
      'Return a debug report in plain text with the section labels Most Likely Causes, What to Check First, and Fix Path.',
    systemPrompt:
      'You are a debugging assistant for developers. Diagnose issues from symptoms and code context, prioritize the most likely root causes, and suggest concrete next checks.',
    helperPoints: [
      'Useful for beginners who need structured diagnosis instead of guesswork.',
      'Focuses on probable causes, not random fixes.',
      'Turns vague errors into ordered troubleshooting steps.',
    ],
    fields: [
      {
        name: 'errorOrSymptom',
        label: 'Error or symptom',
        placeholder: 'Paste the error message or describe the issue...',
        defaultValue: 'My modal opens but the list inside it does not scroll on smaller screens.',
        type: 'textarea',
        rows: 4,
      },
      {
        name: 'codeOrRelevantContext',
        label: 'Code or relevant context',
        placeholder: 'Paste the important code or describe what the component is doing...',
        defaultValue:
          'The modal body had overflow-y-auto, but the parent container was not constrained with flex and min-h-0. The content kept stretching instead of scrolling.',
        type: 'textarea',
        rows: 6,
      },
      {
        name: 'expectedBehavior',
        label: 'Expected behavior',
        placeholder: 'What should happen instead?',
        defaultValue: 'The modal should stay fixed in height and only the inner list should scroll.',
        type: 'input',
      },
    ],
  },
  'social-caption-generator': {
    title: 'Create stronger social captions',
    intro:
      'Generate platform-ready captions for launches, updates, educational posts, and personal brand content.',
    ctaLabel: 'Generate Captions',
    outputGuide:
      'Return multiple caption options in plain text using the section labels Option 1, Option 2, and Option 3, each with clean ready-to-post copy.',
    systemPrompt:
      'You are a social copywriter for personal branding and digital products. Write sharp, platform-aware captions that are concise, engaging, and easy to post.',
    helperPoints: [
      'Useful for LinkedIn, Instagram, X, and launch posts.',
      'Can adapt to educational, personal-brand, or marketing tones.',
      'Produces multiple variants so users can choose or remix.',
    ],
    fields: [
      {
        name: 'platform',
        label: 'Platform',
        placeholder: 'e.g. LinkedIn, Instagram, X',
        defaultValue: 'LinkedIn',
        type: 'input',
      },
      {
        name: 'postTopic',
        label: 'Post topic',
        placeholder: 'What is the post about?',
        defaultValue: 'Launching the AI Enclave page for DigiTantra',
        type: 'textarea',
        rows: 4,
      },
      {
        name: 'toneAndGoal',
        label: 'Tone and goal',
        placeholder: 'e.g. confident launch post, educational, behind-the-scenes',
        defaultValue: 'Professional launch post with a confident but clear tone.',
        type: 'input',
      },
    ],
  },
  'ad-copy-generator': {
    title: 'Generate sharper ad copy',
    intro:
      'Produce cleaner paid campaign copy with better hooks, offer framing, and clearer audience messaging.',
    ctaLabel: 'Generate Ad Copy',
    outputGuide:
      'Return ad copy in plain text with the section labels Headline Options, Primary Copy, and CTA Variants.',
    systemPrompt:
      'You are a performance marketing copywriter. Write ad copy that is clear, conversion-focused, and aligned to a specific audience and offer.',
    helperPoints: [
      'Good for social ads, lead-gen copy, and launch campaigns.',
      'Pairs audience and offer framing with stronger hooks.',
      'Generates multiple angles for testing.',
    ],
    fields: [
      {
        name: 'offer',
        label: 'Offer or product',
        placeholder: 'What are you promoting?',
        defaultValue: 'DigiTantra AI Enclave services',
        type: 'input',
      },
      {
        name: 'audience',
        label: 'Target audience',
        placeholder: 'Who is the ad for?',
        defaultValue: 'Students and early-career tech learners',
        type: 'input',
      },
      {
        name: 'goalAndProof',
        label: 'Goal and proof points',
        placeholder: 'Share the campaign goal and strongest proof points...',
        defaultValue: 'Drive awareness and clicks. Highlight direct-use AI tools for resumes, interviews, study help, and content creation.',
        type: 'textarea',
        rows: 5,
      },
    ],
  },
  'landing-page-copy-generator': {
    title: 'Write cleaner landing page copy',
    intro:
      'Build better hero messaging, feature copy, and CTA sections for launches, products, and offers.',
    ctaLabel: 'Generate Landing Page Copy',
    outputGuide:
      'Return landing page copy in plain text with the section labels Hero Headline, Supporting Copy, Feature Blocks, and CTAs.',
    systemPrompt:
      'You are a conversion copywriter for landing pages. Write clean, structured, high-clarity copy with strong hierarchy and no empty hype.',
    helperPoints: [
      'Useful for launch pages, tools, and educational offers.',
      'Focuses on hierarchy, clarity, and conversion flow.',
      'Produces copy blocks users can drop into design layouts.',
    ],
    fields: [
      {
        name: 'product',
        label: 'Product or page',
        placeholder: 'What is the landing page for?',
        defaultValue: 'AI Resume Builder for DigiTantra users',
        type: 'input',
      },
      {
        name: 'audience',
        label: 'Audience',
        placeholder: 'Who is the landing page aimed at?',
        defaultValue: 'Students and early-career professionals applying for tech roles.',
        type: 'input',
      },
      {
        name: 'positioning',
        label: 'Positioning and offer details',
        placeholder: 'What makes it valuable, and what should the page push users toward?',
        defaultValue: 'Fast ATS-friendly resume drafting with practical AI assistance and clear role targeting.',
        type: 'textarea',
        rows: 5,
      },
    ],
  },
  'seo-blog-outline-tool': {
    title: 'Shape SEO direction before writing',
    intro:
      'Generate keyword clusters, content angles, and a structured outline before moving into full article creation.',
    ctaLabel: 'Generate SEO Outline',
    outputGuide:
      'Return SEO planning output in plain text with the section labels Primary Keyword Direction, Supporting Topics, Search Intent, and Outline.',
    systemPrompt:
      'You are an SEO content strategist. Build practical keyword and outline recommendations for educational or product-led content without fabricating search volumes.',
    helperPoints: [
      'Useful before writing blogs, guides, or long-form content.',
      'Focuses on topic structure and search intent alignment.',
      'Pairs naturally with the AI Blog Generator.',
    ],
    fields: [
      {
        name: 'topic',
        label: 'Primary topic',
        placeholder: 'What is the blog topic?',
        defaultValue: 'How AI is changing digital marketing workflows',
        type: 'input',
      },
      {
        name: 'audience',
        label: 'Audience',
        placeholder: 'Who is the content for?',
        defaultValue: 'Students, marketers, and early-career professionals exploring AI tools.',
        type: 'input',
      },
      {
        name: 'goal',
        label: 'Content goal',
        placeholder: 'What should this content achieve?',
        defaultValue: 'Create an educational blog that can rank for AI + marketing interest queries and guide readers into DigiTantra content.',
        type: 'textarea',
        rows: 5,
      },
    ],
  },
  'study-planner': {
    title: 'Build a realistic study plan',
    intro:
      'Turn vague study intent into a weekly plan that respects timelines, available hours, and actual exam or project pressure.',
    ctaLabel: 'Generate Study Plan',
    outputGuide:
      'Return a study plan in plain text with the section labels Weekly Structure, Daily Focus, and Progress Checks.',
    systemPrompt:
      'You are a study planning assistant. Create realistic schedules that balance ambition with time constraints and help the user sustain progress.',
    helperPoints: [
      'Useful for exam prep, skill-building, and deadline planning.',
      'Transforms goals into repeatable weekly structure.',
      'Keeps plans realistic and easier to follow.',
    ],
    fields: [
      {
        name: 'studyGoal',
        label: 'Study goal',
        placeholder: 'What are you trying to prepare for?',
        defaultValue: 'Prepare for a frontend internship interview and strengthen React fundamentals.',
        type: 'textarea',
        rows: 4,
      },
      {
        name: 'availability',
        label: 'Availability',
        placeholder: 'How many hours and which days are available?',
        defaultValue: '2 hours on weekdays and 4 hours on weekends.',
        type: 'textarea',
        rows: 4,
      },
      {
        name: 'timeline',
        label: 'Timeline and deadlines',
        placeholder: 'Mention the timeframe and any upcoming deadlines...',
        defaultValue: 'Need a 4-week plan with one interview expected next month.',
        type: 'textarea',
        rows: 4,
      },
    ],
  },
  'skill-gap-analyzer': {
    title: 'Analyze skill gaps against a target role',
    intro:
      'Compare current strengths against target-role expectations and surface the most important missing skills and next actions.',
    ctaLabel: 'Analyze Skill Gap',
    outputGuide:
      'Return a skill-gap analysis in plain text with the section labels Current Strengths, Skill Gaps, and Priority Actions.',
    systemPrompt:
      'You are a role-readiness analyst for technology careers. Compare a user profile against a target role and identify the most meaningful skill gaps and the fastest next steps.',
    helperPoints: [
      'Useful for role transitions and readiness checks.',
      'Prioritizes what matters most instead of listing everything.',
      'Produces an action path, not just a diagnosis.',
    ],
    fields: [
      {
        name: 'targetRole',
        label: 'Target role',
        placeholder: 'e.g. DevOps Engineer, Data Analyst, Backend Developer',
        defaultValue: 'Data Analyst Intern',
        type: 'input',
      },
      {
        name: 'currentSkills',
        label: 'Current skills and experience',
        placeholder: 'List tools, projects, coursework, and experience...',
        defaultValue: 'Python basics, SQL basics, Excel, basic charts, no strong statistics project yet.',
        type: 'textarea',
        rows: 6,
      },
      {
        name: 'goalContext',
        label: 'Goal context',
        placeholder: 'Mention timelines, target companies, or specific constraints...',
        defaultValue: 'Looking for internship readiness in the next 3 months.',
        type: 'textarea',
        rows: 4,
      },
    ],
  },
};

export function getAiEnclaveWorkbenchConfig(serviceId: AiEnclaveServiceId) {
  if (serviceId === 'blog-generator') {
    return null;
  }

  return AI_ENCLAVE_WORKBENCH_CONFIG[serviceId];
}
