import { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  FileText, Plus, LogOut, Edit2, Trash2, Eye, Search,
  ChevronLeft, ChevronRight, User,
} from 'lucide-react';

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
import {
  AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent,
  AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle,
} from '@client/src/components/ui/alert-dialog';
import { trainingOrders, authApi } from '@client/src/api';
import type { TrainingOrderListItem, TrainingOrder } from '@shared/api.interface';
import { toast } from 'sonner';
import OrderFormDialog from './OrderFormDialog';

const formatDate = (dateStr: string) => {
  const d = new Date(dateStr);
  return d.toLocaleDateString('zh-CN') + ' ' + d.toLocaleTimeString('zh-CN', { hour: '2-digit', minute: '2-digit' });
};

const getStatusColor = (status: string) => {
  switch (status) {
    case '已签约': return 'bg-green-100 text-green-800';
    case '已退款': return 'bg-red-100 text-red-800';
    case '待定': return 'bg-yellow-100 text-yellow-800';
    default: return 'bg-gray-100 text-gray-800';
  }
};

const MyOrdersPage = () => {
  const navigate = useNavigate();
  const [orders, setOrders] = useState<TrainingOrderListItem[]>([]);
  const [total, setTotal] = useState(0);
  const [page, setPage] = useState(1);
  const [pageSize] = useState(20);
  const [keyword, setKeyword] = useState('');
  const [loading, setLoading] = useState(false);

  const [formOpen, setFormOpen] = useState(false);
  const [editOrder, setEditOrder] = useState<TrainingOrder | null>(null);

  const [detailOrder, setDetailOrder] = useState<TrainingOrder | null>(null);
  const [detailOpen, setDetailOpen] = useState(false);
  const [deleteId, setDeleteId] = useState<string | null>(null);

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
      if (error?.response?.status === 401) {
        authApi.logout();
        window.location.href = '/login';
      }
    } finally {
      setLoading(false);
    }
  }, [page, pageSize, keyword, navigate]);

  useEffect(() => {
    if (!authApi.isLoggedIn()) {
      window.location.href = '/login';
      return;
    }
    loadOrders();
  }, [loadOrders]);

  const handleLogout = () => {
    authApi.logout();
    window.location.href = '/';
  };

  const handleAdd = () => {
    setEditOrder(null);
    setFormOpen(true);
  };

  const handleEdit = async (id: string) => {
    try {
      const order = await trainingOrders.getOrderDetail(id);
      setEditOrder(order);
      setFormOpen(true);
    } catch {
      toast('获取订单失败');
    }
  };

  const handleDelete = async () => {
    if (!deleteId) return;
    try {
      await trainingOrders.deleteOrder(deleteId);
      toast('删除成功');
      setDeleteId(null);
      loadOrders();
    } catch {
      toast('删除失败');
    }
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

  const totalPages = Math.ceil(total / pageSize);

  return (
    <div className="min-h-screen bg-background">
      {/* 顶部导航 */}
      <header className="border-b bg-card sticky top-0 z-10">
        <div className="max-w-7xl mx-auto px-4 py-3 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <FileText className="size-5 text-primary" />
            <span className="font-semibold">我的客户</span>
          </div>
          <div className="flex items-center gap-3">
            <div className="flex items-center gap-2 text-sm text-muted-foreground">
              <User className="size-4" />
              <span>{user?.realName || user?.username}</span>
            </div>
            <Button size="sm" onClick={handleAdd}>
              <Plus className="size-4 mr-1" /> 新增客户
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
              <CardTitle className="text-lg">客户列表 <span className="text-sm font-normal text-muted-foreground">({total}人)</span></CardTitle>
              <div className="relative w-64">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 size-4 text-muted-foreground" />
                <Input
                  placeholder="搜索姓名/电话/订单号"
                  className="pl-9"
                  value={keyword}
                  onChange={(e) => { setPage(1); setKeyword(e.target.value); }}
                />
              </div>
            </div>
          </CardHeader>
          <CardContent>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>订单号</TableHead>
                  <TableHead>学员姓名</TableHead>
                  <TableHead>电话</TableHead>
                  <TableHead>报考项目</TableHead>
                  <TableHead>实付金额</TableHead>
                  <TableHead>欠款</TableHead>
                  <TableHead>合同状态</TableHead>
                  <TableHead>提交时间</TableHead>
                  <TableHead className="text-right">操作</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {loading ? (
                  <TableRow><TableCell colSpan={9} className="text-center py-8 text-muted-foreground">加载中...</TableCell></TableRow>
                ) : orders.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={9} className="text-center py-12 text-muted-foreground">
                      <p className="mb-2">暂无客户数据</p>
                      <Button size="sm" variant="outline" onClick={handleAdd}>
                        <Plus className="size-4 mr-1" /> 添加第一个客户
                      </Button>
                    </TableCell>
                  </TableRow>
                ) : orders.map((order) => (
                  <TableRow key={order.id}>
                    <TableCell className="font-mono text-xs">{order.orderNo}</TableCell>
                    <TableCell className="font-medium">{order.studentName}</TableCell>
                    <TableCell>{order.phone || '-'}</TableCell>
                    <TableCell>{order.examProject || '-'}</TableCell>
                    <TableCell className="font-medium">¥{order.actualPayment.toFixed(2)}</TableCell>
                    <TableCell className={order.remainingAmount > 0 ? 'text-red-600' : ''}>
                      ¥{order.remainingAmount.toFixed(2)}
                    </TableCell>
                    <TableCell>
                      <Badge className={getStatusColor(order.contractStatus)}>{order.contractStatus}</Badge>
                    </TableCell>
                    <TableCell className="text-sm text-muted-foreground">{formatDate(order.createdAt)}</TableCell>
                    <TableCell className="text-right">
                      <div className="flex justify-end gap-1">
                        <Button variant="ghost" size="icon" title="查看" onClick={() => viewDetail(order.id)}>
                          <Eye className="size-4" />
                        </Button>
                        <Button variant="ghost" size="icon" title="编辑" onClick={() => handleEdit(order.id)}>
                          <Edit2 className="size-4" />
                        </Button>
                        <Button variant="ghost" size="icon" title="删除" className="text-destructive" onClick={() => setDeleteId(order.id)}>
                          <Trash2 className="size-4" />
                        </Button>
                      </div>
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

      {/* 新增/编辑弹窗 */}
      <OrderFormDialog
        open={formOpen}
        onOpenChange={setFormOpen}
        editOrder={editOrder}
        onSuccess={loadOrders}
      />

      {/* 详情弹窗 */}
      <Dialog open={detailOpen} onOpenChange={setDetailOpen}>
        <DialogContent className="max-w-2xl max-h-[80vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>客户详情 - {detailOrder?.orderNo}</DialogTitle>
          </DialogHeader>
          {detailOrder && (
            <div className="grid grid-cols-2 gap-4 text-sm">
              <div><span className="text-muted-foreground">学员姓名：</span>{detailOrder.studentName}</div>
              <div><span className="text-muted-foreground">联系电话：</span>{detailOrder.phone || '-'}</div>
              <div><span className="text-muted-foreground">身份证号：</span>{detailOrder.idCard || '-'}</div>
              <div><span className="text-muted-foreground">培训类型：</span>{detailOrder.trainingType}</div>
              <div><span className="text-muted-foreground">报考项目：</span>{detailOrder.examProject || '-'}</div>
              <div><span className="text-muted-foreground">班次专业：</span>{detailOrder.classMajor || '-'}</div>
              <div><span className="text-muted-foreground">客户来源：</span>{detailOrder.customerSource || '-'}</div>
              <div><span className="text-muted-foreground">负责人：</span>{detailOrder.personInCharge || '-'}</div>
              <div><span className="text-muted-foreground">原价：</span>¥{detailOrder.originalPrice.toFixed(2)}</div>
              <div><span className="text-muted-foreground">实付：</span>¥{detailOrder.actualPayment.toFixed(2)}</div>
              <div><span className="text-muted-foreground">优惠：</span>¥{detailOrder.discountedPrice.toFixed(2)}</div>
              <div><span className="text-muted-foreground">欠款：</span>¥{detailOrder.remainingAmount.toFixed(2)}</div>
              <div><span className="text-muted-foreground">合同状态：</span>{detailOrder.contractStatus}</div>
              <div><span className="text-muted-foreground">签约日期：</span>{detailOrder.signDate || '-'}</div>
              <div className="col-span-2"><span className="text-muted-foreground">承诺学员：</span>{detailOrder.promisedStudent || '-'}</div>
              <div className="col-span-2"><span className="text-muted-foreground">转介绍人：</span>{detailOrder.referrer || '-'}</div>
            </div>
          )}
        </DialogContent>
      </Dialog>

      {/* 删除确认 */}
      <AlertDialog open={!!deleteId} onOpenChange={() => setDeleteId(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>确认删除</AlertDialogTitle>
            <AlertDialogDescription>确定要删除这个客户吗？此操作不可撤销。</AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>取消</AlertDialogCancel>
            <AlertDialogAction onClick={handleDelete} className="bg-destructive text-destructive-foreground">删除</AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
};

export default MyOrdersPage;
