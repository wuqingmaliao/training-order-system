import { useState, useEffect } from 'react';
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
import { trainingOrders } from '@client/src/api';
import type { TrainingOrder } from '@shared/api.interface';
import { toast } from 'sonner';

const editSchema = z.object({
  academicCoordinator: z.string().optional(),
  materialStatus: z.string().optional(),
});

type EditFormData = z.infer<typeof editSchema>;

interface AdminEditDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  order: TrainingOrder | null;
  onSuccess: () => void;
}

const AdminEditDialog = ({ open, onOpenChange, order, onSuccess }: AdminEditDialogProps) => {
  const [submitting, setSubmitting] = useState(false);
  const [materialOptions, setMaterialOptions] = useState<string[]>([]);

  const form = useForm<EditFormData>({
    resolver: zodResolver(editSchema),
    defaultValues: {
      academicCoordinator: '',
      materialStatus: '',
    },
  });

  useEffect(() => {
    if (open && order) {
      form.reset({
        academicCoordinator: order.academicCoordinator || '',
        materialStatus: order.materialStatus || '',
      });
      trainingOrders.getMaterialStatusOptions().then(res => {
        setMaterialOptions(res.options || []);
      }).catch(() => setMaterialOptions([]));
    }
  }, [open, order, form]);

  const onSubmit = async (data: EditFormData) => {
    if (!order) return;
    setSubmitting(true);
    try {
      await trainingOrders.updateOrder(order.id, {
        academicCoordinator: data.academicCoordinator || '',
        materialStatus: data.materialStatus || '',
      });
      toast('保存成功');
      onOpenChange(false);
      onSuccess();
    } catch (error: any) {
      toast(error?.message || '保存失败');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle>编辑教务信息</DialogTitle>
        </DialogHeader>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
            <div className="text-sm text-muted-foreground mb-2">
              学员：{order?.studentName} | 手机：{order?.phone}
            </div>
            <FormField
              control={form.control} name="academicCoordinator"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>教务对接人</FormLabel>
                  <FormControl><Input {...field} placeholder="请输入教务对接人" /></FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control} name="materialStatus"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>资料状态</FormLabel>
                  <Select onValueChange={field.onChange} value={field.value || undefined}>
                    <FormControl><SelectTrigger><SelectValue placeholder="请选择资料状态" /></SelectTrigger></FormControl>
                    <SelectContent>
                      {materialOptions.map(s => <SelectItem key={s} value={s}>{s}</SelectItem>)}
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )}
            />
            <div className="flex justify-end gap-3 pt-2">
              <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>取消</Button>
              <Button type="submit" disabled={submitting}>
                {submitting ? '保存中...' : '保存'}
              </Button>
            </div>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
};

export default AdminEditDialog;
