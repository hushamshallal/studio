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
  import { Label } from '@/components/ui/label';
  import Link from 'next/link';
  
  function GoogleIcon(props: React.SVGProps<SVGSVGElement>) {
      return (
        <svg viewBox="0 0 48 48" {...props}><path fill="#FFC107" d="M43.611 20.083H42V20H24v8h11.303c-1.649 4.657-6.08 8-11.303 8c-6.627 0-12-5.373-12-12s5.373-12 12-12c3.059 0 5.842 1.154 7.961 3.039l5.657-5.657C34.046 6.053 29.268 4 24 4C12.955 4 4 12.955 4 24s8.955 20 20 20s20-8.955 20-20c0-1.341-.138-2.65-.389-3.917z"></path><path fill="#FF3D00" d="m6.306 14.691l6.571 4.819C14.655 15.108 18.961 12 24 12c3.059 0 5.842 1.154 7.961 3.039l5.657-5.657C34.046 6.053 29.268 4 24 4C16.318 4 9.656 8.337 6.306 14.691z"></path><path fill="#4CAF50" d="M24 44c5.166 0 9.86-1.977 13.409-5.192l-6.19-5.238A8 8 0 0 1 24 36c-5.225 0-9.554-3.944-11.303-9H6.306C9.656 39.663 16.318 44 24 44z"></path><path fill="#1976D2" d="M43.611 20.083H42V20H24v8h11.303c-.792 2.237-2.231 4.166-4.087 5.571l6.19 5.238C42.012 35.853 44 30.138 44 24c0-1.341-.138-2.65-.389-3.917z"></path></svg>
      )
  }
  
  export default function SignupPage() {
    return (
      <div className="flex items-center justify-center min-h-screen bg-background p-4">
        <Card className="w-full max-w-md">
          <CardHeader className="text-center">
            <CardTitle className="text-3xl font-headline text-accent">سلام</CardTitle>
            <CardDescription>إنشاء حساب جديد للانضمام للمجتمع</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="fullName">الاسم الكامل</Label>
              <Input id="fullName" type="text" placeholder="الاسم الكامل" required />
            </div>
            <div className="space-y-2">
              <Label htmlFor="username">اسم المستخدم</Label>
              <Input id="username" type="text" placeholder="username" required dir="ltr"/>
              <p className="text-xs text-muted-foreground">أحرف إنجليزية صغيرة، أرقام، و _ فقط.</p>
            </div>
            <div className="space-y-2">
              <Label htmlFor="email">البريد الإلكتروني</Label>
              <Input id="email" type="email" placeholder="user@example.com" required dir="ltr"/>
            </div>
            <div className="space-y-2">
              <Label htmlFor="password">كلمة المرور</Label>
              <Input id="password" type="password" required dir="ltr"/>
            </div>
          </CardContent>
          <CardFooter className="flex flex-col gap-4">
            <Button className="w-full" asChild>
                <Link href="/">إنشاء حساب</Link>
            </Button>
            <Button variant="outline" className="w-full">
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
        </Card>
      </div>
    );
  }
  