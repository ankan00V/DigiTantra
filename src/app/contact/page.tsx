import { Chatbot } from "@/components/chatbot";
import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Contact | DigiTantra',
  description: 'Get in touch with DigiTantra or chat with our AI assistant for quick answers.',
};

export default function ContactPage() {
  return (
    <div className="relative overflow-hidden min-h-screen">
      <div className="main-container relative z-10 flex flex-col items-center justify-center min-h-[80vh]">
        <div className="text-center">
          <h1 className="font-headline text-4xl md:text-5xl font-bold tracking-tighter">
            Chat with our <span className="text-glow-primary text-primary">AI Assistant</span>
          </h1>
          <p className="mt-4 max-w-3xl mx-auto text-lg text-muted-foreground">
            Get instant answers to your questions. Our AI is here to help you navigate the world of digital marketing.
          </p>
        </div>

        <div className="mt-12 w-full flex justify-center">
          <Chatbot />
        </div>
      </div>
    </div>
  );
}
