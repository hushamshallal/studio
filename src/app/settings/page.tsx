
"use client";

import React, { useEffect, useState } from 'react';
import { useAuth } from '@/context/auth-context';
import { db, auth } from '@/lib/firebase/config';
import { doc, getDoc, setDoc, updateDoc } from 'firebase/firestore';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Switch } from '@/components/ui/switch';
import { Label } from '@/components/ui/label';
import { Skeleton } from '@/components/ui/skeleton';
import { signOut } from 'firebase/auth';
import { useRouter } from 'next/navigation';
import { useToast } from '@/hooks/use-toast';
import { ThemeToggle } from '@/components/theme-toggle';
import { useTheme } from 'next-themes';

type UserSettings = {
    isPrivate?: boolean;
}

const SettingsSkeleton = () => (
    <div className="space-y-8 p-4 md:p-6">
        <Card>
            <CardHeader>
                <Skeleton className="h-6 w-32" />
                <Skeleton className="h-4 w-48" />
            </CardHeader>
            <CardContent className="space-y-4">
                <div className="flex items-center justify-between">
                    <Skeleton className="h-5 w-24" />
                    <Skeleton className="h-6 w-11 rounded-full" />
                </div>
            </CardContent>
        </Card>
        <Card>
            <CardHeader>
                <Skeleton className="h-6 w-24" />
                <Skeleton className="h-4 w-40" />
            </CardHeader>
            <CardContent className="space-y-4">
                <div className="flex items-center justify-between">
                    <Skeleton className="h-5 w-20" />
                    <Skeleton className="h-6 w-11 rounded-full" />
                </div>
            </CardContent>
        </Card>
        <Card>
            <CardHeader>
                <Skeleton className="h-6 w-40" />
            </CardHeader>
            <CardContent>
                <Skeleton className="h-10 w-full" />
            </CardContent>
        </Card>
    </div>
);


export default function SettingsPage() {
    const { user } = useAuth();
    const router = useRouter();
    const { toast } = useToast();
    const { theme } = useTheme();

    const [settings, setSettings] = useState<UserSettings>({});
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        if (!user) return;
        const userDocRef = doc(db, 'users', user.uid);
        getDoc(userDocRef).then((docSnap) => {
            if (docSnap.exists()) {
                setSettings({ isPrivate: docSnap.data().isPrivate || false });
            }
            setLoading(false);
        });
    }, [user]);

    const updateSetting = async (key: keyof UserSettings, value: any) => {
        if (!user) return;
        const userDocRef = doc(db, 'users', user.uid);
        try {
            await updateDoc(userDocRef, { [key]: value });
            setSettings(prev => ({ ...prev, [key]: value }));
            toast({
                title: "تم تحديث الإعدادات",
                description: "تم حفظ تغييراتك بنجاح.",
            })
        } catch (error) {
            console.error("Error updating settings:", error);
            toast({
                variant: 'destructive',
                title: "خطأ",
                description: "لم نتمكن من حفظ التغييرات.",
            })
        }
    };
    
    const handleSignOut = async () => {
        try {
            await signOut(auth);
            router.push('/login');
            toast({
                title: "تم تسجيل الخروج بنجاح"
            });
        } catch(error) {
            toast({
                variant: 'destructive',
                title: 'حدث خطأ أثناء تسجيل الخروج'
            })
        }
    };


    if (loading) {
        return <SettingsSkeleton />;
    }

    return (
        <div className="space-y-8 p-4 md:p-6">
            <Card>
                <CardHeader>
                    <CardTitle>خصوصية الحساب</CardTitle>
                    <CardDescription>تحكم في من يمكنه رؤية منشوراتك ومعلوماتك.</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                    <div className="flex items-center justify-between p-4 rounded-lg border">
                        <div>
                            <Label htmlFor="private-account" className="font-semibold">حساب خاص</Label>
                             <p className="text-sm text-muted-foreground">عند تفعيله، فقط المتابعون الذين توافق عليهم يمكنهم رؤية ما تشاركه.</p>
                        </div>
                        <Switch
                            id="private-account"
                            checked={settings.isPrivate}
                            onCheckedChange={(checked) => updateSetting('isPrivate', checked)}
                        />
                    </div>
                </CardContent>
            </Card>

            <Card>
                <CardHeader>
                    <CardTitle>المظهر</CardTitle>
                    <CardDescription>خصص شكل ومظهر التطبيق.</CardDescription>
                </CardHeader>
                <CardContent>
                     <div className="flex items-center justify-between p-4 rounded-lg border">
                         <Label htmlFor="dark-mode" className="font-semibold">
                           {theme === 'dark' ? 'الوضع الداكن' : 'الوضع النهاري'}
                         </Label>
                        <ThemeToggle />
                    </div>
                </CardContent>
            </Card>
            
            <Card>
                <CardHeader>
                    <CardTitle>المستخدمون المحظورون</CardTitle>
                    <CardDescription>إدارة قائمة المستخدمين الذين قمت بحظرهم.</CardDescription>
                </CardHeader>
                <CardContent>
                    <p className="text-muted-foreground text-center py-4">لا يوجد مستخدمون محظورون حاليًا.</p>
                </CardContent>
            </Card>

             <Card>
                <CardHeader>
                    <CardTitle>الحساب</CardTitle>
                </CardHeader>
                <CardContent>
                    <Button variant="destructive" className="w-full" onClick={handleSignOut}>
                        تسجيل الخروج
                    </Button>
                </CardContent>
            </Card>
        </div>
    );
}
