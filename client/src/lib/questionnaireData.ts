// Estrutura de dados do questionário com fidelidade total ao original
export const questionnaireData = {
  capa: {
    titulo: "QUESTIONÁRIO PRÉ-CONSULTA",
    subtitulo: "Avaliação do Funcionamento do Organismo",
    profissional: "Dra. Cecília Figueira",
    especialidade: "Médica | Estratégia Metabólica",
  },
  introducao:
    "Olá, tudo bem? Aqui é a Dra. Cecília Figueira.\nAqui começa o meu cuidado com você.\nEste questionário foi desenvolvido por mim para entender, de forma objetiva, como o seu organismo está funcionando neste momento.\nAs respostas me ajudam a identificar padrões do seu metabolismo, energia, sono e outros sinais importantes antes da consulta.\nCom essas informações, consigo direcionar melhor a avaliação e tornar seu atendimento mais preciso e individualizado.\nPeço que responda com atenção. Leva poucos minutos e faz diferença na sua análise.",
  instrucoes:
    "Para cada item, escolha a opção que melhor descreve sua situação nos últimos 30 dias:",
  escala_resposta: ["Não tenho", "Às vezes / leve", "Frequente ou intenso"],
  secoes: [
    {
      id: "intestino",
      titulo: "🔴 1. INTESTINO",
      descricao: "(digestão e funcionamento intestinal)",
      perguntas: [
        "Inchaço abdominal após refeições?",
        "Gases ou desconforto intestinal?",
        "Intestino irregular (preso ou solto)?",
        "Azia ou queimação digestiva?",
        "Mal-estar após comer alguns alimentos?",
      ],
    },
    {
      id: "energia",
      titulo: "🔴 2. ENERGIA AO LONGO DO DIA",
      descricao: "(ritmo de energia)",
      perguntas: [
        "Dificuldade para acordar com disposição?",
        "Queda de energia ao longo do dia?",
        "Baixa disposição no período da manhã?",
        "Queda de energia ou disposição à tarde?",
        "Sensação de energia instável ao longo do dia?",
      ],
    },
    {
      id: "fome",
      titulo: "🔴 3. FOME E CONTROLE DO APETITE",
      descricao: "(comportamento alimentar)",
      perguntas: [
        "Fome fora de hora ou dificuldade de controle alimentar?",
        "Vontade frequente por doces ou carboidratos?",
        "Sonolência ou indisposição após refeições?",
        "Dificuldade em ficar sem comer por algumas horas?",
        "Acúmulo de gordura abdominal?",
      ],
    },
    {
      id: "foco",
      titulo: "🔴 4. FOCO E MEMÓRIA",
      descricao: "(função mental)",
      perguntas: [
        "Dificuldade de concentração?",
        "Sensação de mente lenta?",
        "Falhas de memória recentes?",
        "Dificuldade para tomar decisões?",
        "Sensação de mente nublada?",
      ],
    },
    {
      id: "sono",
      titulo: "🔴 5. SONO",
      descricao: "(qualidade do sono)",
      perguntas: [
        "Dificuldade para iniciar o sono?",
        "Acorda durante a noite?",
        "Acorda sem sensação de descanso?",
        "Sono leve ou não reparador?",
        "Energia pior quando dorme mal?",
      ],
    },
    {
      id: "musculos",
      titulo: "🔴 6. MÚSCULOS E ARTICULAÇÕES",
      descricao: "(força, dor e mobilidade)",
      perguntas: [
        "Dores articulares frequentes?",
        "Rigidez ao acordar ou após repouso?",
        "Sensação de perda de força?",
        "Dor muscular sem esforço proporcional?",
        "Dificuldade de recuperação após atividade física?",
      ],
    },
    {
      id: "menopausa",
      titulo: "🔥 7. SINTOMAS DA MENOPAUSA (SE APLICÁVEL)",
      descricao: "",
      perguntas: [
        "Ondas de calor, suores ou calorões?",
        "Problemas de sono (dificuldade para dormir ou acordar à noite)?",
        "Alterações de humor (irritação, ansiedade, tristeza)?",
        "Esgotamento físico e/ou mental?",
        "Diminuição da libido?",
        "Ressecamento vaginal e/ou perda de urina?",
        "Dores musculares ou articulares?",
      ],
    },
  ],
};

// Número de WhatsApp pré-configurado para a Dra. Cecília
export const WHATSAPP_NUMBER = "5527995087158"; // (27) 99508-7158

// Tipos para respostas
export type Responses = {
  [sectionId: string]: number[];
};

// Especificação técnica: Cálculo de pontuação conforme documento
export const scoringRules = {
  escala: {
    "Não tenho": 0,
    "Às vezes / leve": 1,
    "Frequente ou intenso": 2,
  },
  classificacao: {
    blocos_5: {
      "0-2": "sem destaque",
      "3-5": "atenção",
      "6-10": "maior atenção",
    },
    menopausa_7: {
      "0-3": "sem destaque",
      "4-7": "atenção",
      "8-14": "maior atenção",
    },
  },
  pontoCorte: {
    blocos: 4, // score ≥ 4
    menopausa: 5, // score ≥ 5
  },
  desempate: [
    "sono",
    "energia",
    "fome",
    "intestino",
    "musculos",
    "foco",
    "menopausa",
  ],
};

