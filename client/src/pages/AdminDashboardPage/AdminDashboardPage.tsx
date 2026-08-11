import { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Search, LogOut, Download, RefreshCw, Users, BarChart3, FileText,
  TrendingUp, DollarSign, Calendar, UserCheck,
} from 'lucide-react';
import * as XLSX from 'xlsx';

import { Button } from '@client/src/components/ui/button';
import { Input } from '@client/src/components/ui/input';
import {
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue,
} from '@client/src/components/ui/select';
import { Badge } from '@client/src/components/ui/badge';
import { Card, CardContent, CardHeader, CardTitle } from '@client/src/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@client/src/components/ui/tabs';
import {
  Table, TableBody, TableCell, TableHead, TableHeader, TableRow,
} from '@client/src/components/ui/table';
import {
  Dialog, DialogContent, DialogHeader, DialogTitle,
} from '@client/src/components/ui/dialog';
import {
  AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent,
  AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle,
} from '@client/src/components/ui/alert-dialog';
import { Switch } from '@client/src/components/ui/switch';
import { trainingOrders, authApi, staffApi } from '@client/src/api';
import type { TrainingOrderListItem, TrainingOrder, OrderStats, User } from '@shared/api.interface';
import { toast } from 'sonner';

const TRAINING_TYPE_OPTIONS = ['新培训', '复审', '换证', '其他'];
const CUSTOMER_SOURCE_OPTIONS = [
  '2024二建注册人员', '2024一建通过名单', '2021', '2022', '2023', '小筑题库', '2024',
  '转介绍', '复购-老学员', '地推-现场收单', '茜茜-直播', '运营部（抖音）', '运营部-小红书',
  '话单', '话单-三类25', '话单--七大员25', '教育宝+坦途+厚学等',
  '20毕业浙江专科-工程类', '21毕业浙江专科', '23毕业专科-非工程', '24毕业专科-工程类', '其他',
];
const CONTRACT_STATUS_OPTIONS = ['未签约', '已签约', '已退款', '待定'];

const statusColor: Record<string, string> = {
  已签约: 'bg-green-100 text-green-800',
  未签约: 'bg-gray-100 text-gray-800',
  已退款: 'bg-red-100 text-red-800',
  待定: 'bg-yellow-100 text-yellow-800',
};

