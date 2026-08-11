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
import { ScrollArea } from '@client/src/components/ui/scroll-area';
import { trainingOrders } from '@client/src/api';
import type { TrainingOrder } from '@shared/api.interface';
import { toast } from 'sonner';

const TRAINING_TYPE_OPTIONS = ['新培训', '复审', '换证', '其他'];
const CUSTOMER_SOURCE_OPTIONS = [
  '2024二建注册人员', '2024一建通过名单', '2021', '2022', '2023', '小筑题库', '2024',
  '转介绍', '复购-老学员', '地推-现场收单', '茜茜-直播', '运营部（抖音）', '运营部-小红书',
  '话单', '话单-三类25', '话单--七大员25', '教育宝+坦途+厚学等',
  '20毕业浙江专科-工程类', '21毕业浙江专科', '23毕业专科-非工程', '24毕业专科-工程类', '其他',
];
const CONTRACT_STATUS_OPTIONS = ['未签约', '已签约', '已退款', '待定'];
const EXAM_PROJECT_OPTIONS = [
  '二级建造师', '一级建造师', '消防工程师', '监理工程师', '造价工程师', '安全工程师',
  '建工单位', '学历', '三类', '七大员', '技工', '特种工', '公路水运检测师',
  '中级经济师', '执业药师', '健康管理师', '初中高级职称', '论文',
];
const PROMISED_STUDENT_OPTIONS = [
  '无', '三类交考务费补考1次', '三类免费补考1次', '七大员免费补考1次',
  '七大员交考务费补考1次', '赠送项目正版教材', '赠送公司制定教材-筑一笔记',
  '赠送公司制定教材-试卷练习题', '赠送考试未通过免费重学1年（线上网课）',
  '赠送考试未通过免费重学1年（线下集训）', '承诺二建集训资料费全科只扣除700后退费',
];

const orderSchema = z.object({
  trainingType: z.string().min(1, '请选择培训类型'),
  customerSource: z.string().default(''),
  contractStatus: z.string().default('未签约'),
  studentName: z.string().min(1, '请输入学员姓名'),
  idCard: z.string().default(''),
  phone: z.string().default(''),
  examProject: z.string().default(''),
  classMajor: z.string().min(1, '请输入班次专业'),
  originalPrice: z.coerce.number().default(0),
  actualPayment: z.coerce.number().default(0),
  discountedPrice: z.coerce.number().default(0),
  remainingAmount: z.coerce.number().default(0),
  personInCharge: z.string().default(''),
  signDate: z.string().default(''),
  promisedStudent: z.string().default('无'),
  referrer: z.string().default(''),
});

type OrderFormData = z.infer<typeof orderSchema>;

interface OrderFormDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  editOrder?: TrainingOrder | null;
  onSuccess: () => void;
}

const defaultValues: OrderFormData = {
  trainingType: '', customerSource: '', contractStatus: '未签约',
  studentName: '', idCard: '', phone: '', examProject: '', classMajor: '',
  originalPrice: 0, actualPayment: 0, discountedPrice: 0, remainingAmount: 0,
  personInCharge: '', signDate: '', promisedStudent: '无', referrer: '',
};

