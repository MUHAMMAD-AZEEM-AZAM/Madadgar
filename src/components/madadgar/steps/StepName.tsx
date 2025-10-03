"use client";

import { FormWrapper } from "@/components/madadgar/FormWrapper";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useAppContext } from "@/contexts/AppContext";
import { translations } from "@/lib/translations";
import { VoiceInput } from "@/components/madadgar/VoiceInput";

const TOTAL_STEPS = 6;

export default function StepName() {
  const { state, dispatch } = useAppContext();
  const { formData, language } = state;
  const t = translations[language];

  const updateName = (name: string) => {
    dispatch({ type: "UPDATE_FORM_DATA", payload: { name } });
  };


  return (
    <FormWrapper
      title={t.formSteps.name.title}
      description={t.formSteps.name.description}
      currentStep={1}
      totalSteps={TOTAL_STEPS}
    >
      <div className="space-y-8">
        <div className="space-y-4">
          <Label htmlFor="name" className="sr-only">
            {t.formSteps.name.title}
          </Label>
          <Input
            id="name"
            placeholder={t.formSteps.name.placeholder}
            value={formData.name}
            onChange={(e) => updateName(e.target.value)}
            dir={language === 'ur' ? 'rtl' : 'ltr'}
            className={`h-14 text-lg ${language === 'ur' ? 'font-urdu' : ''}`}
          />
        </div>
        <VoiceInput onTranscription={updateName} />
      </div>
    </FormWrapper>
  );
}
