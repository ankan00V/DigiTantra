'use client'

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { ChartContainer, ChartTooltip, ChartTooltipContent } from '@/components/ui/chart';
import { Bar, BarChart, CartesianGrid, Line, LineChart, XAxis, YAxis } from 'recharts';
import type { ChartConfig } from '@/components/ui/chart';

const chartData = [
  { month: "January", pageViews: 186, sessionDuration: 120 },
  { month: "February", pageViews: 305, sessionDuration: 180 },
  { month: "March", pageViews: 237, sessionDuration: 150 },
  { month: "April", pageViews: 273, sessionDuration: 210 },
  { month: "May", pageViews: 209, sessionDuration: 190 },
  { month: "June", pageViews: 214, sessionDuration: 220 },
];

const chartConfig = {
  pageViews: {
    label: "Page Views",
    color: "hsl(var(--primary))",
  },
  sessionDuration: {
    label: "Session Duration (s)",
    color: "hsl(var(--secondary))",
  }
} satisfies ChartConfig;

export function AnalyticsDashboard() {
  return (
     <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mt-16">
        <Card className="glassmorphic">
            <CardHeader>
                <CardTitle className='font-headline'>Page Views Over Time</CardTitle>
                <CardDescription>Monthly page views for the first half of the year.</CardDescription>
            </CardHeader>
            <CardContent>
                <ChartContainer config={chartConfig} className="h-[300px] w-full">
                    <LineChart data={chartData} margin={{ top: 5, right: 20, left: -10, bottom: 5 }}>
                        <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="hsl(var(--border) / 0.5)" />
                        <XAxis dataKey="month" tickLine={false} axisLine={false} tickMargin={8} fontSize={12} />
                        <YAxis tickLine={false} axisLine={false} tickMargin={8} fontSize={12} />
                        <ChartTooltip content={<ChartTooltipContent />} />
                        <Line type="monotone" dataKey="pageViews" stroke="hsl(var(--primary))" strokeWidth={2} dot={{ fill: 'hsl(var(--primary))', r: 4 }} />
                    </LineChart>
                </ChartContainer>
            </CardContent>
        </Card>
        <Card className="glassmorphic">
            <CardHeader>
                <CardTitle className='font-headline'>Average Session Duration</CardTitle>
                <CardDescription>Average user session duration in seconds per month.</CardDescription>
            </CardHeader>
            <CardContent>
                <ChartContainer config={chartConfig} className="h-[300px] w-full">
                    <BarChart data={chartData} margin={{ top: 5, right: 20, left: -10, bottom: 5 }}>
                        <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="hsl(var(--border) / 0.5)" />
                        <XAxis dataKey="month" tickLine={false} axisLine={false} tickMargin={8} fontSize={12} />
                        <YAxis tickLine={false} axisLine={false} tickMargin={8} fontSize={12} />
                        <ChartTooltip content={<ChartTooltipContent />} />
                        <Bar dataKey="sessionDuration" fill="hsl(var(--secondary))" radius={4} />
                    </BarChart>
                </ChartContainer>
            </CardContent>
        </Card>
    </div>
  )
}
