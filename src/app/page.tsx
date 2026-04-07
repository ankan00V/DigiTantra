import Link from 'next/link';
import { ArrowRight, CheckCircle, Code, Cpu, Database, Feather, LineChart, Lock, Server } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
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
      <div className="main-container flex min-h-[72svh] flex-col items-center justify-center pt-24 text-center sm:min-h-[78svh] sm:pt-28">
        <div className="relative z-10 mx-auto max-w-5xl">
          <h1 className="font-headline text-4xl font-bold leading-[0.95] tracking-tighter sm:text-6xl lg:text-8xl">
            <span className="block bg-clip-text text-transparent bg-gradient-to-br from-white to-neutral-400">The Future of</span>
            <span className="block text-glow-primary text-primary mt-2">Tech Education</span>
          </h1>
          <p className="mx-auto mt-6 max-w-2xl text-base text-muted-foreground sm:text-lg">
            Master the most in-demand skills with our project-based courses, designed by industry experts for aspiring tech leaders.
          </p>
          <div className="mt-8 flex flex-col justify-center gap-3 sm:flex-row sm:gap-4">
            <Button asChild size="lg" className="h-12 font-semibold text-base sm:text-lg">
              <Link href="/features">
                Explore Courses & Pricing <ArrowRight className="ml-2 h-5 w-5" />
              </Link>
            </Button>
            <Button asChild size="lg" variant="outline" className="h-12 font-semibold text-base sm:text-lg">
              <Link href="/contact">Get Started</Link>
            </Button>
          </div>
        </div>
      </div>
      
      <section className="relative z-10 py-16 sm:py-20">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <div className="mb-12 text-center sm:mb-16">
            <h2 className="font-headline text-3xl font-bold tracking-tight sm:text-4xl md:text-5xl">Trending Courses</h2>
            <p className="mx-auto mt-4 max-w-2xl text-base text-muted-foreground sm:text-lg">
              Dive into the technologies shaping our future.
            </p>
          </div>

          <Carousel
            opts={{ align: "start", loop: true }}
            className="w-full max-w-6xl mx-auto"
          >
            <CarouselContent>
              {courses.map((course, index) => (
                <CarouselItem key={index} className="basis-[88%] sm:basis-1/2 lg:basis-1/3">
                  <div className="p-1">
                    <Card className="glassmorphic group overflow-hidden transition-all duration-300 hover:border-primary/50 hover:shadow-2xl hover:shadow-primary/10">
                        <CardHeader>
                            <div className="flex items-center gap-3 sm:gap-4">
                                <div className="p-3 bg-primary/10 rounded-lg text-primary">{course.icon}</div>
                                <CardTitle className="font-headline text-xl sm:text-2xl">{course.name}</CardTitle>
                            </div>
                        </CardHeader>
                        <CardContent>
                            <p className="text-sm text-muted-foreground sm:text-base">Explore hands-on projects and real-world applications in {course.name}.</p>
                        </CardContent>
                    </Card>
                  </div>
                </CarouselItem>
              ))}
            </CarouselContent>
            <CarouselPrevious className="hidden md:flex md:-left-12" />
            <CarouselNext className="hidden md:flex md:-right-12" />
          </Carousel>
        </div>
      </section>

      <section className="relative z-10 bg-background py-16 sm:py-20">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
            <div className="grid grid-cols-1 gap-6 text-left md:grid-cols-3 md:gap-8">
                {kpis.map((kpi, index) => (
                    <div key={index} className="glassmorphic rounded-lg p-5 sm:p-6">
                        {kpi.icon}
                        <h3 className="mt-4 font-headline text-xl sm:text-2xl">{kpi.title}</h3>
                        <p className="mt-2 text-sm text-muted-foreground sm:text-base">{kpi.description}</p>
                    </div>
                ))}
            </div>
        </div>
      </section>
    </div>
  );
}
