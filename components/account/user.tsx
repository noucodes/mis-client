import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar";
import { Label } from "@/components/ui/label";
import { Lock, User, Save, IdCard, Mail } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { useEffect, useState } from "react";
import { toast } from "sonner";
import axios from "axios";

interface UserInfo {
    name: string;
    id: string;
    employeeId: number;
    email: string;
    password: string;
    role: string;
}

export function UserInfo({ id, token }: { id: number, token: string | null }) {
    const [user, setUser] = useState<UserInfo>({
        name: "",
        id: "",
        employeeId: id,
        email: "",
        password: "",
        role: "",
    });
    const [loading, setLoading] = useState<boolean>(false);
    const [error, setError] = useState<string | null>(null);

    const handleUserInfoSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);
        setError(null);
    };

    useEffect(() => {
        const fetchUser = async () => {
            try {
                const token = localStorage.getItem("token");
                if (!token) { return }
                const res = await axios.get(`${process.env.NEXT_PUBLIC_API_URL}/me`, {
                    headers: {
                        Authorization: `bearer ${token}`,
                    },
                });

                setUser(res.data);
            } catch (err) {
                console.error("Failed to fetch user", err);
            }
        };

        fetchUser();
    }, []);
    return (
        <Card className="glass-effect">
            <CardHeader>
                <div className="flex items-center gap-3">
                    <User className="h-5 w-5 text-primary" />
                    <div>
                        <CardTitle>User Information</CardTitle>
                        <CardDescription>Manage your user account credentials and login information</CardDescription>
                    </div>
                </div>
            </CardHeader>
            <CardContent className="space-y-6">
                {error && <p className="text-red-500">{error}</p>}
                <form onSubmit={handleUserInfoSubmit} className="space-y-4">
                    {/* Profile Photo Section */}
                    <div className="flex items-center gap-6">
                        <Avatar className="h-20 w-20">
                            <AvatarImage src="/diverse-user-avatars.png" />
                            <AvatarFallback>JD</AvatarFallback>
                        </Avatar>
                        <div className="space-y-2">
                            <Button variant="outline" size="sm">Change Photo</Button>
                            <p className="text-sm text-muted-foreground">JPG, PNG or GIF. Max size 2MB.</p>
                            <Badge variant="secondary" className="text-xs">
                                Professional headshot recommended
                            </Badge>
                        </div>
                    </div>

                    {/* Form Fields */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div className="space-y-2">
                            <Label htmlFor="name" className="flex items-center gap-2">
                                <User className="h-4 w-4" />
                                Name
                            </Label>
                            <Input id="name" type="name" defaultValue="John Doe" className="bg-muted/50" />
                        </div>
                        <div className="space-y-2">
                            <Label htmlFor="email" className="flex items-center gap-2">
                                <Mail className="h-4 w-4" />
                                Email Address
                            </Label>
                            <Input id="email" type="email" defaultValue="john.doe@company.com" className="bg-muted/50" />
                        </div>
                        <div className="space-y-2">
                            <Label htmlFor="employeeId" className="flex items-center gap-2">
                                <IdCard className="h-4 w-4" />
                                Employee ID
                            </Label>
                            <Input id="employeeId" defaultValue="EMP001234" className="bg-muted/50" />
                        </div>
                        <div className="space-y-2">
                            <Label htmlFor="password" className="flex items-center gap-2">
                                <Lock className="h-4 w-4" />
                                Password
                            </Label>
                            <Input id="password" type="password" placeholder="••••••••" className="bg-muted/50" />
                            <p className="text-xs text-muted-foreground">Leave blank to keep current password</p>
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
                            {loading ? "Saving..." : "Save User Information"}
                        </Button>
                    </div>
                </form>
            </CardContent>
        </Card>
    );
}