
import { GoogleGenAI, Type } from "@google/genai";
import { VSLConfig, GeneratedLead } from "../types";
import { BLOCK_STRUCTURES, SWIPE_FILE_INSTRUCTIONS } from "../constants";

const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });

const SYSTEM_INSTRUCTION = `
Você é um Copywriter Sênior de Classe Mundial.
Sua tarefa é escrever scripts de VSL (Video Sales Letter).
Você deve adotar a persona do especialista definido.
IMPORTANTE: Siga o estilo "TELEPROMPTER":
1. Escreva APENAS o texto que será falado e as direções visuais entre [COLCHETES].
2. NÃO inclua títulos, explicações ou metadados.
3. Use formatação Markdown.
`;

export const generateLeads = async (config: VSLConfig): Promise<GeneratedLead[]> => {
  const model = "gemini-3-flash-preview"; 

  // Pega a descrição do primeiro bloco baseada na duração escolhida
  const firstBlockDesc = BLOCK_STRUCTURES[config.duration][0].description;

  const promptText = `
    Crie 3 opções de Abertura (Lead) para esta VSL.
    
    Contexto:
    Expert: ${config.expert}
    Público: ${config.audience}
    Campanha: ${config.campaign}
    Duração: ${config.duration}
    Objetivo: ${config.goal}
    Produto: ${config.product || "Não especificado (Foque na promessa da campanha)"}
    Observações: ${config.observations || "Nenhuma"}
    
    Foco deste bloco inicial: ${firstBlockDesc}

    Swipes: ${SWIPE_FILE_INSTRUCTIONS}
    
    OUTPUT: Array JSON com 3 objetos {id, title, content}.
  `;

  // Construir payload com partes (Texto + Arquivos se houver)
  const parts: any[] = [{ text: promptText }];
  
  if (config.files && config.files.length > 0) {
    config.files.forEach(file => {
        parts.push({
            inlineData: {
                mimeType: file.mimeType,
                data: file.data
            }
        });
    });
  }

  try {
    const response = await ai.models.generateContent({
      model,
      contents: { parts: parts },
      config: {
        systemInstruction: SYSTEM_INSTRUCTION,
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.ARRAY,
          items: {
            type: Type.OBJECT,
            properties: {
              id: { type: Type.NUMBER },
              title: { type: Type.STRING },
              content: { type: Type.STRING }
            },
            required: ["id", "title", "content"]
          }
        }
      }
    });

    const text = response.text;
    if (!text) throw new Error("No response from AI");
    
    const cleanText = text.replace(/```json/g, '').replace(/```/g, '').trim();
    return JSON.parse(cleanText) as GeneratedLead[];
  } catch (error) {
    console.error("Error generating leads:", error);
    throw error;
  }
};

export const generateScriptBlockStream = async (
  config: VSLConfig,
  currentBlockTitle: string,
  currentBlockDesc: string,
  previousContext: string,
  feedback: string | null,
  onChunk: (text: string) => void
) => {
  const model = "gemini-3-pro-preview";

  let specificInstruction = `
    Escreva a continuação do roteiro.
    PARTE ATUAL: "${currentBlockTitle}"
    OBJETIVO DA PARTE: ${currentBlockDesc}
  `;

  if (feedback) {
    specificInstruction = `
      REFAÇA a parte atual ("${currentBlockTitle}") seguindo este FEEDBACK DO USUÁRIO:
      "${feedback}"
      
      Mantenha o contexto anterior, mas altere esta parte conforme solicitado.
    `;
  }

  const promptText = `
    CONFIGURAÇÕES:
    Expert: ${config.expert}
    Público: ${config.audience}
    Produto: ${config.product || "Não especificado"}
    Conteúdo Extra: ${config.contentInput || "N/A"}
    Observações: ${config.observations || "Nenhuma"}

    CONTEXTO JÁ APROVADO (O que vem antes):
    """
    ${previousContext}
    """

    SUA TAREFA AGORA:
    ${specificInstruction}

    ESTRUTURA VISUAL (Rigorosa):
    - Formato Teleprompter limpo.
    - Apenas Texto Falado e [DIREÇÕES VISUAIS].
    - Sem introduções do tipo "Aqui está a parte 2". Comece direto no texto.
  `;

  // Construir payload com partes para streaming
  const parts: any[] = [{ text: promptText }];
  
  // Inclui os arquivos também na geração dos blocos para manter o contexto visual
  if (config.files && config.files.length > 0) {
    config.files.forEach(file => {
        parts.push({
            inlineData: {
                mimeType: file.mimeType,
                data: file.data
            }
        });
    });
  }

  try {
    const responseStream = await ai.models.generateContentStream({
      model,
      contents: { parts: parts },
      config: {
        systemInstruction: SYSTEM_INSTRUCTION,
      }
    });

    for await (const chunk of responseStream) {
      if (chunk.text) {
        onChunk(chunk.text);
      }
    }
  } catch (error) {
    console.error("Error streaming block:", error);
    throw error;
  }
};
