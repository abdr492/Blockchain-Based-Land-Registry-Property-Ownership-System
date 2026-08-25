import type { Request, Response } from 'express';

export default function handler(req: Request, res: Response) {
  res.status(200).json({
    status: 'ok',
    blockchain: 'active',
    smartContracts: 'online',
    aiAvailable: Boolean(process.env.GEMINI_API_KEY),
    platform: 'Vercel Serverless',
  });
}
