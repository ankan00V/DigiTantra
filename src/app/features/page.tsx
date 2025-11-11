import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { ArrowUpRight, BarChart, Bot, Code, Cpu, Database, Feather, Lock, Rocket, Server, Gem, CheckCircle, Clock, Users, ChevronDown, Linkedin, Star, Quote } from "lucide-react";
import type { Metadata } from 'next';
import { PageSpecific3DAnimation } from "@/components/page-specific-3d-animation";
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";
import { Button } from "@/components/ui/button";
import Link from "next/link";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Carousel, CarouselContent, CarouselItem, CarouselNext, CarouselPrevious } from "@/components/ui/carousel";

export const metadata: Metadata = {
  title: 'Courses & Pricing | DigiTantra',
  description: 'Explore our comprehensive curriculum of tech courses and their pricing.',
};

const courses = [
  { name: 'Gen AI', icon: <Feather />, description: 'Master generative AI and build next-gen applications.', price: '₹49,999', timeline: '12 Weeks', features: ['24/7 Mentor Support', 'AI Chatbot Access', 'Portfolio Projects'], url: 'https://www.lpu.in/programmes/engineering/b-tech-cse-genrative-artificial-intelligence' },
  { name: 'AI/ML', icon: <Cpu />, description: 'Dive deep into machine learning models and algorithms.', price: '₹44,999', timeline: '16 Weeks', features: ['24/7 Mentor Support', 'AI Chatbot Access', 'Capstone Project'], url: 'https://www.lpu.in/programmes/engineering/b-tech-cse-artificial-intelligence-and-machine-learning' },
  { name: 'Data Science', icon: <Database />, description: 'Learn to extract insights from data with Python and SQL.', price: '₹39,999', timeline: '14 Weeks', features: ['24/7 Mentor Support', 'AI Chatbot Access', 'Real-world Datasets'], url: 'https://www.lpu.in/programmes/engineering/b-tech-cse-specialization-in-data-science-ml-and-ai' },
  { name: 'Full Stack Development', icon: <Code />, description: 'Become a complete web developer from frontend to backend.', price: '₹59,999', timeline: '24 Weeks', features: ['24/7 Mentor Support', 'AI Chatbot Access', 'Live Project Building'], url: 'https://www.lpu.in/b-tech-cse-specialization-in-full-stack-development/' },
  { name: 'Cloud Computing', icon: <Server />, description: 'Understand cloud infrastructure with AWS, Azure, and GCP.', price: '₹34,999', timeline: '10 Weeks', features: ['24/7 Mentor Support', 'AI Chatbot Access', 'Cloud Sandboxes'], url: 'https://www.lpu.in/b-tech-cse-cloud-computing-with-google-cloud-platform/' },
  { name: 'Cyber Security', icon: <Lock />, description: 'Protect systems and networks from digital attacks.', price: '₹42,999', timeline: '18 Weeks', features: ['24/7 Mentor Support', 'AI Chatbot Access', 'Ethical Hacking Labs'], url: 'https://www.lpu.in/programmes/bsc-computer-science-cyber-security' },
  { name: 'Web 3.0 & Blockchain', icon: <Gem />, description: 'Explore the future of the decentralized internet.', price: '₹54,999', timeline: '20 Weeks', features: ['24/7 Mentor Support', 'AI Chatbot Access', 'dApp Development'], url: 'https://www.coursera.org/learn/web3-blockchain-fundamentals' },
  { name: 'DevOps Engineering', icon: <Rocket />, description: 'Automate and streamline your development pipelines.', price: '₹47,999', timeline: '15 Weeks', features: ['24/7 Mentor Support', 'AI Chatbot Access', 'CI/CD Pipelines'], url: 'https://www.lpu.in/b-tech-cse-cloud-computing-and-devOps-automation/' },
];

