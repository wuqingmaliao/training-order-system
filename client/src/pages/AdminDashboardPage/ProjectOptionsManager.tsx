import { useState, useEffect } from 'react';
import { Plus, X, Save, Loader2 } from 'lucide-react';

import { Button } from '@client/src/components/ui/button';
import { Input } from '@client/src/components/ui/input';
import { Card, CardContent, CardHeader, CardTitle } from '@client/src/components/ui/card';
import { Tabs, TabsList, TabsTrigger, TabsContent } from '@client/src/components/ui/tabs';
import { trainingOrders } from '@client/src/api';
import { toast } from 'sonner';

interface OptionGroupProps {
  title: string;
  loadOptions: () => Promise<{ options: string[] }>;
  saveOptions: (options: string[]) => Promise<{ options: string[] }>;
}

const OptionGroup = ({ title, loadOptions, saveOptions }: OptionGroupProps) => {
  const [options, setOptions] = useState<string[]>([]);
  const [newOption, setNewOption] = useState('');
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    loadOptions().then(res => {
      setOptions(res.options || []);
    }).catch(() => {
      toast(`加载${title}失败`);
    }).finally(() => setLoading(false));
  }, [loadOptions, title]);

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
      await saveOptions(options);
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
        <CardTitle className="text-base">{title}</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="flex gap-2">
          <Input
            placeholder="输入新选项"
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

const ProjectOptionsManager = () => {
  return (
    <Tabs defaultValue="project">
      <TabsList>
        <TabsTrigger value="project">项目选项</TabsTrigger>
        <TabsTrigger value="class">班次选项</TabsTrigger>
        <TabsTrigger value="material">资料状态</TabsTrigger>
      </TabsList>
      <TabsContent value="project" className="mt-4">
        <OptionGroup
          title="项目选项管理"
          loadOptions={trainingOrders.getProjectOptions}
          saveOptions={trainingOrders.updateProjectOptions}
        />
      </TabsContent>
      <TabsContent value="class" className="mt-4">
        <OptionGroup
          title="班次选项管理"
          loadOptions={trainingOrders.getClassMajorOptions}
          saveOptions={trainingOrders.updateClassMajorOptions}
        />
      </TabsContent>
      <TabsContent value="material" className="mt-4">
        <OptionGroup
          title="资料状态管理"
          loadOptions={trainingOrders.getMaterialStatusOptions}
          saveOptions={trainingOrders.updateMaterialStatusOptions}
        />
      </TabsContent>
    </Tabs>
  );
};

export default ProjectOptionsManager;
