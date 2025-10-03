"use client";

import { useAppContext } from '@/contexts/AppContext';
import { translations } from '@/lib/translations';
import { LanguageSwitcher } from '@/components/madadgar/LanguageSwitcher';
import { Logo } from '@/components/madadgar/Logo';
import { Button } from '@/components/ui/button';
import { Menu, Settings } from 'lucide-react';
import { cn } from '@/lib/utils';

export function ChatHeader() {
  const { state } = useAppContext();
  const { language } = state;
  const t = translations[language];
  const isUrdu = language === 'ur';

  return (
    <header className="bg-white border-b border-gray-200 px-4 py-3 flex items-center justify-between">
      <div className="flex items-center gap-3">
        <Button variant="ghost" size="sm" className="md:hidden">
          <Menu className="h-5 w-5" />
        </Button>
        
        <div className="flex items-center gap-2">
          <Logo className="w-8 h-8 text-primary" />
          <div className="flex flex-col">
            <h1 className={cn("text-lg font-semibold text-gray-900", isUrdu && "font-urdu")} dir={isUrdu ? 'rtl' : 'ltr'}>
              مددگار
            </h1>
            <p className={cn("text-xs text-gray-500", isUrdu && "font-urdu")} dir={isUrdu ? 'rtl' : 'ltr'}>
              {isUrdu ? 'آن لائن' : 'Online'}
            </p>
          </div>
        </div>
      </div>

      <div className="flex items-center gap-2">
        <LanguageSwitcher />
        <Button variant="ghost" size="sm">
          <Settings className="h-5 w-5" />
        </Button>
      </div>
    </header>
  );
}