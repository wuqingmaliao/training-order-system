import { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { Search, LogOut, Download, RefreshCw, Menu, X } from 'lucide-react';
import * as XLSX from 'xlsx';
import { logger } from '@lark-apaas/client-toolkit/logger';
import { Table } from '@lark-apaas/client-toolkit/antd-table';
import type { TableProps } from '@lark-apaas/client-toolkit/antd-table';

import { Button } from '@client/src/components/ui/button';
import { Input } from '@client/src/components/ui/input';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@client/src/components/ui/select';
import { Badge } from '@client/src/components/ui/badge';
import { trainingOrders } from '@client/src/api';
import type { TrainingOrderListItem, TrainingOrder } from '@shared/api.interface';

import OrderDetailDrawer from './OrderDetailDrawer';
import { toast } from 'sonner';

const TRAINING_TYPE_OPTIONS = [
  '新培训', '复审', '换证', '其他',
];

const CUSTOMER_SOURCE_OPTIONS = [
  '2024二建注册人员', '2024一建通过名单', '2021', '2022', '2023', '小筑题库',
  '2024', '转介绍', '复购-老学员', '地推-现场收单', '茜茜-直播',
  '运营部（抖音）', '运营部-小红书', '话单', '话单-三类25', '话单--七大员25',
  '教育宝+坦途+厚学等', '20毕业浙江专科-工程类', '21毕业浙江专科',
  '23毕业专科-非工程', '24毕业专科-工程类', '其他',
];

const CONTRACT_STATUS_OPTIONS = ['未签约', '已签约', '已退款', '待定'];

const statusBadgeVariant: Record<string, string> = {
  已签约: 'bg-success/15 text-success border-success/20',
  未签约: 'bg-warning/15 text-warning border-warning/20',
  已退款: 'bg-destructive/15 text-destructive border-destructive/20',
  待定: 'bg-info-badge text-info-badge-foreground border-info-badge',
};

const AdminDashboardPage = () => {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [orders, setOrders] = useState<TrainingOrderListItem[]>([]);
  const [total, setTotal] = useState(0);
  const [page, setPage] = useState(1);
  const [pageSize] = useState(10);
  const [keyword, setKeyword] = useState('');
  const [trainingType, setTrainingType] = useState('');
  const [customerSource, setCustomerSource] = useState('');
  const [contractStatus, setContractStatus] = useState('');
  const [detailOpen, setDetailOpen] = useState(false);
  const [selectedOrder, setSelectedOrder] = useState<TrainingOrder | null>(null);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const fetchOrders = useCallback(async () => {
    const token = trainingOrders.getAdminToken();
    if (!token) {
      navigate('/admin/login');
      return;
    }
    setLoading(true);
    try {
      const result = await trainingOrders.getOrderList({
        page,
        pageSize,
        keyword: keyword || undefined,
        trainingType: trainingType || undefined,
        customerSource: customerSource || undefined,
        contractStatus: contractStatus || undefined,
      });
      setOrders(result.items);
      setTotal(result.total);
    } catch (error: any) {
      logger.error('获取订单列表失败', error);
      if (error?.response?.status === 401) {
        trainingOrders.clearAdminToken();
        navigate('/admin/login');
      }
    } finally {
      setLoading(false);
    }
  }, [page, pageSize, keyword, trainingType, customerSource, contractStatus, navigate]);

  useEffect(() => {
    fetchOrders();
  }, [fetchOrders]);

  const handleViewDetail = async (id: string) => {
    try {
      const detail = await trainingOrders.getOrderDetail(id);
      setSelectedOrder(detail);
      setDetailOpen(true);
    } catch (error) {
      logger.error('获取订单详情失败', error);
    }
  };

  const handleReset = () => {
    setKeyword('');
    setTrainingType('');
    setCustomerSource('');
    setContractStatus('');
    setPage(1);
  };

  const handleSearch = () => {
    setPage(1);
    fetchOrders();
  };

  const handleLogout = () => {
    trainingOrders.clearAdminToken();
    navigate('/admin/login');
  };

  const handleExport = async () => {
    try {
      const result = await trainingOrders.exportOrders({
        keyword: keyword || undefined,
        trainingType: trainingType || undefined,
        customerSource: customerSource || undefined,
        contractStatus: contractStatus || undefined,
      });

      const exportData = result.items.map((item) => ({
        订单编号: item.orderNo,
        培训类型: item.trainingType,
        客户来源: item.customerSource,
        合同状态: item.contractStatus,
        学员姓名: item.studentName,
        身份证号码: item.idCard,
        联系方式: item.phone,
        报考项目: item.examProject,
        班次专业: item.classMajor,
        原价: item.originalPrice,
        实收金额: item.actualPayment,
        折后金额: item.discountedPrice,
        尾款: item.remainingAmount,
        负责人: item.personInCharge,
        签约日期: item.signDate || '',
        承诺学员: item.promisedStudent,
        转介绍人: item.referrer,
        提交时间: item.createdAt.slice(0, 10),
      }));

      const worksheet = XLSX.utils.json_to_sheet(exportData);
      const workbook = XLSX.utils.book_new();
      XLSX.utils.book_append_sheet(workbook, worksheet, '订单列表');
      XLSX.writeFile(workbook, `培训订单_${new Date().toISOString().slice(0, 10)}.xlsx`);
    } catch (error) {
      logger.error('导出订单失败', error);
      toast('导出失败，请稍后重试');
    }
  };

  const columns: TableProps<TrainingOrderListItem>['columns'] = [
    { title: '学员姓名', dataIndex: 'studentName', width: 100, fixed: 'left' },
    { title: '联系方式', dataIndex: 'phone', width: 130 },
    { title: '培训类型', dataIndex: 'trainingType', width: 110 },
    { title: '报考项目', dataIndex: 'examProject', width: 130 },
    {
      title: '合同状态',
      dataIndex: 'contractStatus',
      width: 100,
      render: (status: string) => (
        <Badge
          variant="outline"
          className={`${statusBadgeVariant[status] || ''} border`}
        >
          {status}
        </Badge>
      ),
    },
    {
      title: '实收金额',
      dataIndex: 'actualPayment',
      width: 110,
      align: 'right',
      render: (val: number) => (
        <span className="font-mono">¥{val.toFixed(2)}</span>
      ),
    },
    { title: '负责人', dataIndex: 'personInCharge', width: 100 },
    { title: '签约日期', dataIndex: 'signDate', width: 110 },
    {
      title: '操作',
      key: 'action',
      fixed: 'right',
      width: 100,
      render: (_: any, record: TrainingOrderListItem) => (
        <Button
          variant="ghost"
          size="sm"
          onClick={() => handleViewDetail(record.id)}
        >
          查看详情
        </Button>
      ),
    },
  ];

  const handlePageChange = (newPage: number) => {
    setPage(newPage);
  };

  return (
    <div className="min-h-screen bg-background">
      <header className="bg-topbar text-topbar-foreground sticky top-0 z-30 print:hidden">
        <div className="max-w-[1400px] mx-auto px-4 md:px-6 h-14 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <button
              className="md:hidden p-1.5 hover:bg-white/10 rounded"
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            >
              {mobileMenuOpen ? <X className="size-5" /> : <Menu className="size-5" />}
            </button>
            <h1 className="text-base md:text-lg font-semibold">培训订单管理系统</h1>
          </div>
          <div className={`${mobileMenuOpen ? 'flex' : 'hidden'} md:flex items-center gap-3 absolute md:static top-14 left-0 right-0 md:top-auto bg-topbar md:bg-transparent p-4 md:p-0 flex-col md:flex-row`}>
            <span className="text-sm text-white/70 hidden md:inline">管理员</span>
            <Button
              variant="secondary"
              size="sm"
              onClick={handleExport}
              className="bg-white/10 text-white hover:bg-white/20 border-0"
            >
              <Download className="size-4 mr-1" />
              导出订单
            </Button>
            <button
              onClick={handleLogout}
              className="flex items-center gap-1.5 text-sm text-white/80 hover:text-white transition-colors"
            >
              <LogOut className="size-4" />
              退出登录
            </button>
          </div>
        </div>
      </header>

      <main className="max-w-[1400px] mx-auto px-4 md:px-6 py-6 print:p-0 print:max-w-none">
        <div className="bg-card rounded-lg p-4 mb-4 shadow-sm print:hidden">
          <div className="flex flex-col md:flex-row gap-3 items-stretch md:items-center">
            <div className="flex-1 relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 size-4 text-muted-foreground" />
              <Input
                placeholder="搜索学员姓名、联系方式、报考项目"
                value={keyword}
                onChange={(e) => setKeyword(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && handleSearch()}
                className="pl-9"
              />
            </div>
            <div className="flex flex-wrap gap-2 items-center">
              <Select value={trainingType} onValueChange={setTrainingType}>
                <SelectTrigger className="w-[130px]">
                  <SelectValue placeholder="培训类型" />
                </SelectTrigger>
                <SelectContent>
                  {TRAINING_TYPE_OPTIONS.map((item) => (
                    <SelectItem key={item} value={item}>
                      {item}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <Select value={customerSource} onValueChange={setCustomerSource}>
                <SelectTrigger className="w-[130px]">
                  <SelectValue placeholder="客户来源" />
                </SelectTrigger>
                <SelectContent>
                  {CUSTOMER_SOURCE_OPTIONS.map((item) => (
                    <SelectItem key={item} value={item}>
                      {item}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <Select value={contractStatus} onValueChange={setContractStatus}>
                <SelectTrigger className="w-[120px]">
                  <SelectValue placeholder="合同状态" />
                </SelectTrigger>
                <SelectContent>
                  {CONTRACT_STATUS_OPTIONS.map((item) => (
                    <SelectItem key={item} value={item}>
                      {item}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <Button variant="outline" size="sm" onClick={handleReset}>
                <RefreshCw className="size-3.5 mr-1" />
                重置
              </Button>
              <Button size="sm" onClick={handleSearch}>
                搜索
              </Button>
            </div>
          </div>
        </div>

        <div className="bg-card rounded-lg shadow-sm overflow-hidden print:hidden">
          <div className="hidden md:block">
            <Table
              columns={columns}
              dataSource={orders}
              loading={loading}
              rowKey="id"
              scroll={{ x: 1000, y: 500 }}
              pagination={{
                current: page,
                pageSize,
                total,
                onChange: handlePageChange,
                showSizeChanger: false,
                showTotal: (t) => `共 ${t} 条`,
              }}
            />
          </div>

          <div className="md:hidden space-y-3 p-4">
            {orders.map((order) => (
              <div
                key={order.id}
                className="border border-border rounded-lg p-4 bg-card"
              >
                <div className="flex justify-between items-start mb-2">
                  <div>
                    <div className="font-medium">{order.studentName}</div>
                    <div className="text-xs text-muted-foreground font-mono">
                      {order.phone}
                    </div>
                  </div>
                  <Badge
                    variant="outline"
                    className={`${statusBadgeVariant[order.contractStatus] || ''}`}
                  >
                    {order.contractStatus}
                  </Badge>
                </div>
                <div className="grid grid-cols-2 gap-2 text-xs text-muted-foreground mb-3">
                  <div>培训类型：{order.trainingType}</div>
                  <div>报考项目：{order.examProject}</div>
                  <div>负责人：{order.personInCharge}</div>
                  <div>签约日期：{order.signDate || '-'}</div>
                </div>
                <div className="flex justify-between items-center pt-2 border-t border-border">
                  <span className="font-mono text-sm font-medium">
                    ¥{order.actualPayment.toFixed(2)}
                  </span>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => handleViewDetail(order.id)}
                  >
                    查看详情
                  </Button>
                </div>
              </div>
            ))}
            {!loading && orders.length === 0 && (
              <div className="text-center py-12 text-muted-foreground text-sm">
                暂无订单数据
              </div>
            )}
            <div className="flex justify-center pt-2">
              <Button
                variant="outline"
                size="sm"
                onClick={() => handlePageChange(page + 1)}
                disabled={page * pageSize >= total}
              >
                加载更多
              </Button>
            </div>
          </div>
        </div>
      </main>

      <OrderDetailDrawer
        order={selectedOrder}
        open={detailOpen}
        onClose={() => setDetailOpen(false)}
      />
    </div>
  );
};

export default AdminDashboardPage;
