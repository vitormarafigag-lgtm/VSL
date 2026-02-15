
import { VSLDuration } from "./types";

export const MOCK_DATABASE = {
  experts: [
    "Dr. Ricardo Silva (Cardiologista)",
    "Fernanda Lima (Marketing para Psicólogos)",
    "João Pedro (Dropshipping)",
    "Instituto Vida Plena (Desenvolvimento Pessoal)",
    "Software EasyTax (SaaS Contábil)"
  ],
  audiences: [
    "Homens de 45+ anos sedentários",
    "Psicólogas recém-formadas",
    "Jovens buscando primeira renda online",
    "Mulheres divorciadas em busca de autoconhecimento",
    "Contadores autônomos"
  ],
  campaigns: [
    "Campanha 'Coração Forte' - VSL Venda Direta",
    "Workshop 'Agenda Lotada' - Lançamento Meteórico",
    "Método Drop 2.0 - Perpétuo",
    "Imersão Renascer - High Ticket",
    "Software Trial - Funil de Aquisição"
  ],
  products: [
    "Suplemento CardioLife",
    "Mentoria Agenda Lotada",
    "Curso Mestre do Drop",
    "Ingresso Imersão Renascer",
    "Plano Anual EasyTax Pro"
  ]
};

// Mapeamento dos passos para execução em etapas
export const BLOCK_STRUCTURES: Record<VSLDuration, { title: string; description: string }[]> = {
  [VSLDuration.SHORT]: [
    { title: "Bloco 1: Abertura e Promessa", description: "Gancho, Identificação do Problema e Apresentação da Solução (Mecanismo)." },
    { title: "Bloco 2: A Doutrina do Mecanismo", description: "Explicação da Grande Ideia, Mecanismo Único e Prova Rápida." },
    { title: "Bloco 3: A Oferta Direta", description: "Apresentação do Produto, Stack de Valor e Preço." },
    { title: "Bloco 4: Fechamento", description: "Garantia, CTA final e Escassez." }
  ],
  [VSLDuration.MEDIUM]: [
    { title: "Bloco 1: Conexão e Empatia", description: "História de origem, definição do problema e agitação emocional." },
    { title: "Bloco 2: A Jornada do Herói", description: "Ponto baixo, a busca pela solução e o grande basta." },
    { title: "Bloco 3: A Revelação", description: "O momento Eureka, a descoberta do mecanismo e a transformação." },
    { title: "Bloco 4: O Pitch", description: "Transição para venda, oferta detalhada e garantia." }
  ],
  [VSLDuration.LONG]: [
    { title: "Bloco 1: Abertura e Contrato", description: "Gancho forte, história de conexão e contrato de aprendizado." },
    { title: "Bloco 2: Doutrinação Profunda", description: "Conteúdo educativo, inimigo comum e quebra de crenças limitantes." },
    { title: "Bloco 3: A Ponte", description: "Recapitulação do que foi aprendido e o dilema da implementação sozinho." },
    { title: "Bloco 4: O Pitch Completo", description: "Apresentação da solução definitiva, bônus, garantia e preço." },
    { title: "Bloco 5: Fechamento", description: "FAQ (Perguntas Frequentes), escassez real e ultimato." }
  ]
};

export const BLUEPRINTS = `
(Referência Interna para a IA - Não exibida)
Blueprint 1: VSL Curta - Foco em Mecanismo.
Blueprint 2: VSL Média - Foco em Narrativa/História.
Blueprint 3: VSL Longa - Foco em Conteúdo/Doutrinação.
`;

export const PITCH_STRUCTURE = `
Estrutura de Pitch (Referência):
1. Transformação. 2. Benefícios. 3. Produto + Prova. 4. Ancoragem. 5. Preço. 6. Garantia. 7. CTA. 8. Escassez.
`;

export const SWIPE_FILE_INSTRUCTIONS = `
DIRETRIZES DE ESTILO (TELEPROMPTER MODE):
- O texto deve ser pronto para leitura em teleprompter.
- Use APENAS [DIREÇÃO VISUAL] entre colchetes para orientar edição.
- NÃO coloque títulos como "Introdução", "Bloco 1", "Parte 2".
- NÃO explique o que você está fazendo. Apenas escreva o roteiro.
- Use espaçamento duplo entre parágrafos para facilitar leitura.
- Linguagem falada, simples, direta.
`;
