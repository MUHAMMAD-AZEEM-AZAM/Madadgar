"use client";

import { useAppContext } from '@/contexts/AppContext';
import { translations, Language } from '@/lib/translations';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';

export function LanguageSwitcher() {
  const { state, dispatch } = useAppContext();
  const { language } = state;

  const setLanguage = (lang: Language) => {
    dispatch({ type: 'SET_LANGUAGE', payload: lang });
  };

  return (
    <div className="flex items-center gap-2">
      <Button
        variant={language === 'en' ? 'default' : 'outline'}
        size="sm"
        onClick={() => setLanguage('en')}
        className={cn(
          "bg-opacity-80 backdrop-blur-sm",
          language === 'en' ? 'bg-primary text-primary-foreground' : 'bg-card/50 text-card-foreground border-border'
        )}
      >
        {translations.en.english}
      </Button>
      <Button
        variant={language === 'ur' ? 'default' : 'outline'}
        size="sm"
        onClick={() => setLanguage('ur')}
        className={cn(
          "font-urdu bg-opacity-80 backdrop-blur-sm",
          language === 'ur' ? 'bg-primary text-primary-foreground' : 'bg-card/50 text-card-foreground border-border'
        )}
        dir="rtl"
      >
        {translations.ur.urdu}
      </Button>
    </div>
  );
}
