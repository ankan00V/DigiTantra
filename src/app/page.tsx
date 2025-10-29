import Link from 'next/link';
import { ArrowRight, Bot, BarChart, ShoppingBag } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Abstract3DModel } from '@/components/abstract-3d-model';

export default function Home() {
  return (
    <div className="relative overflow-hidden">
      <div className="animated-gradient-bg">
        <div className="main-container grid grid-cols-1 lg:grid-cols-2 items-center gap-8 min-h-screen pt-20 lg:pt-0">
          <div className="text-center lg:text-left relative z-10">
            <h1 className="font-headline text-4xl md:text-6xl lg:text-7xl font-bold tracking-tighter">
              <span className="block text-primary text-glow-primary animate-glow">DigMkt</span>
              <span className="block mt-2">Where Data Meets Design.</span>
            </h1>
            <p className="mt-6 max-w-2xl mx-auto lg:mx-0 text-lg text-muted-foreground">
              A modern, data-driven, and visually stunning website for the MKT311 Digital Marketing academic project, inspired by CRED’s premium brand experience.
            </p>
            <div className="mt-8 flex justify-center lg:justify-start gap-4">
              <Button asChild size="lg" className="font-semibold">
                <Link href="/features">
                  Explore Features <ArrowRight className="ml-2 h-5 w-5" />
                </Link>
              </Button>
              <Button asChild size="lg" variant="secondary" className="font-semibold">
                <Link href="/contact">Get Started</Link>
              </Button>
            </div>
          </div>
           <div className="relative z-0 h-64 lg:h-full w-full">
            <Abstract3DModel />
          </div>
        </div>
      </div>

      <section className="py-20">
        <div className="container mx-auto px-4">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 text-center">
            <Card className="glassmorphic">
              <CardHeader>
                <div className="mx-auto bg-primary/10 rounded-full p-3 w-fit">
                  <Bot className="h-8 w-8 text-primary" />
                </div>
                <CardTitle className="font-headline mt-4 text-2xl">AI Insights</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-muted-foreground">
                  Leverage artificial intelligence to generate content, analyze trends, and assist visitors with our integrated chatbot.
                </p>
              </CardContent>
            </Card>
            <Card className="glassmorphic">
              <CardHeader>
                <div className="mx-auto bg-secondary/10 rounded-full p-3 w-fit">
                  <BarChart className="h-8 w-8 text-secondary" />
                </div>
                <CardTitle className="font-headline mt-4 text-2xl">Data Analytics</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-muted-foreground">
                  Integrate Google Analytics to track key metrics, understand user behavior, and make data-driven decisions.
                </p>
              </CardContent>
            </Card>
            <Card className="glassmorphic">
               <CardHeader>
                <div className="mx-auto bg-primary/10 rounded-full p-3 w-fit">
                  <ShoppingBag className="h-8 w-8 text-primary" />
                </div>
                <CardTitle className="font-headline mt-4 text-2xl">Smart Rewards</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-muted-foreground">
                  Discover a conceptual rewards system inspired by CRED, designed to enhance user engagement and loyalty.
                </p>
              </CardContent>
            </Card>
          </div>
        </div>
      </section>
    </div>
  );
}
