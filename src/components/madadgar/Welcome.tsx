"use client";

import Image from 'next/image';
import Link from 'next/link';
import { PlaceHolderImages } from '@/lib/placeholder-images';
import { useAppContext } from '@/contexts/AppContext';
import { translations } from '@/lib/translations';
import { Button } from '@/components/ui/button';
import { LanguageSwitcher } from '@/components/madadgar/LanguageSwitcher';
import { ArrowRight } from 'lucide-react';
import { Logo } from './Logo';
import { cn } from '@/lib/utils';

export default function Welcome() {
  const { state } = useAppContext();
  const { language } = state;
  const t = translations[language];

  const welcomeImage = PlaceHolderImages.find(img => img.id === 'madadgar-welcome');

  return (
    <div className="relative min-h-screen w-full overflow-hidden">
      {welcomeImage && (
         <Image
          src={welcomeImage.imageUrl}
          alt={welcomeImage.description}
          fill
          className="object-cover"
          quality={100}
          priority
          data-ai-hint={welcomeImage.imageHint}
        />
      )}
      <div className="absolute inset-0 bg-gradient-to-t from-background via-background/80 to-transparent" />
      <div className="absolute inset-0 flex flex-col items-center justify-end p-4 pb-16 md:pb-24">
        <div className="w-full max-w-md text-center bg-background/50 backdrop-blur-lg p-8 rounded-2xl shadow-2xl border border-white/10">
          <div className="flex justify-center mb-4">
              <div className="p-4 bg-primary/20 rounded-full">
                <Logo className="w-12 h-12 text-primary" />
              </div>
          </div>
          <h1 className={cn("text-4xl md:text-5xl font-bold font-headline text-foreground leading-tight", language === 'ur' && "font-urdu leading-normal")} dir={language === 'ur' ? 'rtl' : 'ltr'}>
            {t.welcomeTitle}
          </h1>
          <p className={cn("mt-6 text-lg text-muted-foreground leading-relaxed", language === 'ur' && "font-urdu leading-loose")} dir={language === 'ur' ? 'rtl' : 'ltr'}>
            {t.welcomeSubtitle}
          </p>
          <div className="mt-10 flex flex-col items-center gap-8">
            <LanguageSwitcher />
            <Button asChild size="lg" className={cn("w-full max-w-xs shadow-lg bg-accent hover:bg-accent/90 text-accent-foreground", language === 'ur' && "font-urdu")}>
              <Link href="/chat">
                {t.getStarted}
                <ArrowRight className="ml-2 h-5 w-5" />
              </Link>
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}
