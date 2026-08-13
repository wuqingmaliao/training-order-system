import { useState, useEffect, useCallback } from 'react';
import {
  FileText, Plus, LogOut, Eye, Search,
  ChevronLeft, ChevronRight, User, KeyRound, Download,
} from 'lucide-react';
import * as XLSX from 'xlsx';

import { Button } from '@client/src/components/ui/button';
import { Input } from '@client/src/components/ui/input';
import { Card, CardContent, CardHeader, CardTitle } from '@client/src/components/ui/card';
import { Badge } from '@client/src/components/ui/badge';
import {
  Table, TableBody, TableCell, TableHead, TableHeader, TableRow,
} from '@client/src/components/ui/table';
import {
  Dialog, DialogContent, DialogHeader, DialogTitle,
} from '@client/src/components/ui/dialog';
import { trainingOrders, authApi } from '@client/src/api';
import type { TrainingOrderListItem, TrainingOrder } from '@shared/api.interface';
import { toast } from 'sonner';
import OrderFormDialog from './OrderFormDialog';
import ChangePasswordDialog from '@client/src/components/ChangePasswordDialog';

const formatDate = (dateStr: string) => {
  const d = new Date(dateStr);
  return d.toLocaleDateString('zh-CN') + ' ' + d.toLocaleTimeString('zh-CN', { hour: '2-digit', minute: '2-digit' });
};

