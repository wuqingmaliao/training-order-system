import { useState, useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Check, ChevronsUpDown } from 'lucide-react';

import { Button } from '@client/src/components/ui/button';
import {
  Form, FormControl, FormField, FormItem, FormLabel, FormMessage,
} from '@client/src/components/ui/form';
import { Input } from '@client/src/components/ui/input';
import { Textarea } from '@client/src/components/ui/textarea';
import { Switch } from '@client/src/components/ui/switch';
import {
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue,
} from '@client/src/components/ui/select';
import {
  Dialog, DialogContent, DialogHeader, DialogTitle,
} from '@client/src/components/ui/dialog';
import {
  Popover, PopoverContent, PopoverTrigger,
} from '@client/src/components/ui/popover';
import {
  Command, CommandEmpty, CommandGroup, CommandInput, CommandItem, CommandList,
} from '@client/src/components/ui/command';
import { ScrollArea } from '@client/src/components/ui/scroll-area';
import { trainingOrders } from '@client/src/api';
import type { TrainingOrder } from '@shared/api.interface';
import { toast } from 'sonner';
import { cn } from '@/lib/utils';

const BUSINESS_TYPE_OPTIONS = ['资质-挂靠', '学历', '培训', '非培训'];

const orderSchema = z.object({
  createdAt: z.string().min(1, '请选择时间'),
  studentName: z.string().min(1, '请输入学员姓名'),
  idCard: z.string().min(1, '请输入身份证号码'),
  phone: z.string().min(1, '请输入手机号'),
  businessType: z.string().min(1, '请选择业务类型'),
  examProject: z.string().min(1, '请选择项目'),
  classMajor: z.string().min(1, '请选择班次类别'),
  actualPayment: z.coerce.number().min(0, '请输入收款金额'),
  discountedPrice: z.coerce.number().min(0, '请输入折后业绩'),
  personInCharge: z.string().min(1, '请输入对接老师'),
  remainingAmount: z.coerce.number().min(0, '请输入尾款'),
  isSigned: z.boolean(),
  isPaid: z.boolean(),
  academicCoordinator: z.string().optional(),
  materialStatus: z.string().optional(),
  remark: z.string().optional(),
});

type OrderFormData = z.infer<typeof orderSchema>;

interface OrderEditDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  order: TrainingOrder | null;
  onSuccess: () => void;
}

