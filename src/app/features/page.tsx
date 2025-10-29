import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { ArrowUpRight, BarChart, Bot, Code, Cpu, Database, Feather, Lock, Rocket, Server, Gem } from "lucide-react";
import type { Metadata } from 'next';
import { PageSpecific3DAnimation } from "@/components/page-specific-3d-animation";

export const metadata: Metadata = {
  title: 'Courses | DigMkt',
  description: 'Explore our comprehensive curriculum of tech courses.',
};

const courses = [
  { name: 'Gen AI', icon: <Feather />, description: 'Master generative AI and build next-gen applications.' },
  { name: 'AI/ML', icon: <Cpu />, description: 'Dive deep into machine learning models and algorithms.' },
  { name: 'Data Science', icon: <Database />, description: 'Learn to extract insights from data with Python and SQL.' },
  { name: 'Full Stack Development', icon: <Code />, description: 'Become a complete web developer from frontend to backend.' },
  { name: 'Cloud Computing', icon: <Server />, description: 'Understand cloud infrastructure with AWS, Azure, and GCP.' },
  { name: 'Cyber Security', icon: <Lock />, description: 'Protect systems and networks from digital attacks.' },
  { name: 'Web 3.0 & Blockchain', icon: <Gem />, description: 'Explore the future of the decentralized internet.' },
  { name: 'DevOps Engineering', icon: <Rocket />, description: 'Automate and streamline your development pipelines.' },
];

export default function FeaturesPage() {
  return (
    <div className="relative overflow-hidden">
        <PageSpecific3DAnimation type="features" />
      <div className="main-container relative z-10">
        <div className="text-center">
          <h1 className="font-headline text-4xl md:text-5xl font-bold tracking-tighter">
            Our <span className="text-glow-primary text-primary">Courses</span>
          </h1>
          <p className="mt-4 max-w-3xl mx-auto text-lg text-muted-foreground">
            A comprehensive catalog of courses to equip you with the most in-demand tech skills of tomorrow.
          </p>
        </div>

        <div className="mt-16 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
          {courses.map((course, index) => (
            <Card key={index} className="glassmorphic group relative overflow-hidden transition-all duration-300 hover:border-primary/50 hover:shadow-2xl hover:shadow-primary/10 hover:-translate-y-2">
              <CardHeader>
                <div className="flex justify-between items-start">
                  <div className="text-primary">{course.icon}</div>
                </div>
                <CardTitle className="font-headline text-2xl pt-4">{course.name}</CardTitle>
                <CardDescription>{course.description}</CardDescription>
              </CardHeader>
              <CardContent>
                 <ArrowUpRight className="absolute bottom-6 right-6 h-6 w-6 text-muted-foreground transition-transform duration-300 group-hover:text-primary group-hover:rotate-45" />
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    </div>
  );
}
