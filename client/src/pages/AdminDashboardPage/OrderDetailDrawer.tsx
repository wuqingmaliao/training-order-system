import { X, Printer } from 'lucide-react';
import type { TrainingOrder } from '@shared/api.interface';

interface OrderDetailDrawerProps {
  order: TrainingOrder | null;
  open: boolean;
  onClose: () => void;
}

const statusColors: Record<string, string> = {
  已签约: 'bg-success/15 text-success',
  未签约: 'bg-warning/15 text-warning',
  已退款: 'bg-destructive/15 text-destructive',
  待定: 'bg-info-badge text-info-badge-foreground',
};

const InfoRow = ({ label, value }: { label: string; value: string | number | null }) => (
  <div className="flex justify-between items-start py-2 border-b border-border last:border-0">
    <span className="text-sm text-muted-foreground shrink-0 w-28">{label}</span>
    <span className="text-sm text-foreground text-right font-mono break-all">
      {value !== null && value !== undefined && value !== '' ? value : '-'}
    </span>
  </div>
);

const OrderDetailDrawer = ({ order, open, onClose }: OrderDetailDrawerProps) => {
  if (!order) return null;

  const handlePrint = () => {
    window.print();
  };

  return (
    <>
      {open && (
        <div
          className="fixed inset-0 bg-black/40 z-40 print:hidden"
          onClick={onClose}
        />
      )}
      <div
        id="order-detail-drawer"
        className={`fixed top-0 right-0 h-full w-full md:w-[520px] bg-card z-50 shadow-xl transform transition-transform duration-300 ease-in-out print:static print:w-full print:shadow-none print:transform-none ${
          open ? 'translate-x-0' : 'translate-x-full print:translate-x-0'
        }`}
      >
        <div className="h-full flex flex-col">
          <div className="flex items-center justify-between px-6 py-4 border-b border-border print:hidden">
            <h2 className="text-lg font-semibold">订单详情</h2>
            <div className="flex items-center gap-2">
              <button
                onClick={handlePrint}
                className="flex items-center gap-1.5 px-3 py-1.5 text-sm text-primary bg-accent hover:bg-accent/80 rounded-md transition-colors"
              >
                <Printer className="size-4" />
                打印订单
              </button>
              <button
                onClick={onClose}
                className="p-1.5 text-muted-foreground hover:text-foreground hover:bg-accent rounded-md transition-colors"
              >
                <X className="size-5" />
              </button>
            </div>
          </div>

          <div className="flex-1 overflow-y-auto p-6 print:p-0 print:overflow-visible">
            <div className="hidden print:block mb-6 text-center border-b pb-4">
              <h1 className="text-xl font-bold mb-1">培训订单详情</h1>
              <p className="text-sm text-muted-foreground">
                订单编号：{order.orderNo} | 提交时间：{order.createdAt.slice(0, 10)}
              </p>
            </div>

            <div className="mb-6">
              <h3 className="text-sm font-semibold text-foreground mb-3 flex items-center gap-2">
                <div className="w-1 h-4 bg-primary rounded-full" />
                学员信息
              </h3>
              <div className="bg-muted/30 rounded-lg p-4">
                <InfoRow label="学员姓名" value={order.studentName} />
                <InfoRow label="身份证号码" value={order.idCard} />
                <InfoRow label="联系方式" value={order.phone} />
                <InfoRow label="承诺学员" value={order.promisedStudent} />
                <InfoRow label="转介绍人" value={order.referrer} />
              </div>
            </div>

            <div className="mb-6">
              <h3 className="text-sm font-semibold text-foreground mb-3 flex items-center gap-2">
                <div className="w-1 h-4 bg-primary rounded-full" />
                业务信息
              </h3>
              <div className="bg-muted/30 rounded-lg p-4">
                <InfoRow label="培训类型" value={order.trainingType} />
                <InfoRow label="客户来源" value={order.customerSource} />
                <InfoRow
                  label="合同状态"
                  value={null}
                />
                <div className="flex justify-between items-start py-2 border-b border-border">
                  <span className="text-sm text-muted-foreground w-28">合同状态</span>
                  <span
                    className={`text-xs px-2 py-0.5 rounded-full font-medium ${
                      statusColors[order.contractStatus] || 'bg-secondary text-secondary-foreground'
                    }`}
                  >
                    {order.contractStatus}
                  </span>
                </div>
                <InfoRow label="报考项目" value={order.examProject} />
                <InfoRow label="班次专业" value={order.classMajor} />
                <InfoRow label="负责人" value={order.personInCharge} />
                <InfoRow label="签约日期" value={order.signDate} />
              </div>
            </div>

            <div>
              <h3 className="text-sm font-semibold text-foreground mb-3 flex items-center gap-2">
                <div className="w-1 h-4 bg-primary rounded-full" />
                费用明细
              </h3>
              <div className="bg-muted/30 rounded-lg p-4">
                <InfoRow label="原价" value={`¥${order.originalPrice.toFixed(2)}`} />
                <InfoRow label="实收金额" value={`¥${order.actualPayment.toFixed(2)}`} />
                <InfoRow label="折后金额" value={`¥${order.discountedPrice.toFixed(2)}`} />
                <InfoRow label="尾款" value={`¥${order.remainingAmount.toFixed(2)}`} />
              </div>
            </div>
          </div>
        </div>
      </div>
    </>
  );
};

export default OrderDetailDrawer;
