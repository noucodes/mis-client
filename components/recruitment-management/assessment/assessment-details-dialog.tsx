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
import { Loader2, Download } from "lucide-react";
import { jsPDF } from "jspdf";

interface ExamResult {
    english_score: number;
    logical_score: number;
    computerskill_score: number;
    customerservice_score: number;
    total_score: number;
    submitted_at: string;
    typing_wpm: number;
    typing_accuracy: number;
}

interface ExaminationAssessmentDialogProps {
    open: boolean;
    onOpenChange: (open: boolean) => void;
    examinationId: string | null;
}

export function ExaminationAssessmentDialog({
    open,
    onOpenChange,
    examinationId,
}: ExaminationAssessmentDialogProps) {
    const [examResult, setExamResult] = useState<ExamResult | null>(null);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);

    /* ----------------------- Reset on close ----------------------- */
    useEffect(() => {
        if (!open) {
            setExamResult(null);
            setError(null);
        }
    }, [open]);

    /* ----------------------- Fetch exam ----------------------- */
    const fetchExamResult = useCallback(async () => {
        if (!examinationId) return;

        setLoading(true);
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
            setLoading(false);
        }
    }, [examinationId]);

    useEffect(() => {
        if (open) fetchExamResult();
    }, [open, fetchExamResult]);

    /* ----------------------- Date formatting ----------------------- */
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

    /* ----------------------- PDF download ----------------------- */
    const downloadPDF = () => {
        if (!examResult || !examinationId) return;
        const examId = examinationId as string;

        const doc = new jsPDF();
        let y = 30;

        doc.setFontSize(16);
        doc.text("Examination Assessment Results", 20, y);
        y += 15;

        doc.setFontSize(12);
        const scores = [
            ["English", examResult.english_score],
            ["Logical Reasoning", examResult.logical_score],
            ["Computer Skills", examResult.computerskill_score],
            ["Customer Service", examResult.customerservice_score],
            ["Typing Speed", `${examResult.typing_wpm} wpm`],
            ["Typing Accuracy", `${examResult.typing_accuracy}%`],
        ] as const;

        scores.forEach(([label, value]) => {
            doc.text(`${label}:`, 30, y);
            doc.setFont("helvetica", "bold");
            doc.text(`${value}`, 120, y);
            doc.setFont("helvetica", "normal");
            y += 20;
        });

        y += 5;
        doc.setFont("helvetica", "bold");
        doc.text("Total Score:", 30, y);
        doc.setFontSize(14);
        doc.text(`${examResult.total_score}`, 120, y);
        doc.setFontSize(12);
        doc.setFont("helvetica", "normal");

        y += 20;
        doc.text(`Submitted At: ${formatDate(examResult.submitted_at)}`, 30, y);

        const safeId = examId.replace(/[^a-zA-Z0-9_-]/g, "_");
        doc.save(`exam-${safeId}.pdf`);
    };

    /* --------------------------------------------------------------- */
    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent className="max-w-xl sm:max-w-xl max-h-[90vh]">
                <DialogHeader>
                    <DialogTitle>Examination Assessment</DialogTitle>
                    <DialogDescription>
                        Detailed scores from the applicant’s exam.
                    </DialogDescription>
                </DialogHeader>

                <ScrollArea className="max-h-[calc(90vh-8rem)] pr-4">
                    {loading ? (
                        <div className="flex items-center justify-center py-20">
                            <Loader2 className="animate-spin h-8 w-8 text-muted-foreground" />
                        </div>
                    ) : error ? (
                        <div className="flex items-center justify-center py-20">
                            <p className="text-red-500">{error}</p>
                        </div>
                    ) : examResult ? (
                        <div className="space-y-6 py-4">
                            {/* ---------- Scores Grid ---------- */}
                            <div className="grid grid-cols-2 gap-4">
                                <div className="space-y-1">
                                    <Label>English</Label>
                                    <p className="text-2xl font-semibold">{examResult.english_score}</p>
                                </div>
                                <div className="space-y-1">
                                    <Label>Logical Reasoning</Label>
                                    <p className="text-2xl font-semibold">{examResult.logical_score}</p>
                                </div>
                                <div className="space-y-1">
                                    <Label>Computer Skills</Label>
                                    <p className="text-2xl font-semibold">{examResult.computerskill_score}</p>
                                </div>
                                <div className="space-y-1">
                                    <Label>Customer Service</Label>
                                    <p className="text-2xl font-semibold">{examResult.customerservice_score}</p>
                                </div>
                            </div>
                            <div className="grid grid-cols-2 gap-4 border-t pt-4">
                                <div className="space-y-1">
                                    <Label>Typing Speed</Label>
                                    <p className="text-2xl font-semibold">
                                        {examResult.typing_wpm} <span className="text-sm">wpm</span>
                                    </p>
                                </div>
                                <div className="space-y-1">
                                    <Label>Typing Accuracy</Label>
                                    <p className="text-2xl font-semibold">
                                        {examResult.typing_accuracy} <span className="text-sm">%</span>
                                    </p>
                                </div>
                            </div>

                            {/* ---------- Total + Submitted (tight layout) ---------- */}
                            <div className="border-t pt-4 space-y-2">
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

                            {/* ---------- Download Button ---------- */}
                            <Button
                                variant="outline"
                                className="w-full mt-4"
                                onClick={downloadPDF}
                                disabled={!examResult || !examinationId} // ← Prevent click if no data
                            >
                                <Download className="mr-2 h-4 w-4" />
                                Download PDF
                            </Button>
                        </div>
                    ) : (
                        <div className="flex items-center justify-center py-20">
                            <p className="text-muted-foreground">No examination data found.</p>
                        </div>
                    )}
                </ScrollArea>
            </DialogContent>
        </Dialog>
    );
}