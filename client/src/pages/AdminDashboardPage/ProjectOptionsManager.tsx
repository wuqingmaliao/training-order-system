import { useState, useEffect } from 'react';
import { Plus, X, Save, Loader2 } from 'lucide-react';

import { Button } from '@client/src/components/ui/button';
import { Input } from '@client/src/components/ui/input';
import { Card, CardContent, CardHeader, CardTitle } from '@client/src/components/ui/card';
import { trainingOrders } from '@client/src/api';
import { toast } from 'sonner';

const ProjectOptionsManager = () => {
  const [options, setOptions] = useState<string[]>([]);
  const [newOption, setNewOption] = useState('');
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    trainingOrders.getProjectOptions().then(res => {
      setOptions(res.options || []);
    }).catch(() => {
      toast('加载项目选项失败');
    }).finally(() => setLoading(false));
  }, []);

  const handleAdd = () => {
    const v = newOption.trim();
    if (!v) return;
    if (options.includes(v)) {
      toast('该选项已存在');
      return;
    }
    setOptions([...options, v]);
    setNewOption('');
  };

  const handleRemove = (idx: number) => {
    setOptions(options.filter((_, i) => i !== idx));
  };

  const handleSave = async () => {
    setSaving(true);
    try {
      await trainingOrders.updateProjectOptions(options);
      toast('保存成功');
    } catch (error: any) {
      toast(error?.message || '保存失败');
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12 text-muted-foreground">
        <Loader2 className="size-5 animate-spin mr-2" /> 加载中...
      </div>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-base">项目选项管理</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="flex gap-2">
          <Input
            placeholder="输入新项目名称"
            value={newOption}
            onChange={(e) => setNewOption(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && (e.preventDefault(), handleAdd())}
          />
          <Button onClick={handleAdd} variant="outline">
            <Plus className="size-4 mr-1" /> 添加
          </Button>
        </div>

        <div className="flex flex-wrap gap-2">
          {options.length === 0 && (
            <span className="text-sm text-muted-foreground">暂无选项，请添加</span>
          )}
          {options.map((opt, idx) => (
            <div
              key={idx}
              className="flex items-center gap-1 bg-accent rounded-md pl-3 pr-1 py-1 text-sm"
            >
              <span>{opt}</span>
              <button
                onClick={() => handleRemove(idx)}
                className="text-muted-foreground hover:text-destructive p-0.5"
              >
                <X className="size-3.5" />
              </button>
            </div>
          ))}
        </div>

        <div className="flex justify-end">
          <Button onClick={handleSave} disabled={saving}>
            {saving ? <Loader2 className="size-4 mr-1 animate-spin" /> : <Save className="size-4 mr-1" />}
            保存
          </Button>
        </div>
      </CardContent>
    </Card>
  );
};

export default ProjectOptionsManager;
