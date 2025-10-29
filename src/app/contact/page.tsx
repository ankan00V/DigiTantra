import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Chatbot } from "@/components/chatbot";
import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Contact | DigMkt',
  description: 'Get in touch with DigMkt or chat with our AI assistant for quick answers.',
};

export default function ContactPage() {
  return (
    <div className="animated-gradient-bg">
      <div className="main-container">
        <div className="text-center">
          <h1 className="font-headline text-4xl md:text-5xl font-bold tracking-tighter">
            Get In <span className="text-glow-primary text-primary">Touch</span>
          </h1>
          <p className="mt-4 max-w-3xl mx-auto text-lg text-muted-foreground">
            Have a question or a project in mind? Reach out to us or talk to our AI assistant for immediate help.
          </p>
        </div>

        <div className="mt-16 grid grid-cols-1 lg:grid-cols-2 gap-16 items-start">
          <div className="space-y-6">
             <h2 className="font-headline text-3xl text-secondary">Contact Form</h2>
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
          </div>
          <div className="space-y-6">
             <h2 className="font-headline text-3xl text-primary text-center lg:text-left">Chat With Us</h2>
             <Chatbot />
          </div>
        </div>
      </div>
    </div>
  );
}
