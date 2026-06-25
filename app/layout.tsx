import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'AI Resume Matcher — 智能简历优化 & 岗位匹配',
  description: '上传简历，AI 分析优化建议 + 智能匹配岗位',
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="zh-CN">
      <body style={{ margin: 0, background: '#0d1117', color: '#c9d1d9',
        fontFamily: '"Segoe UI", "PingFang SC", sans-serif' }}>
        {children}
      </body>
    </html>
  );
}
