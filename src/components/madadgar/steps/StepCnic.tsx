"use client";

import { FormWrapper } from "@/components/madadgar/FormWrapper";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useAppContext } from "@/contexts/AppContext";
import { translations } from "@/lib/translations";
import { VoiceInput } from "@/components/madadgar/VoiceInput";

const TOTAL_STEPS = 6;

export default function StepCnic() {
  const { state, dispatch } = useAppContext();
  const { formData, language } = state;
  const t = translations[language];

  const updateCnic = (cnic: string) => {
    // Basic formatting: remove non-digits and add hyphens
    const digitsOnly = cnic.replace(/\D/g, "");
    let formattedCnic = digitsOnly;
    if (digitsOnly.length > 5) {
      formattedCnic = `${digitsOnly.slice(0, 5)}-${digitsOnly.slice(5)}`;
    }
    if (digitsOnly.length > 12) {
      formattedCnic = `${digitsOnly.slice(0, 5)}-${digitsOnly.slice(5, 12)}-${digitsOnly.slice(12, 13)}`;
    }
    dispatch({ type: "UPDATE_FORM_DATA", payload: { cnic: formattedCnic.slice(0,15) } });
  };

  return (
    <FormWrapper
      title={t.formSteps.cnic.title}
      description={t.formSteps.cnic.description}
      currentStep={1}
      totalSteps={TOTAL_STEPS}
    >
      <div className="space-y-4">
        <div className="space-y-2">
            <Label htmlFor="cnic" className="sr-only">
            {t.formSteps.cnic.title}
            </Label>
            <Input
            id="cnic"
            placeholder={t.formSteps.cnic.placeholder}
            value={formData.cnic}
            onChange={(e) => updateCnic(e.target.value)}
            />
        </div>
        <VoiceInput onTranscription={updateCnic} />
      </div>
    </FormWrapper>
  );
}
