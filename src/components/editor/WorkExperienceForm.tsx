import React, { useState } from 'react';
import { Plus, Trash2, ChevronDown, ChevronUp } from 'lucide-react';
import { useResumeStore } from '../../store/resumeStore';
import { AIFieldButton } from '../ai/AIFieldButton';
import { useAIStore } from '../../store/aiStore';

export const WorkExperienceForm: React.FC = () => {
  const { data, addWorkExperience, updateWorkExperience, deleteWorkExperience } = useResumeStore();
  const [expanded, setExpanded] = useState<string | null>(data.workExperience[0]?.id || null);
  const jd = useAIStore((s) => s.jd);

  const handleAchievements = (id: string, value: string) => {
    const achievements = value.split('\n').filter((line) => line.trim());
    updateWorkExperience(id, { achievements });
  };

  return (
    <div className="space-y-2">
      {data.workExperience.map((exp) => (
        <div key={exp.id} className="border border-gray-200 rounded-lg overflow-hidden">
          <div
            className="flex items-center justify-between px-3 py-2 cursor-pointer hover:bg-gray-50 transition-colors"
            onClick={() => setExpanded(expanded === exp.id ? null : exp.id)}
          >
            <div className="flex-1 min-w-0">
              <p className="text-[12px] font-medium text-gray-800 truncate">
                {exp.position || '新工作经历'}
              </p>
              <p className="text-[11px] text-gray-500 truncate">{exp.company || '公司名称'}</p>
            </div>
            <div className="flex items-center gap-1.5 ml-2">
              <button
                onClick={(e) => { e.stopPropagation(); deleteWorkExperience(exp.id); }}
                className="p-1 text-gray-400 hover:text-red-500 rounded-md hover:bg-red-50 transition-colors"
              >
                <Trash2 size={13} />
              </button>
              {expanded === exp.id ? <ChevronUp size={14} className="text-gray-400" /> : <ChevronDown size={14} className="text-gray-400" />}
            </div>
          </div>
          {expanded === exp.id && (
            <div className="px-3 pb-3 space-y-2 border-t border-gray-100">
              <div className="grid grid-cols-2 gap-2 pt-2.5">
                <Field label="公司名称 *" value={exp.company} onChange={(v) => updateWorkExperience(exp.id, { company: v })} placeholder="字节跳动" />
                <Field label="职位名称 *" value={exp.position} onChange={(v) => updateWorkExperience(exp.id, { position: v })} placeholder="高级工程师" />
              </div>
              <div className="grid grid-cols-2 gap-2">
                <Field label="开始时间" value={exp.startDate} onChange={(v) => updateWorkExperience(exp.id, { startDate: v })} placeholder="2021-03" />
                <Field
                  label="结束时间"
                  value={exp.current ? '至今' : exp.endDate}
                  onChange={(v) => updateWorkExperience(exp.id, { endDate: v, current: false })}
                  placeholder="2023-12"
                  disabled={exp.current}
                />
              </div>
              <label className="flex items-center gap-1.5 cursor-pointer">
                <input
                  type="checkbox"
                  checked={exp.current}
                  onChange={(e) => updateWorkExperience(exp.id, { current: e.target.checked, endDate: '' })}
                  className="w-3 h-3 rounded border-gray-300 text-emerald-600 focus:ring-emerald-500"
                />
                <span className="text-[11px] text-gray-600">目前在职</span>
              </label>
              <div>
                <div className="flex items-center justify-between mb-1">
                  <label className="block text-[11px] font-medium text-gray-600">工作描述</label>
                  <AIFieldButton
                    value={exp.description}
                    onApply={(next) => updateWorkExperience(exp.id, { description: next })}
                    context={{ role: exp.position, jd }}
                    modes={['polish', 'quantify', 'shorten', 'translate_en']}
                  />
                </div>
                <textarea
                  value={exp.description}
                  onChange={(e) => updateWorkExperience(exp.id, { description: e.target.value })}
                  placeholder="简要描述您的工作职责..."
                  rows={2}
                  className="w-full px-2.5 py-1.5 text-[12px] border border-gray-200 rounded-md focus:outline-none focus:ring-2 focus:ring-emerald-500 resize-none text-gray-700"
                />
              </div>
              <div>
                <div className="flex items-center justify-between mb-1">
                  <label className="block text-[11px] font-medium text-gray-600">
                    工作成就 <span className="text-gray-400 font-normal">（每行一条）</span>
                  </label>
                  <AIFieldButton
                    value={exp.achievements.join('\n')}
                    onApply={(next) => {
                      const arr = next.split('\n').map((s) => s.replace(/^[-•·]\s*/, '').trim()).filter(Boolean);
                      updateWorkExperience(exp.id, { achievements: arr });
                    }}
                    context={{ role: exp.position, jd }}
                    modes={['star', 'quantify', 'polish', 'expand', 'translate_en']}
                    label="AI 增强"
                  />
                </div>
                <textarea
                  value={exp.achievements.join('\n')}
                  onChange={(e) => handleAchievements(exp.id, e.target.value)}
                  placeholder={"主导重构渲染架构，性能提升 40%\n设计并实现低代码平台核心模块"}
                  rows={3}
                  className="w-full px-2.5 py-1.5 text-[12px] border border-gray-200 rounded-md focus:outline-none focus:ring-2 focus:ring-emerald-500 resize-none text-gray-700"
                />
              </div>
            </div>
          )}
        </div>
      ))}
      <button
        onClick={addWorkExperience}
        className="w-full flex items-center justify-center gap-1.5 py-2 border border-dashed border-gray-300 rounded-lg text-[12px] text-gray-500 hover:border-emerald-400 hover:text-emerald-600 hover:bg-emerald-50 transition-colors"
      >
        <Plus size={14} />
        添加工作经历
      </button>
    </div>
  );
};

const Field: React.FC<{
  label: string;
  value: string;
  onChange: (v: string) => void;
  placeholder?: string;
  disabled?: boolean;
}> = ({ label, value, onChange, placeholder, disabled }) => (
  <div>
    <label className="block text-[11px] font-medium text-gray-600 mb-1">{label}</label>
    <input
      type="text"
      value={value}
      onChange={(e) => onChange(e.target.value)}
      placeholder={placeholder}
      disabled={disabled}
      className="w-full px-2.5 py-1.5 text-[12px] border border-gray-200 rounded-md focus:outline-none focus:ring-2 focus:ring-emerald-500 text-gray-700 disabled:bg-gray-50 disabled:text-gray-400"
    />
  </div>
);
