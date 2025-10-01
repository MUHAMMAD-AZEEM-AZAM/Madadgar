"use client";

import { useEffect, useState } from "react";
import { FormWrapper } from "@/components/madadgar/FormWrapper";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useAppContext } from "@/contexts/AppContext";
import { translations } from "@/lib/translations";
import { VoiceInput } from "@/components/madadgar/VoiceInput";
import { aiPoweredAccountCreation } from "@/ai/flows/ai-powered-account-creation";
import { Skeleton } from "@/components/ui/skeleton";
import { Button } from "@/components/ui/button";
import { useRouter } from "next/navigation";
import { cn } from "@/lib/utils";

const TOTAL_STEPS = 6;

interface SecurityQuestion {
  question: string;
  answer: string;
}

export default function StepSecurityQuestions() {
  const { state, dispatch } = useAppContext();
  const { language, hasAccount } = state;
  const router = useRouter();
  const t = translations[language];
  const isUrdu = language === 'ur';

  const [questions, setQuestions] = useState<SecurityQuestion[]>([]);
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    if (!hasAccount) {
      // If user chose not to save, skip this step and go to the end
      dispatch({ type: "GO_TO_STEP", payload: 5 });
      return;
    }

    const fetchQuestions = async () => {
      setIsLoading(true);
      try {
        const result = await aiPoweredAccountCreation({ language });
        setQuestions(result.securityQuestions.map(q => ({ ...q, answer: '' })));
      } catch (error) {
        console.error("Failed to fetch security questions", error);
        // Handle error, maybe show a toast
      } finally {
        setIsLoading(false);
      }
    };
    fetchQuestions();
  }, [language, hasAccount, dispatch]);

  const updateAnswer = (answer: string) => {
    const newQuestions = [...questions];
    newQuestions[currentQuestionIndex].answer = answer;
    setQuestions(newQuestions);
  };
  
  const handleNextQuestion = () => {
      if (currentQuestionIndex < questions.length - 1) {
          setCurrentQuestionIndex(currentQuestionIndex + 1);
      } else {
          // All questions answered, proceed
          dispatch({ type: 'SET_SECURITY_ANSWERS', payload: questions });
          // In a real app, you'd save to backend here.
          // For now, we simulate success and move to the dashboard.
          router.push('/dashboard');
      }
  };

  const handlePrevQuestion = () => {
      if (currentQuestionIndex > 0) {
          setCurrentQuestionIndex(currentQuestionIndex - 1);
      } else {
          dispatch({ type: 'PREV_STEP' }); // Go back to save choice
      }
  }

  const currentQuestion = questions[currentQuestionIndex];
  const isLastQuestion = currentQuestionIndex === questions.length - 1;

  if (isLoading) {
    return (
      <FormWrapper
        title={t.formSteps.security.title}
        description={t.formSteps.security.description}
        currentStep={4}
        totalSteps={TOTAL_STEPS}
        isNextDisabled
      >
        <div className="space-y-8">
            <Skeleton className="h-8 w-3/4" />
            <Skeleton className="h-12 w-full" />
            <Skeleton className="h-12 w-full" />
        </div>
      </FormWrapper>
    );
  }

  if (!currentQuestion) return null; // Or some error state

  return (
    <FormWrapper
      title={t.formSteps.security.title}
      description={t.formSteps.security.description}
      currentStep={4}
      totalSteps={TOTAL_STEPS}
      onNext={handleNextQuestion}
      onBack={handlePrevQuestion}
      isNextDisabled={!currentQuestion.answer.trim()}
      nextButtonText={isLastQuestion ? t.createAccount : t.next}
    >
      <div className="space-y-8">
        <div className="space-y-4">
            <Label htmlFor="security-answer" className={cn("text-muted-foreground text-sm leading-relaxed", isUrdu && "font-urdu leading-loose")} dir={isUrdu ? 'rtl' : 'ltr'}>
                {`(${currentQuestionIndex + 1}/${questions.length}) ${currentQuestion.question}`}
            </Label>
            <Input
                id="security-answer"
                value={currentQuestion.answer}
                onChange={(e) => updateAnswer(e.target.value)}
                dir={isUrdu ? 'rtl' : 'ltr'}
                className={`h-12 text-base ${isUrdu ? 'font-urdu' : ''}`}
            />
        </div>
        <VoiceInput onTranscription={updateAnswer} />
      </div>
    </FormWrapper>
  );
}
