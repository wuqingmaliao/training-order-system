import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { CheckCircle2, FileText } from 'lucide-react';
import { logger } from '@lark-apaas/client-toolkit/logger';

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
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@client/src/components/ui/select';
import { Card, CardContent } from '@client/src/components/ui/card';
import { trainingOrders } from '@client/src/api';
import { toast } from 'sonner';

const TRAINING_TYPE_OPTIONS = [
  '新培训',
  '复审',
  '换证',
  '其他',
];

const CUSTOMER_SOURCE_OPTIONS = [
  '2024二建注册人员',
  '2024一建通过名单',
  '2021',
  '2022',
  '2023',
  '小筑题库',
  '2024',
  '转介绍',
  '复购-老学员',
  '地推-现场收单',
  '茜茜-直播',
  '运营部（抖音）',
  '运营部-小红书',
  '话单',
  '话单-三类25',
  '话单--七大员25',
  '教育宝+坦途+厚学等',
  '20毕业浙江专科-工程类',
  '21毕业浙江专科',
  '23毕业专科-非工程',
  '24毕业专科-工程类',
  '其他',
];

const CONTRACT_STATUS_OPTIONS = [
  '未签约',
  '已签约',
  '已退款',
  '待定',
];

const EXAM_PROJECT_OPTIONS = [
  '二级建造师',
  '一级建造师',
  '消防工程师',
  '监理工程师',
  '造价工程师',
  '安全工程师',
  '建工单位',
  '学历',
  '三类',
  '七大员',
  '技工',
  '特种工',
  '公路水运检测师',
  '中级经济师',
  '执业药师',
  '健康管理师',
  '初中高级职称',
  '论文',
];

const PROMISED_STUDENT_OPTIONS = [
  '无',
  '三类交考务费补考1次',
  '三类免费补考1次',
  '七大员免费补考1次',
  '七大员交考务费补考1次',
  '赠送项目正版教材',
  '赠送公司制定教材-筑一笔记',
  '赠送公司制定教材-试卷练习题',
  '赠送考试未通过免费重学1年（线上网课）',
  '赠送考试未通过免费重学1年（线下集训）',
  '承诺二建集训资料费全科只扣除700后退费',
];

const orderSchema = z.object({
  trainingType: z.string().min(1, '请选择培训类型'),
  customerSource: z.string().default(''),
  contractStatus: z.string().default('未签约'),
  studentName: z.string().min(1, '请输入学员姓名'),
  idCard: z.string().default(''),
  phone: z.string().default(''),
  examProject: z.string().default(''),
  classMajor: z.string().default(''),
  originalPrice: z.coerce.number().default(0),
  actualPayment: z.coerce.number().default(0),
  discountedPrice: z.coerce.number().default(0),
  remainingAmount: z.coerce.number().default(0),
  personInCharge: z.string().default(''),
  signDate: z.string().default(''),
  promisedStudent: z.string().default(''),
  referrer: z.string().default(''),
});

type OrderFormData = z.infer<typeof orderSchema>;

