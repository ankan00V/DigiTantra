import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Eye, Clock, TrendingDown } from "lucide-react";
import type { Metadata } from 'next';
import { AnalyticsDashboard } from "@/components/analytics-dashboard";
import { PageSpecific3DAnimation } from "@/components/page-specific-3d-animation";

export const metadata: Metadata = {
  title: 'Analytics | DigMkt',
  description: 'View key metrics and data visualizations for the DigMkt website.',
};

const stats = [
    {
        icon: <Eye className="h-8 w-8 text-primary" />,
        label: "Total Page Views",
        value: "1,424",
        change: "+12.5%"
    },
    {
        icon: <TrendingDown className="h-8 w-8 text-secondary" />,
        label: "Bounce Rate",
        value: "42.3%",
        change: "-5.2%"
    },
    {
        icon: <Clock className="h-8 w-8 text-primary" />,
        label: "Avg. Session Duration",
        value: "2m 45s",
        change: "+8.9%"
    },
]

export default function AnalyticsPage() {
  return (
    <div className="relative overflow-hidden">
        <PageSpecific3DAnimation type="analytics" />
        <div className="main-container relative z-10">
            <div className="text-center">
                <h1 className="font-headline text-4xl md:text-5xl font-bold tracking-tighter">
                    Website <span className="text-glow-primary text-primary">Analytics</span>
                </h1>
                <p className="mt-4 max-w-3xl mx-auto text-lg text-muted-foreground">
                    Tracking key performance indicators to measure success and inform strategy. All data shown is for demonstration purposes.
                </p>
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
                            <p className="text-xs text-muted-foreground mt-1">{stat.change} from last month</p>
                        </CardContent>
                    </Card>
                ))}
            </div>

            <AnalyticsDashboard />

        </div>
    </div>
  );
}
