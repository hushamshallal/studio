"use client";

import {
    Card,
    CardContent,
    CardDescription,
    CardFooter,
    CardHeader,
    CardTitle,
  } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import Link from 'next/link';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { useToast } from '@/hooks/use-toast';
import { useRouter } from 'next/navigation';
import { auth, db } from '@/lib/firebase/config';
import { createUserWithEmailAndPassword, updateProfile } from 'firebase/auth';
import { doc, setDoc } from 'firebase/firestore';
import React from 'react';

function GoogleIcon(props: React.SVGProps<SVGSVGElement>) {
    return (
      <svg viewBox="0 0 48 48" {...props}><path fill="#FFC107" d="M43.611 20.083H42V20H24v8h11.303c-1.649 4.657-6.08 8-11.303 8c-6.627 0-12-5.373-12-12s5.373-12 12-12c3.059 0 5.842 1.154 7.961 3.039l5.657-5.657C34.046 6.053 29.268 4 24 4C12.955 4 4 12.955 4 24s8.955 20 20 20s20-8.955 20-20c0-1.341-.138-2.65-.389-3.917z"></path><path fill="#FF3D00" d="m6.306 14.691l6.571 4.819C14.655 15.108 18.961 12 24 12c3.059 0 5.842 1.154 7.961 3.039l5.657-5.657C34.046 6.053 29.268 4 24 4C16.318 4 9.656 8.337 6.306 14.691z"></path><path fill="#4CAF50" d="M24 44c5.166 0 9.86-1.977 13.409-5.192l-6.19-5.238A8 8 0 0 1 24 36c-5.225 0-9.554-3.944-11.303-9H6.306C9.656 39.663 16.318 44 24 44z"></path><path fill="#1976D2" d="M43.611 20.083H42V20H24v8h11.303c-.792 2.237-2.231 4.166-4.087 5.571l6.19 5.238C42.012 35.853 44 30.138 44 24c0-1.341-.138-2.65-.389-3.917z"></path></svg>
    )
}

const formSchema = z.object({
    fullName: z.string().min(2, { message: 'الرجاء إدخال اسم صحيح.' }),
    username: z.string().min(3, { message: 'يجب أن يكون اسم المستخدم 3 أحرف على الأقل.' }).regex(/^[a-z0-9_]+$/, { message: 'أحرف إنجليزية صغيرة، أرقام، و _ فقط.' }),
    email: z.string().email({ message: 'الرجاء إدخال بريد إلكتروني صحيح.' }),
    password: z.string().min(6, { message: 'يجب أن تكون كلمة المرور 6 أحرف على الأقل.' }),
});

export default function SignupPage() {
    const { toast } = useToast();
    const router = useRouter();
    const [isLoading, setIsLoading] = React.useState(false);

    const form = useForm<z.infer<typeof formSchema>>({
        resolver: zodResolver(formSchema),
        defaultValues: {
            fullName: '',
            username: '',
            email: '',
            password: '',
        },
    });

    async function onSubmit(values: z.infer<typeof formSchema>) {
        setIsLoading(true);
        try {
            const userCredential = await createUserWithEmailAndPassword(auth, values.email, values.password);
            const user = userCredential.user;

            await updateProfile(user, {
                displayName: values.fullName,
            });

            await setDoc(doc(db, "users", user.uid), {
                uid: user.uid,
                displayName: values.fullName,
                email: values.email,
                username: values.username,
                photoURL: `https://picsum.photos/seed/${user.uid}/100/100`,
                createdAt: new Date(),
            });

            toast({
                title: "تم إنشاء الحساب بنجاح",
                description: "مرحباً بك في سلام! تم توجيهك للصفحة الرئيسية.",
            });

            router.push('/');

        } catch (error: any) {
            console.error(error);
            let description = "حدث خطأ غير متوقع. الرجاء المحاولة مرة أخرى.";
            if (error.code === 'auth/email-already-in-use') {
                description = "هذا البريد الإلكتروني مستخدم بالفعل.";
            }
            toast({
                variant: "destructive",
                title: "خطأ في إنشاء الحساب",
                description,
            });
        } finally {
            setIsLoading(false);
        }
    }

    return (
      <div className="flex items-center justify-center min-h-screen bg-background p-4">
        <Card className="w-full max-w-md">
          <CardHeader className="text-center">
            <CardTitle className="text-3xl font-headline text-accent">سلام</CardTitle>
            <CardDescription>إنشاء حساب جديد للانضمام للمجتمع</CardDescription>
          </CardHeader>
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)}>
                <CardContent className="space-y-4">
                    <FormField
                        control={form.control}
                        name="fullName"
                        render={({ field }) => (
                            <FormItem>
                                <FormLabel>الاسم الكامل</FormLabel>
                                <FormControl>
                                    <Input placeholder="الاسم الكامل" required {...field} />
                                </FormControl>
                                <FormMessage />
                            </FormItem>
                        )}
                    />
                    <FormField
                        control={form.control}
                        name="username"
                        render={({ field }) => (
                            <FormItem>
                                <FormLabel>اسم المستخدم</FormLabel>
                                <FormControl>
                                    <Input placeholder="username" required dir="ltr" {...field} />
                                </FormControl>
                                <p className="text-xs text-muted-foreground">أحرف إنجليزية صغيرة، أرقام، و _ فقط.</p>
                                <FormMessage />
                            </FormItem>
                        )}
                    />
                    <FormField
                        control={form.control}
                        name="email"
                        render={({ field }) => (
                            <FormItem>
                                <FormLabel>البريد الإلكتروني</FormLabel>
                                <FormControl>
                                    <Input type="email" placeholder="user@example.com" required dir="ltr" {...field} />
                                </FormControl>
                                <FormMessage />
                            </FormItem>
                        )}
                    />
                    <FormField
                        control={form.control}
                        name="password"
                        render={({ field }) => (
                            <FormItem>
                                <FormLabel>كلمة المرور</FormLabel>
                                <FormControl>
                                    <Input type="password" required dir="ltr" {...field} />
                                </FormControl>
                                <FormMessage />
                            </FormItem>
                        )}
                    />
                </CardContent>
                <CardFooter className="flex flex-col gap-4">
                    <Button className="w-full" type="submit" disabled={isLoading}>
                        {isLoading ? 'جارِ إنشاء الحساب...' : 'إنشاء حساب'}
                    </Button>
                    <Button variant="outline" className="w-full" type="button" disabled={isLoading}>
                    <GoogleIcon className="ml-2 h-4 w-4" />
                    المتابعة باستخدام جوجل
                    </Button>
                    <div className="text-center text-sm">
                    لديك حساب بالفعل؟{' '}
                    <Link href="/login" className="underline font-medium">
                        تسجيل الدخول
                    </Link>
                    </div>
                </CardFooter>
            </form>
          </Form>
        </Card>
      </div>
    );
}