const AdminDashboardPage = () => {
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState('orders');

  // 订单列表状态
  const [loading, setLoading] = useState(false);
  const [orders, setOrders] = useState<TrainingOrderListItem[]>([]);
  const [total, setTotal] = useState(0);
  const [page, setPage] = useState(1);
  const [pageSize] = useState(20);
  const [keyword, setKeyword] = useState('');
  const [trainingType, setTrainingType] = useState('');
  const [customerSource, setCustomerSource] = useState('');
  const [contractStatus, setContractStatus] = useState('');
  const [filterUserId, setFilterUserId] = useState('');
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');
  const [detailOrder, setDetailOrder] = useState<TrainingOrder | null>(null);
  const [detailOpen, setDetailOpen] = useState(false);

  // 员工列表
  const [staffList, setStaffList] = useState<User[]>([]);
  const [staffLoading, setStaffLoading] = useState(false);

  // 统计数据
  const [stats, setStats] = useState<OrderStats | null>(null);
  const [statsLoading, setStatsLoading] = useState(false);
  const [statsStartDate, setStatsStartDate] = useState('');
  const [statsEndDate, setStatsEndDate] = useState('');

  useEffect(() => {
    if (!authApi.isLoggedIn() || !authApi.isAdmin()) {
      window.location.href = '/admin/login';
      return;
    }
  }, []);

  const fetchOrders = useCallback(async () => {
    setLoading(true);
    try {
      const result = await trainingOrders.getOrderList({
        page, pageSize,
        keyword: keyword || undefined,
        trainingType: trainingType || undefined,
        customerSource: customerSource || undefined,
        contractStatus: contractStatus || undefined,
        userId: filterUserId || undefined,
        startDate: startDate || undefined,
        endDate: endDate || undefined,
      });
      setOrders(result.items);
      setTotal(result.total);
    } catch (error: any) {
      if (error?.response?.status === 401) {
        authApi.logout();
        window.location.href = '/admin/login';
      }
    } finally {
      setLoading(false);
    }
  }, [page, pageSize, keyword, trainingType, customerSource, contractStatus, filterUserId, startDate, endDate, navigate]);

  useEffect(() => { fetchOrders(); }, [fetchOrders]);

  const fetchStaff = useCallback(async () => {
    setStaffLoading(true);
    try {
      const res = await staffApi.getStaffList();
      setStaffList(res.items);
    } catch {} finally { setStaffLoading(false); }
  }, []);

  const fetchStats = useCallback(async () => {
    setStatsLoading(true);
    try {
      const res = await trainingOrders.getStats({
        startDate: statsStartDate || undefined,
        endDate: statsEndDate || undefined,
      });
      setStats(res);
    } catch {} finally { setStatsLoading(false); }
  }, [statsStartDate, statsEndDate]);

  useEffect(() => {
    if (activeTab === 'staff') fetchStaff();
    if (activeTab === 'stats') fetchStats();
  }, [activeTab]);

  const handleLogout = () => { authApi.logout(); window.location.href = '/'; };

  const handleReset = () => {
    setKeyword(''); setTrainingType(''); setCustomerSource('');
    setContractStatus(''); setFilterUserId(''); setStartDate(''); setEndDate(''); setPage(1);
  };

  const handleExport = async () => {
    try {
      const result = await trainingOrders.exportOrders({
        keyword: keyword || undefined,
        trainingType: trainingType || undefined,
        customerSource: customerSource || undefined,
        contractStatus: contractStatus || undefined,
        userId: filterUserId || undefined,
        startDate: startDate || undefined,
        endDate: endDate || undefined,
      });
      const exportData = result.items.map(item => ({
        订单编号: item.orderNo, 提交人: item.createdByName,
        培训类型: item.trainingType, 客户来源: item.customerSource,
        合同状态: item.contractStatus, 学员姓名: item.studentName,
        身份证号: item.idCard, 联系方式: item.phone,
        报考项目: item.examProject, 班次专业: item.classMajor,
        原价: item.originalPrice, 实付: item.actualPayment,
        优惠: item.discountedPrice, 欠款: item.remainingAmount,
        负责人: item.personInCharge, 签约日期: item.signDate || '',
        提交时间: item.createdAt.slice(0, 10),
      }));
      const ws = XLSX.utils.json_to_sheet(exportData);
      const wb = XLSX.utils.book_new();
      XLSX.utils.book_append_sheet(wb, ws, '订单');
      XLSX.writeFile(wb, `订单导出_${new Date().toISOString().slice(0, 10)}.xlsx`);
      toast('导出成功');
    } catch { toast('导出失败'); }
  };

  const viewDetail = async (id: string) => {
    try {
      const order = await trainingOrders.getOrderDetail(id);
      setDetailOrder(order); setDetailOpen(true);
    } catch { toast('获取详情失败'); }
  };

  const toggleStaffStatus = async (user: User) => {
    try {
      await staffApi.updateStaffStatus(user.id, { isActive: !user.isActive });
      toast(user.isActive ? '已禁用' : '已启用');
      fetchStaff();
    } catch { toast('操作失败'); }
  };

  const totalPages = Math.ceil(total / pageSize);

  return (
    <div className="min-h-screen bg-background">
      <header className="border-b bg-card sticky top-0 z-20">
        <div className="max-w-7xl mx-auto px-4 py-3 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <FileText className="size-5 text-primary" />
            <span className="font-semibold">管理后台</span>
          </div>
          <div className="flex items-center gap-3">
            <span className="text-sm text-muted-foreground">管理员</span>
            <Button variant="ghost" size="sm" onClick={handleLogout}>
              <LogOut className="size-4 mr-1" /> 退出
            </Button>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 py-6">
        <Tabs value={activeTab} onValueChange={setActiveTab}>
          <TabsList className="mb-6">
            <TabsTrigger value="orders"><FileText className="size-4 mr-1" /> 订单管理</TabsTrigger>
            <TabsTrigger value="staff"><Users className="size-4 mr-1" /> 员工管理</TabsTrigger>
            <TabsTrigger value="stats"><BarChart3 className="size-4 mr-1" /> 数据统计</TabsTrigger>
          </TabsList>

          {/* 订单管理 */}
          <TabsContent value="orders">
            <Card className="mb-4">
              <CardContent className="pt-4">
                <div className="flex flex-wrap gap-3 items-center">
                  <div className="relative flex-1 min-w-[200px]">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 size-4 text-muted-foreground" />
                    <Input
                      placeholder="搜索姓名/电话/订单号"
                      className="pl-9"
                      value={keyword}
                      onChange={(e) => { setPage(1); setKeyword(e.target.value); }}
                    />
                  </div>
                  <Select value={filterUserId} onValueChange={(v) => { setPage(1); setFilterUserId(v); }}>
                    <SelectTrigger className="w-[140px]"><SelectValue placeholder="选择员工" /></SelectTrigger>
                    <SelectContent>
                      <SelectItem value="">全部员工</SelectItem>
                      {staffList.map(s => (
                        <SelectItem key={s.id} value={s.id}>{s.realName}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  <Select value={trainingType} onValueChange={(v) => { setPage(1); setTrainingType(v); }}>
                    <SelectTrigger className="w-[120px]"><SelectValue placeholder="培训类型" /></SelectTrigger>
                    <SelectContent>{TRAINING_TYPE_OPTIONS.map(i => <SelectItem key={i} value={i}>{i}</SelectItem>)}</SelectContent>
                  </Select>
                  <Select value={contractStatus} onValueChange={(v) => { setPage(1); setContractStatus(v); }}>
                    <SelectTrigger className="w-[110px]"><SelectValue placeholder="合同状态" /></SelectTrigger>
                    <SelectContent>{CONTRACT_STATUS_OPTIONS.map(i => <SelectItem key={i} value={i}>{i}</SelectItem>)}</SelectContent>
                  </Select>
                  <Input type="date" value={startDate} onChange={(e) => { setPage(1); setStartDate(e.target.value); }} className="w-[150px]" />
                  <span className="text-muted-foreground">至</span>
                  <Input type="date" value={endDate} onChange={(e) => { setPage(1); setEndDate(e.target.value); }} className="w-[150px]" />
                  <Button variant="outline" size="sm" onClick={handleReset}><RefreshCw className="size-3.5 mr-1" />重置</Button>
                  <Button size="sm" onClick={handleExport}><Download className="size-3.5 mr-1" />导出</Button>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="pt-4">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>订单号</TableHead>
                      <TableHead>提交人</TableHead>
                      <TableHead>学员</TableHead>
                      <TableHead>电话</TableHead>
                      <TableHead>项目</TableHead>
                      <TableHead>实付</TableHead>
                      <TableHead>欠款</TableHead>
                      <TableHead>状态</TableHead>
                      <TableHead>时间</TableHead>
                      <TableHead>操作</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {loading ? (
                      <TableRow><TableCell colSpan={10} className="text-center py-8">加载中...</TableCell></TableRow>
                    ) : orders.length === 0 ? (
                      <TableRow><TableCell colSpan={10} className="text-center py-8 text-muted-foreground">暂无数据</TableCell></TableRow>
                    ) : orders.map(o => (
                      <TableRow key={o.id}>
                        <TableCell className="font-mono text-xs">{o.orderNo}</TableCell>
                        <TableCell>{o.createdByName || '-'}</TableCell>
                        <TableCell>{o.studentName}</TableCell>
                        <TableCell>{o.phone || '-'}</TableCell>
                        <TableCell>{o.examProject || '-'}</TableCell>
                        <TableCell className="font-medium">¥{o.actualPayment.toFixed(2)}</TableCell>
                        <TableCell className={o.remainingAmount > 0 ? 'text-red-600' : ''}>¥{o.remainingAmount.toFixed(2)}</TableCell>
                        <TableCell><Badge className={statusColor[o.contractStatus]}>{o.contractStatus}</Badge></TableCell>
                        <TableCell className="text-xs text-muted-foreground">{o.createdAt.slice(0, 10)}</TableCell>
                        <TableCell><Button variant="ghost" size="sm" onClick={() => viewDetail(o.id)}>详情</Button></TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
                {totalPages > 1 && (
                  <div className="flex items-center justify-between mt-4">
                    <span className="text-sm text-muted-foreground">共 {total} 条</span>
                    <div className="flex gap-2">
                      <Button variant="outline" size="sm" disabled={page <= 1} onClick={() => setPage(p => p - 1)}>上一页</Button>
                      <span className="text-sm py-2">{page} / {totalPages}</span>
                      <Button variant="outline" size="sm" disabled={page >= totalPages} onClick={() => setPage(p => p + 1)}>下一页</Button>
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          {/* 员工管理 */}
          <TabsContent value="staff">
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">员工列表</CardTitle>
              </CardHeader>
              <CardContent>
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>账号（手机号）</TableHead>
                      <TableHead>用户名</TableHead>
                      <TableHead>注册时间</TableHead>
                      <TableHead>状态</TableHead>
                      <TableHead className="text-right">操作</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {staffLoading ? (
                      <TableRow><TableCell colSpan={5} className="text-center py-8">加载中...</TableCell></TableRow>
                    ) : staffList.length === 0 ? (
                      <TableRow><TableCell colSpan={5} className="text-center py-8 text-muted-foreground">暂无员工</TableCell></TableRow>
                    ) : staffList.map(s => (
                      <TableRow key={s.id}>
                        <TableCell>{s.username}</TableCell>
                        <TableCell>{s.realName}</TableCell>
                        <TableCell className="text-sm text-muted-foreground">{s.createdAt.slice(0, 10)}</TableCell>
                        <TableCell>
                          <Badge className={s.isActive ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'}>
                            {s.isActive ? '正常' : '已禁用'}
                          </Badge>
                        </TableCell>
                        <TableCell className="text-right">
                          <div className="flex items-center justify-end gap-2">
                            <span className="text-sm text-muted-foreground">{s.isActive ? '禁用' : '启用'}</span>
                            <Switch checked={s.isActive} onCheckedChange={() => toggleStaffStatus(s)} />
                          </div>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </CardContent>
            </Card>
          </TabsContent>

          {/* 数据统计 */}
          <TabsContent value="stats">
            <Card className="mb-4">
              <CardContent className="pt-4">
                <div className="flex items-center gap-3">
                  <Calendar className="size-4 text-muted-foreground" />
                  <Input type="date" value={statsStartDate} onChange={(e) => setStatsStartDate(e.target.value)} className="w-[150px]" />
                  <span className="text-muted-foreground">至</span>
                  <Input type="date" value={statsEndDate} onChange={(e) => setStatsEndDate(e.target.value)} className="w-[150px]" />
                  <Button size="sm" onClick={fetchStats}>查询</Button>
                </div>
              </CardContent>
            </Card>

            {stats && (
              <>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
                  <Card>
                    <CardContent className="pt-4">
                      <div className="flex items-center gap-2 text-muted-foreground text-sm mb-1">
                        <FileText className="size-4" /> 总订单数
                      </div>
                      <div className="text-2xl font-bold">{stats.totalOrders}</div>
                    </CardContent>
                  </Card>
                  <Card>
                    <CardContent className="pt-4">
                      <div className="flex items-center gap-2 text-muted-foreground text-sm mb-1">
                        <DollarSign className="size-4" /> 总实收金额
                      </div>
                      <div className="text-2xl font-bold">¥{stats.totalActualPayment.toFixed(2)}</div>
                    </CardContent>
                  </Card>
                  <Card>
                    <CardContent className="pt-4">
                      <div className="flex items-center gap-2 text-muted-foreground text-sm mb-1">
                        <TrendingUp className="size-4" /> 总欠款
                      </div>
                      <div className="text-2xl font-bold text-red-600">¥{stats.totalRemaining.toFixed(2)}</div>
                    </CardContent>
                  </Card>
                  <Card>
                    <CardContent className="pt-4">
                      <div className="flex items-center gap-2 text-muted-foreground text-sm mb-1">
                        <DollarSign className="size-4" /> 总原价
                      </div>
                      <div className="text-2xl font-bold text-muted-foreground">¥{stats.totalOriginalPrice.toFixed(2)}</div>
                    </CardContent>
                  </Card>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
                  <Card>
                    <CardHeader><CardTitle className="text-base">今日数据</CardTitle></CardHeader>
                    <CardContent>
                      <div className="grid grid-cols-2 gap-4">
                        <div>
                          <div className="text-sm text-muted-foreground">今日订单</div>
                          <div className="text-xl font-bold">{stats.todayOrders}</div>
                        </div>
                        <div>
                          <div className="text-sm text-muted-foreground">今日收款</div>
                          <div className="text-xl font-bold text-green-600">¥{stats.todayPayment.toFixed(2)}</div>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                  <Card>
                    <CardHeader><CardTitle className="text-base">本月数据</CardTitle></CardHeader>
                    <CardContent>
                      <div className="grid grid-cols-2 gap-4">
                        <div>
                          <div className="text-sm text-muted-foreground">本月订单</div>
                          <div className="text-xl font-bold">{stats.monthOrders}</div>
                        </div>
                        <div>
                          <div className="text-sm text-muted-foreground">本月收款</div>
                          <div className="text-xl font-bold text-green-600">¥{stats.monthPayment.toFixed(2)}</div>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                </div>

                <Card>
                  <CardHeader><CardTitle className="text-base flex items-center gap-2"><UserCheck className="size-4" /> 员工业绩</CardTitle></CardHeader>
                  <CardContent>
                    <Table>
                      <TableHeader>
                        <TableRow>
                          <TableHead>员工</TableHead>
                          <TableHead>订单数</TableHead>
                          <TableHead className="text-right">收款金额</TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {stats.staffStats.length === 0 ? (
                          <TableRow><TableCell colSpan={3} className="text-center py-4 text-muted-foreground">暂无数据</TableCell></TableRow>
                        ) : stats.staffStats.map(s => (
                          <TableRow key={s.userId}>
                            <TableCell>{s.realName}</TableCell>
                            <TableCell>{s.orderCount}</TableCell>
                            <TableCell className="text-right font-medium">¥{s.totalPayment.toFixed(2)}</TableCell>
                          </TableRow>
                        ))}
                      </TableBody>
                    </Table>
                  </CardContent>
                </Card>
              </>
            )}
          </TabsContent>
        </Tabs>
      </main>

      {/* 详情弹窗 */}
      <Dialog open={detailOpen} onOpenChange={setDetailOpen}>
        <DialogContent className="max-w-2xl max-h-[80vh] overflow-y-auto">
          <DialogHeader><DialogTitle>订单详情 - {detailOrder?.orderNo}</DialogTitle></DialogHeader>
          {detailOrder && (
            <div className="grid grid-cols-2 gap-4 text-sm">
              <div><span className="text-muted-foreground">提交人：</span>{detailOrder.createdByName || '-'}</div>
              <div><span className="text-muted-foreground">学员姓名：</span>{detailOrder.studentName}</div>
              <div><span className="text-muted-foreground">联系电话：</span>{detailOrder.phone || '-'}</div>
              <div><span className="text-muted-foreground">身份证号：</span>{detailOrder.idCard || '-'}</div>
              <div><span className="text-muted-foreground">培训类型：</span>{detailOrder.trainingType}</div>
              <div><span className="text-muted-foreground">报考项目：</span>{detailOrder.examProject || '-'}</div>
              <div><span className="text-muted-foreground">班次专业：</span>{detailOrder.classMajor || '-'}</div>
              <div><span className="text-muted-foreground">客户来源：</span>{detailOrder.customerSource || '-'}</div>
              <div><span className="text-muted-foreground">负责人：</span>{detailOrder.personInCharge || '-'}</div>
              <div><span className="text-muted-foreground">合同状态：</span>{detailOrder.contractStatus}</div>
              <div><span className="text-muted-foreground">原价：</span>¥{detailOrder.originalPrice.toFixed(2)}</div>
              <div><span className="text-muted-foreground">实付：</span>¥{detailOrder.actualPayment.toFixed(2)}</div>
              <div><span className="text-muted-foreground">优惠：</span>¥{detailOrder.discountedPrice.toFixed(2)}</div>
              <div><span className="text-muted-foreground">欠款：</span>¥{detailOrder.remainingAmount.toFixed(2)}</div>
              <div><span className="text-muted-foreground">签约日期：</span>{detailOrder.signDate || '-'}</div>
              <div><span className="text-muted-foreground">承诺学员：</span>{detailOrder.promisedStudent || '-'}</div>
              <div className="col-span-2"><span className="text-muted-foreground">转介绍人：</span>{detailOrder.referrer || '-'}</div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default AdminDashboardPage;
