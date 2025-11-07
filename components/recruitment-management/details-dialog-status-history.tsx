import { Stepper } from "@/components/ui/stepper";
import { Textarea } from "../ui/textarea";

interface StepperConfig {
    title: string;
    description: string;
    steps: Array<{
        id: string;
        label: string;
        description: string;
    }>;
    currentStep: number;
}

const statusTypeValues: Record<string, string[]> = {
    Application: ["Initial Interview", "Examination", "Final Interview", "Job Offer", "Hired", "Hired"],
    Employment: ["Applicant", "On Hold", "Rejected", "Hired"],
};

export function StatusHistory({ personalInfo, statusHistory }: { personalInfo: any, statusHistory: any[] }) {
    // Dynamic stepper configuration based on fetched applicant data
    const stepperConfigs: StepperConfig[] = [
        {
            title: "Application Status",
            description: "Your application progress",
            steps: [
                { id: "initial", label: "Initial Interview", description: "First stage of the interview process" },
                { id: "examination", label: "Examination", description: "Assessment of skills and qualifications" },
                { id: "final", label: "Final Interview", description: "Final evaluation with senior team members" },
                { id: "offer", label: "Job Offer", description: "Offer extended to the candidate" },
                { id: "hired", label: "Hired", description: "Candidate has been hired" },
            ],
            currentStep: personalInfo
                ? statusTypeValues.Application.indexOf(personalInfo.application_status) || 1
                : 1,
        },
    ];

    const formatDateTime = (dateString: string): string => {
        if (!dateString) return "Not yet hired";
        try {
            const date = new Date(dateString);
            if (isNaN(date.getTime())) return "Invalid Date";
            return date.toLocaleString("en-PH", {
                timeZone: "Asia/Manila",
                month: "short",
                day: "2-digit",
                year: "numeric",
                hour: "2-digit",
                minute: "2-digit",
                hour12: true,
            });
        } catch (error) {
            return "Invalid Date";
        }
    };
    return (
        <div className="space-y-4">
            {stepperConfigs.map((stepper, index) => (
                <div key={index} className="space-y-4">
                    <div className="space-y-1">
                        <h3 className="text-base font-bold text-foreground">{stepper.title}</h3>
                        <p className="text-xs text-gray-500">{stepper.description}</p>
                    </div>
                    <Stepper
                        steps={stepper.steps}
                        currentStep={stepper.currentStep}
                        orientation="horizontal"
                        className="w-full"
                    />
                </div>
            ))}
            <div className="space-y-4">
                <h3 className="text-base font-bold text-foreground">Status History Timeline</h3>
                {statusHistory.length > 0 ? (
                    <ul className="space-y-2">
                        {statusHistory.map((status, index) => (
                            <li key={index} className="border-l-2 border-muted pl-4 space-y-1">
                                <p className="text-sm font-medium">
                                    {status.status_type}: {status.status_value}
                                </p>
                                <p className="text-xs text-muted-foreground">{formatDateTime(status.status_created)}</p>
                                <p className="text-sm w-full whitespace-pre-wrap break-all">
                                    {status.comment}
                                </p>
                            </li>
                        ))}
                    </ul>
                ) : (
                    <p className="text-sm text-muted-foreground">No status history available.</p>
                )}
            </div>
        </div>
    );
}
