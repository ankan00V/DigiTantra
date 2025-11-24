import { Target, Goal, Brush, Star, Heart, Award, Wand2, ArrowRight } from "lucide-react";
import type { Metadata } from 'next';
import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from "@/components/ui/card";
import { PageSpecific3DAnimation } from "@/components/page-specific-3d-animation";
import { Button } from "@/components/ui/button";
import Link from "next/link";

export const metadata: Metadata = {
  title: 'About | DigiTantra',
  description: 'Learn about the DigiTantra project, its academic context, and the inspiration behind its design.',
};

const aboutSections = [
    {
        icon: <Target className="h-8 w-8 text-primary" />,
        title: "Our Vision",
        description: "DigiTantra is a next-generation learning platform built to bridge the gap between technology and education. Designed as a showcase project, it demonstrates how innovation, interactivity, and user-centered design can transform online learning experiences.",
    },
    {
        icon: <Goal className="h-8 w-8 text-secondary" />,
        title: "Our Mission",
        description: "Our mission is to empower learners to master digital skills through structured, engaging, and hands-on learning experiences. DigiTantra reimagines how education can feel—dynamic, intuitive, and built for the modern tech enthusiast.",
    },
    {
        icon: <Brush className="h-8 w-8 text-primary" />,
        title: "Design Philosophy",
        description: "DigiTantra embraces a sleek, futuristic design that focuses on smooth user interactions, clarity, and accessibility. Every element is thoughtfully placed to create a frictionless browsing experience—balancing aesthetics with functionality and responsiveness across all devices.",
    },
    {
        icon: <Star className="h-8 w-8 text-secondary" />,
        title: "What Sets Us Apart",
        description: "Personalized learning, seamless experience, modern tech stack, inclusivity, and transparency are the core pillars that differentiate DigiTantra.",
    },
    {
        icon: <Award className="h-8 w-8 text-primary" />,
        title: "Project Objective",
        description: "To design and develop a complete digital learning ecosystem that merges technology, creativity, and education into one cohesive experience—proving that impactful design and functionality can coexist beautifully in a modern web project.",
    },
    {
        icon: <Heart className="h-8 w-8 text-secondary" />,
        title: "Learning Outcome",
        description: "Through DigiTantra, we demonstrate expertise in web design, branding, and digital strategy—building not just a website, but an entire learning experience that reflects the future of online education.",
    }
]

export default function AboutPage() {
  return (
    <div className="relative overflow-hidden">
        <PageSpecific3DAnimation type="about" />
        <div className="main-container relative z-10">
            <div className="text-center">
                <h1 className="font-headline text-4xl md:text-5xl font-bold tracking-tighter">
                    About <span className="text-glow-primary text-primary">DigiTantra</span>
                </h1>
                <p className="mt-4 max-w-3xl mx-auto text-lg text-muted-foreground">
                    An exploration of digital marketing excellence, combining academic theory with cutting-edge web technology and design.
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

            <div className="mt-24 text-center">
                <Card className="glassmorphic inline-block transition-all duration-300 ease-in-out hover:scale-[1.02] hover:shadow-2xl hover:shadow-primary/20 hover:border-primary/50">
                    <CardHeader>
                        <div className="flex justify-center">
                            <Wand2 className="h-10 w-10 text-primary text-glow-primary" />
                        </div>
                        <CardTitle className="font-headline text-3xl mt-4">
                            Explore our <span className="text-glow-primary text-primary">AI Blog Generator</span>
                        </CardTitle>
                        <CardDescription className="max-w-xl mx-auto text-lg text-muted-foreground">
                            Curious about the power of AI in content creation? Visit our blog and generate your own unique articles in seconds.
                        </CardDescription>
                    </CardHeader>
                    <CardFooter className="flex justify-center">
                        <Button asChild size="lg" className="font-semibold">
                            <Link href="/blog">
                                Try it Now <ArrowRight className="ml-2 h-5 w-5" />
                            </Link>
                        </Button>
                    </CardFooter>
                </Card>
            </div>
        </div>
    </div>
  );
}
