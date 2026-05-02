/**
 * export.ts
 *
 * PDF 导出方案：window.print()
 *
 * 为什么不用 html2canvas / dom-to-image：
 *   这两个库都需要自己重新解析并渲染 CSS，与浏览器实际渲染存在差异，
 *   导致 flex/table 布局错位、图标偏移等问题，无法修复。
 *
 * window.print() 方案：
 *   浏览器直接打印当前 DOM，使用同一个渲染引擎，结果与预览 100% 一致。
 *   通过 @media print CSS 隐藏 .no-print 元素，只打印简历内容。
 */

export const exportToPDF = async (fileName: string = '我的简历') => {
  const element = document.getElementById('resume-preview');
  if (!element) { alert('未找到简历预览区域'); return; }

  // 设置打印文件名（通过 document.title 影响默认文件名）
  const originalTitle = document.title;
  document.title = fileName;

  // 等浏览器重排
  await new Promise((r) => requestAnimationFrame(() => requestAnimationFrame(r)));

  // 调用打印（浏览器原生，与预览 100% 一致）
  window.print();

  // 恢复标题
  document.title = originalTitle;
};

export const exportToJSON = (data: unknown, fileName: string = '简历数据') => {
  const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = `${fileName}.json`;
  a.click();
  URL.revokeObjectURL(url);
};

export const importFromJSON = (file: File): Promise<unknown> => {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = (e) => {
      try {
        const data = JSON.parse(e.target?.result as string);
        resolve(data);
      } catch {
        reject(new Error('文件格式错误'));
      }
    };
    reader.onerror = () => reject(new Error('文件读取失败'));
    reader.readAsText(file);
  });
};