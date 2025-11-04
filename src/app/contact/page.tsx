import { Chatbot } from "@/components/chatbot";
import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Contact | DigiTantra',
  description: 'Get in touch with DigiTantra or chat with DigiSaarthi for quick answers.',
};

export default function ContactPage() {
  return (
    <div className="min-h-screen">
      <div className="main-container flex flex-col items-center justify-center min-h-[80vh]">
        <div className="text-center z-10">
          <h1 className="font-headline text-4xl md:text-5xl font-bold tracking-tighter">
            Chat with <span className="text-glow-primary text-primary">DigiSaarthi</span>
          </h1>
          <p className="mt-4 max-w-3xl mx-auto text-lg text-muted-foreground">
            Get instant answers to your questions. Our AI is here to help you navigate the world of endless learning
          </p>
        </div>

        <div className="mt-12 w-full flex justify-center z-10">
          <Chatbot />
        </div>
      </div>
    </div>
  );
}
