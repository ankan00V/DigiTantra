import { AuthForm } from '@/components/auth-form';
import type { Metadata } from 'next';

export const metadata: Metadata = {
    title: 'Sign Up | DigiTantra',
    description: 'Create a new DigiTantra account.',
};

export default function SignupPage() {
    return (
        <div className="main-container flex items-center justify-center">
            <div className="w-full max-w-md">
                <AuthForm mode="signup" />
            </div>
        </div>
    );
}
