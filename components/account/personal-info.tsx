import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import axios, { AxiosError } from "axios";
import { Lock, Camera, IdCard, Mail, Save, User } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useEffect, useState } from "react";
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar";

// Interface aligned with backend schema
interface PersonalInfo {
    id: number;
    active: boolean;
    birth_date: string;
    address?: string;
    phone_number?: string;
    emergency_contact_person?: string;
    emergency_contact_number?: string;
    user_id: string;
}

export function PersonalInfo({ id, token }: { id: number, token: string | null }) {
    const [loading, setLoading] = useState<boolean>(false);
    const [error, setError] = useState<string | null>(null);
    const [personalInfo, setPersonalInfo] = useState<PersonalInfo>({
        id: 0,
        active: true,
        birth_date: "",
        address: "",
        phone_number: "",
        emergency_contact_person: "",
        emergency_contact_number: "",
        user_id: "",
    });
    // Fetch personal info
    const fetchPersonalInfo = async (token: string) => {
        try {
            const personalResponse = await axios.get<PersonalInfo>(
                `${process.env.NEXT_PUBLIC_API_URL}/personal-info/${id}`,
                { headers: { Authorization: `Bearer ${token}` } }
            );
            setPersonalInfo(personalResponse.data);
        } catch (err) {
            const error = err as AxiosError<{ message: string }>;
            console.error("Fetch error:", error);
            toast.info("No personal info found, please fill out the form");
            // Keep default state
        } finally {
            setLoading(false);
        }
    };

    const handlePersonalChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const { name, value } = e.target;
        setPersonalInfo((prev) => ({ ...prev, [name]: value }));
    };

    // Handle form submission
    const handlePersonalInfoSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);
        setError(null);

        if (!personalInfo.birth_date) {
            setError("Birth date is required.");
            toast.error("Birth date is required.");
            setLoading(false);
            return;
        }

        try {
            const response = await axios.put<PersonalInfo>(
                `${process.env.NEXT_PUBLIC_API_URL}/personal-info/${id}`,
                { ...personalInfo, user_id: id },
                { headers: { Authorization: `Bearer ${token}` } }
            );

            toast.success("Personal info updated successfully!");
            setPersonalInfo(response.data);
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
            fetchPersonalInfo(token);
        }
    }, [token]);

    return (
        <Card className="glass-effect">
            <CardHeader>
                <div className="flex items-center gap-3">
                    <User className="h-5 w-5 text-primary" />
                    <div>
                        <CardTitle>Personal Information</CardTitle>
                        <CardDescription>Manage your personal details and emergency contacts</CardDescription>
                    </div>
                </div>
            </CardHeader>
            <CardContent className="space-y-6">
                <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                        <Label htmlFor="birth_date">Date of Birth</Label>
                        <Input
                            id="birth_date"
                            name="birth_date"
                            type="date"
                            placeholder="1990-01-15"
                            value={personalInfo.birth_date}
                            onChange={handlePersonalChange}
                            className="bg-muted/50"
                            required
                        />
                    </div>
                    <div className="space-y-2">
                        <Label htmlFor="address">Address</Label>
                        <Input
                            id="address"
                            name="address"
                            placeholder="123 Main St, City, State 12345"
                            value={personalInfo.address || ""}
                            onChange={handlePersonalChange}
                            className="bg-muted/50"
                        />
                    </div>
                </div>
                <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                        <Label htmlFor="phone_number">Phone Number</Label>
                        <Input
                            id="phone_number"
                            name="phone_number"
                            placeholder="+1 (555) 123-4567"
                            value={personalInfo.phone_number || ""}
                            onChange={handlePersonalChange}
                            className="bg-muted/50"
                        />
                    </div>
                    <div className="space-y-2">
                        <Label htmlFor="emergency_contact_person">Emergency Contact Person</Label>
                        <Input
                            id="emergency_contact_person"
                            name="emergency_contact_person"
                            placeholder="Jane Doe"
                            value={personalInfo.emergency_contact_person || ""}
                            onChange={handlePersonalChange}
                            className="bg-muted/50"
                        />
                    </div>
                </div>
                <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                        <Label htmlFor="emergency_contact_number">Emergency Contact Number</Label>
                        <Input
                            id="emergency_contact_number"
                            name="emergency_contact_number"
                            placeholder="+64 9876543210"
                            value={personalInfo.emergency_contact_number || ""}
                            onChange={handlePersonalChange}
                            className="bg-muted/50"
                        />
                    </div>
                    <div className="space-y-2">
                        <Label htmlFor="active">Active Status</Label>
                        <Input
                            id="active"
                            name="active"
                            placeholder="Active"
                            value={personalInfo.active ? "Yes" : "No"}
                            disabled
                            className="bg-muted/30"
                        />
                    </div>
                </div>

                {/* Action Buttons */}
                <div className="flex justify-between items-center pt-4">
                    <p className="text-sm text-muted-foreground">Last updated: May 9, 2024</p>
                    <Button
                        type="submit"
                        className="gradient-bg text-white hover:opacity-90 transition-opacity"
                        disabled={loading}
                    >
                        <Save className="mr-2 h-4 w-4" />
                        {loading ? "Saving..." : "Save Personal Information"}
                    </Button>
                </div>
            </CardContent>
        </Card>
    );
}