import { AuthForm } from '@/components/auth-form';
import { PageSpecific3DAnimation } from '@/components/page-specific-3d-animation';
import type { Metadata } from 'next';

export const metadata: Metadata = {
    title: 'Login | DigiTantra',
    description: 'Log in to your DigiTantra account.',
};

export default function LoginPage() {
    return (
        <div className="relative overflow-hidden min-h-screen">
            <PageSpecific3DAnimation type="auth" />
            <div className="main-container relative z-10 flex flex-col items-center justify-center min-h-screen py-12">
                 <div className="text-center mb-12">
                    <h1 className="font-headline text-4xl md:text-5xl font-bold tracking-tighter">
                        Welcome <span className="text-glow-primary text-primary">Back</span>
                    </h1>
                    <p className="mt-4 max-w-2xl mx-auto text-lg text-muted-foreground">
                        Let's continue your journey with DigiTantra.
                    </p>
                </div>
                <div className="w-full max-w-md">
                    <AuthForm mode="login" />
                </div>
            </div>
        </div>
    );
}
