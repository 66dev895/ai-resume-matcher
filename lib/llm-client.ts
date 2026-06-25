/**
 * 客户端 LLM 调用（浏览器直接调用 OpenAI 兼容 API）
 */

export interface AnalysisResult {
  score: number;
  strengths: string[];
  weaknesses: string[];
  suggestions: string[];
  keywords: string[];
}

export interface MatchResult {
  score: number;
  matched: string[];
  missing: string[];
  analysis: string;
}

const ANALYZE_PROMPT = `你是一位资深 HR 和简历优化专家。请分析以下简历，按 JSON 格式返回分析结果：

{
  "score": 0-100 的综合评分,
  "strengths": ["亮点1", "亮点2", ...] (最多5条),
  "weaknesses": ["不足1", "不足2", ...] (最多5条),
  "suggestions": ["改进建议1", "改进建议2", ...] (最多5条),
  "keywords": ["关键词1", "关键词2", ...] (技术栈和核心能力)
}

只返回 JSON，不要其他内容。`;

const MATCH_PROMPT = `你是一位资深技术面试官。请将以下求职者简历与目标岗位 JD 进行匹配分析，按 JSON 格式返回：

{
  "score": 0-100 的匹配度,
  "matched": ["已满足要求1", "已满足要求2", ...],
  "missing": ["待提升技能1", "待提升技能2", ...],
  "analysis": "综合分析（100字以内），包括候选人优势、差距和建议"
}

只返回 JSON，不要其他内容。`;

function getClient(apiKey: string, baseUrl: string) {
  return {
    chat: {
      completions: {
        create: async (params: Record<string, unknown>) => {
          const url = baseUrl
            ? `${baseUrl}/v1/chat/completions`
            : 'https://api.openai.com/v1/chat/completions';
          const res = await fetch(url, {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
              'Authorization': `Bearer ${apiKey}`,
            },
            body: JSON.stringify(params),
          });
          if (!res.ok) {
            const err = await res.text();
            throw new Error(`API 错误 (${res.status}): ${err}`);
          }
          return res.json();
        },
      },
    },
  };
}

export async function analyzeResume(
  resume: string,
  apiKey: string,
  baseUrl: string,
  model: string,
): Promise<AnalysisResult> {
  const client = getClient(apiKey, baseUrl);
  const response = await client.chat.completions.create({
    model,
    messages: [
      { role: 'system', content: ANALYZE_PROMPT },
      { role: 'user', content: resume },
    ],
    temperature: 0.3,
    response_format: { type: 'json_object' },
  });
  return JSON.parse(response.choices[0]?.message?.content || '{}');
}

export async function matchJob(
  resume: string,
  job: string,
  apiKey: string,
  baseUrl: string,
  model: string,
): Promise<MatchResult> {
  const client = getClient(apiKey, baseUrl);
  const response = await client.chat.completions.create({
    model,
    messages: [
      { role: 'system', content: MATCH_PROMPT },
      { role: 'user', content: `【求职者简历】\n${resume}\n\n【目标岗位 JD】\n${job}` },
    ],
    temperature: 0.3,
    response_format: { type: 'json_object' },
  });
  return JSON.parse(response.choices[0]?.message?.content || '{}');
}
