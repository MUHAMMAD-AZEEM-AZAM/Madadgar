"use client";

import { FormWrapper } from "@/components/madadgar/FormWrapper";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useAppContext } from "@/contexts/AppContext";
import { translations } from "@/lib/translations";
import { VoiceInput } from "@/components/madadgar/VoiceInput";

const TOTAL_STEPS = 6;

export default function StepDob() {
  const { state, dispatch } = useAppContext();
  const { formData, language } = state;
  const t = translations[language];

  const updateDob = (dob: string) => {
    dispatch({ type: "UPDATE_FORM_DATA", payload: { dob } });
  };

  return (
    <FormWrapper
      title={t.formSteps.dob.title}
      description={t.formSteps.dob.description}
      currentStep={2}
      totalSteps={TOTAL_STEPS}
    >
      <div className="space-y-4">
        <div className="space-y-2">
            <Label htmlFor="dob" className="sr-only">
            {t.formSteps.dob.title}
            </Label>
            <Input
            id="dob"
            placeholder={t.formSteps.dob.placeholder}
            value={formData.dob}
            onChange={(e) => updateDob(e.target.value)}
            />
        </div>
        <VoiceInput onTranscription={updateDob} />
      </div>
    </FormWrapper>
  );
}
