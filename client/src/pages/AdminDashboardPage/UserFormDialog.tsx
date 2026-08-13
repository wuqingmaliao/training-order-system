import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';

import { Button } from '@client/src/components/ui/button';
import {
  Form, FormControl, FormField, FormItem, FormLabel, FormMessage,
} from '@client/src/components/ui/form';
import { Input } from '@client/src/components/ui/input';
import {
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue,
} from '@client/src/components/ui/select';
import {
  Dialog, DialogContent, DialogHeader, DialogTitle,
} from '@client/src/components/ui/dialog';
import { staffApi } from '@client/src/api';
import { toast } from 'sonner';

const userSchema = z.object({
  realName: z.string().min(1, '请输入姓名'),
  username: z.string().min(2, '账号至少2位'),
  password: z.string().min(4, '密码至少4位'),
  role: z.enum(['staff', 'admin']),
  team: z.string().optional(),
});

type UserFormData = z.infer<typeof userSchema>;

interface UserFormDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSuccess: () => void;
}

const UserFormDialog = ({ open, onOpenChange, onSuccess }: UserFormDialogProps) => {
  const [submitting, setSubmitting] = useState(false);

  const form = useForm<UserFormData>({
    resolver: zodResolver(userSchema),
    defaultValues: { realName: '', username: '', password: '', role: 'staff', team: '' },
  });

  const role = form.watch('role');

  const onSubmit = async (data: UserFormData) => {
    setSubmitting(true);
    try {
      await staffApi.createUser({
        realName: data.realName,
        username: data.username,
        password: data.password,
        role: data.role,
        team: data.role === 'staff' ? (data.team || '') : undefined,
      });
      toast(data.role === 'admin' ? '管理员创建成功' : '员工创建成功');
      form.reset();
      onOpenChange(false);
      onSuccess();
    } catch (error: any) {
      toast(error?.message || '创建失败');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-sm">
        <DialogHeader>
          <DialogTitle>添加账号</DialogTitle>
        </DialogHeader>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
            <FormField
              control={form.control} name="role"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>账号类型 <span className="text-destructive">*</span></FormLabel>
                  <Select onValueChange={field.onChange} value={field.value}>
                    <FormControl><SelectTrigger><SelectValue /></SelectTrigger></FormControl>
                    <SelectContent>
                      <SelectItem value="staff">员工</SelectItem>
                      <SelectItem value="admin">普通管理员</SelectItem>
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control} name="realName"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>姓名 <span className="text-destructive">*</span></FormLabel>
                  <FormControl><Input placeholder="请输入姓名" {...field} /></FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control} name="username"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>登录账号 <span className="text-destructive">*</span></FormLabel>
                  <FormControl><Input placeholder="请输入登录账号" {...field} /></FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control} name="password"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>初始密码 <span className="text-destructive">*</span></FormLabel>
                  <FormControl><Input placeholder="至少4位" {...field} /></FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            {role === 'staff' && (
              <FormField
                control={form.control} name="team"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>团队</FormLabel>
                    <FormControl><Input placeholder="请输入团队名称（选填）" {...field} /></FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            )}
            <div className="flex justify-end gap-3 pt-2">
              <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>取消</Button>
              <Button type="submit" disabled={submitting}>
                {submitting ? '创建中...' : '确认创建'}
              </Button>
            </div>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
};

export default UserFormDialog;