const testimonials = [
  {
    name: "Priya Sharma",
    quote: "The Gen AI course was a game-changer! The hands-on projects gave me the confidence to crack interviews at top companies.",
    company: "Google",
    role: "AI Engineer",
    package: "28 LPA",
    avatar: "https://picsum.photos/seed/priya/100/100",
  },
  {
    name: "Rohan Verma",
    quote: "DigiTantra's Full Stack course is incredibly comprehensive. I went from knowing basic HTML to building complex applications and landed my dream job at Microsoft.",
    company: "Microsoft",
    role: "Software Engineer",
    package: "25 LPA",
    avatar: "https://picsum.photos/seed/rohan/100/100",
  },
  {
    name: "Aisha Khan",
    quote: "The Data Science program is top-notch. The mentors are industry experts who provide invaluable guidance. I'm now working at Amazon, and it's all thanks to DigiTantra.",
    company: "Amazon",
    role: "Data Scientist",
    package: "22 LPA",
    avatar: "https://picsum.photos/seed/aisha/100/100",
  },
  {
    name: "Vikram Singh",
    quote: "I highly recommend the Cyber Security course. The ethical hacking labs were the best part, and they prepared me for my role at Cisco.",
    company: "Cisco",
    role: "Security Analyst",
    package: "18 LPA",
    avatar: "https://picsum.photos/seed/vikram/100/100",
  },
   {
    name: "Sneha Reddy",
    quote: "The blend of theory and practical projects in the AI/ML course is perfect. I felt fully prepared for my technical interviews and secured a position at Meta.",
    company: "Meta",
    role: "Machine Learning Engineer",
    package: "26 LPA",
    avatar: "https://picsum.photos/seed/sneha/100/100",
  },
  {
    name: "Arjun Mehta",
    quote: "The consulting case studies in the curriculum were amazing. They helped me land a Tech Consultant role at McKinsey right after the course.",
    company: "McKinsey",
    role: "Tech Consultant",
    package: "27 LPA",
    avatar: "https://picsum.photos/seed/arjun/100/100",
  },
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
                            <Button className="w-full font-semibold" asChild>
                              <Link href={course.url} target="_blank" rel="noopener noreferrer">
                                Enroll Now
                              </Link>
                            </Button>
                        </div>
                    </AccordionContent>
                </Card>
            </AccordionItem>
          ))}
        </Accordion>
      </div>

       <div className="main-container relative z-10">
        <div className="text-center">
          <h2 className="font-headline text-4xl md:text-5xl font-bold tracking-tighter">
            Success <span className="text-glow-primary text-primary">Stories</span>
          </h2>
          <p className="mt-4 max-w-3xl mx-auto text-lg text-muted-foreground">
            Hear from our alumni who have landed their dream jobs in top tech companies.
          </p>
        </div>

        <Carousel
          opts={{ align: "start", loop: true }}
          className="w-full max-w-6xl mx-auto mt-16"
        >
          <CarouselContent>
            {testimonials.map((testimonial, index) => (
              <CarouselItem key={index} className="md:basis-1/2 lg:basis-1/3">
                <div className="p-4">
                  <Card className="glassmorphic flex flex-col h-full">
                    <CardContent className="pt-6 flex-grow">
                      <Quote className="h-8 w-8 text-primary/50 mb-4" />
                      <p className="text-muted-foreground italic">"{testimonial.quote}"</p>
                    </CardContent>
                    <CardFooter className="flex flex-col items-start p-6 bg-muted/30">
                        <div className="flex items-center w-full">
                             <Avatar className="h-12 w-12 mr-4 border-2 border-primary">
                                <AvatarImage src={testimonial.avatar} alt={testimonial.name} />
                                <AvatarFallback>{testimonial.name.substring(0,2)}</AvatarFallback>
                            </Avatar>
                            <div>
                                <p className="font-bold text-lg">{testimonial.name}</p>
                                <p className="text-sm text-muted-foreground">{testimonial.role} at <span className="font-semibold text-primary">{testimonial.company}</span></p>
                            </div>
                        </div>
                        <div className="w-full text-right mt-4">
                            <Badge variant="secondary" className="text-lg">
                                {testimonial.package}
                            </Badge>
                        </div>
                    </CardFooter>
                  </Card>
                </div>
              </CarouselItem>
            ))}
          </CarouselContent>
          <CarouselPrevious className="-left-4 md:-left-12" />
          <CarouselNext className="-right-4 md:-right-12" />
        </Carousel>
      </div>
    </div>
  );
}
