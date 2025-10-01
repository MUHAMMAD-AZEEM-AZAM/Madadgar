"use client";

import { ReactNode } from "react";
import { useRouter } from 'next/navigation';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { useAppContext } from "@/contexts/AppContext";
import { translations } from "@/lib/translations";
import { ArrowLeft, ArrowRight } from "lucide-react";
import { cn } from "@/lib/utils";

interface FormWrapperProps {
  title: string;
  description: string;
  children: ReactNode;
  currentStep: number;
  totalSteps: number;
  onNext?: () => void;
  onBack?: () => void;
  isNextDisabled?: boolean;
  nextButtonText?: string;
  isBackHidden?: boolean;
  isNextHidden?: boolean;
}

export function FormWrapper({
  title,
  description,
  children,
  currentStep,
  totalSteps,
  onNext,
  onBack,
  isNextDisabled = false,
  nextButtonText,
  isBackHidden = false,
  isNextHidden = false,
}: FormWrapperProps) {
  const { state, dispatch } = useAppContext();
  const router = useRouter();
  const t = translations[state.language];
  const progressValue = ((currentStep + 1) / totalSteps) * 100;
  
  const handleBack = () => {
    if (onBack) {
        onBack();
    } else if (currentStep > 0) {
        dispatch({ type: "PREV_STEP" });
    } else {
        router.push('/');
    }
  };

  const handleNext = () => {
    if (onNext) {
        onNext();
    } else {
        dispatch({ type: "NEXT_STEP" });
    }
  };

  const isUrdu = state.language === 'ur';

  return (
    <Card className="w-full max-w-lg shadow-2xl border-0 md:border">
      <CardHeader>
        <Progress value={progressValue} className="mb-4 h-2" />
        <CardTitle className={cn("text-2xl md:text-3xl font-headline", isUrdu && "font-urdu")} dir={isUrdu ? 'rtl' : 'ltr'}>{title}</CardTitle>
        <CardDescription className={cn(isUrdu && "font-urdu")} dir={isUrdu ? 'rtl' : 'ltr'}>{description}</CardDescription>
      </CardHeader>
      <CardContent>
        {children}
      </CardContent>
      <CardFooter className="flex justify-between gap-4">
        {!isBackHidden && (
            <Button variant="outline" onClick={handleBack} className={cn("w-full md:w-auto", isUrdu && "font-urdu")}>
                <ArrowLeft className="mr-2 h-4 w-4" />
                {t.back}
            </Button>
        )}
        <div className="flex-grow md:hidden"/>
        {!isNextHidden && (
            <Button onClick={handleNext} disabled={isNextDisabled} className={cn("w-full md:w-auto bg-accent text-accent-foreground hover:bg-accent/90", isUrdu && "font-urdu")}>
                {nextButtonText || t.next}
                <ArrowRight className="ml-2 h-4 w-4" />
            </Button>
        )}
      </CardFooter>
    </Card>
  );
}
