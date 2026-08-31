import { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  FileText, Users, BarChart3, LogOut, Search, Eye, Edit2, Trash2,
  ChevronLeft, ChevronRight, Download, Plus, Settings, Shield, User as UserIcon,
} from 'lucide-react';
import * as XLSX from 'xlsx';

import { Button } from '@client/src/components/ui/button';
import { Input } from '@client/src/components/ui/input';
import { Card, CardContent, CardHeader, CardTitle } from '@client/src/components/ui/card';
import { Badge } from '@client/src/components/ui/badge';
import { Switch } from '@client/src/components/ui/switch';
import { Tabs, TabsList, TabsTrigger, TabsContent } from '@client/src/components/ui/tabs';
import {
  Table, TableBody, TableCell, TableHead, TableHeader, TableRow,
} from '@client/src/components/ui/table';
import {
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue,
} from '@client/src/components/ui/select';
import {
  Dialog, DialogContent, DialogHeader, DialogTitle,
} from '@client/src/components/ui/dialog';
import {
  AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent,
  AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle,
} from '@client/src/components/ui/alert-dialog';
import { trainingOrders, authApi, staffApi } from '@client/src/api';
import type {
  TrainingOrderListItem, TrainingOrder, OrderStats, User,
} from '@shared/api.interface';
import { toast } from 'sonner';
import OrderEditDialog from './OrderEditDialog';
import AdminEditDialog from './AdminEditDialog';
import UserFormDialog from './UserFormDialog';
import ProjectOptionsManager from './ProjectOptionsManager';
import ChangePasswordDialog from '@client/src/components/ChangePasswordDialog';

const formatDate = (dateStr: string) => {
  const d = new Date(dateStr);
  return d.toLocaleDateString('zh-CN') + ' ' + d.toLocaleTimeString('zh-CN', { hour: '2-digit', minute: '2-digit' });
};

const BUSINESS_TYPE_OPTIONS = ['资质-挂靠', '学历', '培训', '非培训'];