const MyOrdersPage = () => {
  const [orders, setOrders] = useState<TrainingOrderListItem[]>([]);
  const [total, setTotal] = useState(0);
  const [page, setPage] = useState(1);
  const [pageSize] = useState(20);
  const [keyword, setKeyword] = useState('');
  const [loading, setLoading] = useState(false);

  const [formOpen, setFormOpen] = useState(false);
  const [detailOrder, setDetailOrder] = useState<TrainingOrder | null>(null);
  const [detailOpen, setDetailOpen] = useState(false);
  const [pwdOpen, setPwdOpen] = useState(false);

  const user = authApi.getCurrentUser();

  const loadOrders = useCallback(async () => {
    setLoading(true);
    try {
      const res = await trainingOrders.getOrderList({
        page, pageSize,
        keyword: keyword || undefined,
      });
      setOrders(res.items);
      setTotal(res.total);
    } catch (error: any) {
      if (error?.message?.includes('未授权')) {
        authApi.logout();
        window.location.href = '/';
      }
    } finally {
      setLoading(false);
    }
  }, [page, pageSize, keyword]);

  useEffect(() => {
    if (!authApi.isLoggedIn()) {
      window.location.href = '/';
      return;
    }
    loadOrders();
  }, [loadOrders]);

  const handleLogout = () => {
    authApi.logout();
    window.location.href = '/';
  };

  const viewDetail = async (id: string) => {
    try {
      const order = await trainingOrders.getOrderDetail(id);
      setDetailOrder(order);
      setDetailOpen(true);
    } catch {
      toast('获取详情失败');
    }
  };

  const handleExport = async () => {
    try {
      const res = await trainingOrders.exportMyOrders({
        keyword: keyword || undefined,
      });
      const exportData = res.items.map(o => ({
        '时间': formatDate(o.createdAt),
        '学员姓名': o.studentName,
        '身份证号': o.idCard,
        '手机号': o.phone,
        '业务类型': o.businessType,
        '项目': o.examProject,
        '班次类别': o.classMajor,
        '收款（元）': o.actualPayment,
        '折后业绩（元）': o.discountedPrice,
        '尾款（元）': o.remainingAmount,
        '对接老师': o.personInCharge,
        '是否签约': o.isSigned ? '是' : '否',
        '是否回款': o.isPaid ? '是' : '否',
        '备注': o.remark,
      }));
      const ws = XLSX.utils.json_to_sheet(exportData);
      const wb = XLSX.utils.book_new();
      XLSX.utils.book_append_sheet(wb, ws, '我的订单');
      XLSX.writeFile(wb, `我的订单_${new Date().toISOString().slice(0, 10)}.xlsx`);
      toast(`已导出 ${res.items.length} 条订单`);
    } catch (error: any) {
      toast(error?.message || '导出失败');
    }
  };

  const totalPages = Math.ceil(total / pageSize);

  return (
    <div className="min-h-screen bg-background">
      <header className="border-b bg-card sticky top-0 z-10">
        <div className="max-w-7xl mx-auto px-4 py-3 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <FileText className="size-5 text-primary" />
            <span className="font-semibold">我的订单</span>
          </div>
          <div className="flex items-center gap-3">
            <div className="flex items-center gap-2 text-sm text-muted-foreground">
              <User className="size-4" />
              <span>{user?.realName || user?.username}</span>
              {user?.team && <span className="text-xs">({user.team})</span>}
            </div>
            <Button size="sm" variant="outline" onClick={() => setPwdOpen(true)}>
              <KeyRound className="size-4 mr-1" /> 改密码
            </Button>
            <Button size="sm" onClick={() => setFormOpen(true)}>
              <Plus className="size-4 mr-1" /> 新增订单
            </Button>
            <Button variant="ghost" size="sm" onClick={handleLogout}>
              <LogOut className="size-4 mr-1" /> 退出
            </Button>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 py-6">
        <Card>
          <CardHeader className="pb-3">
            <div className="flex items-center justify-between">
              <CardTitle className="text-lg">订单列表 <span className="text-sm font-normal text-muted-foreground">({total}条)</span></CardTitle>
              <div className="flex items-center gap-2">
                <div className="relative w-64">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 size-4 text-muted-foreground" />
                  <Input
                    placeholder="搜索姓名/电话/身份证号"
                    className="pl-9"
                    value={keyword}
                    onChange={(e) => { setPage(1); setKeyword(e.target.value); }}
                  />
                </div>
                <Button variant="outline" size="sm" onClick={handleExport}>
                  <Download className="size-4 mr-1" /> 导出
                </Button>
              </div>
            </div>
          </CardHeader>
          <CardContent>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>时间</TableHead>
                  <TableHead>学员姓名</TableHead>
                  <TableHead>身份证号</TableHead>
                  <TableHead>手机号</TableHead>
                  <TableHead>业务类型</TableHead>
                  <TableHead>项目</TableHead>
                  <TableHead>班次类别</TableHead>
                  <TableHead>收款</TableHead>
                  <TableHead>折后业绩</TableHead>
                  <TableHead>对接老师</TableHead>
                  <TableHead>尾款</TableHead>
                  <TableHead>是否签约</TableHead>
                  <TableHead>是否回款</TableHead>
                  <TableHead>备注</TableHead>
                  <TableHead className="text-right">操作</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {loading ? (
                  <TableRow><TableCell colSpan={15} className="text-center py-8 text-muted-foreground">加载中...</TableCell></TableRow>
                ) : orders.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={15} className="text-center py-12 text-muted-foreground">
                      <p className="mb-2">暂无订单数据</p>
                      <Button size="sm" variant="outline" onClick={() => setFormOpen(true)}>
                        <Plus className="size-4 mr-1" /> 新增第一个订单
                      </Button>
                    </TableCell>
                  </TableRow>
                ) : orders.map((order) => (
                  <TableRow key={order.id}>
                    <TableCell className="text-sm text-muted-foreground whitespace-nowrap">{formatDate(order.createdAt)}</TableCell>
                    <TableCell className="font-medium">{order.studentName}</TableCell>
                    <TableCell className="font-mono text-xs whitespace-nowrap">{order.idCard || '-'}</TableCell>
                    <TableCell>{order.phone || '-'}</TableCell>
                    <TableCell><Badge variant="outline">{order.businessType || '-'}</Badge></TableCell>
                    <TableCell>{order.examProject || '-'}</TableCell>
                    <TableCell>{order.classMajor || '-'}</TableCell>
                    <TableCell className="font-mono">¥{order.actualPayment.toFixed(2)}</TableCell>
                    <TableCell className="font-mono">¥{order.discountedPrice.toFixed(2)}</TableCell>
                    <TableCell>{order.personInCharge || '-'}</TableCell>
                    <TableCell className={`font-mono ${order.remainingAmount > 0 ? 'text-red-600' : ''}`}>
                      ¥{order.remainingAmount.toFixed(2)}
                    </TableCell>
                    <TableCell>
                      <Badge className={order.isSigned ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-800'}>
                        {order.isSigned ? '已签约' : '未签约'}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      <Badge className={order.isPaid ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-800'}>
                        {order.isPaid ? '已回款' : '未回款'}
                      </Badge>
                    </TableCell>
                    <TableCell className="max-w-[150px] truncate" title={order.remark || ''}>{order.remark || '-'}</TableCell>
                    <TableCell className="text-right">
                      <Button variant="ghost" size="icon" title="查看" onClick={() => viewDetail(order.id)}>
                        <Eye className="size-4" />
                      </Button>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>

            {totalPages > 1 && (
              <div className="flex items-center justify-between mt-4">
                <span className="text-sm text-muted-foreground">共 {total} 条</span>
                <div className="flex items-center gap-2">
                  <Button variant="outline" size="sm" disabled={page <= 1} onClick={() => setPage(p => p - 1)}>
                    <ChevronLeft className="size-4" />
                  </Button>
                  <span className="text-sm">{page} / {totalPages}</span>
                  <Button variant="outline" size="sm" disabled={page >= totalPages} onClick={() => setPage(p => p + 1)}>
                    <ChevronRight className="size-4" />
                  </Button>
                </div>
              </div>
            )}
          </CardContent>
        </Card>
      </main>

      <OrderFormDialog
        open={formOpen}
        onOpenChange={setFormOpen}
        onSuccess={loadOrders}
      />

      <ChangePasswordDialog open={pwdOpen} onOpenChange={setPwdOpen} />

      {/* 详情弹窗 */}
      <Dialog open={detailOpen} onOpenChange={setDetailOpen}>
        <DialogContent className="max-w-2xl max-h-[80vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>订单详情</DialogTitle>
          </DialogHeader>
          {detailOrder && (
            <div className="grid grid-cols-2 gap-4 text-sm">
              <div><span className="text-muted-foreground">时间：</span>{formatDate(detailOrder.createdAt)}</div>
              <div><span className="text-muted-foreground">学员姓名：</span>{detailOrder.studentName}</div>
              <div><span className="text-muted-foreground">手机号：</span>{detailOrder.phone || '-'}</div>
              <div><span className="text-muted-foreground">身份证号：</span>{detailOrder.idCard || '-'}</div>
              <div><span className="text-muted-foreground">业务类型：</span>{detailOrder.businessType || '-'}</div>
              <div><span className="text-muted-foreground">项目：</span>{detailOrder.examProject || '-'}</div>
              <div><span className="text-muted-foreground">班次类别：</span>{detailOrder.classMajor || '-'}</div>
              <div><span className="text-muted-foreground">收款：</span>¥{detailOrder.actualPayment.toFixed(2)}</div>
              <div><span className="text-muted-foreground">折后业绩：</span>¥{detailOrder.discountedPrice.toFixed(2)}</div>
              <div><span className="text-muted-foreground">尾款：</span>¥{detailOrder.remainingAmount.toFixed(2)}</div>
              <div><span className="text-muted-foreground">对接老师：</span>{detailOrder.personInCharge || '-'}</div>
              <div><span className="text-muted-foreground">是否签约：</span>{detailOrder.isSigned ? '是' : '否'}</div>
              <div><span className="text-muted-foreground">是否回款：</span>{detailOrder.isPaid ? '是' : '否'}</div>
              <div className="col-span-2"><span className="text-muted-foreground">备注：</span>{detailOrder.remark || '-'}</div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default MyOrdersPage;
