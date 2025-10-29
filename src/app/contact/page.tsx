import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Chatbot } from "@/components/chatbot";
import type { Metadata } from 'next';
import { PageSpecific3DAnimation } from "@/components/page-specific-3d-animation";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Mail } from "lucide-react";

export const metadata: Metadata = {
  title: 'Contact | DigMkt',
  description: 'Get in touch with DigMkt or chat with our AI assistant for quick answers.',
};

export default function ContactPage() {
  return (
    <div className="relative overflow-hidden min-h-screen">
      <PageSpecific3DAnimation type="contact" />
      <div className="main-container relative z-10 flex flex-col items-center">
        <div className="text-center">
          <h1 className="font-headline text-4xl md:text-5xl font-bold tracking-tighter">
            Chat with our <span className="text-glow-primary text-primary">AI Assistant</span>
          </h1>
          <p className="mt-4 max-w-3xl mx-auto text-lg text-muted-foreground">
            Get instant answers to your digital marketing questions, or fill out the form below for general inquiries.
          </p>
        </div>

        <div className="mt-12 w-full flex justify-center">
          <Chatbot />
        </div>

        <div className="mt-24 w-full max-w-2xl">
           <Card className="glassmorphic">
            <CardHeader>
                <CardTitle className="font-headline text-3xl flex items-center gap-3">
                    <Mail className="h-6 w-6 text-secondary"/>
                    General Inquiries
                </CardTitle>
            </CardHeader>
             <CardContent>
                 <form className="space-y-4">
                   <div className="space-y-2">
                     <Label htmlFor="name">Name</Label>
                     <Input id="name" placeholder="Your Name" />
                   </div>
                   <div className="space-y-2">
                     <Label htmlFor="email">Email</Label>
                     <Input id="email" type="email" placeholder="your@email.com" />
                   </div>
                   <div className="space-y-2">
                     <Label htmlFor="message">Message</Label>
                     <Textarea id="message" placeholder="How can we help you?" rows={5} />
                   </div>
                   <Button type="submit" className="font-semibold w-full" size="lg">Send Message</Button>
                 </form>
             </CardContent>
           </Card>
        </div>
      </div>
    </div>
  );
}
