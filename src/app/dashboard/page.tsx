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
    const isUrdu = language === 'ur';

    return (
        <div className="flex min-h-screen items-center justify-center bg-background p-4">
            <Card className="w-full max-w-md shadow-2xl">
                <CardHeader className="text-center space-y-4">
                    <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-green-100">
                        <CheckCircle className="h-10 w-10 text-green-600" />
                    </div>
                    <div className="space-y-2">
                        <CardTitle className={`text-3xl font-bold ${isUrdu ? 'font-urdu' : ''}`} dir={isUrdu ? 'rtl' : 'ltr'}>{t.dashboard}</CardTitle>
                        <CardDescription className={`${isUrdu ? 'font-urdu leading-relaxed' : ''}`} dir={isUrdu ? 'rtl' : 'ltr'}>{t.formSteps.complete.description_account_created}</CardDescription>
                    </div>
                </CardHeader>
                <CardContent className="space-y-6">
                    <div className="rounded-lg border bg-card p-4 text-center space-y-3">
                        <User className="mx-auto h-10 w-10 text-primary" />
                        <div className="space-y-1">
                            <p className={`text-lg font-semibold text-foreground ${isUrdu ? 'font-urdu' : ''}`} dir={isUrdu ? 'rtl' : 'ltr'}>{formData.name}</p>
                            <p className={`text-sm text-muted-foreground ${isUrdu ? 'font-urdu' : ''}`}>{formData.cnic}</p>
                            <p className={`text-sm text-muted-foreground ${isUrdu ? 'font-urdu' : ''}`}>{formData.dob}</p>
                        </div>
                    </div>
                    <Button asChild className={`w-full bg-accent hover:bg-accent/90 text-accent-foreground ${isUrdu ? 'font-urdu' : ''}`}>
                        <Link href="/">{t.logout}</Link>
                    </Button>
                </CardContent>
            </Card>
        </div>
    );
}
