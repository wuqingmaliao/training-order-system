import { useNavigate } from 'react-router-dom';
import { Users, Shield, FileText } from 'lucide-react';
import { Button } from '@client/src/components/ui/button';
import { Card, CardContent } from '@client/src/components/ui/card';

const LandingPage = () => {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100 flex flex-col items-center justify-center p-4">
      <div className="text-center mb-10">
        <div className="inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-primary/10 mb-4">
          <FileText className="size-8 text-primary" />
        </div>
        <h1 className="text-3xl font-bold text-foreground mb-2">培训订单管理系统</h1>
        <p className="text-muted-foreground">请选择登录入口</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 w-full max-w-2xl">
        <Card
          className="cursor-pointer hover:shadow-lg transition-shadow border-2 hover:border-primary/50"
          onClick={() => navigate('/login')}
        >
          <CardContent className="pt-8 pb-8 flex flex-col items-center text-center">
            <div className="w-14 h-14 rounded-xl bg-blue-100 flex items-center justify-center mb-4">
              <Users className="size-7 text-blue-600" />
            </div>
            <h2 className="text-xl font-semibold mb-2">员工入口</h2>
            <p className="text-sm text-muted-foreground mb-4">
              员工登录、注册账号<br />
              填写和管理客户订单
            </p>
            <Button className="w-full">
              员工登录 / 注册
            </Button>
          </CardContent>
        </Card>

        <Card
          className="cursor-pointer hover:shadow-lg transition-shadow border-2 hover:border-primary/50"
          onClick={() => navigate('/admin/login')}
        >
          <CardContent className="pt-8 pb-8 flex flex-col items-center text-center">
            <div className="w-14 h-14 rounded-xl bg-amber-100 flex items-center justify-center mb-4">
              <Shield className="size-7 text-amber-600" />
            </div>
            <h2 className="text-xl font-semibold mb-2">管理员入口</h2>
            <p className="text-sm text-muted-foreground mb-4">
              管理员后台登录<br />
              查看所有订单、员工管理、统计
            </p>
            <Button variant="secondary" className="w-full">
              管理员登录
            </Button>
          </CardContent>
        </Card>
      </div>

      <p className="text-xs text-muted-foreground mt-10">
        © 2026 培训订单管理系统
      </p>
    </div>
  );
};

export default LandingPage;
