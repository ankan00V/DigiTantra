'use client';

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { ChartContainer, ChartTooltip, ChartTooltipContent } from '@/components/ui/chart';
import { Bar, BarChart, CartesianGrid, XAxis, YAxis } from 'recharts';
import type { ChartConfig } from '@/components/ui/chart';

type CategoryDistribution = {
  category: string;
  freeListings: number;
  paidListings: number;
  totalListings: number;
};

type ServiceDistribution = {
  section: string;
  services: number;
};

type ProviderDistribution = {
  mode: string;
  providers: number;
};

type AnalyticsDashboardProps = {
  categoryDistribution: CategoryDistribution[];
  providerDistribution: ProviderDistribution[];
  serviceDistribution: ServiceDistribution[];
};

const chartConfig = {
  paidListings: {
    label: 'Paid listings',
    color: 'hsl(var(--chart-1))',
  },
  freeListings: {
    label: 'Free listings',
    color: 'hsl(var(--chart-2))',
  },
  services: {
    label: 'AI services',
    color: 'hsl(var(--chart-3))',
  },
  providers: {
    label: 'Providers',
    color: 'hsl(var(--chart-4))',
  },
} satisfies ChartConfig;

export function AnalyticsDashboard({
  categoryDistribution,
  providerDistribution,
  serviceDistribution,
}: AnalyticsDashboardProps) {
  return (
    <div className="mt-16 grid grid-cols-1 gap-8 xl:grid-cols-2">
      <Card className="glassmorphic xl:col-span-2">
        <CardHeader>
          <CardTitle className="font-headline">Marketplace Coverage by Track</CardTitle>
          <CardDescription>
            Real tracked course volume currently visible inside DigiTantra&apos;s Courses & Pricing experience,
            split by paid and free listings for each track.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <ChartContainer config={chartConfig} className="h-[360px] w-full">
            <BarChart data={categoryDistribution} margin={{ top: 10, right: 12, left: -10, bottom: 10 }}>
              <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="hsl(var(--border) / 0.5)" />
              <XAxis dataKey="category" tickLine={false} axisLine={false} tickMargin={10} fontSize={12} />
              <YAxis tickLine={false} axisLine={false} tickMargin={8} fontSize={12} />
              <ChartTooltip content={<ChartTooltipContent />} />
              <Bar dataKey="paidListings" stackId="catalog" fill="var(--color-paidListings)" radius={[6, 6, 0, 0]} />
              <Bar dataKey="freeListings" stackId="catalog" fill="var(--color-freeListings)" radius={[6, 6, 0, 0]} />
            </BarChart>
          </ChartContainer>
        </CardContent>
      </Card>

      <Card className="glassmorphic">
        <CardHeader>
          <CardTitle className="font-headline">AI Enclave Service Lanes</CardTitle>
          <CardDescription>
            Current live service distribution across DigiTantra&apos;s four AI Enclave lanes.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <ChartContainer config={chartConfig} className="h-[300px] w-full">
            <BarChart data={serviceDistribution} margin={{ top: 10, right: 12, left: -10, bottom: 10 }}>
              <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="hsl(var(--border) / 0.5)" />
              <XAxis dataKey="section" tickLine={false} axisLine={false} tickMargin={10} fontSize={12} />
              <YAxis tickLine={false} axisLine={false} tickMargin={8} fontSize={12} allowDecimals={false} />
              <ChartTooltip content={<ChartTooltipContent />} />
              <Bar dataKey="services" fill="var(--color-services)" radius={6} />
            </BarChart>
          </ChartContainer>
        </CardContent>
      </Card>

      <Card className="glassmorphic">
        <CardHeader>
          <CardTitle className="font-headline">Provider Health Snapshot</CardTitle>
          <CardDescription>
            Current provider-status spread based on the stored marketplace catalog used by the app.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <ChartContainer config={chartConfig} className="h-[300px] w-full">
            <BarChart data={providerDistribution} margin={{ top: 10, right: 12, left: -10, bottom: 10 }}>
              <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="hsl(var(--border) / 0.5)" />
              <XAxis dataKey="mode" tickLine={false} axisLine={false} tickMargin={10} fontSize={12} />
              <YAxis tickLine={false} axisLine={false} tickMargin={8} fontSize={12} allowDecimals={false} />
              <ChartTooltip content={<ChartTooltipContent />} />
              <Bar dataKey="providers" fill="var(--color-providers)" radius={6} />
            </BarChart>
          </ChartContainer>
        </CardContent>
      </Card>
    </div>
  );
}
