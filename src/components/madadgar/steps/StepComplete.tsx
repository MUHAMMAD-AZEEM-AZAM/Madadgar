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
    // This step is only for users who chose not to save info.
    // Users who created an account are redirected to /dashboard.
    if (hasAccount) {
      router.replace('/dashboard');
    }
  }, [hasAccount, router]);

  const handleFinish = () => {
    dispatch({ type: 'RESET' });
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
