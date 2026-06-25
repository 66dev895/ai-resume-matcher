/** @type {import('next').NextConfig} */
const nextConfig = {
  env: {
    OPENAI_API_KEY: process.env.OPENAI_API_KEY || '',
    OPENAI_BASE_URL: process.env.OPENAI_BASE_URL || '',
    MODEL_NAME: process.env.MODEL_NAME || 'gpt-3.5-turbo',
  },
};

module.exports = nextConfig;
