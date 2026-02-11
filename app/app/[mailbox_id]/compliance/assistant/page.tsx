"use client";

import { useState } from "react";
import { useParams } from "next/navigation";
import { CustomerLayout } from "@/components/layout/CustomerLayout";
import { WelcomeStep } from "@/components/compliance/wizard/WelcomeStep";
import { IdentityStep } from "@/components/compliance/wizard/IdentityStep";
import { AddressStep } from "@/components/compliance/wizard/AddressStep";
import { BusinessStep } from "@/components/compliance/wizard/BusinessStep";
import { ReviewStep } from "@/components/compliance/wizard/ReviewStep";
import { SignStep } from "@/components/compliance/wizard/SignStep";
import { SuccessStep } from "@/components/compliance/wizard/SuccessStep";
import { 
  ChevronLeft, 
  ChevronRight, 
  CheckCircle2,
  Circle
} from "lucide-react";

export type WizardStep = 
  | "welcome" 
  | "identity" 
  | "address" 
  | "business" 
  | "review" 
  | "sign" 
  | "success";

export interface ComplianceFormData {
  // Identity
  idType?: "drivers_license" | "passport" | "state_id" | "military_id";
  idFrontFile?: File;
  idBackFile?: File;
  idNumber?: string;
  
  // Address
  addressLine1?: string;
  addressLine2?: string;
  city?: string;
  state?: string;
  postalCode?: string;
  proofOfAddressFile?: File;
  
  // Business
  businessUse?: boolean;
  businessName?: string;
  placeOfRegistration?: string;
  
  // Renters
  additionalRenters?: Array<{
    fullName: string;
    email?: string;
  }>;
  
  // Signature
  signatureDataUrl?: string;
}

const steps: { id: WizardStep; label: string }[] = [
  { id: "welcome", label: "Welcome" },
  { id: "identity", label: "Identity" },
  { id: "address", label: "Address" },
  { id: "business", label: "Business" },
  { id: "review", label: "Review" },
  { id: "sign", label: "Sign" },
];

