import { AuthForm } from '@/components/auth-form';
import { PageSpecific3DAnimation } from '@/components/page-specific-3d-animation';
import type { Metadata } from 'next';

export const metadata: Metadata = {
    title: 'Sign Up | DigiTantra',
    description: 'Create a new DigiTantra account.',
};

export default function SignupPage() {
    return (
        <div className="relative overflow-hidden min-h-screen">
            <PageSpecific3DAnimation type="auth" />
            <div className="main-container relative z-10 flex flex-col items-center justify-center min-h-screen py-12">
                <div className="text-center mb-12">
                    <h1 className="font-headline text-4xl md:text-5xl font-bold tracking-tighter">
                        Let's <span className="text-glow-primary text-primary">authenticate</span> you
                    </h1>
                    <p className="mt-4 max-w-2xl mx-auto text-lg text-muted-foreground">
                        to the world of DigiTantra
                    </p>
                </div>
                <div className="w-full max-w-md">
                    <AuthForm mode="signup" />
                </div>
            </div>
        </div>
    );
}
