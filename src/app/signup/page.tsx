import { AuthForm } from '@/components/auth-form';
import type { Metadata } from 'next';

export const metadata: Metadata = {
    title: 'Sign Up | DigiTantra',
    description: 'Create a new DigiTantra account.',
};

export default function SignupPage() {
    return (
        <div className="relative overflow-hidden min-h-screen">
            <div className="main-container relative z-10 flex min-h-[100svh] flex-col items-center justify-center py-24 sm:min-h-screen">
                <div className="mb-10 text-center sm:mb-12">
                    <h1 className="font-headline text-3xl font-bold tracking-tighter sm:text-4xl md:text-5xl">
                        Start with a <span className="text-glow-primary text-primary">trusted account</span>
                    </h1>
                    <p className="mx-auto mt-4 max-w-2xl text-base text-muted-foreground sm:text-lg">
                        Create your DigiTantra profile instantly using Google.
                    </p>
                </div>
                <div className="w-full max-w-md">
                    <AuthForm mode="signup" />
                </div>
            </div>
        </div>
    );
}
