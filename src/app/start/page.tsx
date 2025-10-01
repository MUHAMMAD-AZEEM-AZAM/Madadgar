"use client";

import { useAppContext } from "@/contexts/AppContext";
import StepName from "@/components/madadgar/steps/StepName";
import StepCnic from "@/components/madadgar/steps/StepCnic";
import StepDob from "@/components/madadgar/steps/StepDob";
import StepReview from "@/components/madadgar/steps/StepReview";
import StepSaveChoice from "@/components/madadgar/steps/StepSaveChoice";
import StepSecurityQuestions from "@/components/madadgar/steps/StepSecurityQuestions";
import StepComplete from "@/components/madadgar/steps/StepComplete";
import { Logo } from "@/components/madadgar/Logo";
import { LanguageSwitcher } from "@/components/madadgar/LanguageSwitcher";

const steps = [
    StepName,
    StepCnic,
    StepDob,
    StepReview,
    StepSaveChoice,
    StepSecurityQuestions,
    StepComplete,
];

export default function StartPage() {
    const { state } = useAppContext();
    const CurrentStepComponent = steps[state.currentStep] || steps[0];

    return (
        <div className="flex flex-col min-h-screen">
            <header className="sticky top-0 z-10 bg-background/80 backdrop-blur-sm border-b">
                <div className="container mx-auto px-4 h-16 flex items-center justify-between">
                    <Link href="/" className="flex items-center gap-2 text-xl font-bold text-foreground">
                        <Logo className="w-7 h-7 text-primary" />
                        <span>Madadgar</span>
                    </Link>
                    <LanguageSwitcher />
                </div>
            </header>
            <main className="flex-grow flex items-center justify-center p-4">
                <CurrentStepComponent />
            </main>
        </div>
    );
}
