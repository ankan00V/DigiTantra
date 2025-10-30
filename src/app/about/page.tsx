import { Award, BookOpen, BrainCircuit, Rocket } from "lucide-react";
import type { Metadata } from 'next';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { PageSpecific3DAnimation } from "@/components/page-specific-3d-animation";

export const metadata: Metadata = {
  title: 'About | DigiTantra',
  description: 'Learn about the DigiTantra project, its academic context, and the inspiration behind its design.',
};

const aboutSections = [
    {
        icon: <BookOpen className="h-8 w-8 text-primary" />,
        title: "Our Mission",
        description: "This website is a showcase project to demonstrate a comprehensive understanding of building a modern digital ecosystem for tech education.",
    },
    {
        icon: <Rocket className="h-8 w-8 text-secondary" />,
        title: "CRED-Inspired Design",
        description: "The UI/UX is heavily inspired by CRED, emphasizing a premium, minimalist, and interactive design philosophy. The name 'DigiTantra' symbolizes digital expertise and strategy.",
    },
    {
        icon: <BrainCircuit className="h-8 w-8 text-primary" />,
        title: "Learning Goals",
        description: "The project integrates core pillars of modern tech: branding, web development, AI-driven strategy, and hands-on project-based learning.",
    },
    {
        icon: <Award className="h-8 w-8 text-secondary" />,
        title: "Project Objective",
        description: "To build a complete digital learning ecosystem, showcasing the ability to merge technology and educational strategy into a cohesive and visually stunning online presence.",
    }
]

export default function AboutPage() {
  return (
    <div className="relative overflow-hidden">
        <PageSpecific3DAnimation type="about" />
        <div className="main-container relative z-10">
            <div className="text-center">
                <h1 className="font-headline text-4xl md:text-5xl font-bold tracking-tighter">
                    The Story of <span className="text-glow-primary text-primary">DigiTantra</span>
                </h1>
                <p className="mt-4 max-w-3xl mx-auto text-lg text-muted-foreground">
                    An exploration of digital marketing excellence, combining academic theory with cutting-edge web technology and design.
                </p>
            </div>

            <div className="mt-16 grid grid-cols-1 md:grid-cols-2 gap-8">
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
