import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { ArrowUpRight, BarChart, Bot, Gem, Search } from "lucide-react";
import type { Metadata } from 'next';
import { PageSpecific3DAnimation } from "@/components/page-specific-3d-animation";

export const metadata: Metadata = {
  title: 'Features | DigMkt',
  description: 'Explore the features of DigMkt, including AI Insights, SEO Optimization, and Smart Rewards.',
};

const features = [
  {
    icon: <Gem className="h-8 w-8 text-primary" />,
    title: "Smart Rewards",
    description: "A conceptual gamified rewards system inspired by CRED, designed to boost user engagement and retention through exclusive perks and benefits.",
    badge: "Conceptual"
  },
  {
    icon: <Bot className="h-8 w-8 text-secondary" />,
    title: "AI Insights",
    description: "Harness the power of AI for content creation, SEO keyword generation, and providing instant, helpful responses to visitors via our integrated chatbot.",
    badge: "Active"
  },
  {
    icon: <Search className="h-8 w-8 text-primary" />,
    title: "SEO Optimization",
    description: "Built from the ground up with SEO best practices, including optimized meta tags, semantic HTML, image compression, and fast load speeds for higher search rankings.",
    badge: "Active"
  },
  {
    icon: <BarChart className="h-8 w-8 text-secondary" />,
    title: "Analytics Integration",
    description: "Real-time tracking of website performance with Google Analytics. Monitor page views, bounce rates, and session durations to make data-informed decisions.",
    badge: "Active"
  }
];

export default function FeaturesPage() {
  return (
    <div className="relative overflow-hidden">
        <PageSpecific3DAnimation type="features" />
      <div className="main-container relative z-10">
        <div className="text-center">
          <h1 className="font-headline text-4xl md:text-5xl font-bold tracking-tighter">
            Core <span className="text-glow-primary text-primary">Features</span>
          </h1>
          <p className="mt-4 max-w-3xl mx-auto text-lg text-muted-foreground">
            A suite of powerful tools and strategies designed to create a comprehensive digital marketing platform.
          </p>
        </div>

        <div className="mt-16 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-2 gap-8">
          {features.map((feature, index) => (
            <Card key={index} className="glassmorphic group relative overflow-hidden transition-all duration-300 hover:border-primary/50 hover:shadow-2xl hover:shadow-primary/10">
              <CardHeader>
                <div className="flex justify-between items-start">
                  {feature.icon}
                  <Badge variant={feature.badge === 'Active' ? 'default' : 'secondary'}>{feature.badge}</Badge>
                </div>
                <CardTitle className="font-headline text-2xl pt-4">{feature.title}</CardTitle>
                <CardDescription>{feature.description}</CardDescription>
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
