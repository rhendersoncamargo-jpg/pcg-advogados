import { GoogleGenAI } from "@google/genai";
import { NextRequest, NextResponse } from "next/server";

export async function POST(req: NextRequest) {
  try {
    const key = process.env.GEMINI_API_KEY;
    if (!key) {
      return NextResponse.json({
        text: "AVISO: A variável de ambiente GEMINI_API_KEY não foi configurada nas configurações do sistema. Para usar a IA plenamente, declare GEMINI_API_KEY no arquivo .env ou no painel de controle.",
      });
    }

    const ai = new GoogleGenAI({ apiKey: key });
    const { prompt, model } = await req.json();

    const response = await ai.models.generateContent({
      model: model || "gemini-2.5-flash",
      contents: prompt,
    });

    return NextResponse.json({ text: response.text });
  } catch (error: any) {
    console.error("Gemini Route Error:", error);
    return NextResponse.json({
      text: `Erro ao processar requisição de IA: ${error.message || error}`,
    }, { status: 500 });
  }
}
