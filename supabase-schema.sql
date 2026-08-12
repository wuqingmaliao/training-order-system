-- ============================================
-- 培训订单管理系统 - Supabase 建表脚本
-- 在 Supabase Dashboard → SQL Editor 中执行
-- ============================================

-- 用户表
CREATE TABLE IF NOT EXISTS users (
  id TEXT PRIMARY KEY,
  username TEXT NOT NULL UNIQUE,
  password_hash TEXT NOT NULL,
  real_name TEXT NOT NULL,
  role TEXT NOT NULL DEFAULT 'staff',
  is_active BOOLEAN NOT NULL DEFAULT TRUE,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- 培训订单表
CREATE TABLE IF NOT EXISTS training_order (
  id TEXT PRIMARY KEY,
  order_no TEXT NOT NULL UNIQUE,
  training_type TEXT NOT NULL,
  customer_source TEXT NOT NULL DEFAULT '',
  contract_status TEXT NOT NULL DEFAULT '未签约',
  student_name TEXT NOT NULL,
  id_card TEXT NOT NULL DEFAULT '',
  phone TEXT NOT NULL DEFAULT '',
  exam_project TEXT NOT NULL DEFAULT '',
  class_major TEXT NOT NULL DEFAULT '',
  original_price REAL NOT NULL DEFAULT 0,
  actual_payment REAL NOT NULL DEFAULT 0,
  discounted_price REAL NOT NULL DEFAULT 0,
  remaining_amount REAL NOT NULL DEFAULT 0,
  person_in_charge TEXT NOT NULL DEFAULT '',
  sign_date TEXT,
  promised_student TEXT NOT NULL DEFAULT '',
  referrer TEXT NOT NULL DEFAULT '',
  user_id TEXT REFERENCES users(id),
  created_by_name TEXT NOT NULL DEFAULT '',
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- 索引
CREATE INDEX IF NOT EXISTS idx_training_order_user_id ON training_order(user_id);
CREATE INDEX IF NOT EXISTS idx_training_order_student_name ON training_order(student_name);
CREATE INDEX IF NOT EXISTS idx_training_order_phone ON training_order(phone);
CREATE INDEX IF NOT EXISTS idx_training_order_exam_project ON training_order(exam_project);
CREATE INDEX IF NOT EXISTS idx_training_order_training_type ON training_order(training_type);
CREATE INDEX IF NOT EXISTS idx_training_order_customer_source ON training_order(customer_source);
CREATE INDEX IF NOT EXISTS idx_training_order_contract_status ON training_order(contract_status);
CREATE INDEX IF NOT EXISTS idx_training_order_sign_date ON training_order(sign_date);
CREATE INDEX IF NOT EXISTS idx_training_order_created_at ON training_order(created_at);
CREATE INDEX IF NOT EXISTS idx_users_username ON users(username);

-- 管理员账号由应用首次启动时自动创建
-- 密码通过 ADMIN_PASSWORD 环境变量设置，未设置则随机生成（查看 Vercel Logs）
-- INSERT INTO users ... （已由应用自动处理，无需手动插入）
