import Link from 'next/link';
import { ArrowRight, CheckCircle, Code, Cpu, Database, Feather, LineChart, Lock, Server } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { PageSpecific3DAnimation } from '@/components/page-specific-3d-animation';
import { Carousel, CarouselContent, CarouselItem, CarouselNext, CarouselPrevious } from '@/components/ui/carousel';

const courses = [
  { name: 'Gen AI', icon: <Feather /> },
  { name: 'AI/ML', icon: <Cpu /> },
  { name: 'Data Science', icon: <Database /> },
  { name: 'Full Stack', icon: <Code /> },
  { name: 'Cloud Computing', icon: <Server /> },
  { name: 'Cyber Security', icon: <Lock /> },
];

const kpis = [
    { title: "Developer-First", description: "Built for developers, by developers. Our courses are hands-on and practical.", icon: <Code className="h-6 w-6 text-primary" /> },
    { title: "Global Scale", description: "Trusted by students and professionals from over 150 countries.", icon: <LineChart className="h-6 w-6 text-primary" /> },
    { title: "Enterprise-Grade", description: "Curriculum designed with industry leaders to meet enterprise demands.", icon: <CheckCircle className="h-6 w-6 text-primary" /> },
];

export default function Home() {
  return (
    <div className="relative overflow-hidden">
      <PageSpecific3DAnimation type="home" />

      <div className="main-container text-center min-h-[80vh] flex flex-col justify-center items-center">
        <div className="relative z-10">
          <h1 className="font-headline text-5xl md:text-7xl lg:text-8xl font-bold tracking-tighter leading-tight">
            <span className="block bg-clip-text text-transparent bg-gradient-to-br from-white to-neutral-400">The Future of</span>
            <span className="block text-glow-primary text-primary mt-2">Tech Education</span>
          </h1>
          <p className="mt-6 max-w-2xl mx-auto text-lg text-muted-foreground">
            Master the most in-demand skills with our project-based courses, designed by industry experts for aspiring tech leaders.
          </p>
          <div className="mt-8 flex justify-center gap-4">
            <Button asChild size="lg" className="font-semibold text-lg">
              <Link href="/features">
                Explore Courses <ArrowRight className="ml-2 h-5 w-5" />
              </Link>
            </Button>
            <Button asChild size="lg" variant="outline" className="font-semibold text-lg">
              <Link href="/contact">Get Started</Link>
            </Button>
          </div>
        </div>
      </div>
      
      <section className="py-20 relative z-10">
        <div className="container mx-auto px-4">
          <div className="text-center mb-16">
            <h2 className="font-headline text-4xl md:text-5xl font-bold tracking-tight">Trending Courses</h2>
            <p className="mt-4 max-w-2xl mx-auto text-lg text-muted-foreground">
              Dive into the technologies shaping our future.
            </p>
          </div>

          <Carousel
            opts={{ align: "start", loop: true }}
            className="w-full max-w-6xl mx-auto"
          >
            <CarouselContent>
              {courses.map((course, index) => (
                <CarouselItem key={index} className="md:basis-1/2 lg:basis-1/3">
                  <div className="p-1">
                    <Card className="glassmorphic group overflow-hidden transition-all duration-300 hover:border-primary/50 hover:shadow-2xl hover:shadow-primary/10">
                        <CardHeader>
                            <div className="flex items-center gap-4">
                                <div className="p-3 bg-primary/10 rounded-lg text-primary">{course.icon}</div>
                                <CardTitle className="font-headline text-2xl">{course.name}</CardTitle>
                            </div>
                        </CardHeader>
                        <CardContent>
                            <p className="text-muted-foreground">Explore hands-on projects and real-world applications in {course.name}.</p>
                        </CardContent>
                    </Card>
                  </div>
                </CarouselItem>
              ))}
            </CarouselContent>
            <CarouselPrevious className="-left-4 md:-left-12" />
            <CarouselNext className="-right-4 md:-right-12" />
          </Carousel>
        </div>
      </section>

      <section className="py-20 relative z-10 bg-background">
        <div className="container mx-auto px-4">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8 text-left">
                {kpis.map((kpi, index) => (
                    <div key={index} className="glassmorphic p-6 rounded-lg">
                        {kpi.icon}
                        <h3 className="font-headline text-2xl mt-4">{kpi.title}</h3>
                        <p className="text-muted-foreground mt-2">{kpi.description}</p>
                    </div>
                ))}
            </div>
        </div>
      </section>
    </div>
  );
}
