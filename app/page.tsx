'use client';

import { useState } from 'react';
import { Upload, Sparkles, Target, FileText, Loader2, Key, Check, X } from 'lucide-react';
import { analyzeResume, matchJob, AnalysisResult, MatchResult } from '../lib/llm-client';

export default function Home() {
  const [resumeText, setResumeText] = useState('');
  const [jobDesc, setJobDesc] = useState('');
  const [apiKey, setApiKey] = useState('');
  const [baseUrl, setBaseUrl] = useState('');
  const [model, setModel] = useState('gpt-3.5-turbo');
  const [showSettings, setShowSettings] = useState(false);
  const [analyzing, setAnalyzing] = useState(false);
  const [matching, setMatching] = useState(false);
  const [analysis, setAnalysis] = useState<AnalysisResult | null>(null);
  const [match, setMatch] = useState<MatchResult | null>(null);
  const [error, setError] = useState('');

  const handleUpload = (e: React.ChangeEvent<HTMLTextAreaElement | HTMLInputElement>) => {
    const target = e.target as HTMLInputElement;
    if (target.type === 'file' && target.files?.[0]) {
      const reader = new FileReader();
      reader.onload = (ev) => setResumeText(ev.target?.result as string);
      reader.readAsText(target.files[0]);
    }
  };

  const handleAnalyze = async () => {
    if (!apiKey.trim()) return setError('请先配置 API Key（点击右上角 🔑）');
    if (!resumeText.trim()) return setError('请先输入或上传简历');
    setError('');
    setAnalyzing(true);
    try {
      setAnalysis(await analyzeResume(resumeText, apiKey, baseUrl, model));
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : '未知错误');
    }
    setAnalyzing(false);
  };

  const handleMatch = async () => {
    if (!apiKey.trim()) return setError('请先配置 API Key（点击右上角 🔑）');
    if (!resumeText.trim() || !jobDesc.trim()) return setError('请填写简历和岗位描述');
    setError('');
    setMatching(true);
    try {
      setMatch(await matchJob(resumeText, jobDesc, apiKey, baseUrl, model));
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : '未知错误');
    }
    setMatching(false);
  };

  const ScoreRing = ({ score, label }: { score: number; label: string }) => (
    <div style={{ textAlign: 'center' }}>
      <svg width="100" height="100">
        <circle cx="50" cy="50" r="42" fill="none" stroke="#21262d" strokeWidth="8" />
        <circle cx="50" cy="50" r="42" fill="none" stroke={score >= 70 ? '#3fb950' : score >= 40 ? '#d2991d' : '#f85149'}
          strokeWidth="8" strokeDasharray={`${score * 2.64} 264`} strokeLinecap="round"
          transform="rotate(-90 50 50)" />
        <text x="50" y="50" textAnchor="middle" dominantBaseline="central"
          fill="#c9d1d9" fontSize="24" fontWeight="bold">{score}</text>
      </svg>
      <div style={{ fontSize: '0.8rem', color: '#8b949e', marginTop: 4 }}>{label}</div>
    </div>
  );

  return (
    <div style={{ maxWidth: 1200, margin: '0 auto', padding: '40px 24px' }}>
      {/* Header */}
      <div style={{ textAlign: 'center', marginBottom: 40 }}>
        <div style={{ position: 'absolute', top: 20, right: 24 }}>
          <button onClick={() => setShowSettings(!showSettings)}
            style={{ background: '#161b22', border: '1px solid #30363d', borderRadius: 8,
              padding: '8px 16px', color: '#c9d1d9', cursor: 'pointer', display: 'flex',
              alignItems: 'center', gap: 6, fontSize: '0.85rem' }}>
            <Key size={16} /> {apiKey ? '已配置' : '设置 API Key'}
          </button>
        </div>
        <h1 style={{ color: '#58a6ff', fontSize: '2rem', display: 'flex',
          alignItems: 'center', justifyContent: 'center', gap: 12 }}>
          <Sparkles size={32} /> AI 简历优化 & 岗位匹配
        </h1>
        <p style={{ color: '#8b949e', marginTop: 8 }}>
          上传简历 → AI 智能分析 → 匹配岗位要求 → 精准优化建议
        </p>
      </div>

      {/* Settings Panel */}
      {showSettings && (
        <div style={{ background: '#161b22', border: '1px solid #30363d', borderRadius: 12,
          padding: 16, marginBottom: 24, display: 'flex', gap: 12, flexWrap: 'wrap', alignItems: 'center' }}>
          <input value={apiKey} onChange={e => setApiKey(e.target.value)} type="password"
            placeholder="API Key (sk-...)" style={inputStyle()} />
          <input value={baseUrl} onChange={e => setBaseUrl(e.target.value)}
            placeholder="Base URL (可选，如 https://api.deepseek.com)" style={{ ...inputStyle(), flex: 2 }} />
          <input value={model} onChange={e => setModel(e.target.value)}
            placeholder="模型名" style={{ ...inputStyle(), width: 160 }} />
          <div style={{ fontSize: '0.75rem', color: '#8b949e' }}>
            支持 OpenAI / DeepSeek / 通义千问 等兼容接口
          </div>
        </div>
      )}

      {/* Input */}
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 24, marginBottom: 24 }}>
        <div style={{ background: '#161b22', border: '1px solid #21262d', borderRadius: 12, padding: 20 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 12 }}>
            <FileText size={20} color="#58a6ff" />
            <span style={{ fontWeight: 600 }}>你的简历</span>
          </div>
          <label style={{
            display: 'block', padding: '24px', border: '2px dashed #30363d', borderRadius: 8,
            textAlign: 'center', cursor: 'pointer', marginBottom: 12, color: '#8b949e'
          }}>
            <Upload size={24} style={{ marginBottom: 8 }} />
            <div>点击上传 .txt/.md 文件</div>
            <input type="file" accept=".txt,.md" onChange={handleUpload} style={{ display: 'none' }} />
          </label>
          <textarea value={resumeText}
            onChange={(e: React.ChangeEvent<HTMLTextAreaElement>) => setResumeText(e.target.value)}
            placeholder="或直接粘贴简历内容..."
            rows={12}
            style={textareaStyle()}
          />
        </div>
        <div style={{ background: '#161b22', border: '1px solid #21262d', borderRadius: 12, padding: 20 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 12 }}>
            <Target size={20} color="#58a6ff" />
            <span style={{ fontWeight: 600 }}>目标岗位描述</span>
          </div>
          <textarea value={jobDesc}
            onChange={(e: React.ChangeEvent<HTMLTextAreaElement>) => setJobDesc(e.target.value)}
            placeholder="粘贴目标岗位的 JD..."
            rows={22}
            style={textareaStyle()}
          />
        </div>
      </div>

      {/* Buttons */}
      <div style={{ display: 'flex', gap: 12, justifyContent: 'center', marginBottom: 32 }}>
        <button onClick={handleAnalyze} disabled={analyzing} style={btnStyle('#238636', analyzing)}>
          {analyzing ? <Loader2 size={18} className="spin" /> : <Sparkles size={18} />}
          {analyzing ? '分析中...' : '智能分析简历'}
        </button>
        <button onClick={handleMatch} disabled={matching} style={btnStyle('#1f6feb', matching)}>
          {matching ? <Loader2 size={18} className="spin" /> : <Target size={18} />}
          {matching ? '匹配中...' : '匹配岗位要求'}
        </button>
      </div>

      {error && (
        <div style={{ background: '#f8514911', border: '1px solid #f8514944', borderRadius: 8,
          padding: 12, marginBottom: 24, color: '#f85149', textAlign: 'center' }}>{error}</div>
      )}

      {/* Results */}
      {(analysis || match) && (
        <div style={{ display: 'grid', gridTemplateColumns: analysis && match ? '1fr 1fr' : '1fr', gap: 24 }}>
          {analysis && (
            <div style={{ background: '#161b22', border: '1px solid #21262d', borderRadius: 12, padding: 24 }}>
              <h3 style={{ color: '#58a6ff', marginBottom: 16, display: 'flex', alignItems: 'center', gap: 8 }}>
                <Sparkles size={20} /> 简历分析报告
              </h3>
              <div style={{ display: 'flex', justifyContent: 'center', marginBottom: 16 }}>
                <ScoreRing score={analysis.score} label="综合评分" />
              </div>
              <Section title="💪 优势" items={analysis.strengths} color="#3fb950" />
              <Section title="⚠️ 不足" items={analysis.weaknesses} color="#f85149" />
              <Section title="💡 优化建议" items={analysis.suggestions} color="#58a6ff" />
              <div style={{ marginTop: 12 }}>
                <div style={{ fontSize: '0.85rem', color: '#8b949e', marginBottom: 8 }}>🏷 关键词</div>
                <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6 }}>
                  {analysis.keywords.map((kw, i) => (
                    <span key={i} style={{
                      background: '#1f6feb22', color: '#58a6ff', border: '1px solid #1f6feb44',
                      padding: '3px 10px', borderRadius: 20, fontSize: '0.8rem'
                    }}>{kw}</span>
                  ))}
                </div>
              </div>
            </div>
          )}
          {match && (
            <div style={{ background: '#161b22', border: '1px solid #21262d', borderRadius: 12, padding: 24 }}>
              <h3 style={{ color: '#58a6ff', marginBottom: 16, display: 'flex', alignItems: 'center', gap: 8 }}>
                <Target size={20} /> 岗位匹配度
              </h3>
              <div style={{ display: 'flex', justifyContent: 'center', marginBottom: 16 }}>
                <ScoreRing score={match.score} label="匹配度" />
              </div>
              <Section title="✅ 已满足的要求" items={match.matched} color="#3fb950"
                icon={<Check size={14} color="#3fb950" />} />
              <Section title="❌ 待提升的技能" items={match.missing} color="#f85149"
                icon={<X size={14} color="#f85149" />} />
              <div style={{ background: '#0d1117', border: '1px solid #21262d', borderRadius: 8,
                padding: 12, marginTop: 12, fontSize: '0.85rem', lineHeight: 1.6,
                whiteSpace: 'pre-wrap' }}>{match.analysis}</div>
            </div>
          )}
        </div>
      )}
      <style>{`.spin { animation: spin 1s linear infinite; } @keyframes spin { from { transform:rotate(0deg) } to { transform:rotate(360deg) } }`}</style>
    </div>
  );
}

