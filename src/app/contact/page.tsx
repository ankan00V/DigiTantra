
import { Chatbot } from "@/components/chatbot";
import { ContactForm } from "@/components/contact-form";
import type { Metadata } from 'next';

const SUPPORT_EMAIL = "digitantra.helpdesk@gmail.com";

export const metadata: Metadata = {
  title: 'Contact | DigiTantra',
  description: 'Get in touch with DigiTantra or chat with AI Saarthi for quick answers.',
};

export default function ContactPage() {
  return (
    <div className="min-h-screen">
      <div className="main-container flex min-h-[70svh] flex-col items-center justify-center pt-24 pb-10 sm:min-h-[80vh] sm:pb-12">
        <div className="text-center">
          <h1 className="font-headline text-3xl font-bold tracking-tighter sm:text-4xl md:text-5xl">
            Chat with <span className="text-glow-primary text-primary">AI Saarthi</span>
          </h1>
          <p className="mx-auto mt-4 max-w-3xl text-base text-muted-foreground sm:text-lg">
            Get instant answers to your questions. Our AI is here to help you navigate the world of endless learning.
          </p>
        </div>

        <div className="mt-10 flex w-full justify-center sm:mt-12">
          <Chatbot />
        </div>
      </div>
      
      <div className="main-container flex min-h-[70svh] flex-col items-center justify-center pt-12 pb-12 sm:min-h-[80vh]">
        <div className="text-center">
            <h2 className="font-headline text-3xl font-bold tracking-tighter sm:text-4xl md:text-5xl">
                Contact <span className="text-glow-primary text-primary">Us</span>
            </h2>
            <p className="mx-auto mt-4 max-w-3xl text-base text-muted-foreground sm:text-lg">
                Have a specific question or partnership inquiry? Fill out the form below.
            </p>
            <p className="mx-auto mt-3 max-w-3xl text-sm text-muted-foreground sm:text-base">
                Support email:{" "}
                <a
                  href={`mailto:${SUPPORT_EMAIL}`}
                  className="font-semibold text-primary transition-colors hover:text-primary/80"
                >
                  {SUPPORT_EMAIL}
                </a>
              </p>
        </div>
        <div className="mt-10 flex w-full justify-center sm:mt-12">
            <ContactForm />
        </div>
      </div>
    </div>
  );
}
