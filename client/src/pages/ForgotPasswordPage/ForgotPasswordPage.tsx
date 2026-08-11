import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { useNavigate, Link, useSearchParams } from 'react-router-dom';
import { Eye, EyeOff, Phone, Lock, KeyRound, CheckCircle2 } from 'lucide-react';

import { Button } from '@client/src/components/ui/button';
import {
  Form, FormControl, FormField, FormItem, FormLabel, FormMessage,
} from '@client/src/components/ui/form';
import { Input } from '@client/src/components/ui/input';
import { Card, CardContent, CardHeader } from '@client/src/components/ui/card';
import { authApi } from '@client/src/api';

const forgotPasswordSchema = z.object({
  username: z.string().min(1, '请输入账号'),
  newPassword: z.string().min(6, '密码至少6位'),
  confirmPassword: z.string().min(6, '请再次输入密码'),
}).refine(data => data.newPassword === data.confirmPassword, {
  message: '两次输入的密码不一致',
  path: ['confirmPassword'],
});

type ForgotPasswordFormData = z.infer<typeof forgotPasswordSchema>;

const ForgotPasswordPage = () => {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const isAdmin = searchParams.get('type') === 'admin';

  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');
  const [success, setSuccess] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  const form = useForm<ForgotPasswordFormData>({
    resolver: zodResolver(forgotPasswordSchema),
    defaultValues: { username: '', newPassword: '', confirmPassword: '' },
  });

  const onSubmit = async (data: ForgotPasswordFormData) => {
    setSubmitting(true);
    setErrorMsg('');
    try {
      await authApi.resetPassword({
        username: data.username,
        newPassword: data.newPassword,
      });
      setSuccess(true);
      setTimeout(() => {
        navigate(isAdmin ? '/admin/login' : '/login', { replace: true });
      }, 2000);
    } catch (error: any) {
      const message = error?.response?.data?.message || error?.message || '重置失败，请重试';
      setErrorMsg(message);
    } finally {
      setSubmitting(false);
    }
  };

  if (success) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center p-4">
        <Card className="w-full max-w-sm shadow-lg">
          <CardContent className="pt-8 pb-8 text-center">
            <CheckCircle2 className="size-16 text-green-500 mx-auto mb-4" />
            <h2 className="text-lg font-bold text-foreground mb-2">密码重置成功</h2>
            <p className="text-muted-foreground text-sm">
              2秒后自动跳转到登录页...
            </p>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background flex items-center justify-center p-4">
      <Card className="w-full max-w-sm shadow-lg">
        <CardHeader className="text-center pb-2">
          <div className="inline-flex items-center justify-center w-12 h-12 rounded-xl bg-primary/10 mb-3">
            <KeyRound className="size-6 text-primary" />
          </div>
          <h1 className="text-xl font-bold text-foreground">重置密码</h1>
          <p className="text-muted-foreground text-sm mt-1">
            {isAdmin ? '管理员密码重置' : '员工密码重置'}
          </p>
        </CardHeader>
        <CardContent className="pt-4">
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
              <FormField
                control={form.control} name="username"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>{isAdmin ? '管理员账号' : '账号（手机号）'}</FormLabel>
                    <FormControl>
                      <div className="relative">
                        {isAdmin ? (
                          <Lock className="absolute left-3 top-1/2 -translate-y-1/2 size-4 text-muted-foreground" />
                        ) : (
                          <Phone className="absolute left-3 top-1/2 -translate-y-1/2 size-4 text-muted-foreground" />
                        )}
                        <Input
                          placeholder={isAdmin ? '请输入管理员账号' : '请输入注册手机号'}
                          className="pl-9"
                          maxLength={isAdmin ? undefined : 11}
                          autoFocus
                          {...field}
                        />
                      </div>
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control} name="newPassword"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>新密码</FormLabel>
                    <FormControl>
                      <div className="relative">
                        <Lock className="absolute left-3 top-1/2 -translate-y-1/2 size-4 text-muted-foreground" />
                        <Input
                          type={showPassword ? 'text' : 'password'}
                          placeholder="请输入新密码（至少6位）"
                          className="pl-9 pr-10"
                          {...field}
                        />
                        <button
                          type="button"
                          onClick={() => setShowPassword(!showPassword)}
                          className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors"
                          tabIndex={-1}
                        >
                          {showPassword ? <EyeOff className="size-4" /> : <Eye className="size-4" />}
                        </button>
                      </div>
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control} name="confirmPassword"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>确认新密码</FormLabel>
                    <FormControl>
                      <div className="relative">
                        <Lock className="absolute left-3 top-1/2 -translate-y-1/2 size-4 text-muted-foreground" />
                        <Input
                          type={showConfirmPassword ? 'text' : 'password'}
                          placeholder="请再次输入新密码"
                          className="pl-9 pr-10"
                          {...field}
                        />
                        <button
                          type="button"
                          onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                          className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors"
                          tabIndex={-1}
                        >
                          {showConfirmPassword ? <EyeOff className="size-4" /> : <Eye className="size-4" />}
                        </button>
                      </div>
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              {errorMsg && (
                <p className="text-sm text-destructive text-center">{errorMsg}</p>
              )}

              <Button type="submit" className="w-full" disabled={submitting}>
                {submitting ? '提交中...' : '重置密码'}
              </Button>

              <div className="text-center text-sm">
                <Link
                  to={isAdmin ? '/admin/login' : '/login'}
                  className="text-primary hover:underline"
                >
                  返回登录
                </Link>
              </div>
            </form>
          </Form>
        </CardContent>
      </Card>
    </div>
  );
};

export default ForgotPasswordPage;
