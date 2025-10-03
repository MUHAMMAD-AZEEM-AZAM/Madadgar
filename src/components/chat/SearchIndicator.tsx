"use client";

import { Globe, Search } from 'lucide-react';
import { cn } from '@/lib/utils';
import { Language } from '@/lib/translations';

interface SearchIndicatorProps {
  language: Language;
}

export function SearchIndicator({ language }: SearchIndicatorProps) {
  const isUrdu = language === 'ur';

  return (
    <div className="flex items-center gap-3 p-4 bg-gradient-to-r from-blue-50 to-indigo-50 rounded-2xl border border-blue-100">
      <div className="relative">
        <Globe className="w-5 h-5 text-blue-600 animate-spin" />
        <div className="absolute -top-1 -right-1 w-3 h-3 bg-blue-600 rounded-full animate-ping opacity-75"></div>
      </div>
      
      <div className="flex-1">
        <div className="flex items-center gap-2 mb-1">
          <Search className="w-4 h-4 text-blue-600" />
          <span className={cn("text-sm font-medium text-blue-800", isUrdu && "font-urdu")} dir={isUrdu ? 'rtl' : 'ltr'}>
            {isUrdu ? 'ویب سے تلاش کر رہا ہے' : 'Searching the web'}
          </span>
        </div>
        <p className={cn("text-xs text-blue-600", isUrdu && "font-urdu")} dir={isUrdu ? 'rtl' : 'ltr'}>
          {isUrdu ? 'تازہ ترین معلومات حاصل کر رہا ہے...' : 'Getting the latest information...'}
        </p>
      </div>
      
      <div className="flex space-x-1">
        <div className="w-2 h-2 bg-blue-400 rounded-full animate-bounce"></div>
        <div className="w-2 h-2 bg-blue-400 rounded-full animate-bounce" style={{ animationDelay: '0.1s' }}></div>
        <div className="w-2 h-2 bg-blue-400 rounded-full animate-bounce" style={{ animationDelay: '0.2s' }}></div>
      </div>
    </div>
  );
}