import { Label } from "@/components/ui/label";
import axios, { AxiosError } from "axios";
import { Briefcase, Save } from "lucide-react";
import { useState, useEffect } from "react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Card, CardHeader, CardTitle, CardContent, CardDescription } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Textarea } from "../ui/textarea";

interface EmployeeDetails {
    id: number;
    user_id: string; // UUID
    position: string; // since it's VARCHAR(45)[], we can use string[] if you want multiple positions
    job_level: string;
    payment_method: string;
    pay_computation: string;
    salary_type: string;
    basic_pay: number;
    allowance: number;
    gross: number;
    bank_number: string;
    salary_grade: string;
    date_hired: string; // YYYY-MM-DD
    employee_activity: string;
    activity_effect_date: string; // YYYY-MM-DD
    remarks: string;
    department: string;
    manager: string;
    employee_status: string;
}

export function EmployeeInfo({ id, token }: { id: number, token: string | null }) {
    const [loading, setLoading] = useState<boolean>(false);
    const [error, setError] = useState<string | null>(null);

    const [employee, setEmployee] = useState<EmployeeDetails>({
        id: 0,
        user_id: "", // you can pass a generated UUID if needed
        position: "", // or [] if you want multiple values
        job_level: "",
        payment_method: "",
        pay_computation: "",
        salary_type: "",
        basic_pay: 0,
        allowance: 0,
        gross: 0,
        bank_number: "",
        salary_grade: "",
        date_hired: "",
        employee_activity: "",
        activity_effect_date: "",
        remarks: "",
        department: "",
        manager: "",
        employee_status: "Active", // default maybe
    })

    // Fetch personal info
    const fetchEmployeeDetails = async (token: string) => {
        try {
            const employeeResponse = await axios.get<EmployeeDetails>(
                `${process.env.NEXT_PUBLIC_API_URL}/employee-details/${id}`,
                { headers: { Authorization: `Bearer ${token}` } }
            );
            setEmployee(employeeResponse.data);
        } catch (err) {
            const error = err as AxiosError<{ message: string }>;
            console.error("Fetch error:", error);
            toast.info("No employee details found, please fill out the form");
            // Keep default state
        } finally {
            setLoading(false);
        }
    };

    const handleEmployeeChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const { name, value } = e.target;

        // Convert numbers properly
        const newValue =
            e.target.type === "number" ? (value === "" ? 0 : parseFloat(value)) : value;

        setEmployee((prev) => ({ ...prev, [name]: newValue }));
    };

    const handleEmployeeSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);
        setError(null);

        try {
            const response = await axios.put<EmployeeDetails>(
                `${process.env.NEXT_PUBLIC_API_URL}/employee-details/${id}`,
                { ...employee, user_id: id }, // make sure backend expects this
                { headers: { Authorization: `Bearer ${token}` } }
            );

            toast.success("Employee details updated successfully!");
            setEmployee(response.data);
        } catch (err) {
            const error = err as AxiosError<{ message: string }>;
            console.error("Error:", error);
            const errorMessage =
                error.response?.data?.message || error.message || "Failed to update info.";
            setError(errorMessage);
            toast.error(errorMessage);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        if (token) {
            fetchEmployeeDetails(token);
        }
    }, [token]);

    return (
        <Card className="glass-effect">
            <CardHeader>
                <div className="flex items-center gap-3">
                    <Briefcase className="h-5 w-5 text-primary" />
                    <div>
                        <CardTitle>Employee Information</CardTitle>
                        <CardDescription>
                            Manage employment details, compensation, and work-related information
                        </CardDescription>
                    </div>
                </div>
            </CardHeader>
            <CardContent>
                <form onSubmit={handleEmployeeSubmit} className="space-y-6">
                    {/* Employment Status & Position */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div className="space-y-2">
                            <Label htmlFor="employee_status">Employee Status</Label>
                            <Input
                                id="employee_status"
                                name="employee_status"
                                placeholder="Active / Inactive"
                                value={employee.employee_status || ""}
                                onChange={handleEmployeeChange}
                                className="bg-muted/50"
                            />
                        </div>
                        <div className="space-y-2">
                            <Label htmlFor="position">Position</Label>
                            <Input
                                id="position"
                                name="position"
                                placeholder="Manager, Developer"
                                value={employee.position || ""}
                                onChange={handleEmployeeChange}
                                className="bg-muted/50"
                            />
                        </div>
                    </div>

                    {/* Job Level & Payment Method */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div className="space-y-2">
                            <Label htmlFor="job_level">Job Level</Label>
                            <Input
                                id="job_level"
                                name="job_level"
                                placeholder="Junior / Mid / Senior"
                                value={employee.job_level || ""}
                                onChange={handleEmployeeChange}
                                className="bg-muted/50"
                            />
                        </div>
                        <div className="space-y-2">
                            <Label htmlFor="payment_method">Payment Method</Label>
                            <Input
                                id="payment_method"
                                name="payment_method"
                                placeholder="Bank Transfer / Cash"
                                value={employee.payment_method || ""}
                                onChange={handleEmployeeChange}
                                className="bg-muted/50"
                            />
                        </div>
                    </div>

                    {/* Pay Computation & Salary Type */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div className="space-y-2">
                            <Label htmlFor="pay_computation">Pay Computation</Label>
                            <Input
                                id="pay_computation"
                                name="pay_computation"
                                placeholder="Hourly / Monthly"
                                value={employee.pay_computation || ""}
                                onChange={handleEmployeeChange}
                                className="bg-muted/50"
                            />
                        </div>
                        <div className="space-y-2">
                            <Label htmlFor="salary_type">Salary Type</Label>
                            <Input
                                id="salary_type"
                                name="salary_type"
                                placeholder="Fixed / Variable"
                                value={employee.salary_type || ""}
                                onChange={handleEmployeeChange}
                                className="bg-muted/50"
                            />
                        </div>
                    </div>

                    {/* Basic Pay & Allowance */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div className="space-y-2">
                            <Label htmlFor="basic_pay">Basic Pay</Label>
                            <Input
                                id="basic_pay"
                                name="basic_pay"
                                type="number"
                                step="0.01"
                                placeholder="50000"
                                value={employee.basic_pay || ""}
                                onChange={handleEmployeeChange}
                                className="bg-muted/50"
                            />
                        </div>
                        <div className="space-y-2">
                            <Label htmlFor="allowance">Allowance</Label>
                            <Input
                                id="allowance"
                                name="allowance"
                                type="number"
                                step="0.01"
                                placeholder="5000"
                                value={employee.allowance || ""}
                                onChange={handleEmployeeChange}
                                className="bg-muted/50"
                            />
                        </div>
                    </div>

                    {/* Gross & Bank Number */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div className="space-y-2">
                            <Label htmlFor="gross">Gross</Label>
                            <Input
                                id="gross"
                                name="gross"
                                type="number"
                                step="0.01"
                                placeholder="55000"
                                value={employee.gross || ""}
                                onChange={handleEmployeeChange}
                                className="bg-muted/50"
                            />
                        </div>
                        <div className="space-y-2">
                            <Label htmlFor="bank_number">Bank Number</Label>
                            <Input
                                id="bank_number"
                                name="bank_number"
                                placeholder="1234-5678-90"
                                value={employee.bank_number || ""}
                                onChange={handleEmployeeChange}
                                className="bg-muted/50"
                            />
                        </div>
                    </div>

                    {/* Salary Grade & Date Hired */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div className="space-y-2">
                            <Label htmlFor="salary_grade">Salary Grade</Label>
                            <Input
                                id="salary_grade"
                                name="salary_grade"
                                placeholder="SG-15"
                                value={employee.salary_grade || ""}
                                onChange={handleEmployeeChange}
                                className="bg-muted/50"
                            />
                        </div>
                        <div className="space-y-2">
                            <Label htmlFor="date_hired">Date Hired</Label>
                            <Input
                                id="date_hired"
                                name="date_hired"
                                type="date"
                                value={employee.date_hired || ""}
                                onChange={handleEmployeeChange}
                                className="bg-muted/50"
                            />
                        </div>
                    </div>

                    {/* Employee Activity & Activity Effect Date */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div className="space-y-2">
                            <Label htmlFor="employee_activity">Employee Activity</Label>
                            <Input
                                id="employee_activity"
                                name="employee_activity"
                                placeholder="Onboarding / Training"
                                value={employee.employee_activity || ""}
                                onChange={handleEmployeeChange}
                                className="bg-muted/50"
                            />
                        </div>
                        <div className="space-y-2">
                            <Label htmlFor="activity_effect_date">Activity Effect Date</Label>
                            <Input
                                id="activity_effect_date"
                                name="activity_effect_date"
                                type="date"
                                value={employee.activity_effect_date || ""}
                                onChange={handleEmployeeChange}
                                className="bg-muted/50"
                            />
                        </div>
                    </div>

                    {/* Department & Manager */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div className="space-y-2">
                            <Label htmlFor="department">Department</Label>
                            <Input
                                id="department"
                                name="department"
                                placeholder="HR / IT / Finance"
                                value={employee.department || ""}
                                onChange={handleEmployeeChange}
                                className="bg-muted/50"
                            />
                        </div>
                        <div className="space-y-2">
                            <Label htmlFor="manager">Manager</Label>
                            <Input
                                id="manager"
                                name="manager"
                                placeholder="John Smith"
                                value={employee.manager || ""}
                                onChange={handleEmployeeChange}
                                className="bg-muted/50"
                            />
                        </div>
                    </div>

                    {/* Remarks */}
                    <div className="space-y-2">
                        <Label htmlFor="remarks">Remarks</Label>
                        <Textarea
                            id="remarks"
                            name="remarks"
                            placeholder="Optional notes"
                            className="bg-muted/50"
                        />
                    </div>

                    {/* Action Button */}
                    <div className="flex justify-between items-center pt-4">
                        <p className="text-sm text-muted-foreground">Last updated: May 9, 2024</p>
                        <Button
                            type="submit"
                            className="gradient-bg text-white hover:opacity-90 transition-opacity"
                            disabled={loading}
                        >
                            <Save className="mr-2 h-4 w-4" />
                            {loading ? "Saving..." : "Save Employee Information"}
                        </Button>
                    </div>
                </form>
            </CardContent>
        </Card>
    );

}