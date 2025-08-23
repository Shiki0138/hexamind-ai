// Gemini API の安全なラッパー
// ビルド時のエラーを回避するための条件付き初期化

let GoogleGenerativeAI: any = null;

export async function getGeminiModel(apiKey: string) {
  if (!apiKey || apiKey === 'your-gemini-key' || apiKey === 'not-set') {
    return null;
  }

  try {
    // 実行時のみモジュールをロード
    if (!GoogleGenerativeAI) {
      const module = await import('@google/generative-ai');
      GoogleGenerativeAI = module.GoogleGenerativeAI;
    }

    const genAI = new GoogleGenerativeAI(apiKey);
    return genAI.getGenerativeModel({ model: 'gemini-pro' });
  } catch (error) {
    console.error('Failed to initialize Gemini:', error);
    return null;
  }
}

export async function generateWithGemini(
  apiKey: string,
  prompt: string
): Promise<string | null> {
  const model = await getGeminiModel(apiKey);
  
  if (!model) {
    return null;
  }

  try {
    const result = await model.generateContent(prompt);
    const response = await result.response;
    return response.text();
  } catch (error) {
    console.error('Gemini generation error:', error);
    return null;
  }
}