
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardFooter } from "@/components/ui/card";
import { Quote } from "lucide-react";
import type { Metadata } from 'next';
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Carousel, CarouselContent, CarouselItem, CarouselNext, CarouselPrevious } from "@/components/ui/carousel";
import { CourseMarketplace } from "@/components/course-marketplace";
import { getCourseMarketplaceCatalog } from "@/lib/course-marketplace/server";

export const metadata: Metadata = {
  title: 'Courses & Pricing | DigiTantra',
  description: 'Explore our comprehensive curriculum of tech courses and their pricing.',
};
export const revalidate = 300;

const testimonials = [
  {
    name: "Priya Sharma",
    quote: "The Gen AI course was a game-changer! The hands-on projects gave me the confidence to crack interviews at top companies.",
    company: "Google",
    role: "AI Engineer",
    package: "28 LPA",
    avatar: "https://media.istockphoto.com/id/1587604256/photo/portrait-lawyer-and-black-woman-with-tablet-smile-and-happy-in-office-workplace-african.jpg?s=612x612&w=0&k=20&c=n9yulMNKdIYIQC-Qns8agFj6GBDbiKyPRruaUTh4MKs=",
  },
  {
    name: "Rohan Verma",
    quote: "DigiTantra's Full Stack course is incredibly comprehensive. I went from knowing basic HTML to building complex applications and landed my dream job at Microsoft.",
    company: "Microsoft",
    role: "Software Engineer",
    package: "25 LPA",
    avatar: "https://static.vecteezy.com/system/resources/thumbnails/033/129/417/small/a-business-man-stands-against-white-background-with-his-arms-crossed-ai-generative-photo.jpg",
  },
  {
    name: "Aisha Khan",
    quote: "The Data Science program is top-notch. The mentors are industry experts who provide invaluable guidance. I'm now working at Amazon, and it's all thanks to DigiTantra.",
    company: "Amazon",
    role: "Data Scientist",
    package: "22 LPA",
    avatar: "https://img.freepik.com/free-photo/medium-shot-woman-posing-indoors_23-2149915935.jpg?semt=ais_hybrid&w=740&q=80",
  },
  {
    name: "Vikram Singh",
    quote: "I highly recommend the Cyber Security course. The ethical hacking labs were the best part, and they prepared me for my role at Cisco.",
    company: "Cisco",
    role: "Security Analyst",
    package: "18 LPA",
    avatar: "https://www.shutterstock.com/image-photo/serious-young-ambitious-indian-businessman-260nw-2598795817.jpg",
  },
   {
    name: "Sneha Reddy",
    quote: "The blend of theory and practical projects in the AI/ML course is perfect. I felt fully prepared for my technical interviews and secured a position at Meta.",
    company: "Meta",
    role: "Machine Learning Engineer",
    package: "26 LPA",
    avatar: "https://img.freepik.com/free-photo/confident-cheerful-young-businesswoman_1262-20881.jpg?semt=ais_hybrid&w=740&q=80",
  },
  {
    name: "Arjun Mehta",
    quote: "The consulting case studies in the curriculum were amazing. They helped me land a Tech Consultant role at McKinsey right after the course.",
    company: "McKinsey",
    role: "Tech Consultant",
    package: "27 LPA",
    avatar: "https://static.vecteezy.com/system/resources/thumbnails/029/330/406/small/ai-generative-happy-business-man-in-a-suit-white-transparent-background-free-photo.jpg",
  },
  {
    name: "Naina Gupta",
    quote: "The DevOps course was fantastic. I learned so much about CI/CD pipelines and automation, which helped me get a great job at Accenture.",
    company: "Accenture",
    role: "DevOps Engineer",
    package: "19 LPA",
    avatar: "https://img.freepik.com/free-photo/brunette-business-woman-with-wavy-long-hair-blue-eyes-stands-holding-notebook-hands_197531-343.jpg?semt=ais_hybrid&w=740&q=80",
  },
  {
    name: "Karan Johar",
    quote: "I took the Web 3.0 & Blockchain course and it opened up a new world for me. Now I am working at Netflix on their emerging tech team.",
    company: "Netflix",
    role: "Blockchain Developer",
    package: "24 LPA",
    avatar: "https://static.vecteezy.com/system/resources/thumbnails/034/585/817/small/ai-generative-happy-business-man-in-a-suit-white-background-free-photo.jpg",
  },
  {
    name: "Anjali Rao",
    quote: "The Full Stack Development course is worth every penny. I got placed at TCS with a great package and a promotion in the first year!",
    company: "TCS",
    role: "System Engineer",
    package: "16 LPA",
    avatar: "https://static.vecteezy.com/system/resources/thumbnails/038/962/461/small/ai-generated-caucasian-successful-confident-young-businesswoman-ceo-boss-bank-employee-worker-manager-with-arms-crossed-in-formal-wear-isolated-in-white-background-photo.jpg",
  },
  {
    name: "Rajesh Kumar",
    quote: "From zero to hero in Data Science. The curriculum is perfectly structured. I’m now a Data Analyst at Google, and I couldn't be happier.",
    company: "Google",
    role: "Data Analyst",
    package: "21 LPA",
    avatar: "https://thumbs.dreamstime.com/b/young-happy-gentleman-portrait-smiling-elegant-man-isolated-white-background-40627782.jpg",
  },
  {
    name: "Sunita Williams",
    quote: "The Cloud Computing course helped me master AWS and Azure. Landed a Cloud Architect role at Amazon Web Services.",
    company: "Amazon",
    role: "Cloud Architect",
    package: "23 LPA",
    avatar: "https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcRBwgu1A5zgPSvfE83nurkuzNEoXs9DMNr8Ww&s",
  },
  {
    name: "Amitabh Singh",
    quote: "The AI/ML program is incredibly detailed. The mentors guided me through complex projects, which was key to getting hired by Meta.",
    company: "Meta",
    role: "Research Scientist",
    package: "27.5 LPA",
    avatar: "https://thumbs.dreamstime.com/b/portrait-male-african-american-professional-possibly-business-executive-corporate-ceo-finance-attorney-lawyer-sales-stylish-155546880.jpg",
  },
  {
    name: "Deepika Patel",
    quote: "I was new to coding, but the Full Stack course was so well-taught that I landed an SDE role at Microsoft. Highly recommended!",
    company: "Microsoft",
    role: "SDE-1",
    package: "24.5 LPA",
    avatar: "https://cdn.myportfolio.com/34b839f6562dc845f8265e2435b68d97/93650d9a-6c6b-4851-a0fb-8710b068b769_rw_600.jpg?h=e557d75cc2421438b921845048e9e58c",
  },
  {
    name: "Ranveer Chopra",
    quote: "The Cyber Security specialization is a must for anyone passionate about this field. I'm now a Security Consultant at Accenture, thanks to DigiTantra.",
    company: "Accenture",
    role: "Security Consultant",
    package: "20 LPA",
    avatar: "https://images.stockcake.com/public/1/b/2/1b233006-c7d5-4955-8499-b591153b7fd7_large/confident-business-professional-stockcake.jpg",
  },
  {
    name: "Katrina Menon",
    quote: "The Gen AI course content is cutting-edge. It helped me secure a coveted role as a Prompt Engineer at Google.",
    company: "Google",
    role: "Prompt Engineer",
    package: "26.5 LPA",
    avatar: "https://img.freepik.com/free-photo/portrait-smiling-successful-businesswoman-looking-into-camera-sitting-restaurant-business-lady-with-stylish-hairstyle-wears-elegant-suit-business-meeting-attractive-appearance_8353-12611.jpg?semt=ais_hybrid&w=740&q=80",
  },
  {
    name: "Salman Biswas",
    quote: "The placement support for the Data Science course is phenomenal. I got placed at TCS as a Data Scientist right after completing the program.",
    company: "TCS",
    role: "Data Scientist",
    package: "17 LPA",
    avatar: "https://i.pinimg.com/736x/c7/68/ba/c768baca8eb33036c331ba4730643258.jpg",
  },
];
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

       <div className="main-container relative z-10">
        <div className="text-center">
          <h2 className="font-headline text-3xl font-bold tracking-tighter sm:text-4xl md:text-5xl">
            Success <span className="text-glow-primary text-primary">Stories</span>
          </h2>
          <p className="mx-auto mt-4 max-w-3xl text-base text-muted-foreground sm:text-lg">
            Hear from our alumni who have landed their dream jobs in top tech companies.
          </p>
        </div>

        <Carousel
          opts={{ align: "start", loop: true }}
          className="mx-auto mt-12 w-full max-w-6xl sm:mt-16"
        >
          <CarouselContent>
            {testimonials.map((testimonial, index) => (
              <CarouselItem key={index} className="basis-[88%] sm:basis-1/2">
                <div className="p-4">
                  <Card className="glassmorphic flex flex-col h-full">
                    <CardContent className="pt-6 flex-grow">
                      <Quote className="h-8 w-8 text-primary/50 mb-4" />
                      <p className="text-sm italic text-muted-foreground sm:text-base">"{testimonial.quote}"</p>
                    </CardContent>
                    <CardFooter className="flex flex-col items-start bg-muted/30 p-5 sm:p-6">
                        <div className="flex items-center w-full">
                             <Avatar className="h-12 w-12 mr-4 border-2 border-primary">
                                <AvatarImage src={testimonial.avatar} alt={testimonial.name} />
                                <AvatarFallback>{testimonial.name.substring(0,2)}</AvatarFallback>
                            </Avatar>
                            <div>
                                <p className="font-bold text-base sm:text-lg">{testimonial.name}</p>
                                <p className="text-xs text-muted-foreground sm:text-sm">{testimonial.role} at <span className="font-semibold text-primary">{testimonial.company}</span></p>
                            </div>
                        </div>
                        <div className="w-full text-right mt-4">
                            <Badge variant="secondary" className="text-base sm:text-lg">
                                {testimonial.package}
                            </Badge>
                        </div>
                    </CardFooter>
                  </Card>
                </div>
              </CarouselItem>
            ))}
          </CarouselContent>
          <CarouselPrevious className="hidden md:flex md:-left-12" />
          <CarouselNext className="hidden md:flex md:-right-12" />
        </Carousel>
      </div>
    </div>
  );
}
