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
import { ScrollArea } from "@/components/ui/scroll-area";
import { Button } from "@/components/ui/button";
import { Loader2 } from "lucide-react";
import {
    Tabs,
    TabsList,
    TabsTrigger,
    TabsContent,
} from "@/components/ui/tabs";

import { SkillSet } from "../details-dialog-skills-set";
import { PersonalInfo } from "@/components/recruitment-management/details-dialog-personal";
import { StatusHistory } from "../details-dialog-status-history";
import { Textarea } from "@/components/ui/textarea";

interface StatusDialogProps {
    open: boolean;
    onOpenChange: (open: boolean) => void;
    applicantId: string | null;
    examinationId: string | null;
}

/* --------------------------------------------------------------- */
/*  Types for the exam result (makes the code type‑safe)          */
/* --------------------------------------------------------------- */
interface ExamResult {
    english_score: number;
    logical_score: number;
    computerskill_score: number;
    customerservice_score: number;
    total_score: number;
    submitted_at: string;
}

export function StatusDialog({
    open,
    onOpenChange,
    applicantId,
    examinationId,
}: StatusDialogProps) {
    /* ----------------------- UI state ----------------------- */
    const [comment, setComment] = useState("");
    const [statusType, setStatusType] = useState("Employment");
    const [statusValue, setStatusValue] = useState("Applicant");

    /* ----------------------- Data state ----------------------- */
    const [personalInfo, setPersonalInfo] = useState<any>(null);
    const [statusHistory, setStatusHistory] = useState<any[]>([]);
    const [examResult, setExamResult] = useState<ExamResult | null>(null);

    /* ----------------------- Loading / error ----------------------- */
    const [loading, setLoading] = useState(false);          // global loading
    const [examLoading, setExamLoading] = useState(false); // only exam tab
    const [error, setError] = useState<string | null>(null);

    /* ----------------------- Reset when dialog closes ----------------------- */
    useEffect(() => {
        if (!open) {
            setComment("");
            setStatusType("Employment");
            setStatusValue("Applicant");
            setPersonalInfo(null);
            setStatusHistory([]);
            setExamResult(null);
            setError(null);
        }
    }, [open]);

    /* ----------------------- Fetch applicant + history ----------------------- */
    const fetchApplicantData = useCallback(async () => {
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

    /* ----------------------- Fetch exam result (only when tab is open) ----------------------- */
    const fetchExamResult = useCallback(async () => {
        if (!examinationId) return;

        setExamLoading(true);
        setError(null);
        try {
            const token = localStorage.getItem("token") || "";
            const baseUrl = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8080/api";

            const res = await axios.get(`${baseUrl}/examination/exam/${examinationId}`, {
                headers: { Authorization: `Bearer ${token}` },
            });

            setExamResult(res.data);
        } catch (err: any) {
            console.error("Error loading exam result:", err);
            setError("Failed to load examination data.");
        } finally {
            setExamLoading(false);
        }
    }, [examinationId]);

    /* ----------------------- Load applicant data when dialog opens ----------------------- */
    useEffect(() => {
        if (open) fetchApplicantData();
    }, [open, fetchApplicantData]);

    /* ----------------------- Helpers ----------------------- */
    const formatDate = (iso: string) => {
        if (!iso) return "—";
        return new Date(iso).toLocaleString("en-PH", {
            timeZone: "Asia/Manila",
            month: "short",
            day: "2-digit",
            year: "numeric",
            hour: "2-digit",
            minute: "2-digit",
            hour12: true,
        });
    };

    /* --------------------------------------------------------------- */
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
                    {/* ---------- GLOBAL LOADING (applicant data) ---------- */}
                    {loading ? (
                        <div className="flex items-center justify-center py-20">
                            <Loader2 className="animate-spin h-8 w-8 text-muted-foreground" />
                        </div>
                    ) : error ? (
                        <div className="flex items-center justify-center py-20">
                            <p className="text-red-500">{error}</p>
                        </div>
                    ) : personalInfo ? (
                        /* ---------- TABS ---------- */
                        <Tabs defaultValue="personal" className="space-y-6">
                            <TabsList className="grid w-full grid-cols-4">
                                <TabsTrigger value="personal">Personal Information</TabsTrigger>
                                <TabsTrigger value="history">Status History</TabsTrigger>
                                <TabsTrigger value="skills">Skills Set</TabsTrigger>
                                <TabsTrigger
                                    value="assessment"
                                    onClick={() => {
                                        // Load exam only when the tab is clicked (lazy)
                                        if (!examResult && examinationId) fetchExamResult();
                                    }}
                                >
                                    Assessment
                                </TabsTrigger>
                            </TabsList>

                            {/* ---------- Personal ---------- */}
                            <TabsContent value="personal">
                                <PersonalInfo personalInfo={personalInfo} />
                            </TabsContent>

                            {/* ---------- History ---------- */}
                            <TabsContent value="history">
                                <StatusHistory personalInfo={personalInfo} statusHistory={statusHistory} />
                            </TabsContent>

                            {/* ---------- Skills ---------- */}
                            <TabsContent value="skills">
                                <SkillSet />
                            </TabsContent>

                            {/* ---------- Assessment ---------- */}
                            <TabsContent value="assessment">
                                <div className="space-y-6 relative">
                                    <h3 className="text-base font-bold text-foreground">
                                        Assessment Results
                                    </h3>

                                    {/* Exam‑specific spinner overlay */}
                                    {examLoading && (
                                        <div className="absolute inset-0 flex items-center justify-center bg-background/80">
                                            <Loader2 className="animate-spin h-6 w-6 text-muted-foreground" />
                                        </div>
                                    )}

                                    {examResult ? (
                                        <div className="space-y-6 py-4">
                                            {/* Scores */}
                                            <div className="grid grid-cols-2 gap-4">
                                                <div className="space-y-1">
                                                    <Label>English</Label>
                                                    <p className="text-2xl font-semibold">
                                                        {examResult.english_score}
                                                    </p>
                                                </div>
                                                <div className="space-y-1">
                                                    <Label>Logical Reasoning</Label>
                                                    <p className="text-2xl font-semibold">
                                                        {examResult.logical_score}
                                                    </p>
                                                </div>
                                                <div className="space-y-1">
                                                    <Label>Computer Skills</Label>
                                                    <p className="text-2xl font-semibold">
                                                        {examResult.computerskill_score}
                                                    </p>
                                                </div>
                                                <div className="space-y-1">
                                                    <Label>Customer Service</Label>
                                                    <p className="text-2xl font-semibold">
                                                        {examResult.customerservice_score}
                                                    </p>
                                                </div>
                                            </div>

                                            {/* Total & Submitted */}
                                            <div className="border-t pt-4 space-y-3">
                                                <div className="flex justify-between items-center">
                                                    <Label className="text-lg">Total Score</Label>
                                                    <p className="text-3xl font-bold text-primary">
                                                        {examResult.total_score}
                                                    </p>
                                                </div>
                                                <div className="flex justify-between items-center">
                                                    <Label>Submitted At</Label>
                                                    <p className="text-sm text-muted-foreground">
                                                        {formatDate(examResult.submitted_at)}
                                                    </p>
                                                </div>
                                            </div>
                                        </div>
                                    ) : (
                                        <div className="flex items-center justify-center py-20">
                                            <p className="text-muted-foreground">
                                                No examination data found.
                                            </p>
                                        </div>
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