const OrderFormPage = () => {
  const [submitted, setSubmitted] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [orderNo, setOrderNo] = useState('');

  const form = useForm<OrderFormData>({
    resolver: zodResolver(orderSchema),
    defaultValues: {
      trainingType: '',
      customerSource: '',
      contractStatus: '未签约',
      studentName: '',
      idCard: '',
      phone: '',
      examProject: '',
      classMajor: '',
      originalPrice: 0,
      actualPayment: 0,
      discountedPrice: 0,
      remainingAmount: 0,
      personInCharge: '',
      signDate: '',
      promisedStudent: '',
      referrer: '',
    },
  });

  const onSubmit = async (data: OrderFormData) => {
    setSubmitting(true);
    try {
      const result = await trainingOrders.createOrder({
        trainingType: data.trainingType,
        customerSource: data.customerSource,
        contractStatus: data.contractStatus,
        studentName: data.studentName,
        idCard: data.idCard,
        phone: data.phone,
        examProject: data.examProject,
        classMajor: data.classMajor,
        originalPrice: data.originalPrice,
        actualPayment: data.actualPayment,
        discountedPrice: data.discountedPrice,
        remainingAmount: data.remainingAmount,
        personInCharge: data.personInCharge,
        signDate: data.signDate || null,
        promisedStudent: data.promisedStudent,
        referrer: data.referrer,
      });
      setOrderNo(result.orderNo);
      setSubmitted(true);
    } catch (error) {
      logger.error('提交订单失败', error);
      toast('提交失败，请稍后重试');
    } finally {
      setSubmitting(false);
    }
  };

  const handleReset = () => {
    form.reset();
    setSubmitted(false);
    setOrderNo('');
  };

  if (submitted) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center p-4">
        <Card className="w-full max-w-md shadow-lg">
          <CardContent className="pt-8 pb-8 flex flex-col items-center text-center">
            <CheckCircle2 className="size-16 text-success mb-4" />
            <h2 className="text-2xl font-bold text-foreground mb-2">
              订单提交成功
            </h2>
            <p className="text-muted-foreground mb-1">
              感谢您提交培训订单，我们将尽快与您联系。
            </p>
            <p className="text-sm text-muted-foreground mb-6">
              订单编号：<span className="font-mono text-foreground">{orderNo}</span>
            </p>
            <Button onClick={handleReset} variant="outline">
              继续填写
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background py-8 px-4">
      <div className="max-w-2xl mx-auto">
        <div className="text-center mb-8">
          <div className="inline-flex items-center gap-2 text-primary mb-3">
            <FileText className="size-6" />
            <span className="text-sm font-semibold tracking-wide">培训订单管理系统</span>
          </div>
          <h1 className="text-2xl md:text-3xl font-bold text-foreground mb-2">
            培训订单登记表
          </h1>
          <p className="text-muted-foreground text-sm">
            请填写以下信息，完成后点击提交即可
          </p>
        </div>

        <Card className="shadow-sm">
          <CardContent className="pt-6">
            <Form {...form}>
              <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-8">
                <div>
                  <div className="flex items-center gap-2 mb-4">
                    <div className="w-1 h-5 bg-primary rounded-full" />
                    <h3 className="font-semibold text-foreground">学员信息</h3>
                  </div>
                  <div className="space-y-4">
                    <FormField
                      control={form.control}
                      name="studentName"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>
                            对应学员姓名 <span className="text-destructive">*</span>
                          </FormLabel>
                          <FormControl>
                            <Input placeholder="请输入学员姓名" {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <FormField
                        control={form.control}
                        name="idCard"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>身份证号码</FormLabel>
                            <FormControl>
                              <Input placeholder="请输入身份证号码" {...field} />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                      <FormField
                        control={form.control}
                        name="phone"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>联系方式</FormLabel>
                            <FormControl>
                              <Input placeholder="请输入手机号码" {...field} />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <FormField
                        control={form.control}
                        name="promisedStudent"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>承诺学员</FormLabel>
                            <Select
                              onValueChange={field.onChange}
                              defaultValue={field.value}
                            >
                              <FormControl>
                                <SelectTrigger>
                                  <SelectValue placeholder="请选择承诺学员" />
                                </SelectTrigger>
                              </FormControl>
                              <SelectContent>
                                {PROMISED_STUDENT_OPTIONS.map((item) => (
                                  <SelectItem key={item} value={item}>
                                    {item}
                                  </SelectItem>
                                ))}
                              </SelectContent>
                            </Select>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                      <FormField
                        control={form.control}
                        name="referrer"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>转介绍人</FormLabel>
                            <FormControl>
                              <Input placeholder="请输入转介绍人" {...field} />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                    </div>
                  </div>
                </div>

                <div>
                  <div className="flex items-center gap-2 mb-4">
                    <div className="w-1 h-5 bg-primary rounded-full" />
                    <h3 className="font-semibold text-foreground">业务信息</h3>
                  </div>
                  <div className="space-y-4">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <FormField
                        control={form.control}
                        name="trainingType"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>
                              培训类型 <span className="text-destructive">*</span>
                            </FormLabel>
                            <Select
                              onValueChange={field.onChange}
                              defaultValue={field.value}
                            >
                              <FormControl>
                                <SelectTrigger>
                                  <SelectValue placeholder="请选择培训类型" />
                                </SelectTrigger>
                              </FormControl>
                              <SelectContent>
                                {TRAINING_TYPE_OPTIONS.map((item) => (
                                  <SelectItem key={item} value={item}>
                                    {item}
                                  </SelectItem>
                                ))}
                              </SelectContent>
                            </Select>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                      <FormField
                        control={form.control}
                        name="customerSource"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>客户来源</FormLabel>
                            <Select
                              onValueChange={field.onChange}
                              defaultValue={field.value}
                            >
                              <FormControl>
                                <SelectTrigger>
                                  <SelectValue placeholder="请选择客户来源" />
                                </SelectTrigger>
                              </FormControl>
                              <SelectContent>
                                {CUSTOMER_SOURCE_OPTIONS.map((item) => (
                                  <SelectItem key={item} value={item}>
                                    {item}
                                  </SelectItem>
                                ))}
                              </SelectContent>
                            </Select>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <FormField
                        control={form.control}
                        name="contractStatus"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>合同状态</FormLabel>
                            <Select
                              onValueChange={field.onChange}
                              defaultValue={field.value}
                            >
                              <FormControl>
                                <SelectTrigger>
                                  <SelectValue placeholder="请选择合同状态" />
                                </SelectTrigger>
                              </FormControl>
                              <SelectContent>
                                {CONTRACT_STATUS_OPTIONS.map((item) => (
                                  <SelectItem key={item} value={item}>
                                    {item}
                                  </SelectItem>
                                ))}
                              </SelectContent>
                            </Select>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                      <FormField
                        control={form.control}
                        name="examProject"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>报考项目</FormLabel>
                            <Select
                              onValueChange={field.onChange}
                              defaultValue={field.value}
                            >
                              <FormControl>
                                <SelectTrigger>
                                  <SelectValue placeholder="请选择报考项目" />
                                </SelectTrigger>
                              </FormControl>
                              <SelectContent>
                                {EXAM_PROJECT_OPTIONS.map((item) => (
                                  <SelectItem key={item} value={item}>
                                    {item}
                                  </SelectItem>
                                ))}
                              </SelectContent>
                            </Select>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <FormField
                        control={form.control}
                        name="classMajor"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>
                              班次专业 <span className="text-destructive">*</span>
                            </FormLabel>
                            <FormControl>
                              <Input placeholder="请输入" {...field} />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                      <FormField
                        control={form.control}
                        name="personInCharge"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>负责人</FormLabel>
                            <FormControl>
                              <Input placeholder="请输入负责人" {...field} />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                    </div>
                    <FormField
                      control={form.control}
                      name="signDate"
                      render={({ field }) => (
                        <FormItem className="md:w-1/2">
                          <FormLabel>签约日期</FormLabel>
                          <FormControl>
                            <Input type="date" {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </div>
                </div>

                <div>
                  <div className="flex items-center gap-2 mb-4">
                    <div className="w-1 h-5 bg-primary rounded-full" />
                    <h3 className="font-semibold text-foreground">费用明细</h3>
                  </div>
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                    <FormField
                      control={form.control}
                      name="originalPrice"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>原价（元）</FormLabel>
                          <FormControl>
                            <Input
                              type="number"
                              placeholder="0.00"
                              {...field}
                              className="font-mono text-right"
                            />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    <FormField
                      control={form.control}
                      name="actualPayment"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>实收金额（元）</FormLabel>
                          <FormControl>
                            <Input
                              type="number"
                              placeholder="0.00"
                              {...field}
                              className="font-mono text-right"
                            />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    <FormField
                      control={form.control}
                      name="discountedPrice"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>折后金额（元）</FormLabel>
                          <FormControl>
                            <Input
                              type="number"
                              placeholder="0.00"
                              {...field}
                              className="font-mono text-right"
                            />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    <FormField
                      control={form.control}
                      name="remainingAmount"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>尾款（元）</FormLabel>
                          <FormControl>
                            <Input
                              type="number"
                              placeholder="0.00"
                              {...field}
                              className="font-mono text-right"
                            />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </div>
                </div>

                <div className="pt-4 flex justify-center">
                  <Button
                    type="submit"
                    size="lg"
                    disabled={submitting}
                    className="w-full md:w-auto md:px-12"
                  >
                    {submitting ? '提交中...' : '提交订单'}
                  </Button>
                </div>
              </form>
            </Form>
          </CardContent>
        </Card>

        <p className="text-center text-xs text-muted-foreground mt-6">
          您的信息将被严格保密，仅用于培训报名服务
        </p>
      </div>
    </div>
  );
};

export default OrderFormPage;
