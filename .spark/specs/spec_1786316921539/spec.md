# 技术方案

## 开发元信息
- 开发模式: 全栈应用
- 涉及层级: [数据库, 服务端, 前端]

## 页面路由与导航

### 页面路由
| 页面 | 路径 | 说明 |
|------|------|------|
| 订单填写表单页 | `/` | 公开入口，客户通过分享链接访问 |
| 管理员登录页 | `/admin/login` | 管理员身份验证入口 |
| 订单管理后台页 | `/admin` | 订单列表、搜索筛选、详情、打印、导出 |

### 导航设计
- 导航机制：页面路由
- 导航项：
  - 表单页无导航（独立公开页面）
  - 管理后台顶部操作栏含系统名称与退出登录入口

## 业务组件
| 组件 | 来源 | 关联页面 | 对应功能点 |
|------|------|---------|-----------|
| Table | `@lark-apaas/client-toolkit/antd-table` | 订单管理后台页 | 订单列表展示 |
| Sheet / Dialog | shadcn/ui | 订单管理后台页 | 订单详情抽屉面板 |
| Button | shadcn/ui | 全部页面 | 提交、导出、打印等操作 |
| Input | shadcn/ui | 表单页、登录页、管理后台 | 文本输入、搜索框 |
| Select | shadcn/ui | 表单页、管理后台 | 下拉选择字段、筛选 |
| Calendar / DatePicker | shadcn/ui | 表单页 | 签约日期选择 |
| Card | shadcn/ui | 全部页面 | 表单卡片、登录卡片 |
| Label | shadcn/ui | 表单页、登录页 | 字段标签 |
| Badge | shadcn/ui | 管理后台 | 合同状态标签 |
| Pagination | shadcn/ui 或 antd-table 内置 | 管理后台 | 列表分页 |

## 数据模型

### 数据库设计

#### 订单表（training_order）
用途：存储培训订单的完整信息，包含学员信息、业务信息和费用明细。

核心字段：
- order_no: varchar (订单编号，系统自动生成，唯一)
- training_type: varchar (培训类型：电工/焊工/叉车/高处作业/特种设备安全管理/电梯维修/起重机械等)
- customer_source: varchar (客户来源：朋友介绍/老学员介绍/抖音/快手/微信/陌拜/转介绍/其他)
- contract_status: varchar (合同状态：未签约/已签约/已退款/待定)
- student_name: varchar (对应学员姓名)
- id_card: varchar (身份证号码)
- phone: varchar (联系方式)
- exam_project: varchar (报考项目：初级/中级/高级/技师/高级技师/特种作业操作证/特种设备作业证等)
- class_major: varchar (班次专业：全日制班/周末班/晚班/VIP班/一对一/网络班等)
- original_price: numeric (原价)
- actual_payment: numeric (实收金额)
- discounted_price: numeric (折后金额)
- remaining_amount: numeric (尾款)
- person_in_charge: varchar (负责人)
- sign_date: date (签约日期)
- promised_student: varchar (承诺学员)
- referrer: varchar (转介绍人)

索引：
- order_no 唯一索引
- student_name、phone、exam_project 用于关键词搜索
- training_type、customer_source、contract_status 用于筛选
- sign_date 用于排序

Mock数据：预置 5 条不同状态、不同培训类型的示例订单。

## 业务模型

### API 设计

#### 订单填写表单页相关
**页面路径**: `/`
**功能全景**：
| 功能 | 实现方式 | 说明 |
|------|----------|------|
| 提交订单 | API | POST /api/training-orders |
| 获取下拉选项配置 | 前端常量 | 培训类型、客户来源、合同状态、报考项目、班次专业预置选项 |

**所需 API**:
```typescript
// 创建培训订单 [领域模型: TrainingOrder] [对应页面功能: 提交订单]
POST /api/training-orders
Request: {
  trainingType: string;
  customerSource: string;
  contractStatus: string;
  studentName: string;
  idCard: string;
  phone: string;
  examProject: string;
  classMajor: string;
  originalPrice: number;
  actualPayment: number;
  discountedPrice: number;
  remainingAmount: number;
  personInCharge: string;
  signDate: string; // ISO date string
  promisedStudent: string;
  referrer: string;
}
Response: {
  id: string;
  orderNo: string;
  message: string;
}
```

#### 管理员登录相关
**页面路径**: `/admin/login`
**功能全景**：
| 功能 | 实现方式 | 说明 |
|------|----------|------|
| 管理员密码验证 | API | POST /api/admin/login |
| 登录状态保持 | localStorage | 前端存储登录 token |

**所需 API**:
```typescript
// 管理员登录 [领域模型: AdminAuth] [对应页面功能: 密码验证]
POST /api/admin/login
Request: {
  password: string;
}
Response: {
  success: boolean;
  token: string;
}
```

管理员密码通过环境变量 `ADMIN_PASSWORD` 配置，默认值 `admin123`。登录成功后服务端返回一个简单 token（包含过期时间戳 + 签名），前端存储在 localStorage 中，后续管理接口请求时在 Header 中携带 `X-Admin-Token` 进行验证。

#### 订单管理后台页相关
**页面路径**: `/admin`
**功能全景**：
| 功能 | 实现方式 | 说明 |
|------|----------|------|
| 订单列表（分页+搜索+筛选） | API | GET /api/training-orders |
| 订单详情 | API | GET /api/training-orders/:id |
| 导出订单（Excel） | 前端 xlsx 库 | 前端根据当前筛选数据生成 Excel 文件下载 |
| 打印订单 | 浏览器原生打印 | 前端 CSS 媒体查询 + window.print() |

**所需 API**:
```typescript
// 分页查询订单列表 [领域模型: TrainingOrder] [对应页面功能: 列表+搜索+筛选+分页]
GET /api/training-orders?page=1&pageSize=20&keyword=xxx&trainingType=xxx&customerSource=xxx&contractStatus=xxx
Response: {
  items: Array<{
    id: string;
    orderNo: string;
    trainingType: string;
    customerSource: string;
    contractStatus: string;
    studentName: string;
    phone: string;
    examProject: string;
    classMajor: string;
    actualPayment: number;
    personInCharge: string;
    signDate: string;
    createdAt: string;
  }>;
  total: number;
  page: number;
  pageSize: number;
}

// 获取订单详情 [领域模型: TrainingOrder] [对应页面功能: 查看详情]
GET /api/training-orders/:id
Response: {
  id: string;
  orderNo: string;
  trainingType: string;
  customerSource: string;
  contractStatus: string;
  studentName: string;
  idCard: string;
  phone: string;
  examProject: string;
  classMajor: string;
  originalPrice: number;
  actualPayment: number;
  discountedPrice: number;
  remainingAmount: number;
  personInCharge: string;
  signDate: string;
  promisedStudent: string;
  referrer: string;
  createdAt: string;
}

// 导出全部订单（按筛选条件）[领域模型: TrainingOrder] [对应页面功能: 数据导出]
GET /api/training-orders/export?keyword=xxx&trainingType=xxx&customerSource=xxx&contractStatus=xxx
Response: {
  items: Array<TrainingOrderDetail>;
}
```

**管理端鉴权说明**：
- 所有 `/api/training-orders` GET 系列接口（列表、详情、导出）均需管理员登录验证
- 验证方式：请求 Header 携带 `X-Admin-Token`，服务端校验有效性
- POST 创建订单接口为公开接口（供客户填写表单提交），无需鉴权
