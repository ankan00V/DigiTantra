'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { LogOut, Menu, X } from 'lucide-react';

import { Logo } from '@/components/logo';
import { useAuthSession } from '@/components/auth-session-provider';
import { Button } from '@/components/ui/button';
import { Sheet, SheetContent, SheetTrigger } from '@/components/ui/sheet';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { cn } from '@/lib/utils';

const navLinks = [
  { href: '/', label: 'Home' },
  { href: '/features', label: 'Courses & Pricing' },
  { href: '/ai-enclave', label: 'AI Enclave' },
  { href: '/analytics', label: 'Dashboard' },
  { href: '/about', label: 'About' },
  { href: '/contact', label: 'Contact' },
];

export function Header() {
  const [scrolled, setScrolled] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const pathname = usePathname();
  const router = useRouter();
  const { user, isLoading: isUserLoading, logout } = useAuthSession();

  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 10);
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const closeMobileMenu = () => setIsMobileMenuOpen(false);

  const handleLogout = async () => {
    closeMobileMenu();
    await logout();
    router.push('/');
    router.refresh();
  };

  const getInitials = (name: string | null | undefined, email: string | null | undefined) => {
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
  };

  return (
    <header
      className={cn(
        'fixed top-0 left-0 right-0 z-40 transition-all duration-300 ease-in-out',
        scrolled ? 'border-b border-border/50 bg-background/80 py-2 backdrop-blur-lg' : 'py-3 sm:py-4'
      )}
    >
      <div className="container mx-auto flex items-center justify-between px-4 sm:px-6 lg:px-8">
        <Link href="/" className="flex items-center space-x-2">
          <Logo />
        </Link>

        <nav className="hidden md:flex items-center space-x-2">
          {navLinks.map((link) => (
            <Button
              key={link.href}
              variant="ghost"
              asChild
              className={cn(
                'text-muted-foreground font-semibold hover:text-primary',
                pathname === link.href && 'text-primary'
              )}
            >
              <Link href={link.href}>{link.label}</Link>
            </Button>
          ))}
        </nav>

        <div className="hidden md:flex items-center gap-2">
          {isUserLoading ? (
            <div className="h-10 w-24 animate-pulse rounded-md bg-muted/50" />
          ) : user ? (
            <>
              <Link
                href="/profile"
                className="inline-flex items-center rounded-full border border-transparent p-1 transition-colors hover:border-border/60"
              >
                <Avatar>
                  <AvatarImage src={user.image ?? undefined} alt={user.name ?? user.email ?? 'Profile'} />
                  <AvatarFallback>{getInitials(user.name, user.email)}</AvatarFallback>
                </Avatar>
              </Link>
              <div className="flex min-w-0 flex-col pr-1">
                <span className="max-w-[12rem] truncate text-sm font-semibold lg:max-w-[16rem]">
                  {user.name ?? user.email}
                </span>
                <span className="max-w-[12rem] truncate text-xs text-muted-foreground lg:max-w-[16rem]">
                  {user.email}
                </span>
              </div>
              <Button variant="ghost" size="sm" asChild>
                <Link href="/profile">Profile</Link>
              </Button>
              <Button variant="ghost" size="icon" onClick={handleLogout} aria-label="Log out">
                <LogOut className="h-5 w-5" />
              </Button>
            </>
          ) : (
            <>
              <Button variant="ghost" asChild>
                <Link href="/login">Log in</Link>
              </Button>
              <Button asChild>
                <Link href="/signup">Sign Up</Link>
              </Button>
            </>
          )}
        </div>

        <div className="md:hidden">
          <Sheet open={isMobileMenuOpen} onOpenChange={setIsMobileMenuOpen}>
            <SheetTrigger asChild>
              <Button variant="ghost" size="icon">
                <Menu className="h-6 w-6" />
                <span className="sr-only">Open menu</span>
              </Button>
            </SheetTrigger>
            <SheetContent side="right" className="w-[86vw] max-w-[320px] bg-background px-0">
              <div className="flex h-full flex-col">
                <div className="flex items-center justify-between border-b p-4">
                  <Logo />
                  <Button variant="ghost" size="icon" onClick={closeMobileMenu}>
                    <X className="h-6 w-6" />
                    <span className="sr-only">Close menu</span>
                  </Button>
                </div>

                <nav className="flex flex-col space-y-2 p-4">
                  {navLinks.map((link) => (
                    <Button
                      key={link.href}
                      variant={pathname === link.href ? 'secondary' : 'ghost'}
                      asChild
                      onClick={closeMobileMenu}
                      className="h-11 justify-start text-base"
                    >
                      <Link href={link.href}>{link.label}</Link>
                    </Button>
                  ))}
                  {user ? (
                    <Button
                      variant={pathname === '/profile' ? 'secondary' : 'ghost'}
                      asChild
                      onClick={closeMobileMenu}
                      className="h-11 justify-start text-base"
                    >
                      <Link href="/profile">Profile</Link>
                    </Button>
                  ) : null}
                </nav>

                <div className="mt-auto space-y-2 border-t p-4">
                  {isUserLoading ? (
                    <div className="h-10 w-full animate-pulse rounded-md bg-muted/50" />
                  ) : user ? (
                    <>
                      <div className="mb-2 flex items-center gap-3 rounded-lg border border-border/60 px-3 py-2">
                        <Avatar className="h-9 w-9">
                          <AvatarImage src={user.image ?? undefined} alt={user.name ?? user.email ?? 'Profile'} />
                          <AvatarFallback>{getInitials(user.name, user.email)}</AvatarFallback>
                        </Avatar>
                        <div className="min-w-0">
                          <p className="truncate text-sm font-semibold">{user.name ?? user.email}</p>
                          <p className="truncate text-xs text-muted-foreground">{user.email}</p>
                        </div>
                      </div>
                      <Button variant="ghost" className="h-11 w-full justify-center text-base" onClick={handleLogout}>
                        Log out
                      </Button>
                    </>
                  ) : (
                    <>
                      <Button variant="ghost" className="h-11 w-full justify-center text-base" asChild onClick={closeMobileMenu}>
                        <Link href="/login">Log in</Link>
                      </Button>
                      <Button className="h-11 w-full justify-center text-base" asChild onClick={closeMobileMenu}>
                        <Link href="/signup">Sign Up</Link>
                      </Button>
                    </>
                  )}
                </div>
              </div>
            </SheetContent>
          </Sheet>
        </div>
      </div>
    </header>
  );
}
