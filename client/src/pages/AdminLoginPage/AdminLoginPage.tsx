import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { useNavigate, Link } from 'react-router-dom';
import { Eye, EyeOff, User, Lock, Shield } from 'lucide-react';

import { Button } from '@client/src/components/ui/button';
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@client/src/components/ui/form';
import { Input } from '@client/src/components/ui/input';
import { Card, CardContent, CardHeader } from '@client/src/components/ui/card';
import { authApi } from '@client/src/api';

const loginSchema = z.object({
  username: z.string().min(1, '请输入用户名'),
  password: z.string().min(1, '请输入密码'),
});

type LoginFormData = z.infer<typeof loginSchema>;

const AdminLoginPage = () => {
  const navigate = useNavigate();
  const [showPassword, setShowPassword] = useState(false);
  const [loginError, setLoginError] = useState('');
  const [loggingIn, setLoggingIn] = useState(false);

  const form = useForm<LoginFormData>({
    resolver: zodResolver(loginSchema),
    defaultValues: { username: 'admin', password: '' },
  });

  const onSubmit = async (data: LoginFormData) => {
    setLoggingIn(true);
    setLoginError('');
    try {
      const result = await authApi.login({ username: data.username, password: data.password });
      if (result.success) {
        if (result.user.role === 'admin') {
          navigate('/admin', { replace: true });
          return;
        } else {
          setLoginError('该账号不是管理员');
          authApi.logout();
        }
      } else {
        setLoginError('登录失败，请重试');
      }
    } catch (error: any) {
      const message = error?.response?.data?.message || error?.message || '登录失败';
      setLoginError(message);
    } finally {
      setLoggingIn(false);
    }
  };

  return (
    <div className="min-h-screen bg-background flex items-center justify-center p-4">
      <Card className="w-full max-w-sm shadow-lg">
        <CardHeader className="text-center pb-2">
          <div className="inline-flex items-center justify-center w-12 h-12 rounded-xl bg-primary/10 mb-3">
            <Shield className="size-6 text-primary" />
          </div>
          <h1 className="text-xl font-bold text-foreground">培训订单管理系统</h1>
          <p className="text-muted-foreground text-sm mt-1">管理员登录</p>
        </CardHeader>
        <CardContent className="pt-4">
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
              <FormField
                control={form.control}
                name="username"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>管理员账号</FormLabel>
                    <FormControl>
                      <div className="relative">
                        <User className="absolute left-3 top-1/2 -translate-y-1/2 size-4 text-muted-foreground" />
                        <Input placeholder="请输入管理员账号" className="pl-9" {...field} />
                      </div>
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
                    <FormLabel>密码</FormLabel>
                    <FormControl>
                      <div className="relative">
                        <Lock className="absolute left-3 top-1/2 -translate-y-1/2 size-4 text-muted-foreground" />
                        <Input
                          type={showPassword ? 'text' : 'password'}
                          placeholder="请输入密码"
                          className="pl-9 pr-10"
                          autoFocus
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

              {loginError && (
                <p className="text-sm text-destructive text-center">{loginError}</p>
              )}

              <Button type="submit" className="w-full" disabled={loggingIn}>
                {loggingIn ? '登录中...' : '登录'}
              </Button>

              <p className="text-xs text-muted-foreground text-center">
                默认账号：admin / admin123
              </p>
              <div className="flex items-center justify-center gap-4 text-xs">
                <Link to="/forgot-password?type=admin" className="text-muted-foreground hover:text-foreground">
                  忘记密码
                </Link>
                <Link to="/login" className="text-muted-foreground hover:text-foreground">
                  员工登录入口
                </Link>
              </div>
            </form>
          </Form>
        </CardContent>
      </Card>
    </div>
  );
};

export default AdminLoginPage;
