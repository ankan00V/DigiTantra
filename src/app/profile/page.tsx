'use client';

import { type ChangeEvent, useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { Loader2, Upload, XCircle } from 'lucide-react';

import { useAuthSession } from '@/components/auth-session-provider';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { useToast } from '@/hooks/use-toast';

async function readImageAsDataUrl(file: File) {
  return new Promise<string>((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => {
      if (typeof reader.result === 'string') {
        resolve(reader.result);
        return;
      }

      reject(new Error('Unable to read image.'));
    };
    reader.onerror = () => reject(new Error('Unable to read image.'));
    reader.readAsDataURL(file);
  });
}

function getInitials(name: string | null | undefined, email: string | null | undefined) {
  if (name?.trim()) {
    const initials = name
      .trim()
      .split(/\s+/)
      .slice(0, 2)
      .map((part) => part[0]?.toUpperCase() ?? '')
      .join('');

    if (initials) {
      return initials;
    }
  }

  if (!email) {
    return '..';
  }

  return email.substring(0, 2).toUpperCase();
}

export default function ProfilePage() {
  const router = useRouter();
  const { toast } = useToast();
  const { user, isLoading, refreshSession } = useAuthSession();
  const [name, setName] = useState('');
  const [image, setImage] = useState<string | null>(null);
  const [selectedPhotoName, setSelectedPhotoName] = useState<string | null>(null);
  const [isSaving, setIsSaving] = useState(false);
  const [isReadingPhoto, setIsReadingPhoto] = useState(false);

  useEffect(() => {
    if (!isLoading && !user) {
      router.push('/login?callbackUrl=%2Fprofile');
    }
  }, [isLoading, router, user]);

  useEffect(() => {
    if (!user) {
      return;
    }

    setName(user.name ?? '');
    setImage(user.image ?? null);
  }, [user]);

  const handleProfilePhotoSelection = async (event: ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];

    if (!file) {
      return;
    }

    if (!file.type.startsWith('image/')) {
      toast({
        variant: 'destructive',
        title: 'Invalid File',
        description: 'Please choose an image file.',
      });
      event.target.value = '';
      return;
    }

    if (file.size > 1_500_000) {
      toast({
        variant: 'destructive',
        title: 'Image Too Large',
        description: 'Profile photo must be 1.5 MB or smaller.',
      });
      event.target.value = '';
      return;
    }

    setIsReadingPhoto(true);

    try {
      const dataUrl = await readImageAsDataUrl(file);
      setImage(dataUrl);
      setSelectedPhotoName(file.name);
    } catch {
      toast({
        variant: 'destructive',
        title: 'Upload Failed',
        description: 'Unable to read selected image.',
      });
      event.target.value = '';
    } finally {
      setIsReadingPhoto(false);
    }
  };

  const clearProfilePhoto = () => {
    setImage(null);
    setSelectedPhotoName(null);
  };

  const saveProfile = async () => {
    if (!user) {
      return;
    }

    const normalizedName = name.trim();

    if (normalizedName.length < 2) {
      toast({
        variant: 'destructive',
        title: 'Invalid Name',
        description: 'Name must be at least 2 characters long.',
      });
      return;
    }

    setIsSaving(true);

    try {
      const response = await fetch('/api/email-auth/profile', {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
        },
        credentials: 'same-origin',
        body: JSON.stringify({
          name: normalizedName,
          image,
        }),
      });

      if (!response.ok) {
        const payload = (await response.json()) as { error?: string };
        throw new Error(payload.error ?? 'Unable to update profile.');
      }

      const payload = (await response.json()) as {
        ok: boolean;
        user?: {
          name: string | null;
          image: string | null;
        };
      };

      if (payload.user) {
        setName(payload.user.name ?? normalizedName);
        setImage(payload.user.image ?? null);
      }

      await refreshSession({
        name: payload.user?.name ?? normalizedName,
        image: payload.user?.image ?? image,
      });
      toast({
        title: 'Profile Updated',
        description: 'Your profile details were saved successfully.',
      });
    } catch (error) {
      toast({
        variant: 'destructive',
        title: 'Update Failed',
        description: error instanceof Error ? error.message : 'Please try again.',
      });
    } finally {
      setIsSaving(false);
    }
  };

  if (!user) {
    return (
      <div className="relative min-h-screen overflow-hidden">
        <div className="main-container relative z-10 flex min-h-[100svh] items-center justify-center py-24 sm:min-h-screen">
          <Loader2 className="h-6 w-6 animate-spin text-primary" />
        </div>
      </div>
    );
  }

  return (
    <div className="relative min-h-screen overflow-hidden">
      <div className="main-container relative z-10 flex min-h-[100svh] items-center justify-center py-24 sm:min-h-screen">
        <Card className="glassmorphic w-full max-w-xl">
          <CardHeader className="p-5 sm:p-6">
            <CardTitle className="font-headline text-2xl sm:text-3xl">
              Your Profile
            </CardTitle>
            <CardDescription>
              Manage your name, email, and profile photo.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-5 p-5 pt-0 sm:p-6 sm:pt-0">
            <div className="flex items-center gap-4 rounded-2xl border border-border/70 bg-background/40 p-4">
              <Avatar className="h-16 w-16">
                <AvatarImage src={image ?? undefined} alt={user.name ?? user.email ?? 'Profile'} />
                <AvatarFallback>{getInitials(user.name, user.email)}</AvatarFallback>
              </Avatar>
              <div className="min-w-0">
                <p className="truncate text-base font-semibold">{user.name ?? user.email}</p>
                <p className="truncate text-sm text-muted-foreground">{user.email}</p>
              </div>
            </div>

            <div className="space-y-2">
              <label htmlFor="profile-name" className="text-sm font-medium">
                Name
              </label>
              <Input
                id="profile-name"
                value={name}
                onChange={(event) => setName(event.target.value)}
                disabled={isSaving || isReadingPhoto}
              />
            </div>

            <div className="space-y-2">
              <label className="text-sm font-medium">Email</label>
              <Input value={user.email ?? ''} disabled />
            </div>

            <div className="space-y-2">
              <p className="text-sm font-medium">Profile Photo</p>
              <div className="rounded-2xl border border-border/70 bg-background/40 p-3">
                <div className="flex flex-wrap items-center gap-3">
                  <label className="inline-flex cursor-pointer items-center gap-2 rounded-xl border border-white/15 bg-white/5 px-3 py-2 text-sm font-medium text-foreground hover:bg-white/10">
                    <Upload className="h-4 w-4" />
                    Upload Photo
                    <input
                      type="file"
                      accept="image/png,image/jpeg,image/jpg,image/webp,image/gif"
                      className="hidden"
                      onChange={handleProfilePhotoSelection}
                      disabled={isSaving || isReadingPhoto}
                    />
                  </label>
                  {image ? (
                    <Button
                      type="button"
                      variant="ghost"
                      size="sm"
                      onClick={clearProfilePhoto}
                      disabled={isSaving || isReadingPhoto}
                    >
                      <XCircle className="mr-2 h-4 w-4" />
                      Remove
                    </Button>
                  ) : null}
                  {selectedPhotoName ? (
                    <span className="max-w-[14rem] truncate text-xs text-muted-foreground">
                      {selectedPhotoName}
                    </span>
                  ) : null}
                </div>
              </div>
            </div>

            <Button onClick={saveProfile} disabled={isSaving || isReadingPhoto} className="w-full font-semibold">
              {isSaving || isReadingPhoto ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : null}
              Save Profile
            </Button>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