const AdminDashboardPage = () => {
  const navigate = useNavigate();
  const currentUser = authApi.getCurrentUser();
  const isSuperAdmin = currentUser?.role === 'super_admin';

  const [activeTab, setActiveTab] = useState('orders');
  const [pwdOpen, setPwdOpen] = useState(false);

  // 订单列表
  const [orders, setOrders] = useState<TrainingOrderListItem[]>([]);
  const [total, setTotal] = useState(0);
  const [page, setPage] = useState(1);
  const [pageSize] = useState(20);
  const [keyword, setKeyword] = useState('');
  const [filterBusinessType, setFilterBusinessType] = useState('');
  const [filterIsSigned, setFilterIsSigned] = useState('');
  const [filterIsPaid, setFilterIsPaid] = useState('');
  const [filterUserId, setFilterUserId] = useState('');
  const [loading, setLoading] = useState(false);

  const [detailOrder, setDetailOrder] = useState<TrainingOrder | null>(null);
  const [detailOpen, setDetailOpen] = useState(false);
  const [editOrder, setEditOrder] = useState<TrainingOrder | null>(null);
  const [editOpen, setEditOpen] = useState(false);
  const [adminEditOrder, setAdminEditOrder] = useState<TrainingOrder | null>(null);
  const [adminEditOpen, setAdminEditOpen] = useState(false);
  const [deleteId, setDeleteId] = useState<string | null>(null);

  // 人员管理
  const [users, setUsers] = useState<User[]>([]);
  const [userFormOpen, setUserFormOpen] = useState(false);

  // 统计
  const [stats, setStats] = useState<OrderStats | null>(null);
  const [staffList, setStaffList] = useState<User[]>([]);

  const loadOrders = useCallback(async () => {
    setLoading(true);
    try {
      const res = await trainingOrders.getOrderList({
        page, pageSize,
        keyword: keyword || undefined,
        businessType: filterBusinessType || undefined,
        isSigned: filterIsSigned || undefined,
        isPaid: filterIsPaid || undefined,
        userId: filterUserId || undefined,
      });
      setOrders(res.items);
      setTotal(res.total);
    } catch (error: any) {
      if (error?.message?.includes('未授权')) {
        authApi.logout();
        navigate('/');
      }
    } finally {
      setLoading(false);
    }
  }, [page, pageSize, keyword, filterBusinessType, filterIsSigned, filterIsPaid, filterUserId, navigate]);

  const loadUsers = useCallback(async () => {
    try {
      const res = await staffApi.getUserList();
      setUsers(res.items);
    } catch (error: any) {
      toast(error?.message || '加载用户列表失败');
    }
  }, []);

  const loadStats = useCallback(async () => {
    try {
      const res = await trainingOrders.getStats();
      setStats(res);
    } catch (error: any) {
      toast(error?.message || '加载统计失败');
    }
  }, []);

  const loadStaffList = useCallback(async () => {
    try {
      const res = await staffApi.getStaffList();
      setStaffList(res.items);
    } catch {
      // 普通管理员可能没权限，忽略
    }
  }, []);

  useEffect(() => {
    loadOrders();
  }, [loadOrders]);

  useEffect(() => {
    if (activeTab === 'users' && isSuperAdmin) loadUsers();
    if (activeTab === 'stats' && isSuperAdmin) loadStats();
    if (isSuperAdmin) loadStaffList();
  }, [activeTab, isSuperAdmin, loadUsers, loadStats, loadStaffList]);

  const handleLogout = () => {
    authApi.logout();
    navigate('/');
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

  const handleEdit = async (id: string) => {
    try {
      const order = await trainingOrders.getOrderDetail(id);
      setEditOrder(order);
      setEditOpen(true);
    } catch {
      toast('获取订单失败');
    }
  };

  const handleAdminEdit = async (id: string) => {
    try {
      const order = await trainingOrders.getOrderDetail(id);
      setAdminEditOrder(order);
      setAdminEditOpen(true);
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
    } catch (error: any) {
      toast(error?.message || '删除失败');
    }
  };

  const handleToggleUserStatus = async (user: User) => {
    try {
      await staffApi.updateUserStatus(user.id, { isActive: !user.isActive });
      toast(user.isActive ? '已禁用' : '已启用');
      loadUsers();
    } catch (error: any) {
      toast(error?.message || '操作失败');
    }
  };

  const handleExport = async () => {
    try {
      const res = await trainingOrders.exportOrders({
        keyword: keyword || undefined,
        businessType: filterBusinessType || undefined,
        isSigned: filterIsSigned || undefined,
        isPaid: filterIsPaid || undefined,
        userId: filterUserId || undefined,
      });
      const exportData = res.items.map(o => ({
        '时间': formatDate(o.createdAt),
        '学员姓名': o.studentName,
        '身份证号': o.idCard,
        '手机号': o.phone,
        '业务类型': o.businessType,
        '项目': o.examProject,
        '班次类别': o.classMajor,
        '收款': o.actualPayment,
        '折后业绩': o.discountedPrice,
        '尾款': o.remainingAmount,
        '对接老师': o.personInCharge,
        '团队': o.team || '',
        '是否签约': o.isSigned ? '是' : '否',
        '是否回款': o.isPaid ? '是' : '否',
        '教务对接人': o.academicCoordinator || '',
        '资料状态': o.materialStatus || '',
        '备注': o.remark,
      }));
      const ws = XLSX.utils.json_to_sheet(exportData);
      const wb = XLSX.utils.book_new();
      XLSX.utils.book_append_sheet(wb, ws, '订单');
      XLSX.writeFile(wb, `订单导出_${new Date().toISOString().slice(0, 10)}.xlsx`);
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
            <Shield className="size-5 text-primary" />
            <span className="font-semibold">管理后台</span>
            <Badge variant={isSuperAdmin ? 'default' : 'secondary'} className="ml-2">
              {isSuperAdmin ? '超级管理员' : '普通管理员'}
            </Badge>
          </div>
          <div className="flex items-center gap-3">
            <div className="flex items-center gap-2 text-sm text-muted-foreground">
              <UserIcon className="size-4" />
              <span>{currentUser?.realName || currentUser?.username}</span>
            </div>
            <Button size="sm" variant="outline" onClick={() => setPwdOpen(true)}>
              改密码
            </Button>
            <Button variant="ghost" size="sm" onClick={handleLogout}>
              <LogOut className="size-4 mr-1" /> 退出
            </Button>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 py-6">
        <Tabs value={activeTab} onValueChange={setActiveTab}>
          <TabsList>
            <TabsTrigger value="orders"><FileText className="size-4 mr-1" />订单管理</TabsTrigger>
            {isSuperAdmin && <TabsTrigger value="users"><Users className="size-4 mr-1" />人员管理</TabsTrigger>}
            {isSuperAdmin && <TabsTrigger value="stats"><BarChart3 className="size-4 mr-1" />数据统计</TabsTrigger>}
            {isSuperAdmin && <TabsTrigger value="settings"><Settings className="size-4 mr-1" />选项设置</TabsTrigger>}
          </TabsList>

          {/* 订单管理 */}
          <TabsContent value="orders">
            <Card>
              <CardHeader className="pb-3">
                <div className="flex flex-wrap items-center gap-2">
                  <div className="relative w-56">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 size-4 text-muted-foreground" />
                    <Input
                      placeholder="搜索全部"
                      className="pl-9"
                      value={keyword}
                      onChange={(e) => { setPage(1); setKeyword(e.target.value); }}
                    />
                  </div>
                  <Select value={filterBusinessType} onValueChange={(v) => { setPage(1); setFilterBusinessType(v === '__all' ? '' : v); }}>
                    <SelectTrigger className="w-36"><SelectValue placeholder="业务类型" /></SelectTrigger>
                    <SelectContent>
                      <SelectItem value="__all">全部类型</SelectItem>
                      {BUSINESS_TYPE_OPTIONS.map(t => <SelectItem key={t} value={t}>{t}</SelectItem>)}
                    </SelectContent>
                  </Select>
                  {isSuperAdmin && (
                    <>
                      <Select value={filterIsSigned} onValueChange={(v) => { setPage(1); setFilterIsSigned(v === '__all' ? '' : v); }}>
                        <SelectTrigger className="w-28"><SelectValue placeholder="签约" /></SelectTrigger>
                        <SelectContent>
                          <SelectItem value="__all">全部签约</SelectItem>
                          <SelectItem value="true">已签约</SelectItem>
                          <SelectItem value="false">未签约</SelectItem>
                        </SelectContent>
                      </Select>
                      <Select value={filterIsPaid} onValueChange={(v) => { setPage(1); setFilterIsPaid(v === '__all' ? '' : v); }}>
                        <SelectTrigger className="w-28"><SelectValue placeholder="回款" /></SelectTrigger>
                        <SelectContent>
                          <SelectItem value="__all">全部回款</SelectItem>
                          <SelectItem value="true">已回款</SelectItem>
                          <SelectItem value="false">未回款</SelectItem>
                        </SelectContent>
                      </Select>
                      <Select value={filterUserId} onValueChange={(v) => { setPage(1); setFilterUserId(v === '__all' ? '' : v); }}>
                        <SelectTrigger className="w-32"><SelectValue placeholder="对接老师" /></SelectTrigger>
                        <SelectContent>
                          <SelectItem value="__all">全部老师</SelectItem>
                          {staffList.map(s => <SelectItem key={s.id} value={s.id}>{s.realName}</SelectItem>)}
                        </SelectContent>
                      </Select>
                    </>
                  )}
                  {isSuperAdmin && (
                    <Button variant="outline" size="sm" onClick={handleExport}>
                      <Download className="size-4 mr-1" /> 导出
                    </Button>
                  )}
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
                      <TableHead>团队</TableHead>
                      <TableHead>尾款</TableHead>
                      <TableHead>是否签约</TableHead>
                      <TableHead>是否回款</TableHead>
                      <TableHead>教务对接人</TableHead>
                      <TableHead>资料状态</TableHead>
                      <TableHead>备注</TableHead>
                      <TableHead className="text-right">操作</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {loading ? (
                      <TableRow><TableCell colSpan={18} className="text-center py-8 text-muted-foreground">加载中...</TableCell></TableRow>
                    ) : orders.length === 0 ? (
                      <TableRow><TableCell colSpan={18} className="text-center py-12 text-muted-foreground">暂无数据</TableCell></TableRow>
                    ) : orders.map((order) => (
                      <TableRow key={order.id}>
                        <TableCell className="text-sm text-muted-foreground whitespace-nowrap">{formatDate(order.createdAt)}</TableCell>
                        <TableCell className="font-medium">{order.studentName}</TableCell>
                        <TableCell className="font-mono text-xs whitespace-nowrap">{order.idCard || '-'}</TableCell>
                        <TableCell className="font-mono">{order.phone}</TableCell>
                        <TableCell><Badge variant="outline">{order.businessType || '-'}</Badge></TableCell>
                        <TableCell>{order.examProject || '-'}</TableCell>
                        <TableCell>{order.classMajor || '-'}</TableCell>
                        <TableCell className="font-mono">¥{order.actualPayment.toFixed(2)}</TableCell>
                        <TableCell className="font-mono">¥{order.discountedPrice.toFixed(2)}</TableCell>
                        <TableCell>{order.personInCharge || '-'}</TableCell>
                        <TableCell>{order.team || '-'}</TableCell>
                        <TableCell className={`font-mono ${order.remainingAmount > 0 ? 'text-red-600' : ''}`}>¥{order.remainingAmount.toFixed(2)}</TableCell>
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
                        <TableCell>{order.academicCoordinator || '-'}</TableCell>
                        <TableCell>
                          {order.materialStatus ? (
                            <Badge variant="outline">{order.materialStatus}</Badge>
                          ) : '-'}
                        </TableCell>
                        <TableCell className="max-w-[150px] truncate" title={order.remark || ''}>{order.remark || '-'}</TableCell>
                        <TableCell className="text-right">
                          <div className="flex justify-end gap-1">
                            <Button variant="ghost" size="icon" title="查看" onClick={() => viewDetail(order.id)}>
                              <Eye className="size-4" />
                            </Button>
                            {isSuperAdmin ? (
                              <>
                                <Button variant="ghost" size="icon" title="编辑" onClick={() => handleEdit(order.id)}>
                                  <Edit2 className="size-4" />
                                </Button>
                                <Button variant="ghost" size="icon" title="删除" className="text-destructive" onClick={() => setDeleteId(order.id)}>
                                  <Trash2 className="size-4" />
                                </Button>
                              </>
                            ) : (
                              <Button variant="ghost" size="icon" title="编辑教务信息" onClick={() => handleAdminEdit(order.id)}>
                                <Edit2 className="size-4" />
                              </Button>
                            )}
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
          </TabsContent>

          {/* 人员管理（仅超管） */}
          {isSuperAdmin && (
            <TabsContent value="users">
              <Card>
                <CardHeader className="pb-3">
                  <div className="flex items-center justify-between">
                    <CardTitle className="text-base">人员列表</CardTitle>
                    <Button size="sm" onClick={() => setUserFormOpen(true)}>
                      <Plus className="size-4 mr-1" /> 添加账号
                    </Button>
                  </div>
                </CardHeader>
                <CardContent>
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>姓名</TableHead>
                        <TableHead>登录账号</TableHead>
                        <TableHead>角色</TableHead>
                        <TableHead>团队</TableHead>
                        <TableHead>状态</TableHead>
                        <TableHead>创建时间</TableHead>
                        <TableHead className="text-right">操作</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {users.map(u => (
                        <TableRow key={u.id}>
                          <TableCell className="font-medium">{u.realName}</TableCell>
                          <TableCell>{u.username}</TableCell>
                          <TableCell>
                            <Badge variant={u.role === 'super_admin' ? 'default' : u.role === 'admin' ? 'secondary' : 'outline'}>
                              {u.role === 'super_admin' ? '超级管理员' : u.role === 'admin' ? '普通管理员' : '员工'}
                            </Badge>
                          </TableCell>
                          <TableCell>{u.team || '-'}</TableCell>
                          <TableCell>
                            <span className={u.isActive ? 'text-green-600' : 'text-muted-foreground'}>
                              {u.isActive ? '正常' : '禁用'}
                            </span>
                          </TableCell>
                          <TableCell className="text-sm text-muted-foreground">{formatDate(u.createdAt)}</TableCell>
                          <TableCell className="text-right">
                            {u.role !== 'super_admin' && (
                              <Switch
                                checked={u.isActive}
                                onCheckedChange={() => handleToggleUserStatus(u)}
                              />
                            )}
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </CardContent>
              </Card>
            </TabsContent>
          )}

          {/* 数据统计（仅超管） */}
          {isSuperAdmin && (
            <TabsContent value="stats">
              {stats ? (
                <div className="space-y-4">
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                    <Card>
                      <CardContent className="pt-6">
                        <p className="text-sm text-muted-foreground">总订单数</p>
                        <p className="text-2xl font-bold mt-1">{stats.totalOrders}</p>
                      </CardContent>
                    </Card>
                    <Card>
                      <CardContent className="pt-6">
                        <p className="text-sm text-muted-foreground">总收款</p>
                        <p className="text-2xl font-bold mt-1">¥{stats.totalActualPayment.toFixed(2)}</p>
                      </CardContent>
                    </Card>
                    <Card>
                      <CardContent className="pt-6">
                        <p className="text-sm text-muted-foreground">总折后业绩</p>
                        <p className="text-2xl font-bold mt-1 text-blue-600">¥{stats.totalDiscounted.toFixed(2)}</p>
                      </CardContent>
                    </Card>
                    <Card>
                      <CardContent className="pt-6">
                        <p className="text-sm text-muted-foreground">总尾款</p>
                        <p className="text-2xl font-bold mt-1 text-red-600">¥{stats.totalRemaining.toFixed(2)}</p>
                      </CardContent>
                    </Card>
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <Card>
                      <CardContent className="pt-6">
                        <p className="text-sm text-muted-foreground">今日订单</p>
                        <p className="text-2xl font-bold mt-1">{stats.todayOrders}</p>
                        <p className="text-xs text-muted-foreground mt-1">收款 ¥{stats.todayPayment.toFixed(2)}</p>
                      </CardContent>
                    </Card>
                    <Card>
                      <CardContent className="pt-6">
                        <p className="text-sm text-muted-foreground">本月订单</p>
                        <p className="text-2xl font-bold mt-1">{stats.monthOrders}</p>
                        <p className="text-xs text-muted-foreground mt-1">收款 ¥{stats.monthPayment.toFixed(2)}</p>
                      </CardContent>
                    </Card>
                  </div>
                  <Card>
                    <CardHeader><CardTitle className="text-base">员工业绩</CardTitle></CardHeader>
                    <CardContent>
                      <Table>
                        <TableHeader>
                          <TableRow>
                            <TableHead>姓名</TableHead>
                            <TableHead>团队</TableHead>
                            <TableHead>订单数</TableHead>
                            <TableHead>总收款</TableHead>
                            <TableHead>折后业绩</TableHead>
                          </TableRow>
                        </TableHeader>
                        <TableBody>
                          {stats.staffStats.map((s, i) => (
                            <TableRow key={i}>
                              <TableCell className="font-medium">{s.realName}</TableCell>
                              <TableCell>{s.team || '-'}</TableCell>
                              <TableCell>{s.orderCount}</TableCell>
                              <TableCell className="font-mono">¥{s.totalPayment.toFixed(2)}</TableCell>
                              <TableCell className="font-mono text-blue-600">¥{s.totalDiscounted.toFixed(2)}</TableCell>
                            </TableRow>
                          ))}
                        </TableBody>
                      </Table>
                    </CardContent>
                  </Card>
                </div>
              ) : (
                <p className="text-center py-12 text-muted-foreground">加载中...</p>
              )}
            </TabsContent>
          )}

          {/* 选项设置（仅超管） */}
          {isSuperAdmin && (
            <TabsContent value="settings">
              <ProjectOptionsManager />
            </TabsContent>
          )}
        </Tabs>
      </main>

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
              <div><span className="text-muted-foreground">手机号：</span>{detailOrder.phone}</div>
              <div><span className="text-muted-foreground">身份证号：</span>{detailOrder.idCard}</div>
              <div><span className="text-muted-foreground">业务类型：</span>{detailOrder.businessType}</div>
              <div><span className="text-muted-foreground">项目：</span>{detailOrder.examProject}</div>
              <div><span className="text-muted-foreground">班次类别：</span>{detailOrder.classMajor}</div>
              <div><span className="text-muted-foreground">收款：</span>¥{detailOrder.actualPayment.toFixed(2)}</div>
              <div><span className="text-muted-foreground">折后业绩：</span>¥{detailOrder.discountedPrice.toFixed(2)}</div>
              <div><span className="text-muted-foreground">尾款：</span>¥{detailOrder.remainingAmount.toFixed(2)}</div>
              <div><span className="text-muted-foreground">对接老师：</span>{detailOrder.personInCharge}</div>
              <div><span className="text-muted-foreground">团队：</span>{detailOrder.team || '-'}</div>
              <div><span className="text-muted-foreground">是否签约：</span>{detailOrder.isSigned ? '是' : '否'}</div>
              <div><span className="text-muted-foreground">是否回款：</span>{detailOrder.isPaid ? '是' : '否'}</div>
              <div><span className="text-muted-foreground">教务对接人：</span>{detailOrder.academicCoordinator || '-'}</div>
              <div><span className="text-muted-foreground">资料状态：</span>{detailOrder.materialStatus || '-'}</div>
              <div className="col-span-2"><span className="text-muted-foreground">备注：</span>{detailOrder.remark || '-'}</div>
            </div>
          )}
        </DialogContent>
      </Dialog>

      {/* 超管编辑弹窗 */}
      {isSuperAdmin && (
        <OrderEditDialog
          open={editOpen}
          onOpenChange={setEditOpen}
          order={editOrder}
          onSuccess={loadOrders}
        />
      )}

      {/* 普通管理员编辑弹窗 */}
      {!isSuperAdmin && (
        <AdminEditDialog
          open={adminEditOpen}
          onOpenChange={setAdminEditOpen}
          order={adminEditOrder}
          onSuccess={loadOrders}
        />
      )}

      {/* 添加账号弹窗（仅超管） */}
      {isSuperAdmin && (
        <UserFormDialog
          open={userFormOpen}
          onOpenChange={setUserFormOpen}
          onSuccess={loadUsers}
        />
      )}

      {/* 删除确认 */}
      <AlertDialog open={!!deleteId} onOpenChange={() => setDeleteId(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>确认删除</AlertDialogTitle>
            <AlertDialogDescription>确定要删除这个订单吗？此操作不可撤销。</AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>取消</AlertDialogCancel>
            <AlertDialogAction onClick={handleDelete} className="bg-destructive text-destructive-foreground">删除</AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      <ChangePasswordDialog open={pwdOpen} onOpenChange={setPwdOpen} />
    </div>
  );
};

export default AdminDashboardPage;