// Calcular scores por área
export function calculateScores(responses: Responses): { [key: string]: number } {
  const scores: { [key: string]: number } = {};

  Object.entries(responses).forEach(([sectionId, values]) => {
    if (Array.isArray(values)) {
      scores[sectionId] = values.reduce((sum, val) => sum + (val >= 0 ? val : 0), 0);
    }
  });

  return scores;
}

// Classificar área
export function classifyArea(
  sectionId: string,
  score: number
): string {
  const isMenupausa = sectionId === "menopausa";
  const maxScore = isMenupausa ? 14 : 10;

  if (isMenupausa) {
    if (score <= 3) return "sem destaque";
    if (score <= 7) return "atenção";
    return "maior atenção";
  } else {
    if (score <= 2) return "sem destaque";
    if (score <= 5) return "atenção";
    return "maior atenção";
  }
}

// Identificar áreas prioritárias
export function identifyPriorityAreas(
  scoresOrResponses: { [key: string]: number } | Responses,
  menopausaAplicavel: boolean
) {
  // Se receber Responses, converter para scores
  let scores: { [key: string]: number };
  if (Object.values(scoresOrResponses)[0] && Array.isArray(Object.values(scoresOrResponses)[0])) {
    scores = calculateScores(scoresOrResponses as Responses);
  } else {
    scores = scoresOrResponses as { [key: string]: number };
  }
  let scoresToRank = { ...scores };

  // Excluir menopausa se não aplicável
  if (!menopausaAplicavel) {
    delete scoresToRank.menopausa;
  }

  // Filtrar por ponto de corte
  const filteredAreas = Object.entries(scoresToRank)
    .filter(([sectionId, score]) => {
      const cutoff =
        sectionId === "menopausa"
          ? scoringRules.pontoCorte.menopausa
          : scoringRules.pontoCorte.blocos;
      return score >= cutoff;
    })
    .map(([sectionId, score]) => ({ sectionId, score }));

  // Ordenar por score decrescente, depois por desempate
  const ranked = filteredAreas.sort((a, b) => {
    if (b.score !== a.score) {
      return b.score - a.score;
    }
    const priorityA = scoringRules.desempate.indexOf(a.sectionId);
    const priorityB = scoringRules.desempate.indexOf(b.sectionId);
    return priorityA - priorityB;
  });

  // Retornar até 3 áreas
  return ranked.slice(0, 3);
}

// Gerar texto para WhatsApp
export function generateWhatsAppMessage(
  responses: Responses,
  menopausaAplicavel: boolean,
  nomeCliente?: string
): string {
  const scores = calculateScores(responses);
  const priorityAreas = identifyPriorityAreas(scores, menopausaAplicavel);

  // Mapear IDs para nomes legíveis
  const areaNames: { [key: string]: string } = {
    intestino: "Intestino",
    energia: "Energia ao longo do dia",
    fome: "Fome e controle do apetite",
    foco: "Foco e memória",
    sono: "Sono",
    musculos: "Músculos e articulações",
    menopausa: "Sintomas da menopausa",
  };

  let message = `📋 *RESULTADO DO QUESTIONÁRIO PRÉ-CONSULTA*\n`;
  if (nomeCliente) {
    message += `Paciente: ${nomeCliente}\n`;
  }
  message += `Data: ${new Date().toLocaleDateString("pt-BR")}\n\n`;

  message += `*PONTUAÇÃO POR ÁREA:*\n`;
  Object.entries(scores).forEach(([sectionId, score]) => {
    if (sectionId === "menopausa" && !menopausaAplicavel) return;
    const maxScore = sectionId === "menopausa" ? 14 : 10;
    const classification = classifyArea(sectionId, score);
    message += `• ${areaNames[sectionId]}: ${score}/${maxScore} (${classification})\n`;
  });

  message += `\n*ÁREAS COM MAIOR PONTUAÇÃO:*\n`;
  if (priorityAreas.length === 0) {
    message += `Nenhuma área acima do ponto de corte.\n`;
  } else {
    priorityAreas.forEach((area, index) => {
      message += `${index + 1}. ${areaNames[area.sectionId]} (${area.score})\n`;
    });
  }

  message += `\n_Esses achados não representam um diagnóstico. Eles funcionam como uma pré-avaliação, que ajuda a identificar quais aspectos merecem análise mais cuidadosa._\n`;

  return message;
}

// Calcular score metabólico (sem menopausa)
export function calculateMetabolicScore(responses: Responses): number {
  const scores = calculateScores(responses);
  const metabolicSections = [
    "intestino",
    "energia",
    "fome",
    "foco",
    "sono",
    "musculos",
  ];
  return metabolicSections.reduce((sum, section) => sum + (scores[section] || 0), 0);
}

// Gerar URL de WhatsApp com número pré-configurado
export function generateWhatsAppURL(message: string): string {
  const encodedMessage = encodeURIComponent(message);
  return `https://wa.me/${WHATSAPP_NUMBER}?text=${encodedMessage}`;
}
