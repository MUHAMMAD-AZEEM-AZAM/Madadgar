"use client";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { useAppContext } from "@/contexts/AppContext";
import { translations } from "@/lib/translations";
import { CheckCircle, User } from "lucide-react";
import Link from "next/link";

export default function DashboardPage() {
    const { state } = useAppContext();
    const { language, formData } = state;
    const t = translations[language];

    return (
        <div className="flex min-h-screen items-center justify-center bg-background p-4">
            <Card className="w-full max-w-md shadow-2xl">
                <CardHeader className="text-center">
                    <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-green-100">
                        <CheckCircle className="h-10 w-10 text-green-600" />
                    </div>
                    <CardTitle className="text-3xl font-bold">{t.dashboard}</CardTitle>
                    <CardDescription>{t.formSteps.complete.description_account_created}</CardDescription>
                </CardHeader>
                <CardContent className="space-y-6">
                    <div className="rounded-lg border bg-card p-4 text-center">
                        <User className="mx-auto mb-2 h-10 w-10 text-primary" />
                        <p className="text-lg font-semibold text-foreground">{formData.name}</p>
                        <p className="text-sm text-muted-foreground">{formData.cnic}</p>
                        <p className="text-sm text-muted-foreground">{formData.dob}</p>
                    </div>
                    <Button asChild className="w-full bg-accent hover:bg-accent/90 text-accent-foreground">
                        <Link href="/">{t.logout}</Link>
                    </Button>
                </CardContent>
            </Card>
        </div>
    );
}