function Section({ title, items, color, icon }: {
  title: string; items: string[]; color: string; icon?: React.ReactNode;
}) {
  return (
    <div style={{ marginBottom: 12 }}>
      <div style={{ fontSize: '0.85rem', color: '#8b949e', marginBottom: 6 }}>{title}</div>
      {items.map((item, i) => (
        <div key={i} style={{ display: 'flex', alignItems: 'flex-start', gap: 6,
          fontSize: '0.85rem', lineHeight: 1.6, marginBottom: 3 }}>
          {icon || <span style={{ color }}>•</span>}
          <span>{item}</span>
        </div>
      ))}
    </div>
  );
}

function btnStyle(bg: string, disabled: boolean): React.CSSProperties {
  return {
    background: disabled ? bg + '44' : bg, border: 'none', borderRadius: 8, padding: '12px 24px',
    color: 'white', fontSize: '0.95rem', cursor: disabled ? 'default' : 'pointer',
    display: 'flex', alignItems: 'center', gap: 8, fontWeight: 600
  };
}

function inputStyle(): React.CSSProperties {
  return {
    background: '#0d1117', border: '1px solid #30363d', borderRadius: 8,
    padding: '8px 12px', color: '#c9d1d9', fontSize: '0.85rem', flex: 1, minWidth: 200
  };
}

function textareaStyle(): React.CSSProperties {
  return {
    width: '100%', background: '#0d1117', border: '1px solid #30363d',
    borderRadius: 8, padding: 12, color: '#c9d1d9', fontSize: '0.9rem',
    resize: 'vertical', fontFamily: 'inherit', boxSizing: 'border-box'
  };
}
