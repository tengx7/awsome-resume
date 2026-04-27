import React, { useState } from 'react';
import { TopBar } from './components/TopBar';
import { EditorPanel } from './components/editor/EditorPanel';
import { PreviewPanel } from './components/PreviewPanel';
import { SettingsPanel } from './components/SettingsPanel';
import { AIAssistantPanel } from './components/ai/AIAssistantPanel';
import { AISettingsModal } from './components/ai/AISettingsModal';
import { AutoFillPanel } from './components/ai/AutoFillPanel';
import { PenLine, Eye, Settings } from 'lucide-react';

type Tab = 'edit' | 'settings';

function App() {
  const [activeTab, setActiveTab] = useState<Tab>('edit');
  const [mobileView, setMobileView] = useState<'editor' | 'preview'>('editor');

  return (
    <div className="flex flex-col h-screen bg-white overflow-hidden">
      {/* Top Navigation Bar */}
      <TopBar />

      {/* Tab Bar (desktop left panel) */}
      <div className="flex flex-1 overflow-hidden">
        {/* Left Panel */}
        <div className="w-[520px] flex-shrink-0 flex flex-col border-r border-gray-200 overflow-hidden">
          {/* Tabs */}
          <div className="flex border-b border-gray-200 bg-gray-50 flex-shrink-0">
            <button
              onClick={() => setActiveTab('edit')}
              className={`flex-1 flex items-center justify-center gap-2 py-2.5 text-sm font-medium transition-colors ${
                activeTab === 'edit'
                  ? 'text-blue-600 bg-white border-b-2 border-blue-600'
                  : 'text-gray-500 hover:text-gray-700'
              }`}
            >
              <PenLine size={15} />
              编辑内容
            </button>
            <button
              onClick={() => setActiveTab('settings')}
              className={`flex-1 flex items-center justify-center gap-2 py-2.5 text-sm font-medium transition-colors ${
                activeTab === 'settings'
                  ? 'text-blue-600 bg-white border-b-2 border-blue-600'
                  : 'text-gray-500 hover:text-gray-700'
              }`}
            >
              <Settings size={15} />
              模板设置
            </button>
          </div>

          {/* Panel Content */}
          <div className="flex-1 overflow-hidden">
            {activeTab === 'edit' ? <EditorPanel /> : <SettingsPanel />}
          </div>
        </div>

        {/* Right Preview */}
        <div className="flex-1 overflow-hidden">
          <PreviewPanel />
        </div>
      </div>

      {/* Mobile Bottom Navigation */}
      <div className="sm:hidden flex border-t border-gray-200 bg-white">
        <button
          onClick={() => setMobileView('editor')}
          className={`flex-1 flex flex-col items-center gap-1 py-3 text-xs ${mobileView === 'editor' ? 'text-blue-600' : 'text-gray-500'}`}
        >
          <PenLine size={18} />
          编辑
        </button>
        <button
          onClick={() => setMobileView('preview')}
          className={`flex-1 flex flex-col items-center gap-1 py-3 text-xs ${mobileView === 'preview' ? 'text-blue-600' : 'text-gray-500'}`}
        >
          <Eye size={18} />
          预览
        </button>
      </div>

      {/* Print Styles */}
      <style>{`
        @media print {
          body > *:not(#resume-preview) { display: none !important; }
          #resume-preview {
            position: fixed !important;
            top: 0 !important;
            left: 0 !important;
            width: 210mm !important;
            transform: none !important;
          }
          .resume-preview-wrapper { box-shadow: none !important; }
        }
      `}</style>

      {/* AI 助手 & 设置（全局挂载，受 aiStore 控制显隐） */}
      <AIAssistantPanel />
      <AISettingsModal />
      <AutoFillPanel />
    </div>
  );
}

export default App;
