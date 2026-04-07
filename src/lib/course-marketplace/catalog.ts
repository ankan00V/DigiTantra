import type { CourseCategory } from "@/lib/course-marketplace/types";

export const COURSE_REFRESH_INTERVAL_MINUTES = 30;

const baseCategories: Omit<CourseCategory, "listings">[] = [
  {
    id: "gen-ai",
    name: "Gen AI",
    description: "Track generative AI programs and compare public-source offerings in one place.",
    iconKey: "feather",
    ownedPrice: "₹49,999",
    ownedTimeline: "12 Weeks",
    highlights: ["24/7 Mentor Support", "AI Chatbot Access", "Portfolio Projects"],
  },
  {
    id: "ai-ml",
    name: "AI/ML",
    description: "Compare machine learning and AI upskilling tracks across well-known platforms.",
    iconKey: "cpu",
    ownedPrice: "₹44,999",
    ownedTimeline: "16 Weeks",
    highlights: ["24/7 Mentor Support", "AI Chatbot Access", "Capstone Project"],
  },
  {
    id: "data-science",
    name: "Data Science",
    description: "Monitor public data science programs, durations, and source-level pricing availability.",
    iconKey: "database",
    ownedPrice: "₹39,999",
    ownedTimeline: "14 Weeks",
    highlights: ["24/7 Mentor Support", "AI Chatbot Access", "Real-world Datasets"],
  },
  {
    id: "full-stack-development",
    name: "Full Stack Development",
    description: "See web development and software engineering tracks from external providers.",
    iconKey: "code",
    ownedPrice: "₹59,999",
    ownedTimeline: "24 Weeks",
    highlights: ["24/7 Mentor Support", "AI Chatbot Access", "Live Project Building"],
  },
  {
    id: "cloud-computing",
    name: "Cloud Computing",
    description: "Reserved for AWS, Azure, and GCP provider feeds as adapters are added.",
    iconKey: "server",
    ownedPrice: "₹34,999",
    ownedTimeline: "10 Weeks",
    highlights: ["24/7 Mentor Support", "AI Chatbot Access", "Cloud Sandboxes"],
  },
  {
    id: "cyber-security",
    name: "Cyber Security",
    description: "Reserved for security-focused course aggregation from public providers.",
    iconKey: "lock",
    ownedPrice: "₹42,999",
    ownedTimeline: "18 Weeks",
    highlights: ["24/7 Mentor Support", "AI Chatbot Access", "Ethical Hacking Labs"],
  },
  {
    id: "web3-blockchain",
    name: "Web 3.0 & Blockchain",
    description: "Reserved for blockchain, web3, and decentralized systems course tracking.",
    iconKey: "gem",
    ownedPrice: "₹54,999",
    ownedTimeline: "20 Weeks",
    highlights: ["24/7 Mentor Support", "AI Chatbot Access", "dApp Development"],
  },
  {
    id: "devops-engineering",
    name: "DevOps Engineering",
    description: "Reserved for DevOps, platform, and deployment-focused provider feeds.",
    iconKey: "rocket",
    ownedPrice: "₹47,999",
    ownedTimeline: "15 Weeks",
    highlights: ["24/7 Mentor Support", "AI Chatbot Access", "CI/CD Pipelines"],
  },
];

export function createEmptyCategories(): CourseCategory[] {
  return baseCategories.map((category) => ({
    ...category,
    listings: [],
  }));
}
