import { Award, BookOpen, BrainCircuit, Rocket } from "lucide-react";
import type { Metadata } from 'next';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { PageSpecific3DAnimation } from "@/components/page-specific-3d-animation";

export const metadata: Metadata = {
  title: 'About | DigMkt',
  description: 'Learn about the DigMkt project, its academic context, and the inspiration behind its design.',
};

const aboutSections = [
    {
        icon: <BookOpen className="h-8 w-8 text-primary" />,
        title: "Academic Context",
        description: "This website is an individual assignment for MKT311 – Digital Marketing under Dr. Ashok Malhi. It aims to demonstrate a comprehensive understanding of building a digital marketing ecosystem.",
    },
    {
        icon: <Rocket className="h-8 w-8 text-secondary" />,
        title: "CRED-Inspired Design",
        description: "The UI/UX is heavily inspired by CRED, emphasizing a premium, minimalist, and interactive design philosophy. The name 'DigMkt' symbolizes clarity, innovation, and intelligent online strategy.",
    },
    {
        icon: <BrainCircuit className="h-8 w-8 text-primary" />,
        title: "Learning Goals",
        description: "The project integrates core digital marketing pillars: branding, web development, SEO, AI-driven strategy, social media marketing, and data analytics through Google Analytics.",
    },
    {
        icon: <Award className="h-8 w-8 text-secondary" />,
        title: "Project Objective",
        description: "To build a complete digital marketing ecosystem, showcasing the ability to merge technology and marketing strategy into a cohesive and visually stunning online presence.",
    }
]

export default function AboutPage() {
  return (
    <div className="relative overflow-hidden">
        <PageSpecific3DAnimation type="about" />
        <div className="main-container relative z-10">
            <div className="text-center">
                <h1 className="font-headline text-4xl md:text-5xl font-bold tracking-tighter">
                    The Story of <span className="text-glow-primary text-primary">DigMkt</span>
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
