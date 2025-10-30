import { AuthForm } from '@/components/auth-form';
import type { Metadata } from 'next';

export const metadata: Metadata = {
    title: 'Login | DigiTantra',
    description: 'Log in to your DigiTantra account.',
};

export default function LoginPage() {
    return (
        <div className="main-container flex items-center justify-center">
            <div className="w-full max-w-md">
                <AuthForm mode="login" />
            </div>
        </div>
    );
}
