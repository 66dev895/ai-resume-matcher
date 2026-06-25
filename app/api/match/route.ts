import { NextRequest, NextResponse } from 'next/server';
import { getClient, getModel } from '@/lib/llm';

const PROMPT = `你是一位资深技术面试官。请将以下求职者简历与目标岗位 JD 进行匹配分析，按 JSON 格式返回：

{
  "score": 0-100 的匹配度,
  "matched": ["已满足要求1", "已满足要求2", ...],
  "missing": ["待提升技能1", "待提升技能2", ...],
  "analysis": "综合分析（100字以内），包括候选人优势、差距和建议"
}

只返回 JSON，不要其他内容。`;

export async function POST(req: NextRequest) {
  try {
    const { resume, job } = await req.json();
    if (!resume?.trim() || !job?.trim()) {
      return NextResponse.json({ error: '请填写简历和岗位描述' }, { status: 400 });
    }

    const client = getClient();
    const response = await client.chat.completions.create({
      model: getModel(),
      messages: [
        { role: 'system', content: PROMPT },
        { role: 'user', content: `【求职者简历】\n${resume}\n\n【目标岗位 JD】\n${job}` },
      ],
      temperature: 0.3,
      response_format: { type: 'json_object' },
    });

    const content = response.choices[0]?.message?.content || '{}';
    return NextResponse.json(JSON.parse(content));

  } catch (err: unknown) {
    const msg = err instanceof Error ? err.message : '匹配服务异常';
    console.error('[match]', msg);
    return NextResponse.json({ error: msg }, { status: 500 });
  }
}
