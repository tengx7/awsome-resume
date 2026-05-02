import React, { useEffect, useState } from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { LandingPage } from './pages/LandingPage';
import { TemplatesPage } from './pages/TemplatesPage';
import { PCEditorPage } from './pages/PCEditorPage';
import { MobileEditorPage } from './pages/MobileEditorPage';

/**
 * 自动根据视口宽度选择 PC 或移动编辑器
 */
const ResponsiveEditor: React.FC = () => {
  const [isMobile, setIsMobile] = useState(() =>
    typeof window !== 'undefined' ? window.innerWidth < 900 : false,
  );

  useEffect(() => {
    const onResize = () => setIsMobile(window.innerWidth < 900);
    window.addEventListener('resize', onResize);
    return () => window.removeEventListener('resize', onResize);
  }, []);

  return isMobile ? <MobileEditorPage /> : <PCEditorPage />;
};

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<LandingPage />} />
        <Route path="/templates" element={<TemplatesPage />} />
        <Route path="/editor" element={<ResponsiveEditor />} />
        <Route path="/m/editor" element={<MobileEditorPage />} />
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </BrowserRouter>
  );
}

export default App;