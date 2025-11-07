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
import { FileDown, Loader2 } from "lucide-react";
import {
    Tabs,
    TabsList,
    TabsTrigger,
    TabsContent,
} from "@/components/ui/tabs";

import { SkillSet } from "../details-dialog-skills-set";
import { PersonalInfo } from "@/components/recruitment-management/details-dialog-personal";
import { StatusHistory } from "../details-dialog-status-history";

interface StatusDialogProps {
    open: boolean;
    onOpenChange: (open: boolean) => void;
    applicantId: string | null;
    examinationId: string | null;
}

export function StatusDialog({ open, onOpenChange, applicantId, examinationId }: StatusDialogProps) {
    const [comment, setComment] = useState("");
    const [statusType, setStatusType] = useState<string>("Employment");
    const [statusValue, setStatusValue] = useState<string>("Applicant");
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [personalInfo, setPersonalInfo] = useState<any>(null);
    const [statusHistory, setStatusHistory] = useState<any[]>([]);
    const [examinationData, setExaminationData] = useState<any>(null);


    // Reset state when dialog closes
    useEffect(() => {
        if (!open) {
            setComment("");
            setStatusType("Employment");
            setStatusValue("Applicant");
            setPersonalInfo(null);
            setStatusHistory([]);
            setExaminationData(null);
            // setWpm("");
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

            const [infoRes, historyRes] = await Promise.all([
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
            ]);

            setPersonalInfo(infoRes.data);
            setStatusHistory(historyRes.data);
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
                                <TabsTrigger value="skills">Skills Set</TabsTrigger>
                                <TabsTrigger value="assessment">Assessment</TabsTrigger>
                            </TabsList>
                            <TabsContent value="personal">
                                <PersonalInfo personalInfo={personalInfo} />
                            </TabsContent>
                            <TabsContent value="history">
                                <StatusHistory personalInfo={personalInfo} statusHistory={statusHistory} />
                            </TabsContent>
                            <TabsContent value="skills">
                                <SkillSet />
                            </TabsContent>
                            <TabsContent value="assessment">
                                <div className="space-y-6">
                                    <h3 className="text-base font-bold text-foreground">Assessment Results</h3>
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
                                            {/* <div className="space-y-2">
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
                                            </div> */}
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