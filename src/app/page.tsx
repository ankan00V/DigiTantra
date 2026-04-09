import Link from 'next/link';
import { ArrowRight, CheckCircle, Code, Cpu, Database, Feather, LineChart, Lock, Server } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Carousel, CarouselContent, CarouselItem, CarouselNext, CarouselPrevious } from '@/components/ui/carousel';
import { HomeSplineBackground } from '@/components/home-spline-background';

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
      <section className="relative min-h-[100svh] overflow-hidden">
        <HomeSplineBackground />
        <div className="main-container relative z-10 flex min-h-[100svh] flex-col items-center justify-center pt-20 text-center sm:pt-28">
          <div className="mx-auto max-w-5xl px-4 sm:px-8 lg:px-10">
            <div className="mx-auto mb-5 inline-flex items-center rounded-full border border-white/15 bg-black/20 px-3 py-1.5 text-[10px] font-semibold uppercase tracking-[0.24em] text-white/92 shadow-[0_10px_30px_rgba(0,0,0,0.3)] backdrop-blur-md sm:px-4 sm:text-[11px] sm:tracking-[0.28em]">
              AI-first learning platform
            </div>
            <h1 className="font-headline text-[2.75rem] font-bold leading-[0.95] tracking-tighter sm:text-6xl lg:text-8xl">
              <span className="block bg-gradient-to-br from-white via-violet-100 to-fuchsia-100 bg-clip-text text-transparent drop-shadow-[0_18px_46px_rgba(0,0,0,0.52)]">
                The Future of
              </span>
              <span className="mt-2 block bg-gradient-to-b from-[#2a1459] via-[#3f1f86] to-[#5b2cc0] bg-clip-text text-transparent [-webkit-text-stroke:1.5px_rgba(232,221,255,0.92)] [text-shadow:0_0_18px_rgba(176,132,255,0.36),0_12px_28px_rgba(0,0,0,0.34)]">
                Tech Education
              </span>
            </h1>
            <p className="mx-auto mt-6 max-w-xl text-sm font-medium leading-7 text-white/95 [text-shadow:0_10px_26px_rgba(0,0,0,0.58)] sm:max-w-2xl sm:text-lg">
              Master the most in-demand skills with our project-based courses, designed by
              industry experts for aspiring tech leaders.
            </p>
            <div className="mt-8 flex flex-col justify-center gap-3 sm:flex-row sm:gap-4">
              <Button asChild size="lg" className="h-12 w-full border border-[#eadcff]/70 bg-gradient-to-b from-[#3a1d79] via-[#5a2cc0] to-[#7644eb] font-semibold text-base text-white shadow-[0_16px_36px_rgba(120,76,255,0.34),inset_0_0_0_1px_rgba(255,255,255,0.14)] hover:from-[#43218a] hover:via-[#6433d3] hover:to-[#8756f2] sm:w-auto sm:text-lg">
                <Link href="/features">
                  Explore Courses & Pricing <ArrowRight className="ml-2 h-5 w-5" />
                </Link>
              </Button>
              <Button asChild size="lg" variant="outline" className="h-12 w-full border-white/20 bg-black/25 font-semibold text-base text-white shadow-[0_16px_36px_rgba(0,0,0,0.24)] backdrop-blur-md hover:bg-black/35 sm:w-auto sm:text-lg">
                <Link href="/contact">Get Started</Link>
              </Button>
            </div>
          </div>
        </div>
      </section>
      
      <section className="relative z-10 bg-background py-16 sm:py-20">
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
