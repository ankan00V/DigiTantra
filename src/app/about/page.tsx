import { Target, Goal, Brush, Star, Heart, Award } from "lucide-react";
import type { Metadata } from 'next';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

export const metadata: Metadata = {
  title: 'About | DigiTantra',
  description: 'Learn about DigiTantra, its vision for AI-powered tech education, and the product principles behind the platform.',
};

const aboutSections = [
    {
        icon: <Target className="h-8 w-8 text-primary" />,
        title: "What DigiTantra Is",
        description: "DigiTantra is an AI-powered tech learning platform built for learners who want more than static course catalogs. It combines course discovery, guided AI tools, and practical learning workflows in one product experience.",
    },
    {
        icon: <Goal className="h-8 w-8 text-secondary" />,
        title: "Our Vision",
        description: "Our vision is to make tech education more intelligent, practical, and outcome-driven. DigiTantra is designed to help users move from curiosity to capability with clear learning paths, real tools, and job-oriented guidance.",
    },
    {
        icon: <Brush className="h-8 w-8 text-primary" />,
        title: "Our Mission",
        description: "DigiTantra exists to help learners build in-demand digital and technical skills through structured tracks, AI-assisted support, and a modern product experience that feels actionable from day one.",
    },
    {
        icon: <Star className="h-8 w-8 text-secondary" />,
        title: "How The Platform Works",
        description: "The product brings together course exploration, AI Enclave workspaces, analytics-led product surfaces, and guided learning support so users can discover, plan, practice, and improve in one ecosystem.",
    },
    {
        icon: <Award className="h-8 w-8 text-primary" />,
        title: "What Sets DigiTantra Apart",
        description: "Instead of treating AI as a side feature, DigiTantra makes it part of the core learning journey. Users can access tools for resumes, interviews, study planning, summaries, content creation, and career roadmaps alongside course and skill discovery.",
    },
    {
        icon: <Heart className="h-8 w-8 text-secondary" />,
        title: "Our Long-Term Goal",
        description: "The long-term goal is to turn DigiTantra into a complete AI-first education and career acceleration platform where learners can continuously upskill, build proof of work, and become job-ready through guided digital experiences.",
    }
]

export default function AboutPage() {
  return (
    <div className="relative overflow-hidden">
        <div className="main-container relative z-10">
            <div className="text-center">
                <h1 className="font-headline text-4xl md:text-5xl font-bold tracking-tighter">
                    About <span className="text-glow-primary text-primary">DigiTantra</span>
                </h1>
                <p className="mt-4 max-w-3xl mx-auto text-lg text-muted-foreground">
                    DigiTantra is a next-generation platform for AI-powered tech education, built to combine
                    learning, career growth, and practical execution in one cohesive digital experience.
                </p>
            </div>

            <div className="mt-16 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                {aboutSections.map((section, index) => (
                    <Card key={index} className="glassmorphic">
                        <CardHeader className="flex flex-row items-center gap-4">
                            <div className="flex-shrink-0">{section.icon}</div>
                            <CardTitle className="font-headline text-2xl">{section.title}</CardTitle>
                        </CardHeader>
                        <CardContent>
                            <p className="text-muted-foreground">{section.description}</p>
                        </CardContent>
                    </Card>
                ))}
            </div>
        </div>
    </div>
  );
}
