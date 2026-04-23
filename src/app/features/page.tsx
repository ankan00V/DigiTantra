import type { Metadata } from 'next';
import { CourseMarketplace } from "@/components/course-marketplace";
import { getCourseMarketplaceCatalog } from "@/lib/course-marketplace/server";

export const metadata: Metadata = {
  title: 'Courses & Pricing | DigiTantra',
  description: 'Explore our comprehensive curriculum of tech courses and their pricing.',
};
export const dynamic = "force-dynamic";

export default async function FeaturesPage() {
  const courseMarketplaceCatalog = await getCourseMarketplaceCatalog();

  return (
    <div className="relative overflow-hidden">
      <div className="main-container relative z-10">
        <div className="text-center">
          <h1 className="font-headline text-3xl font-bold tracking-tighter sm:text-4xl md:text-5xl">
            Our <span className="text-glow-primary text-primary">Courses & Pricing</span>
          </h1>
          <p className="mx-auto mt-4 max-w-3xl text-base text-muted-foreground sm:text-lg">
            Compare DigiTantra tracks with public-source programs from major learning platforms, grouped by
            category and refreshed through a dedicated catalog pipeline.
          </p>
        </div>

        <CourseMarketplace catalog={courseMarketplaceCatalog} />
      </div>
    </div>
  );
}