const toDatetimeLocal = (iso: string) => {
  const d = new Date(iso);
  const pad = (n: number) => String(n).padStart(2, '0');
  return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}T${pad(d.getHours())}:${pad(d.getMinutes())}`;
};

const OrderEditDialog = ({ open, onOpenChange, order, onSuccess }: OrderEditDialogProps) => {
  const [submitting, setSubmitting] = useState(false);
  const [projectOptions, setProjectOptions] = useState<string[]>([]);
  const [classMajorOptions, setClassMajorOptions] = useState<string[]>([]);
  const [materialOptions, setMaterialOptions] = useState<string[]>([]);
  const [projectOpen, setProjectOpen] = useState(false);

  const form = useForm<OrderFormData>({
    resolver: zodResolver(orderSchema),
    defaultValues: {
      createdAt: '', studentName: '', idCard: '', phone: '',
      businessType: '', examProject: '', classMajor: '',
      actualPayment: 0, discountedPrice: 0, personInCharge: '',
      remainingAmount: 0, isSigned: false, isPaid: false,
      academicCoordinator: '', materialStatus: '', remark: '',
    },
  });

  useEffect(() => {
    if (open && order) {
      form.reset({
        createdAt: toDatetimeLocal(order.createdAt),
        studentName: order.studentName,
        idCard: order.idCard,
        phone: order.phone,
        businessType: order.businessType,
        examProject: order.examProject,
        classMajor: order.classMajor,
        actualPayment: order.actualPayment,
        discountedPrice: order.discountedPrice,
        personInCharge: order.personInCharge,
        remainingAmount: order.remainingAmount,
        isSigned: order.isSigned,
        isPaid: order.isPaid,
        academicCoordinator: order.academicCoordinator || '',
        materialStatus: order.materialStatus || '',
        remark: order.remark || '',
      });
      trainingOrders.getProjectOptions().then(res => setProjectOptions(res.options || [])).catch(() => setProjectOptions([]));
      trainingOrders.getClassMajorOptions().then(res => setClassMajorOptions(res.options || [])).catch(() => setClassMajorOptions([]));
      trainingOrders.getMaterialStatusOptions().then(res => setMaterialOptions(res.options || [])).catch(() => setMaterialOptions([]));
    }
  }, [open, order, form]);

  const onSubmit = async (data: OrderFormData) => {
    if (!order) return;
    setSubmitting(true);
    try {
      await trainingOrders.updateOrder(order.id, {
        ...data,
        createdAt: new Date(data.createdAt).toISOString(),
      });
      toast('修改成功');
      onOpenChange(false);
      onSuccess();
    } catch (error: any) {
      toast(error?.message || '修改失败');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl max-h-[90vh] p-0">
        <DialogHeader className="px-6 pt-6 pb-2">
          <DialogTitle>编辑订单</DialogTitle>
        </DialogHeader>
        <ScrollArea className="max-h-[calc(90vh-140px)] px-6 pb-6">
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
              <FormField
                control={form.control} name="createdAt"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>时间 <span className="text-destructive">*</span></FormLabel>
                    <FormControl><Input type="datetime-local" {...field} /></FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control} name="studentName"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>学员姓名 <span className="text-destructive">*</span></FormLabel>
                    <FormControl><Input {...field} /></FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <div className="grid grid-cols-2 gap-3">
                <FormField
                  control={form.control} name="idCard"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>身份证号码 <span className="text-destructive">*</span></FormLabel>
                      <FormControl><Input {...field} /></FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control} name="phone"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>手机号 <span className="text-destructive">*</span></FormLabel>
                      <FormControl><Input {...field} /></FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <FormField
                  control={form.control} name="businessType"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>培训/非培训/学历 <span className="text-destructive">*</span></FormLabel>
                      <Select onValueChange={field.onChange} value={field.value}>
                        <FormControl><SelectTrigger><SelectValue placeholder="请选择" /></SelectTrigger></FormControl>
                        <SelectContent>
                          {BUSINESS_TYPE_OPTIONS.map(i => <SelectItem key={i} value={i}>{i}</SelectItem>)}
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control} name="examProject"
                  render={({ field }) => (
                    <FormItem className="flex flex-col">
                      <FormLabel>项目 <span className="text-destructive">*</span></FormLabel>
                      <Popover open={projectOpen} onOpenChange={setProjectOpen}>
                        <PopoverTrigger asChild>
                          <FormControl>
                            <Button
                              variant="outline"
                              role="combobox"
                              className={cn('w-full justify-between font-normal', !field.value && 'text-muted-foreground')}
                            >
                              {field.value || '请选择项目'}
                              <ChevronsUpDown className="ml-2 size-4 shrink-0 opacity-50" />
                            </Button>
                          </FormControl>
                        </PopoverTrigger>
                        <PopoverContent className="w-[--radix-popover-trigger-width] p-0" align="start">
                          <Command>
                            <CommandInput placeholder="搜索项目..." />
                            <CommandList>
                              <CommandEmpty>未找到项目</CommandEmpty>
                              <CommandGroup>
                                {projectOptions.map(option => (
                                  <CommandItem
                                    key={option}
                                    value={option}
                                    onSelect={() => {
                                      field.onChange(option);
                                      setProjectOpen(false);
                                    }}
                                  >
                                    <Check className={cn('mr-2 size-4', field.value === option ? 'opacity-100' : 'opacity-0')} />
                                    {option}
                                  </CommandItem>
                                ))}
                              </CommandGroup>
                            </CommandList>
                          </Command>
                        </PopoverContent>
                      </Popover>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>

              <FormField
                control={form.control} name="classMajor"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>班次类别 <span className="text-destructive">*</span></FormLabel>
                    <Select onValueChange={field.onChange} value={field.value}>
                      <FormControl><SelectTrigger><SelectValue placeholder="请选择班次" /></SelectTrigger></FormControl>
                      <SelectContent>
                        {classMajorOptions.map(i => <SelectItem key={i} value={i}>{i}</SelectItem>)}
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <div className="grid grid-cols-2 gap-3">
                <FormField
                  control={form.control} name="actualPayment"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>收款（元） <span className="text-destructive">*</span></FormLabel>
                      <FormControl><Input type="number" step="0.01" {...field} className="font-mono" /></FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control} name="discountedPrice"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>折后业绩（元） <span className="text-destructive">*</span></FormLabel>
                      <FormControl><Input type="number" step="0.01" {...field} className="font-mono" /></FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>

              <FormField
                control={form.control} name="personInCharge"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>对接老师（负责人） <span className="text-destructive">*</span></FormLabel>
                    <FormControl><Input {...field} /></FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control} name="remainingAmount"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>尾款（元） <span className="text-destructive">*</span></FormLabel>
                    <FormControl><Input type="number" step="0.01" {...field} className="font-mono" /></FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <div className="grid grid-cols-2 gap-3">
                <FormField
                  control={form.control} name="academicCoordinator"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>教务对接人</FormLabel>
                      <FormControl><Input {...field} /></FormControl>
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
                        <FormControl><SelectTrigger><SelectValue placeholder="请选择" /></SelectTrigger></FormControl>
                        <SelectContent>
                          {materialOptions.map(s => <SelectItem key={s} value={s}>{s}</SelectItem>)}
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>

              <div className="grid grid-cols-2 gap-4 py-2">
                <FormField
                  control={form.control} name="isSigned"
                  render={({ field }) => (
                    <FormItem className="flex items-center justify-between rounded-lg border p-3">
                      <FormLabel className="!mt-0">是否签约</FormLabel>
                      <FormControl>
                        <Switch checked={field.value} onCheckedChange={field.onChange} />
                      </FormControl>
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control} name="isPaid"
                  render={({ field }) => (
                    <FormItem className="flex items-center justify-between rounded-lg border p-3">
                      <FormLabel className="!mt-0">是否回款</FormLabel>
                      <FormControl>
                        <Switch checked={field.value} onCheckedChange={field.onChange} />
                      </FormControl>
                    </FormItem>
                  )}
                />
              </div>

              <FormField
                control={form.control} name="remark"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>备注</FormLabel>
                    <FormControl><Textarea rows={3} {...field} /></FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <div className="flex justify-end gap-3 pt-2">
                <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>取消</Button>
                <Button type="submit" disabled={submitting}>
                  {submitting ? '保存中...' : '保存修改'}
                </Button>
              </div>
            </form>
          </Form>
        </ScrollArea>
      </DialogContent>
    </Dialog>
  );
};

export default OrderEditDialog;
