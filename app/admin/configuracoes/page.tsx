'use client';

import { useState, useEffect } from 'react';
import { Settings, Save, Loader2 } from 'lucide-react';
import { toast } from 'sonner';

const settingFields = [
  { key: 'free_ai_credits', label: 'Créditos gratuitos por mês', type: 'number' },
  { key: 'premium_ai_credits', label: 'Créditos Premium por mês', type: 'number' },
  { key: 'prayer_credit_cost', label: 'Custo por oração (créditos)', type: 'number' },
  { key: 'reflection_credit_cost', label: 'Custo por reflexão (créditos)', type: 'number' },
  { key: 'my_moment_credit_cost', label: 'Custo Meu Momento (créditos)', type: 'number' },
  { key: 'price_monthly_brl', label: 'Preço mensal (R$)', type: 'text' },
  { key: 'price_yearly_brl', label: 'Preço anual (R$)', type: 'text' },
];

export default function AdminConfiguracoes() {
  const [settings, setSettings] = useState<Record<string, string>>({});
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    fetch('/api/admin/settings')
      .then((r) => r.json())
      .then((d) => setSettings(d?.settings ?? {}))
      .catch(() => {});
  }, []);

  const handleSave = async () => {
    setSaving(true);
    try {
      const res = await fetch('/api/admin/settings', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(settings),
      });
      if (!res.ok) throw new Error();
      toast.success('Configurações salvas!');
    } catch {
      toast.error('Erro ao salvar.');
    } finally {
      setSaving(false);
    }
  };

  return (
    <div>
      <h1 className="text-xl font-display font-bold mb-6 flex items-center gap-2">
        <Settings className="w-5 h-5 text-[#C9A84C]" /> Configurações
      </h1>
      <div className="bg-white rounded-xl p-5 space-y-4" style={{ boxShadow: 'var(--shadow-sm)' }}>
        {settingFields.map((field) => (
          <div key={field.key}>
            <label className="text-xs font-medium text-foreground mb-1 block">{field.label}</label>
            <input
              type={field.type}
              value={settings[field.key] ?? ''}
              onChange={(e) => setSettings({ ...settings, [field.key]: e.target.value })}
              className="w-full px-3 py-2.5 rounded-lg bg-muted/50 text-sm focus:outline-none focus:ring-2 focus:ring-[#C9A84C]/40"
            />
          </div>
        ))}
        <button onClick={handleSave} disabled={saving} className="w-full py-2.5 rounded-lg gold-gradient text-white text-sm font-semibold flex items-center justify-center gap-2 disabled:opacity-50">
          {saving ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
          {saving ? 'Salvando...' : 'Salvar configurações'}
        </button>
      </div>
    </div>
  );
}
