-- 培训订单表初始化脚本
-- 此脚本在 PostgreSQL 容器首次启动时自动执行

-- 创建自定义类型（如果不存在）
DO $$
BEGIN
    IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'user_profile') THEN
        CREATE TYPE user_profile AS (
            user_id TEXT
        );
    END IF;
END$$;

-- 创建 training_order 表
CREATE TABLE IF NOT EXISTS training_order (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    order_no VARCHAR(32) NOT NULL UNIQUE,
    training_type VARCHAR(100) NOT NULL,
    customer_source VARCHAR(100) NOT NULL,
    contract_status VARCHAR(50) NOT NULL DEFAULT 'pending',
    student_name VARCHAR(100) NOT NULL,
    id_card VARCHAR(20) NOT NULL,
    phone VARCHAR(20) NOT NULL,
    exam_project VARCHAR(100) NOT NULL,
    class_major VARCHAR(100) NOT NULL,
    original_price NUMERIC NOT NULL DEFAULT 0,
    actual_payment NUMERIC NOT NULL DEFAULT 0,
    discounted_price NUMERIC NOT NULL DEFAULT 0,
    remaining_amount NUMERIC NOT NULL DEFAULT 0,
    person_in_charge VARCHAR(100) NOT NULL,
    sign_date DATE,
    promised_student VARCHAR(100) NOT NULL DEFAULT '',
    referrer VARCHAR(100) NOT NULL DEFAULT '',
    _created_at TIMESTAMPTZ(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    _created_by user_profile DEFAULT NULL,
    _updated_at TIMESTAMPTZ(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    _updated_by user_profile DEFAULT NULL
);

-- 创建索引
CREATE UNIQUE INDEX IF NOT EXISTS idx_training_order_order_no ON training_order(order_no);
CREATE INDEX IF NOT EXISTS idx_training_order_student_name ON training_order(student_name);
CREATE INDEX IF NOT EXISTS idx_training_order_phone ON training_order(phone);
CREATE INDEX IF NOT EXISTS idx_training_order_exam_project ON training_order(exam_project);
CREATE INDEX IF NOT EXISTS idx_training_order_training_type ON training_order(training_type);
CREATE INDEX IF NOT EXISTS idx_training_order_customer_source ON training_order(customer_source);
CREATE INDEX IF NOT EXISTS idx_training_order_contract_status ON training_order(contract_status);
CREATE INDEX IF NOT EXISTS idx_training_order_sign_date ON training_order(sign_date);

-- 插入示例数据（可选，首次启动时）
INSERT INTO training_order (
    order_no, training_type, customer_source, contract_status,
    student_name, id_card, phone, exam_project, class_major,
    original_price, actual_payment, discounted_price, remaining_amount,
    person_in_charge, sign_date, promised_student, referrer
) VALUES
(
    'PX20260810001', '非培训', '转介绍', '已回款',
    '张三', '110101199001011234', '13800138001', '理工学位', '理工学位',
    1500.00, 1500.00, 750.00, 0.00,
    '刘顺景', '2026-08-07', '无', ''
),
(
    'PX20260810002', '非培训', '21毕业浙江', '已回款',
    '李四', '110101199002022345', '13800138002', '理工学位', '学位论文',
    1500.00, 1500.00, 750.00, 0.00,
    '刘彩兰', '2026-08-07', '无', ''
)
ON CONFLICT (order_no) DO NOTHING;

-- 设置更新时间触发器
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW._updated_at = CURRENT_TIMESTAMP;
    RETURN NEW;
END;
$$ language 'plpgsql';

DROP TRIGGER IF EXISTS update_training_order_updated_at ON training_order;
CREATE TRIGGER update_training_order_updated_at
    BEFORE UPDATE ON training_order
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();
