import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { useNavigate, Link } from 'react-router-dom';
import { Eye, EyeOff, Phone, User, Lock, UserPlus } from 'lucide-react';

import { Button } from '@client/src/components/ui/button';
import {
  Form, FormControl, FormField, FormItem, FormLabel, FormMessage,
} from '@client/src/components/ui/form';
import { Input } from '@client/src/components/ui/input';
import { Card, CardContent, CardHeader } from '@client/src/components/ui/card';
import { authApi } from '@client/src/api';

const registerSchema = z.object({
  username: z.string().regex(/^1[3-9]\d{9}$/, '请输入正确的手机号'),
  realName: z.string().min(1, '请输入用户名'),
  password: z.string().min(6, '密码至少6个字符'),
  confirmPassword: z.string().min(1, '请确认密码'),
}).refine((data) => data.password === data.confirmPassword, {
  message: '两次密码不一致',
  path: ['confirmPassword'],
});

type RegisterFormData = z.infer<typeof registerSchema>;

const RegisterPage = () => {
  const navigate = useNavigate();
  const [showPassword, setShowPassword] = useState(false);
  const [registerError, setRegisterError] = useState('');
  const [registering, setRegistering] = useState(false);

  const form = useForm<RegisterFormData>({
    resolver: zodResolver(registerSchema),
    defaultValues: { username: '', realName: '', password: '', confirmPassword: '' },
  });

  const onSubmit = async (data: RegisterFormData) => {
    setRegistering(true);
    setRegisterError('');
    try {
      const result = await authApi.register({
        username: data.username,
        realName: data.realName,
        password: data.password,
      });
      if (result.success && authApi.isLoggedIn()) {
        navigate('/my-customers', { replace: true });
        return;
      }
      setRegisterError('注册失败，请重试');
    } catch (error: any) {
      const message = error?.response?.data?.message || error?.message || '注册失败，请稍后重试';
      setRegisterError(message);
    } finally {
      setRegistering(false);
    }
  };

  return (
    <div className="min-h-screen bg-background flex items-center justify-center p-4">
      <Card className="w-full max-w-sm shadow-lg">
        <CardHeader className="text-center pb-2">
          <div className="inline-flex items-center justify-center w-12 h-12 rounded-xl bg-primary/10 mb-3">
            <UserPlus className="size-6 text-primary" />
          </div>
          <h1 className="text-xl font-bold text-foreground">注册账号</h1>
          <p className="text-muted-foreground text-sm mt-1">创建员工账号</p>
        </CardHeader>
        <CardContent className="pt-4">
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
              <FormField
                control={form.control} name="username"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>账号（手机号）</FormLabel>
                    <FormControl>
                      <div className="relative">
                        <Phone className="absolute left-3 top-1/2 -translate-y-1/2 size-4 text-muted-foreground" />
                        <Input placeholder="请输入手机号" className="pl-9" maxLength={11} autoFocus {...field} />
                      </div>
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control} name="realName"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>用户名</FormLabel>
                    <FormControl>
                      <div className="relative">
                        <User className="absolute left-3 top-1/2 -translate-y-1/2 size-4 text-muted-foreground" />
                        <Input placeholder="请输入您的姓名" className="pl-9" {...field} />
                      </div>
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control} name="password"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>密码</FormLabel>
                    <FormControl>
                      <div className="relative">
                        <Lock className="absolute left-3 top-1/2 -translate-y-1/2 size-4 text-muted-foreground" />
                        <Input
                          type={showPassword ? 'text' : 'password'}
                          placeholder="至少6个字符"
                          className="pl-9 pr-10"
                          {...field}
                        />
                        <button
                          type="button"
                          onClick={() => setShowPassword(!showPassword)}
                          className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
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
                    <FormLabel>确认密码</FormLabel>
                    <FormControl>
                      <div className="relative">
                        <Lock className="absolute left-3 top-1/2 -translate-y-1/2 size-4 text-muted-foreground" />
                        <Input
                          type={showPassword ? 'text' : 'password'}
                          placeholder="再次输入密码"
                          className="pl-9"
                          {...field}
                        />
                      </div>
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              {registerError && (
                <p className="text-sm text-destructive text-center">{registerError}</p>
              )}

              <Button type="submit" className="w-full" disabled={registering}>
                {registering ? '注册中...' : '注册'}
              </Button>

              <p className="text-sm text-center text-muted-foreground">
                已有账号？{' '}
                <Link to="/login" className="text-primary hover:underline">
                  返回登录
                </Link>
              </p>
            </form>
          </Form>
        </CardContent>
      </Card>
    </div>
  );
};

export default RegisterPage;
