import { NextRequest, NextResponse } from 'next/server';
import { getClient, getModel } from '@/lib/llm';

const PROMPT = `你是一位资深 HR 和简历优化专家。请分析以下简历，按 JSON 格式返回分析结果：

{
  "score": 0-100 的综合评分,
  "strengths": ["亮点1", "亮点2", ...] (最多5条),
  "weaknesses": ["不足1", "不足2", ...] (最多5条),
  "suggestions": ["改进建议1", "改进建议2", ...] (最多5条),
  "keywords": ["关键词1", "关键词2", ...] (技术栈和核心能力)
}

只返回 JSON，不要其他内容。`;

export async function POST(req: NextRequest) {
  try {
    const { resume } = await req.json();
    if (!resume?.trim()) {
      return NextResponse.json({ error: '简历内容为空' }, { status: 400 });
    }

    const client = getClient();
    const response = await client.chat.completions.create({
      model: getModel(),
      messages: [
        { role: 'system', content: PROMPT },
        { role: 'user', content: resume },
      ],
      temperature: 0.3,
      response_format: { type: 'json_object' },
    });

    const content = response.choices[0]?.message?.content || '{}';
    return NextResponse.json(JSON.parse(content));

  } catch (err: unknown) {
    const msg = err instanceof Error ? err.message : '分析服务异常';
    console.error('[analyze]', msg);
    return NextResponse.json({ error: msg }, { status: 500 });
  }
}
