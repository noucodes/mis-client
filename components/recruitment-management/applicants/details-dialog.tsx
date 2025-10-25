"use client";

import { useCallback, useEffect, useState } from "react";
import axios from "axios";
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogHeader,
    DialogTitle,
} from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Button } from "@/components/ui/button";
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select";
import { Send, Printer, FileDown, Loader2 } from "lucide-react";
import {
    Tabs,
    TabsList,
    TabsTrigger,
    TabsContent,
} from "@/components/ui/tabs";
import { Stepper } from "@/components/ui/stepper";
import { Input } from "@/components/ui/input";

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

interface StatusDialogProps {
    open: boolean;
    onOpenChange: (open: boolean) => void;
    applicantId: number | null;
}

const statusTypeValues: Record<string, string[]> = {
    Application: ["Initial Interview", "Examination", "Final Interview", "Job Offer", "Contract Signing", "Hired"],
    Employment: ["Applicant", "On Hold", "Rejected", "Hired"],
};

export function StatusDialog({ open, onOpenChange, applicantId }: StatusDialogProps) {
    const [comment, setComment] = useState("");
    const [statusType, setStatusType] = useState<string>("Employment");
    const [statusValue, setStatusValue] = useState<string>("Applicant");
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [personalInfo, setPersonalInfo] = useState<any>(null);
    const [statusHistory, setStatusHistory] = useState<any[]>([]);
    const [examinationData, setExaminationData] = useState<any>(null);
    const [wpm, setWpm] = useState<string>("");

    // Reset state when dialog closes
    useEffect(() => {
        if (!open) {
            setComment("");
            setStatusType("Employment");
            setStatusValue("Applicant");
            setPersonalInfo(null);
            setStatusHistory([]);
            setExaminationData(null);
            setWpm("");
            setError(null);
        }
    }, [open]);

    // Memoized fetch function to avoid re-renders
    const fetchData = useCallback(async () => {
        if (!applicantId) return;

        setLoading(true);
        setError(null);
        try {
            const token = localStorage.getItem("token") || "";
            const baseUrl = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8080/api";

            const [infoRes, historyRes, examRes] = await Promise.all([
                axios.get(`${baseUrl}/applicants/${applicantId}`, {
                    headers: {
                        "Content-Type": "application/json",
                        Authorization: `Bearer ${token}`,
                    },
                }),
                axios.get(`${baseUrl}/status/applicant/${applicantId}`, {
                    headers: {
                        "Content-Type": "application/json",
                        Authorization: `Bearer ${token}`,
                    },
                }),
                axios.get(`${baseUrl}/examinations/applicant/${applicantId}`, {
                    headers: {
                        "Content-Type": "application/json",
                        Authorization: `Bearer ${token}`,
                    },
                }),
            ]);

            setPersonalInfo(infoRes.data);
            setStatusHistory(historyRes.data);
            setExaminationData(examRes.data);
            setWpm(examRes.data?.phaseThreeWpm?.toString() || "");
        } catch (err: any) {
            console.error("Error fetching applicant data:", err);
            setError("Failed to load applicant data. Please try again.");
        } finally {
            setLoading(false);
        }
    }, [applicantId]);

    // Fetch applicant data when dialog opens or applicantId changes
    useEffect(() => {
        fetchData();
    }, [open, fetchData]);

    // Handle status submission
    const handleSubmitStatus = async () => {
        if (!applicantId || !comment.trim()) {
            setError("Please provide a comment before submitting.");
            return;
        }

        setLoading(true);
        setError(null);
        try {
            const token = localStorage.getItem("token") || "";
            const baseUrl = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8080/api";

            await axios.post(
                `${baseUrl}/status/applicant/${applicantId}`,
                { status_type: statusType, status_value: statusValue, comment },
                {
                    headers: {
                        "Content-Type": "application/json",
                        Authorization: `Bearer ${token}`,
                    },
                }
            );

            // Refresh status history
            const historyRes = await axios.get(`${baseUrl}/status/applicant/${applicantId}`, {
                headers: {
                    "Content-Type": "application/json",
                    Authorization: `Bearer ${token}`,
                },
            });
            setStatusHistory(historyRes.data);
            setComment("");
            setStatusType("Employment");
            setStatusValue("Applicant");
        } catch (err: any) {
            console.error("Error submitting status:", err);
            setError("Failed to submit status. Please try again.");
        } finally {
            setLoading(false);
        }
    };

    // Handle WPM update
    const handleUpdateWpm = async () => {
        if (!applicantId || !wpm || isNaN(Number(wpm))) {
            setError("Please provide a valid WPM value.");
            return;
        }

        setLoading(true);
        setError(null);
        try {
            const token = localStorage.getItem("token") || "";
            const baseUrl = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8080/api";

            await axios.put(
                `${baseUrl}/examinations/applicant/${applicantId}`,
                { phaseThreeWpm: Number(wpm) },
                {
                    headers: {
                        "Content-Type": "application/json",
                        Authorization: `Bearer ${token}`,
                    },
                }
            );

            // Refresh examination data
            const examRes = await axios.get(`${baseUrl}/examinations/applicant/${applicantId}`, {
                headers: {
                    "Content-Type": "application/json",
                    Authorization: `Bearer ${token}`,
                },
            });
            setExaminationData(examRes.data);
            setWpm(examRes.data?.phaseThreeWpm?.toString() || "");
        } catch (err: any) {
            console.error("Error updating WPM:", err);
            setError("Failed to update WPM. Please try again.");
        } finally {
            setLoading(false);
        }
    };

    const handleStatusTypeChange = (type: string) => {
        setStatusType(type);
        setStatusValue(statusTypeValues[type][0]);
    };

    const formatDateTime = (dateString: string): string => {
        if (!dateString) return "Not yet hired";
        try {
            const date = new Date(dateString);
            if (isNaN(date.getTime())) return "Invalid Date";
            return date.toLocaleString("en-US", {
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

    const handlePrint = () => window.print();
    const handleSaveAsPDF = () => alert("PDF generation would be implemented here");

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
                { id: "contract-signing", label: "Contract Signing", description: "Finalizing employment contract" },
                { id: "hired", label: "Hired", description: "Candidate has been hired" },
            ],
            currentStep: personalInfo
                ? statusTypeValues.Application.indexOf(personalInfo.application_status) || 1
                : 1,
        },
    ];

    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent className="max-w-3xl sm:max-w-3xl max-h-[90vh]">
                <DialogHeader>
                    <DialogTitle>Employment Activity</DialogTitle>
                    <DialogDescription>
                        View personal information, status history, and post a new status comment.
                    </DialogDescription>
                </DialogHeader>

                <ScrollArea className="max-h-[calc(90vh-8rem)] pr-6">
                    {loading ? (
                        <div className="flex items-center justify-center py-20">
                            <Loader2 className="animate-spin h-8 w-8 text-muted-foreground" />
                        </div>
                    ) : error ? (
                        <div className="flex items-center justify-center py-20">
                            <p className="text-red-500">{error}</p>
                        </div>
                    ) : personalInfo ? (
                        <Tabs defaultValue="personal" className="space-y-6">
                            <TabsList className="grid w-full grid-cols-4">
                                <TabsTrigger value="personal">Personal Information</TabsTrigger>
                                <TabsTrigger value="history">Status History</TabsTrigger>
                                <TabsTrigger value="current">Update Status</TabsTrigger>
                                <TabsTrigger value="examination">Examination</TabsTrigger>
                            </TabsList>
                            <TabsContent value="personal">
                                <div className="grid grid-cols-2 gap-4">
                                    <div className="space-y-3 flex flex-col items-left">
                                        <div className="grid grid-cols-3 gap-2 w-full max-w-md">
                                            <Label className="text-muted-foreground text-left">Name:</Label>
                                            <span className="col-span-2 text-left">{personalInfo.full_name}</span>
                                        </div>
                                        <div className="grid grid-cols-3 gap-2 w-full max-w-md">
                                            <Label className="text-muted-foreground text-left">Email:</Label>
                                            <span className="col-span-2 text-left">{personalInfo.email}</span>
                                        </div>
                                        <div className="grid grid-cols-3 gap-2 w-full max-w-md">
                                            <Label className="text-muted-foreground text-left">Position Applied:</Label>
                                            <span className="col-span-2 text-left">{personalInfo.position_applied}</span>
                                        </div>
                                        <div className="grid grid-cols-3 gap-2 w-full max-w-md">
                                            <Label className="text-muted-foreground text-left">Phone:</Label>
                                            <span className="col-span-2 text-left">{personalInfo.phone}</span>
                                        </div>
                                        <div className="grid grid-cols-3 gap-2 w-full max-w-md">
                                            <Label className="text-muted-foreground text-left">Referrer:</Label>
                                            <span className="col-span-2 text-left">{personalInfo.referrer || "N/A"}</span>
                                        </div>
                                    </div>
                                    <div className="space-y-3 flex flex-col items-left">
                                        <div className="grid grid-cols-3 gap-2 w-full max-w-md">
                                            <Label className="text-muted-foreground text-left">Employment Status:</Label>
                                            <span className="col-span-2 text-left">{personalInfo.employment_status}</span>
                                        </div>
                                        <div className="grid grid-cols-3 gap-2 w-full max-w-md">
                                            <Label className="text-muted-foreground text-left">Application Status:</Label>
                                            <span className="col-span-2 text-left">{personalInfo.application_status}</span>
                                        </div>
                                        <div className="grid grid-cols-3 gap-2 w-full max-w-md">
                                            <Label className="text-muted-foreground text-left">Final Interview Date:</Label>
                                            <span className="col-span-2 text-left">{formatDateTime(personalInfo.final_interview_date)}</span>
                                        </div>
                                        <div className="grid grid-cols-3 gap-2 w-full max-w-md">
                                            <Label className="text-muted-foreground text-left">Date Hired:</Label>
                                            <span className="col-span-2 text-left">{formatDateTime(personalInfo.date_hired)}</span>
                                        </div>
                                    </div>
                                </div>
                            </TabsContent>
                            <TabsContent value="history">
                                <div className="space-y-6">
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
                                                    <li key={index} className="border-l-2 border-muted pl-4">
                                                        <p className="text-sm font-medium">
                                                            {status.status_type}: {status.status_value}
                                                        </p>
                                                        <p className="text-xs text-muted-foreground">{formatDateTime(status.status_created)}</p>
                                                        <p className="text-sm">{status.comment}</p>
                                                    </li>
                                                ))}
                                            </ul>
                                        ) : (
                                            <p className="text-sm text-muted-foreground">No status history available.</p>
                                        )}
                                    </div>
                                </div>
                            </TabsContent>
                            <TabsContent value="current">
                                <div className="space-y-4">
                                    <div className="grid grid-cols-2 gap-4">
                                        <div className="space-y-2">
                                            <Label htmlFor="status-type">Status Type</Label>
                                            <Select value={statusType} onValueChange={handleStatusTypeChange}>
                                                <SelectTrigger id="status-type">
                                                    <SelectValue />
                                                </SelectTrigger>
                                                <SelectContent>
                                                    {Object.keys(statusTypeValues).map((type) => (
                                                        <SelectItem key={type} value={type}>
                                                            {type}
                                                        </SelectItem>
                                                    ))}
                                                </SelectContent>
                                            </Select>
                                        </div>
                                        <div className="space-y-2">
                                            <Label htmlFor="status-value">Status Value</Label>
                                            <Select value={statusValue} onValueChange={setStatusValue}>
                                                <SelectTrigger id="status-value">
                                                    <SelectValue />
                                                </SelectTrigger>
                                                <SelectContent>
                                                    {statusTypeValues[statusType].map((value) => (
                                                        <SelectItem key={value} value={value}>
                                                            {value}
                                                        </SelectItem>
                                                    ))}
                                                </SelectContent>
                                            </Select>
                                        </div>
                                    </div>
                                    <div className="space-y-2">
                                        <Label htmlFor="comment">Comment</Label>
                                        <div className="relative">
                                            <Textarea
                                                id="comment"
                                                placeholder="Enter your status comment here..."
                                                value={comment}
                                                onChange={(e) => setComment(e.target.value)}
                                                rows={4}
                                                className="resize-none pr-12"
                                            />
                                            <Button
                                                size="icon"
                                                className="absolute bottom-2 left-2"
                                                onClick={handleSubmitStatus}
                                                disabled={loading}
                                            >
                                                <Send className="h-4 w-4" />
                                            </Button>
                                        </div>
                                    </div>
                                    {error && <p className="text-red-500 text-sm">{error}</p>}
                                    <div className="flex gap-2 pt-2">
                                        <Button variant="outline" onClick={handlePrint} className="flex-1 bg-transparent">
                                            <Printer className="h-4 w-4 mr-2" />
                                            Print
                                        </Button>
                                        <Button variant="outline" onClick={handleSaveAsPDF} className="flex-1 bg-transparent">
                                            <FileDown className="h-4 w-4 mr-2" />
                                            Save as PDF
                                        </Button>
                                    </div>
                                </div>
                            </TabsContent>
                            <TabsContent value="examination">
                                <div className="space-y-6">
                                    <h3 className="text-base font-bold text-foreground">Examination Results</h3>
                                    {examinationData ? (
                                        <div className="grid grid-cols-2 gap-4">
                                            <div className="space-y-2">
                                                <Label>Phase One Result</Label>
                                                <p className="text-sm">{examinationData.phaseOneResult || "N/A"}</p>
                                            </div>
                                            <div className="space-y-2">
                                                <Label>Phase Two Result</Label>
                                                <p className="text-sm">{examinationData.phaseTwoResult || "N/A"}</p>
                                            </div>
                                            <div className="space-y-2">
                                                <Label>Phase Three - WPM</Label>
                                                <Input
                                                    type="number"
                                                    value={wpm}
                                                    onChange={(e) => setWpm(e.target.value)}
                                                    placeholder="Enter WPM"
                                                />
                                                <Button onClick={handleUpdateWpm} disabled={loading}>
                                                    {loading ? <Loader2 className="animate-spin h-4 w-4 mr-2" /> : null}
                                                    Update WPM
                                                </Button>
                                            </div>
                                            <div className="space-y-2">
                                                <Label>Phase Three - Picture</Label>
                                                {examinationData.phaseThreeImageUrl ? (
                                                    <img
                                                        src={examinationData.phaseThreeImageUrl}
                                                        alt="Phase Three Picture"
                                                        className="max-w-full h-auto rounded-md"
                                                    />
                                                ) : (
                                                    <p className="text-sm text-muted-foreground">No picture available.</p>
                                                )}
                                            </div>
                                            <div className="space-y-2 col-span-2">
                                                <Label>Phase Four - Downloadable File</Label>
                                                {examinationData.phaseFourFileUrl ? (
                                                    <Button variant="outline" asChild>
                                                        <a href={examinationData.phaseFourFileUrl} download>
                                                            <FileDown className="h-4 w-4 mr-2" />
                                                            Download Phase Four
                                                        </a>
                                                    </Button>
                                                ) : (
                                                    <p className="text-sm text-muted-foreground">No file available.</p>
                                                )}
                                            </div>
                                        </div>
                                    ) : (
                                        <p className="text-sm text-muted-foreground">No examination data available.</p>
                                    )}
                                </div>
                            </TabsContent>
                        </Tabs>
                    ) : (
                        <div className="flex items-center justify-center py-20">
                            <p className="text-muted-foreground">No applicant data available.</p>
                        </div>
                    )}
                </ScrollArea>
            </DialogContent>
        </Dialog>
    );
}