const OrderFormDialog = ({ open, onOpenChange, editOrder, onSuccess }: OrderFormDialogProps) => {
  const [submitting, setSubmitting] = useState(false);
  const isEdit = !!editOrder;

  const form = useForm<OrderFormData>({
    resolver: zodResolver(orderSchema),
    defaultValues,
  });

  useEffect(() => {
    if (open && editOrder) {
      form.reset({
        trainingType: editOrder.trainingType,
        customerSource: editOrder.customerSource,
        contractStatus: editOrder.contractStatus,
        studentName: editOrder.studentName,
        idCard: editOrder.idCard,
        phone: editOrder.phone,
        examProject: editOrder.examProject,
        classMajor: editOrder.classMajor,
        originalPrice: editOrder.originalPrice,
        actualPayment: editOrder.actualPayment,
        discountedPrice: editOrder.discountedPrice,
        remainingAmount: editOrder.remainingAmount,
        personInCharge: editOrder.personInCharge,
        signDate: editOrder.signDate || '',
        promisedStudent: editOrder.promisedStudent || '无',
        referrer: editOrder.referrer,
      });
    } else if (open) {
      form.reset(defaultValues);
    }
  }, [open, editOrder]);

  const onSubmit = async (data: OrderFormData) => {
    setSubmitting(true);
    try {
      if (isEdit && editOrder) {
        await trainingOrders.updateOrder(editOrder.id, {
          ...data,
          signDate: data.signDate || null,
        });
        toast('更新成功');
      } else {
        await trainingOrders.createOrder({
          ...data,
          signDate: data.signDate || null,
        });
        toast('添加成功');
      }
      onOpenChange(false);
      onSuccess();
    } catch {
      toast(isEdit ? '更新失败' : '添加失败');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl max-h-[90vh] p-0">
        <DialogHeader className="px-6 pt-6 pb-2">
          <DialogTitle>{isEdit ? '编辑客户信息' : '新增客户'}</DialogTitle>
        </DialogHeader>
        <ScrollArea className="max-h-[calc(90vh-140px)] px-6 pb-6">
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
              {/* 学员信息 */}
              <div>
                <h3 className="font-semibold text-sm mb-3 flex items-center gap-2">
                  <div className="w-1 h-4 bg-primary rounded-full" /> 学员信息
                </h3>
                <div className="space-y-3">
                  <FormField
                    control={form.control} name="studentName"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>学员姓名 <span className="text-destructive">*</span></FormLabel>
                        <FormControl><Input placeholder="请输入学员姓名" {...field} /></FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <div className="grid grid-cols-2 gap-3">
                    <FormField
                      control={form.control} name="idCard"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>身份证号</FormLabel>
                          <FormControl><Input placeholder="请输入" {...field} /></FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    <FormField
                      control={form.control} name="phone"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>联系电话</FormLabel>
                          <FormControl><Input placeholder="请输入" {...field} /></FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </div>
                  <div className="grid grid-cols-2 gap-3">
                    <FormField
                      control={form.control} name="promisedStudent"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>承诺学员</FormLabel>
                          <Select onValueChange={field.onChange} value={field.value}>
                            <FormControl><SelectTrigger><SelectValue placeholder="请选择" /></SelectTrigger></FormControl>
                            <SelectContent>
                              {PROMISED_STUDENT_OPTIONS.map(i => <SelectItem key={i} value={i}>{i}</SelectItem>)}
                            </SelectContent>
                          </Select>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    <FormField
                      control={form.control} name="referrer"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>转介绍人</FormLabel>
                          <FormControl><Input placeholder="请输入" {...field} /></FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </div>
                </div>
              </div>

              {/* 业务信息 */}
              <div>
                <h3 className="font-semibold text-sm mb-3 flex items-center gap-2">
                  <div className="w-1 h-4 bg-primary rounded-full" /> 业务信息
                </h3>
                <div className="space-y-3">
                  <div className="grid grid-cols-2 gap-3">
                    <FormField
                      control={form.control} name="trainingType"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>培训类型 <span className="text-destructive">*</span></FormLabel>
                          <Select onValueChange={field.onChange} value={field.value}>
                            <FormControl><SelectTrigger><SelectValue placeholder="请选择" /></SelectTrigger></FormControl>
                            <SelectContent>
                              {TRAINING_TYPE_OPTIONS.map(i => <SelectItem key={i} value={i}>{i}</SelectItem>)}
                            </SelectContent>
                          </Select>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    <FormField
                      control={form.control} name="customerSource"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>客户来源</FormLabel>
                          <Select onValueChange={field.onChange} value={field.value}>
                            <FormControl><SelectTrigger><SelectValue placeholder="请选择" /></SelectTrigger></FormControl>
                            <SelectContent>
                              {CUSTOMER_SOURCE_OPTIONS.map(i => <SelectItem key={i} value={i}>{i}</SelectItem>)}
                            </SelectContent>
                          </Select>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </div>
                  <div className="grid grid-cols-2 gap-3">
                    <FormField
                      control={form.control} name="contractStatus"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>合同状态</FormLabel>
                          <Select onValueChange={field.onChange} value={field.value}>
                            <FormControl><SelectTrigger><SelectValue placeholder="请选择" /></SelectTrigger></FormControl>
                            <SelectContent>
                              {CONTRACT_STATUS_OPTIONS.map(i => <SelectItem key={i} value={i}>{i}</SelectItem>)}
                            </SelectContent>
                          </Select>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    <FormField
                      control={form.control} name="examProject"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>报考项目</FormLabel>
                          <Select onValueChange={field.onChange} value={field.value}>
                            <FormControl><SelectTrigger><SelectValue placeholder="请选择" /></SelectTrigger></FormControl>
                            <SelectContent>
                              {EXAM_PROJECT_OPTIONS.map(i => <SelectItem key={i} value={i}>{i}</SelectItem>)}
                            </SelectContent>
                          </Select>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </div>
                  <div className="grid grid-cols-2 gap-3">
                    <FormField
                      control={form.control} name="classMajor"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>班次专业 <span className="text-destructive">*</span></FormLabel>
                          <FormControl><Input placeholder="请输入" {...field} /></FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    <FormField
                      control={form.control} name="personInCharge"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>负责人</FormLabel>
                          <FormControl><Input placeholder="请输入" {...field} /></FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </div>
                  <FormField
                    control={form.control} name="signDate"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>签约日期</FormLabel>
                        <FormControl><Input type="date" {...field} /></FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>
              </div>

              {/* 费用 */}
              <div>
                <h3 className="font-semibold text-sm mb-3 flex items-center gap-2">
                  <div className="w-1 h-4 bg-primary rounded-full" /> 费用明细
                </h3>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                  {[
                    { name: 'originalPrice', label: '原价' },
                    { name: 'actualPayment', label: '实付' },
                    { name: 'discountedPrice', label: '优惠' },
                    { name: 'remainingAmount', label: '欠款' },
                  ].map(f => (
                    <FormField
                      key={f.name}
                      control={form.control}
                      name={f.name as any}
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>{f.label}（元）</FormLabel>
                          <FormControl>
                            <Input type="number" placeholder="0.00" {...field} className="font-mono text-right" />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  ))}
                </div>
              </div>

              <div className="flex justify-end gap-3 pt-2">
                <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>取消</Button>
                <Button type="submit" disabled={submitting}>
                  {submitting ? '保存中...' : isEdit ? '保存修改' : '确认添加'}
                </Button>
              </div>
            </form>
          </Form>
        </ScrollArea>
      </DialogContent>
    </Dialog>
  );
};

export default OrderFormDialog;
