import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { ArrowUpRight, BarChart, Bot, Code, Cpu, Database, Feather, Lock, Rocket, Server, Gem, CheckCircle, Clock, Users, ChevronDown } from "lucide-react";
import type { Metadata } from 'next';
import { PageSpecific3DAnimation } from "@/components/page-specific-3d-animation";
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";
import { Button } from "@/components/ui/button";

export const metadata: Metadata = {
  title: 'Courses & Pricing | DigMkt',
  description: 'Explore our comprehensive curriculum of tech courses and their pricing.',
};

const courses = [
  { name: 'Gen AI', icon: <Feather />, description: 'Master generative AI and build next-gen applications.', price: '₹49,999', timeline: '12 Weeks', features: ['24/7 Mentor Support', 'AI Chatbot Access', 'Portfolio Projects'] },
  { name: 'AI/ML', icon: <Cpu />, description: 'Dive deep into machine learning models and algorithms.', price: '₹44,999', timeline: '16 Weeks', features: ['24/7 Mentor Support', 'AI Chatbot Access', 'Capstone Project'] },
  { name: 'Data Science', icon: <Database />, description: 'Learn to extract insights from data with Python and SQL.', price: '₹39,999', timeline: '14 Weeks', features: ['24/7 Mentor Support', 'AI Chatbot Access', 'Real-world Datasets'] },
  { name: 'Full Stack Development', icon: <Code />, description: 'Become a complete web developer from frontend to backend.', price: '₹59,999', timeline: '24 Weeks', features: ['24/7 Mentor Support', 'AI Chatbot Access', 'Live Project Building'] },
  { name: 'Cloud Computing', icon: <Server />, description: 'Understand cloud infrastructure with AWS, Azure, and GCP.', price: '₹34,999', timeline: '10 Weeks', features: ['24/7 Mentor Support', 'AI Chatbot Access', 'Cloud Sandboxes'] },
  { name: 'Cyber Security', icon: <Lock />, description: 'Protect systems and networks from digital attacks.', price: '₹42,999', timeline: '18 Weeks', features: ['24/7 Mentor Support', 'AI Chatbot Access', 'Ethical Hacking Labs'] },
  { name: 'Web 3.0 & Blockchain', icon: <Gem />, description: 'Explore the future of the decentralized internet.', price: '₹54,999', timeline: '20 Weeks', features: ['24/7 Mentor Support', 'AI Chatbot Access', 'dApp Development'] },
  { name: 'DevOps Engineering', icon: <Rocket />, description: 'Automate and streamline your development pipelines.', price: '₹47,999', timeline: '15 Weeks', features: ['24/7 Mentor Support', 'AI Chatbot Access', 'CI/CD Pipelines'] },
];

export default function FeaturesPage() {
  return (
    <div className="relative overflow-hidden">
        <PageSpecific3DAnimation type="features" />
      <div className="main-container relative z-10">
        <div className="text-center">
          <h1 className="font-headline text-4xl md:text-5xl font-bold tracking-tighter">
            Our <span className="text-glow-primary text-primary">Courses & Pricing</span>
          </h1>
          <p className="mt-4 max-w-3xl mx-auto text-lg text-muted-foreground">
            A comprehensive catalog of courses to equip you with the most in-demand tech skills of tomorrow.
          </p>
        </div>

        <Accordion type="single" collapsible className="mt-16 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8 w-full">
          {courses.map((course, index) => (
             <AccordionItem value={`item-${index}`} key={index} className="border-none">
                <Card className="glassmorphic group relative flex flex-col overflow-hidden transition-all duration-300 hover:border-primary/50 hover:shadow-2xl hover:shadow-primary/10 h-full">
                    <AccordionTrigger className="hover:no-underline p-0 flex-grow">
                        <div className="p-6 text-left w-full flex-grow flex flex-col">
                            <CardHeader className="p-0 flex-grow">
                                <div className="flex justify-between items-start">
                                <div className="text-primary">{course.icon}</div>
                                </div>
                                <CardTitle className="font-headline text-2xl pt-4">{course.name}</CardTitle>
                                <CardDescription>{course.description}</CardDescription>
                            </CardHeader>
                            <CardContent className="p-0 pt-6">
                                <div className="flex justify-between items-center">
                                    <div className="text-2xl font-bold text-primary">{course.price}</div>
                                    <div className="text-muted-foreground group-hover:text-primary">
                                        <div className="flex items-center text-sm font-semibold">
                                            Details
                                            <ChevronDown className="h-4 w-4 ml-1 transition-transform duration-300" />
                                        </div>
                                    </div>
                                </div>
                            </CardContent>
                        </div>
                    </AccordionTrigger>
                    <AccordionContent className="px-6 pb-6">
                        <div>
                            <div className="flex items-center text-muted-foreground text-sm mb-4">
                                <Clock className="h-4 w-4 mr-2" />
                                <span>Timeline: {course.timeline}</span>
                            </div>
                            <ul className="space-y-2 mb-4">
                                {course.features.map((feature, fIndex) => (
                                    <li key={fIndex} className="flex items-center text-sm">
                                        <CheckCircle className="h-4 w-4 mr-2 text-green-400" />
                                        <span className="text-muted-foreground">{feature}</span>
                                    </li>
                                ))}
                            </ul>
                            <Button className="w-full font-semibold">Enroll Now</Button>
                        </div>
                    </AccordionContent>
                </Card>
            </AccordionItem>
          ))}
        </Accordion>
      </div>
    </div>
  );
}
