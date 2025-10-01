"use client";

import { FormWrapper } from "@/components/madadgar/FormWrapper";
import { useAppContext } from "@/contexts/AppContext";
import { translations } from "@/lib/translations";
import { Edit } from "lucide-react";
import { Button } from "@/components/ui/button";

const TOTAL_STEPS = 6;

export default function StepReview() {
  const { state, dispatch } = useAppContext();
  const { formData, language } = state;
  const t = translations[language];

  const goToStep = (step: number) => {
    dispatch({ type: "GO_TO_STEP", payload: step });
  };

  const infoItems = [
    { label: t.formSteps.review.name, value: formData.name, step: 0 },
    { label: t.formSteps.review.cnic, value: formData.cnic, step: 1 },
    { label: t.formSteps.review.dob, value: formData.dob, step: 2 },
  ];

  return (
    <FormWrapper
      title={t.formSteps.review.title}
      description={t.formSteps.review.description}
      currentStep={3}
      totalSteps={TOTAL_STEPS}
    >
      <div className="space-y-4 rounded-lg border p-4" dir={language === 'ur' ? 'rtl' : 'ltr'}>
        {infoItems.map((item, index) => (
          <div key={item.label} className="flex items-center justify-between">
            <div>
              <p className="text-sm text-muted-foreground">{item.label}</p>
              <p className="font-semibold">{item.value || "-"}</p>
            </div>
            <Button variant="ghost" size="icon" onClick={() => goToStep(item.step)}>
              <Edit className="h-4 w-4" />
            </Button>
          </div>
        ))}
      </div>
    </FormWrapper>
  );
}
