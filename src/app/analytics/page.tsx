import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Users, CheckCircle, Clock, Linkedin } from "lucide-react";
import type { Metadata } from 'next';
import { AnalyticsDashboard } from "@/components/analytics-dashboard";
import { PageSpecific3DAnimation } from "@/components/page-specific-3d-animation";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import Link from "next/link";

export const metadata: Metadata = {
  title: 'Dashboard | DigiTantra',
  description: 'View key metrics and data visualizations for course performance.',
};

const stats = [
    {
        icon: <Users className="h-8 w-8 text-primary" />,
        label: "Total Students",
        value: "12,424",
        change: "+15.2% this month"
    },
    {
        icon: <CheckCircle className="h-8 w-8 text-green-400" />,
        label: "Completion Rate",
        value: "82.3%",
        change: "+3.1% this month"
    },
    {
        icon: <Clock className="h-8 w-8 text-primary" />,
        label: "Avg. Learning Time",
        value: "28h 45m",
        change: "+5.9% this month"
    },
]

export default function AnalyticsPage() {
  return (
    <div className="relative overflow-hidden">
        <PageSpecific3DAnimation type="analytics" />
        <div className="main-container relative z-10">
            <div className="text-center">
                <h1 className="font-headline text-4xl md:text-5xl font-bold tracking-tighter">
                    Platform <span className="text-glow-primary text-primary">Dashboard</span>
                </h1>
                <p className="mt-4 max-w-3xl mx-auto text-lg text-muted-foreground">
                    Tracking key performance indicators for our courses and students. All data shown is for demonstration.
                </p>
            </div>

            <div className="mt-16">
                <Card className="glassmorphic">
                    <CardContent className="p-8 flex flex-col md:flex-row items-center gap-8">
                        <Avatar className="h-24 w-24 border-4 border-primary">
                            <AvatarImage src="https://media.licdn.com/dms/image/v2/D5603AQEgsBwL21VRlw/profile-displayphoto-scale_400_400/B56ZgJOw0_HYAk-/0/1752501523203?e=1763596800&v=beta&t=36YCkE6cGe8xJBSWfu2FqAl8YCEEa8SLx555O3r0_N8" alt="Ankan Ghosh" />
                            <AvatarFallback>AG</AvatarFallback>
                        </Avatar>
                        <div className="text-center md:text-left">
                            <h3 className="font-headline text-3xl text-primary">Connect with the Founder</h3>
                            <p className="text-muted-foreground mt-2 max-w-lg">
                                Have questions or ideas? Connect with Ankan Ghosh, the creator of DigiTantra. Let's innovate the future of tech education together.
                            </p>
                        </div>
                        <Button asChild size="lg" className="font-semibold ml-auto flex-shrink-0">
                            <Link href="https://www.linkedin.com/in/ghoshankan/" target="_blank" rel="noopener noreferrer">
                                <Linkedin className="mr-2 h-5 w-5" />
                                Connect on LinkedIn
                            </Link>
                        </Button>
                    </CardContent>
                </Card>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mt-16">
                {stats.map((stat, index) => (
                    <Card key={index} className="glassmorphic">
                        <CardHeader className="flex flex-row items-center justify-between pb-2">
                           <CardTitle className="text-sm font-medium text-muted-foreground">{stat.label}</CardTitle>
                           {stat.icon}
                        </CardHeader>
                        <CardContent>
                            <div className="text-4xl font-bold">{stat.value}</div>
                            <p className="text-xs text-muted-foreground mt-1">{stat.change}</p>
                        </CardContent>
                    </Card>
                ))}
            </div>

            <AnalyticsDashboard />

        </div>
    </div>
  );
}
