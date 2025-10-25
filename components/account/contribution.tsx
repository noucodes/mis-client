import { Label } from "@/components/ui/label";
import { Card, CardHeader, CardTitle, CardContent, CardDescription } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "../ui/button";
import { Award, Save } from "lucide-react";
import { useState } from "react";

export function Contribution({ id, token }: { id: number, token: string | null }) {
    const [loading, setLoading] = useState<boolean>(false);
    const [error, setError] = useState<string | null>(null);

    return (
        <Card className="glass-effect">
            <CardHeader>
                <div className="flex items-center gap-3">
                    <Award className="h-5 w-5 text-primary" />
                    <div>
                        <CardTitle>Contribution & Benefits</CardTitle>
                        <CardDescription>
                            Manage your retirement contributions, benefits, and compensation details
                        </CardDescription>
                    </div>
                </div>
            </CardHeader>
            <CardContent className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="space-y-2">
                        <Label htmlFor="retirement401k">401(k) Contribution</Label>
                        <Input id="retirement401k" defaultValue="6%" className="bg-muted/50" />
                    </div>
                    <div className="space-y-2">
                        <Label htmlFor="healthInsurance">Health Insurance Plan</Label>
                        <Input id="healthInsurance" defaultValue="Premium Plan" className="bg-muted/50" />
                    </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="space-y-2">
                        <Label htmlFor="vacationDays">Vacation Days Remaining</Label>
                        <Input
                            id="vacationDays"
                            defaultValue="15 days"
                            readOnly
                            className="bg-muted/30 cursor-not-allowed"
                        />
                    </div>
                    <div className="space-y-2">
                        <Label htmlFor="sickDays">Sick Days Remaining</Label>
                        <Input
                            id="sickDays"
                            defaultValue="8 days"
                            readOnly
                            className="bg-muted/30 cursor-not-allowed"
                        />
                    </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="space-y-2">
                        <Label htmlFor="stockOptions">Stock Options</Label>
                        <Input
                            id="stockOptions"
                            defaultValue="1,000 shares vested"
                            readOnly
                            className="bg-muted/30 cursor-not-allowed"
                        />
                    </div>
                    <div className="space-y-2">
                        <Label htmlFor="performanceBonus">Performance Bonus (YTD)</Label>
                        <Input
                            id="performanceBonus"
                            defaultValue="$5,000"
                            readOnly
                            className="bg-muted/30 cursor-not-allowed"
                        />
                    </div>
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
                        {loading ? "Saving..." : "Save Personal Information"}
                    </Button>
                </div>
            </CardContent>
        </Card>
    );

}