export default function ComplianceWizardPage() {
  const params = useParams();
  const mailboxId = params.mailbox_id as string;
  
  const [currentStep, setCurrentStep] = useState<WizardStep>("welcome");
  const [formData, setFormData] = useState<ComplianceFormData>({});
  const [completedSteps, setCompletedSteps] = useState<Set<WizardStep>>(new Set());

  const updateFormData = (updates: Partial<ComplianceFormData>) => {
    setFormData((prev) => ({ ...prev, ...updates }));
  };

  const markStepComplete = (step: WizardStep) => {
    setCompletedSteps((prev) => new Set([...prev, step]));
  };

  const goToStep = (step: WizardStep) => {
    setCurrentStep(step);
  };

  const goNext = () => {
    const stepOrder: WizardStep[] = ["welcome", "identity", "address", "business", "review", "sign", "success"];
    const currentIndex = stepOrder.indexOf(currentStep);
    if (currentIndex < stepOrder.length - 1) {
      setCurrentStep(stepOrder[currentIndex + 1]);
    }
  };

  const goBack = () => {
    const stepOrder: WizardStep[] = ["welcome", "identity", "address", "business", "review", "sign", "success"];
    const currentIndex = stepOrder.indexOf(currentStep);
    if (currentIndex > 0) {
      setCurrentStep(stepOrder[currentIndex - 1]);
    }
  };

  const handleSubmit = () => {
    // In real app, submit to API
    console.log("Submitting compliance data:", formData);
    setCurrentStep("success");
  };

  const renderStep = () => {
    switch (currentStep) {
      case "welcome":
        return <WelcomeStep onNext={goNext} />;
      case "identity":
        return (
          <IdentityStep
            formData={formData}
            updateFormData={updateFormData}
            onComplete={() => markStepComplete("identity")}
          />
        );
      case "address":
        return (
          <AddressStep
            formData={formData}
            updateFormData={updateFormData}
            onComplete={() => markStepComplete("address")}
          />
        );
      case "business":
        return (
          <BusinessStep
            formData={formData}
            updateFormData={updateFormData}
            onComplete={() => markStepComplete("business")}
          />
        );
      case "review":
        return <ReviewStep formData={formData} mailboxId={mailboxId} />;
      case "sign":
        return (
          <SignStep
            formData={formData}
            updateFormData={updateFormData}
            onSubmit={handleSubmit}
          />
        );
      case "success":
        return <SuccessStep mailboxId={mailboxId} />;
      default:
        return null;
    }
  };

  const currentStepIndex = steps.findIndex((s) => s.id === currentStep);
  const progress = ((currentStepIndex + 1) / steps.length) * 100;

  return (
    <CustomerLayout>
      <div className="min-h-[calc(100vh-200px)] bg-[var(--surface-0)]">
        {/* Progress Header */}
        {currentStep !== "success" && (
          <div className="bg-white border-b border-[var(--border-subtle)]">
            <div className="max-w-4xl mx-auto px-4 py-6">
              {/* Step Indicators */}
              <div className="hidden md:flex items-center justify-between mb-4">
                {steps.map((step, index) => {
                  const isActive = step.id === currentStep;
                  const isCompleted = completedSteps.has(step.id);
                  const isPast = index < currentStepIndex;

                  return (
                    <div key={step.id} className="flex items-center">
                      <button
                        onClick={() => goToStep(step.id)}
                        disabled={!isCompleted && !isPast}
                        className={`flex items-center gap-2 transition-colors ${
                          isActive
                            ? "text-[var(--action-black)]"
                            : isCompleted || isPast
                            ? "text-[var(--semantic-green)]"
                            : "text-[var(--text-muted)]"
                        }`}
                      >
                        {isCompleted || isPast ? (
                          <CheckCircle2 className="w-5 h-5" />
                        ) : (
                          <Circle className={`w-5 h-5 ${isActive ? "fill-[var(--brand-primary)]" : ""}`} />
                        )}
                        <span className="text-sm font-medium">{step.label}</span>
                      </button>
                      {index < steps.length - 1 && (
                        <div className="w-8 h-px bg-[var(--border-subtle)] mx-2" />
                      )}
                    </div>
                  );
                })}
              </div>

              {/* Mobile Progress */}
              <div className="md:hidden mb-2">
                <p className="text-sm text-[var(--text-secondary)]">
                  Step {currentStepIndex + 1} of {steps.length}: <span className="font-medium text-[var(--text-primary)]">{steps[currentStepIndex]?.label}</span>
                </p>
              </div>

              {/* Progress Bar */}
              <div className="h-2 bg-[var(--surface-0)] rounded-full overflow-hidden">
                <div
                  className="h-full bg-[var(--brand-primary)] transition-all duration-300"
                  style={{ width: `${progress}%` }}
                />
              </div>
            </div>
          </div>
        )}

        {/* Step Content */}
        <div className="max-w-4xl mx-auto px-4 py-8">
          {renderStep()}
        </div>

        {/* Navigation Footer */}
        {currentStep !== "welcome" && currentStep !== "success" && (
          <div className="fixed bottom-0 left-0 right-0 bg-white border-t border-[var(--border-subtle)]">
            <div className="max-w-4xl mx-auto px-4 py-4 flex items-center justify-between">
              <button
                onClick={goBack}
                className="inline-flex items-center gap-2 px-4 py-2 text-[var(--text-secondary)] hover:text-[var(--text-primary)] transition-colors"
              >
                <ChevronLeft className="w-4 h-4" />
                Back
              </button>

              {currentStep === "review" ? (
                <button
                  onClick={goNext}
                  className="inline-flex items-center gap-2 px-6 py-2.5 bg-[var(--action-black)] text-white font-medium rounded-lg hover:bg-[var(--action-black-hover)] transition-colors"
                >
                  Continue to Sign
                  <ChevronRight className="w-4 h-4" />
                </button>
              ) : currentStep === "sign" ? (
                <button
                  onClick={handleSubmit}
                  disabled={!formData.signatureDataUrl}
                  className="inline-flex items-center gap-2 px-6 py-2.5 bg-[var(--brand-primary)] text-[var(--action-black)] font-medium rounded-lg hover:bg-[var(--brand-primary-hover)] transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  Submit Compliance
                  <CheckCircle2 className="w-4 h-4" />
                </button>
              ) : (
                <button
                  onClick={goNext}
                  className="inline-flex items-center gap-2 px-6 py-2.5 bg-[var(--brand-primary)] text-[var(--action-black)] font-medium rounded-lg hover:bg-[var(--brand-primary-hover)] transition-colors"
                >
                  Continue
                  <ChevronRight className="w-4 h-4" />
                </button>
              )}
            </div>
          </div>
        )}
      </div>
    </CustomerLayout>
  );
}
