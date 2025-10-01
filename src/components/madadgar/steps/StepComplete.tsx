"use client";

import { FormWrapper } from "@/components/madadgar/FormWrapper";
import { useAppContext } from "@/contexts/AppContext";
import { translations } from "@/lib/translations";
import { Button } from "@/components/ui/button";
import { PartyPopper } from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect } from "react";

export default function StepComplete() {
  const { state, dispatch } = useAppContext();
  const { language, hasAccount } = state;
  const router = useRouter();
  const t = translations[language];

  useEffect(() => {
    // Redirect all users to the chat page now.
    router.replace('/chat');
  }, [router]);

  // The content below will likely not be seen as the user is redirected.
  // It's kept as a fallback.

  const handleFinish = () => {
    dispatch({ type: 'RESET' });
    router.push('/');
  };

  return (
    <FormWrapper
      title={t.formSteps.complete.title}
      description={t.formSteps.complete.description}
      currentStep={5}
      totalSteps={6}
      isBackHidden
      isNextHidden
      titleClassName="mt-4"
    >
        <div className="text-center space-y-8 flex flex-col items-center">
            <div className="p-6 bg-green-100 rounded-full">
                <PartyPopper className="h-16 w-16 text-green-600" />
            </div>
            <p className={`text-muted-foreground leading-relaxed ${language === 'ur' ? 'font-urdu leading-loose' : ''}`} dir={language === 'ur' ? 'rtl' : 'ltr'}>{t.formSteps.complete.description}</p>
            <Button asChild onClick={handleFinish} className={`w-full max-w-xs bg-accent text-accent-foreground hover:bg-accent/90 ${language === 'ur' ? 'font-urdu' : ''}`}>
                <Link href="/">{t.formSteps.complete.backToHome}</Link>
            </Button>
        </div>
    </FormWrapper>
  );
}
