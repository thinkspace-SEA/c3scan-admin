import { CustomerLayout } from "@/components/layout/CustomerLayout";
import { StatusPill } from "@/components/ui/StatusPill";
import { 
  CheckCircle2, 
  AlertCircle, 
  Clock, 
  FileText, 
  Shield, 
  ArrowRight,
  Upload,
  UserCheck,
  MapPin,
  Building2,
  Users,
  PenTool
} from "lucide-react";
import Link from "next/link";

interface ComplianceOverviewPageProps {
  params: Promise<{
    mailbox_id: string;
  }>;
}

export default async function ComplianceOverviewPage({ params }: ComplianceOverviewPageProps) {
  const { mailbox_id } = await params;

  // Mock compliance data - in real app would fetch from API
  const complianceData = {
    status: "pending" as const,
    progress: 25,
    graceDeadline: "2026-03-15",
    steps: [
      {
        id: "identity",
        title: "Identity Verification",
        description: "Upload a government-issued photo ID",
        status: "completed" as const,
        icon: UserCheck,
      },
      {
        id: "address",
        title: "Proof of Address",
        description: "Upload a document showing your current address",
        status: "pending" as const,
        icon: MapPin,
      },
      {
        id: "business",
        title: "Business Information",
        description: "Provide business details if applicable",
        status: "pending" as const,
        icon: Building2,
      },
      {
        id: "renters",
        title: "Additional Renters",
        description: "List other individuals using this mailbox",
        status: "pending" as const,
        icon: Users,
      },
      {
        id: "review",
        title: "Review & Sign",
        description: "Review your Form 1583 and sign digitally",
        status: "pending" as const,
        icon: PenTool,
      },
    ],
    documents: [
      {
        id: "doc-1",
        type: "Driver's License",
        uploadedAt: "2026-02-07T10:30:00Z",
        status: "verified" as const,
      },
    ],
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case "completed":
      case "verified":
        return <CheckCircle2 className="w-5 h-5 text-[var(--semantic-green)]" />;
      case "pending":
        return <Clock className="w-5 h-5 text-[var(--semantic-yellow)]" />;
      case "rejected":
        return <AlertCircle className="w-5 h-5 text-[var(--semantic-red)]" />;
      default:
        return <Clock className="w-5 h-5 text-[var(--text-muted)]" />;
    }
  };

  return (
    <CustomerLayout>
      <div className="max-w-5xl mx-auto px-4 py-8">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-2xl font-semibold text-[var(--text-primary)]">
            Compliance
          </h1>
          <p className="mt-1 text-[var(--text-secondary)]">
            Complete USPS Form 1583 to receive mail at your virtual mailbox
          </p>
        </div>

        {/* Status Card */}
        <div className="bg-white rounded-xl border border-[var(--border-subtle)] p-6 mb-6">
          <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
            <div className="flex items-center gap-4">
              <div className="w-16 h-16 rounded-full bg-[var(--brand-primary-soft)] flex items-center justify-center">
                <Shield className="w-8 h-8 text-[var(--action-black)]" />
              </div>
              <div>
                <div className="flex items-center gap-2 mb-1">
                  <h2 className="text-lg font-semibold text-[var(--text-primary)]">
                    Compliance Status
                  </h2>
                  <StatusPill status={complianceData.status} />
                </div>
                <p className="text-sm text-[var(--text-secondary)]">
                  {complianceData.progress}% complete • Due by {complianceData.graceDeadline}
                </p>
              </div>
            </div>
            <Link
              href={`/app/${mailbox_id}/compliance/assistant`}
              className="inline-flex items-center justify-center gap-2 px-6 py-3 bg-[var(--brand-primary)] text-[var(--action-black)] font-medium rounded-lg hover:bg-[var(--brand-primary-hover)] transition-colors"
            >
              Continue Setup
              <ArrowRight className="w-4 h-4" />
            </Link>
          </div>

          {/* Progress Bar */}
          <div className="mt-6">
            <div className="h-2 bg-[var(--surface-0)] rounded-full overflow-hidden">
              <div
                className="h-full bg-[var(--brand-primary)] transition-all duration-500"
                style={{ width: `${complianceData.progress}%` }}
              />
            </div>
          </div>
        </div>

        <div className="grid md:grid-cols-3 gap-6">
          {/* Steps Checklist */}
          <div className="md:col-span-2">
            <div className="bg-white rounded-xl border border-[var(--border-subtle)] overflow-hidden">
              <div className="px-6 py-4 border-b border-[var(--border-subtle)]">
                <h3 className="font-semibold text-[var(--text-primary)]">
                  Required Steps
                </h3>
              </div>
              <div className="divide-y divide-[var(--border-subtle)]">
                {complianceData.steps.map((step, index) => {
                  const Icon = step.icon;
                  return (
                    <div
                      key={step.id}
                      className="flex items-start gap-4 p-6 hover:bg-[var(--surface-0)] transition-colors"
                    >
                      <div className="flex-shrink-0 w-10 h-10 rounded-lg bg-[var(--surface-0)] flex items-center justify-center">
                        <Icon className="w-5 h-5 text-[var(--text-secondary)]" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2">
                          <h4 className="font-medium text-[var(--text-primary)]">
                            {index + 1}. {step.title}
                          </h4>
                          {getStatusIcon(step.status)}
                        </div>
                        <p className="mt-1 text-sm text-[var(--text-secondary)]">
                          {step.description}
                        </p>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            {/* Documents Card */}
            <div className="bg-white rounded-xl border border-[var(--border-subtle)] overflow-hidden">
              <div className="px-6 py-4 border-b border-[var(--border-subtle)]">
                <h3 className="font-semibold text-[var(--text-primary)]">
                  Uploaded Documents
                </h3>
              </div>
              <div className="p-6">
                {complianceData.documents.length > 0 ? (
                  <div className="space-y-3">
                    {complianceData.documents.map((doc) => (
                      <div
                        key={doc.id}
                        className="flex items-center gap-3 p-3 bg-[var(--surface-0)] rounded-lg"
                      >
                        <FileText className="w-5 h-5 text-[var(--text-muted)]" />
                        <div className="flex-1 min-w-0">
                          <p className="text-sm font-medium text-[var(--text-primary)] truncate">
                            {doc.type}
                          </p>
                          <p className="text-xs text-[var(--text-muted)]">
                            {new Date(doc.uploadedAt).toLocaleDateString()}
                          </p>
                        </div>
                        <StatusPill status={doc.status} />
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="text-center py-8">
                    <Upload className="w-10 h-10 text-[var(--text-muted)] mx-auto mb-3" />
                    <p className="text-sm text-[var(--text-secondary)]">
                      No documents uploaded yet
                    </p>
                  </div>
                )}
              </div>
            </div>

            {/* Info Card */}
            <div className="bg-[var(--semantic-blue-soft)] rounded-xl p-6">
              <div className="flex items-start gap-3">
                <FileText className="w-5 h-5 text-[var(--semantic-blue)] flex-shrink-0 mt-0.5" />
                <div>
                  <h4 className="font-medium text-[var(--text-primary)] mb-1">
                    About Form 1583
                  </h4>
                  <p className="text-sm text-[var(--text-secondary)]">
                    USPS requires this form for all Commercial Mail Receiving Agents (CMRA). 
                    It verifies your identity and authorizes us to receive mail on your behalf.
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </CustomerLayout>
  );
}
