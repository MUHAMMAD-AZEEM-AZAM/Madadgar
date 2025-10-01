"use client";

import { FormWrapper } from "@/components/madadgar/FormWrapper";
import { useAppContext } from "@/contexts/AppContext";
import { translations } from "@/lib/translations";
import { Button } from "@/components/ui/button";
import { Save, XCircle } from "lucide-react";

const TOTAL_STEPS = 6;

export default function StepSaveChoice() {
  const { state, dispatch } = useAppContext();
  const t = translations[state.language];

  const handleSave = () => {
    dispatch({ type: 'SET_HAS_ACCOUNT', payload: true });
    // This will automatically go to next step (Security Questions) because of the dispatch
  };

  const handleDontSave = () => {
    dispatch({ type: 'SET_HAS_ACCOUNT', payload: false });
    // This will automatically go to next step (Completion screen)
  };

  return (
    <FormWrapper
      title={t.formSteps.saveChoice.title}
      description={t.formSteps.saveChoice.description}
      currentStep={4}
      totalSteps={TOTAL_STEPS}
      isBackHidden
      isNextHidden
    >
      <div className="space-y-4">
        <Button onClick={handleSave} className="w-full h-16 text-lg bg-accent text-accent-foreground hover:bg-accent/90">
            <Save className="mr-3 h-6 w-6" />
            {t.formSteps.saveChoice.save}
        </Button>
        <Button onClick={handleDontSave} variant="outline" className="w-full h-16 text-lg">
            <XCircle className="mr-3 h-6 w-6" />
            {t.formSteps.saveChoice.dontSave}
        </Button>
      </div>
    </FormWrapper>
  );
}
