import { useState } from 'react';
import { Download, Trash2, Building2, Users, Target, Globe, Clock } from 'lucide-react';
import { Card } from '../components/ui/Card';
import { Button } from '../components/ui/Button';
import { ConfirmDialog } from '../components/ui/Modal';
import { useAppContext, useSettings } from '../context/AppContext';
import { storage } from '../utils/storage';
import { PLATFORM_CONFIG, type Platform, type ContentGoal } from '../types';

const PLATFORMS: Platform[] = ['instagram', 'linkedin', 'blog', 'youtube', 'email', 'twitter', 'facebook'];
const GOALS: ContentGoal[] = ['awareness', 'engagement', 'conversion', 'retention'];

export default function Settings() {
  const { dispatch } = useAppContext();
  const settings = useSettings();

  const [form, setForm] = useState({ ...settings });
  const [saved, setSaved] = useState(false);
  const [clearConfirm, setClearConfirm] = useState(false);

  function handleSave() {
    dispatch({ type: 'UPDATE_SETTINGS', payload: form });
    setSaved(true);
    setTimeout(() => setSaved(false), 2000);
  }

  function handleClearData() {
    dispatch({ type: 'CLEAR_ALL_DATA' });
    setClearConfirm(false);
  }

  function handleExport() {
    const data = storage.exportAll();
    const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `bvp-marketing-agent-export-${new Date().toISOString().split('T')[0]}.json`;
    a.click();
    URL.revokeObjectURL(url);
  }

  function togglePlatform(p: Platform) {
    setForm((f) => ({
      ...f,
      activePlatforms: f.activePlatforms.includes(p)
        ? f.activePlatforms.filter((x) => x !== p)
        : [...f.activePlatforms, p],
    }));
  }

  function setPreferredTime(platform: Platform, time: string) {
    setForm((f) => ({
      ...f,
      preferredTimes: { ...f.preferredTimes, [platform]: time },
    }));
  }

  return (
    <div className="p-5 md:p-6 max-w-2xl mx-auto space-y-5">
      <h1 className="text-xl font-heading font-bold text-[#F5F5F5] tracking-wide uppercase">
        Settings
      </h1>

      {/* Business Profile */}
      <Card>
        <div className="flex items-center gap-2 mb-4">
          <Building2 size={14} className="text-orange-400" />
          <h2 className="text-xs font-heading font-semibold text-[#F5F5F5] uppercase tracking-wide">
            Business Profile
          </h2>
        </div>
        <div className="space-y-3">
          <div>
            <label className="block text-xs font-medium text-[#A3A3A3] mb-1">Business Name</label>
            <input
              type="text"
              value={form.businessName}
              onChange={(e) => setForm((f) => ({ ...f, businessName: e.target.value }))}
              className="w-full h-9 px-3 text-sm bg-[#0A0A0A] border border-[#2A2A2A] rounded-lg text-[#F5F5F5] placeholder-[#6B6B6B] focus:outline-none focus:border-orange-500/60"
            />
          </div>
          <div>
            <label className="block text-xs font-medium text-[#A3A3A3] mb-1">Industry</label>
            <input
              type="text"
              value={form.industry}
              onChange={(e) => setForm((f) => ({ ...f, industry: e.target.value }))}
              placeholder="e.g. Freelance / Consulting"
              className="w-full h-9 px-3 text-sm bg-[#0A0A0A] border border-[#2A2A2A] rounded-lg text-[#F5F5F5] placeholder-[#6B6B6B] focus:outline-none focus:border-orange-500/60"
            />
          </div>
          <div>
            <label className="block text-xs font-medium text-[#A3A3A3] mb-1">
              <Users size={11} className="inline mr-1" />Target Audience
            </label>
            <textarea
              value={form.targetAudience}
              onChange={(e) => setForm((f) => ({ ...f, targetAudience: e.target.value }))}
              rows={2}
              placeholder="Describe your ideal customer..."
              className="w-full px-3 py-2 text-sm bg-[#0A0A0A] border border-[#2A2A2A] rounded-lg text-[#F5F5F5] placeholder-[#6B6B6B] focus:outline-none focus:border-orange-500/60 resize-none"
            />
          </div>
          <div>
            <label className="block text-xs font-medium text-[#A3A3A3] mb-1">
              <Target size={11} className="inline mr-1" />Primary Marketing Goal
            </label>
            <select
              value={form.primaryGoal}
              onChange={(e) => setForm((f) => ({ ...f, primaryGoal: e.target.value as ContentGoal }))}
              className="w-full h-9 px-3 text-sm bg-[#0A0A0A] border border-[#2A2A2A] rounded-lg text-[#F5F5F5] focus:outline-none focus:border-orange-500/60"
            >
              {GOALS.map((g) => (
                <option key={g} value={g} className="capitalize">{g}</option>
              ))}
            </select>
          </div>
        </div>
      </Card>

      {/* Platform Connections */}
      <Card>
        <div className="flex items-center gap-2 mb-4">
          <Globe size={14} className="text-orange-400" />
          <h2 className="text-xs font-heading font-semibold text-[#F5F5F5] uppercase tracking-wide">
            Active Platforms
          </h2>
        </div>
        <div className="flex flex-wrap gap-2">
          {PLATFORMS.map((p) => (
            <button
              key={p}
              onClick={() => togglePlatform(p)}
              className={`flex items-center gap-2 px-3 py-2 rounded-xl text-xs border transition-colors ${
                form.activePlatforms.includes(p)
                  ? 'bg-orange-500/10 border-orange-500/40 text-orange-400'
                  : 'bg-[#0A0A0A] border-[#2A2A2A] text-[#6B6B6B] hover:border-[#3A3A3A]'
              }`}
            >
              <div
                className="w-2.5 h-2.5 rounded-full"
                style={{ backgroundColor: PLATFORM_CONFIG[p].color }}
              />
              {PLATFORM_CONFIG[p].label}
              <span
                className={`ml-0.5 text-[9px] font-medium ${
                  form.activePlatforms.includes(p) ? 'text-orange-400' : 'text-[#333]'
                }`}
              >
                {form.activePlatforms.includes(p) ? 'ON' : 'OFF'}
              </span>
            </button>
          ))}
        </div>
      </Card>

      {/* Content Defaults */}
      <Card>
        <div className="flex items-center gap-2 mb-4">
          <Clock size={14} className="text-orange-400" />
          <h2 className="text-xs font-heading font-semibold text-[#F5F5F5] uppercase tracking-wide">
            Content Defaults
          </h2>
        </div>
        <div className="space-y-3">
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-medium text-[#A3A3A3] mb-1">Default Platform</label>
              <select
                value={form.defaultPlatform}
                onChange={(e) => setForm((f) => ({ ...f, defaultPlatform: e.target.value as Platform }))}
                className="w-full h-9 px-3 text-sm bg-[#0A0A0A] border border-[#2A2A2A] rounded-lg text-[#F5F5F5] focus:outline-none focus:border-orange-500/60"
              >
                {PLATFORMS.map((p) => (
                  <option key={p} value={p}>{PLATFORM_CONFIG[p].label}</option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-xs font-medium text-[#A3A3A3] mb-1">Default Goal</label>
              <select
                value={form.defaultGoal}
                onChange={(e) => setForm((f) => ({ ...f, defaultGoal: e.target.value as ContentGoal }))}
                className="w-full h-9 px-3 text-sm bg-[#0A0A0A] border border-[#2A2A2A] rounded-lg text-[#F5F5F5] focus:outline-none focus:border-orange-500/60"
              >
                {GOALS.map((g) => (
                  <option key={g} value={g} className="capitalize">{g}</option>
                ))}
              </select>
            </div>
          </div>

          <div>
            <p className="text-xs font-medium text-[#A3A3A3] mb-2">Preferred Posting Times</p>
            <div className="space-y-2">
              {form.activePlatforms.map((p) => (
                <div key={p} className="flex items-center gap-3">
                  <div className="flex items-center gap-2 w-28">
                    <div
                      className="w-2 h-2 rounded-full"
                      style={{ backgroundColor: PLATFORM_CONFIG[p].color }}
                    />
                    <span className="text-xs text-[#A3A3A3]">{PLATFORM_CONFIG[p].label}</span>
                  </div>
                  <input
                    type="time"
                    value={form.preferredTimes[p] ?? '09:00'}
                    onChange={(e) => setPreferredTime(p, e.target.value)}
                    className="h-8 px-2 text-xs bg-[#0A0A0A] border border-[#2A2A2A] rounded-lg text-[#F5F5F5] focus:outline-none focus:border-orange-500/60"
                  />
                </div>
              ))}
            </div>
          </div>
        </div>
      </Card>

      {/* Save button */}
      <div className="flex justify-end">
        <Button onClick={handleSave}>
          {saved ? 'Saved!' : 'Save Settings'}
        </Button>
      </div>

      {/* Data management */}
      <Card>
        <h2 className="text-xs font-heading font-semibold text-[#F5F5F5] uppercase tracking-wide mb-4">
          Data Management
        </h2>
        <div className="space-y-3">
          <div className="flex items-center justify-between p-3 rounded-xl bg-[#0A0A0A] border border-[#1A1A1A]">
            <div>
              <p className="text-xs font-medium text-[#F5F5F5]">Export Data</p>
              <p className="text-[10px] text-[#6B6B6B]">
                Download all your data as JSON
              </p>
            </div>
            <Button variant="secondary" size="sm" onClick={handleExport}>
              <Download size={13} /> Export
            </Button>
          </div>
          <div className="flex items-center justify-between p-3 rounded-xl bg-[#0A0A0A] border border-red-500/10">
            <div>
              <p className="text-xs font-medium text-red-400">Clear All Data</p>
              <p className="text-[10px] text-[#6B6B6B]">
                Permanently delete all content, campaigns, and settings
              </p>
            </div>
            <Button variant="danger" size="sm" onClick={() => setClearConfirm(true)}>
              <Trash2 size={13} /> Clear
            </Button>
          </div>
        </div>
      </Card>

      {/* About */}
      <div className="text-center py-4 border-t border-[#1A1A1A]">
        <p className="text-xs text-[#6B6B6B]">
          BVP Marketing Agent v1.0 · Built by{' '}
          <a
            href="mailto:botvaultpro@outlook.com"
            className="text-orange-400 hover:text-orange-300 transition-colors"
          >
            Bot Vault Pro
          </a>
        </p>
        <p className="text-[10px] text-[#333] mt-1">botvaultpro@outlook.com</p>
      </div>

      {/* Clear confirm */}
      <ConfirmDialog
        isOpen={clearConfirm}
        onClose={() => setClearConfirm(false)}
        onConfirm={handleClearData}
        title="Clear All Data"
        description="This will permanently delete all your content items, campaigns, grader responses, and settings. This cannot be undone."
        confirmLabel="Clear Everything"
        danger
      />
    </div>
  );
}
