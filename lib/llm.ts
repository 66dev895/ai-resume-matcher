/**
 * LLM 工具模块 — OpenAI 兼容 API 封装
 */

import OpenAI from 'openai';

export function getClient(): OpenAI {
  const apiKey = process.env.OPENAI_API_KEY;
  const baseURL = process.env.OPENAI_BASE_URL || undefined;
  if (!apiKey) throw new Error('未配置 OPENAI_API_KEY');
  return new OpenAI({ apiKey, baseURL });
}

export function getModel(): string {
  return process.env.MODEL_NAME || 'gpt-3.5-turbo';
}

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
