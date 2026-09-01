import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Label } from "@/components/ui/label";
import {
  questionnaireData,
  calculateScores,
  identifyPriorityAreas,
  classifyArea,
  calculateMetabolicScore,
  generateWhatsAppMessage,
  generateWhatsAppURL,
  type Responses,
} from "@/lib/questionnaireData";
import { MessageCircle, Download, ChevronDown, ChevronUp } from "lucide-react";
import { toast } from "sonner";

/**
 * Design: Elegância Médica Contemporânea
 * Fidelidade: 100% ao arquivo original DOCX
 * - Mantém todo conteúdo exato do original
 * - Remove adições (observações, disclaimer)
 * - Layout visual refinado com design profissional
 */

export default function Questionnaire() {
  const [responses, setResponses] = useState<Responses>(() => {
    const newResponses: Responses = {};
    questionnaireData.secoes.forEach((secao) => {
      newResponses[secao.id] = new Array(secao.perguntas.length).fill(-1);
    });
    return newResponses;
  });
  const [menopausaAplicavel, setMenopausaAplicavel] = useState(false);
  const [nomeCliente, setNomeCliente] = useState("");
  const [observacoes, setObservacoes] = useState("");
  const [showResults, setShowResults] = useState(false);
  const [expandedSections, setExpandedSections] = useState<{
    [key: string]: boolean;
  }>({});

  const handleResponseChange = (sectionId: string, questionIndex: number, value: number) => {
    setResponses((prev) => ({
      ...prev,
      [sectionId]: [
        ...prev[sectionId].slice(0, questionIndex),
        value,
        ...prev[sectionId].slice(questionIndex + 1),
      ],
    }));
  };

  const validateResponses = () => {
    for (const [sectionId, values] of Object.entries(responses)) {
      if (sectionId === "menopausa" && !menopausaAplicavel) continue;
      if (values.some((v) => v === -1)) {
        return false;
      }
    }
    return true;
  };

  const handleSubmit = () => {
    if (!validateResponses()) {
      toast.error("Por favor, responda todas as perguntas antes de enviar.");
      return;
    }
    setShowResults(true);
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  const handleWhatsAppSend = () => {
    const message = generateWhatsAppMessage(responses, menopausaAplicavel, nomeCliente);
    const whatsappURL = generateWhatsAppURL(message);
    window.open(whatsappURL, "_blank");
    toast.success("Abrindo WhatsApp para enviar resultado...");
  };

  const handleDownloadPDF = () => {
    const scores = calculateScores(responses);
    const priorityAreas = identifyPriorityAreas(responses, menopausaAplicavel);
    const metabolicScore = calculateMetabolicScore(responses);

    let content = `QUESTIONÁRIO PRÉ-CONSULTA\nDra. Cecília Figueira\n\n`;
    if (nomeCliente) {
      content += `Paciente: ${nomeCliente}\n`;
    }
    content += `Data: ${new Date().toLocaleDateString("pt-BR")}\n\n`;

    content += `RESPOSTAS:\n`;
    questionnaireData.secoes.forEach((secao) => {
      if (secao.id === "menopausa" && !menopausaAplicavel) return;
      content += `\n${secao.titulo}\n`;
      secao.perguntas.forEach((pergunta, idx) => {
        const responseIdx = responses[secao.id][idx];
        const responseText = questionnaireData.escala_resposta[responseIdx] || "Não respondida";
        content += `  • ${pergunta}\n    Resposta: ${responseText}\n`;
      });
    });

    content += `\n\nPONTUAÇÃO POR ÁREA:\n`;
    Object.entries(scores).forEach(([sectionId, score]) => {
      if (sectionId === "menopausa" && !menopausaAplicavel) return;
      const maxScore = sectionId === "menopausa" ? 14 : 10;
      const classification = classifyArea(sectionId, score);
      content += `• ${sectionId}: ${score}/${maxScore} (${classification})\n`;
    });

    content += `\nScore Metabólico Total: ${metabolicScore}/60\n`;

    content += `\nÁREAS PRIORITÁRIAS:\n`;
    if (priorityAreas.length === 0) {
      content += `Nenhuma área acima do ponto de corte.\n`;
    } else {
      priorityAreas.forEach((area, idx) => {
        content += `${idx + 1}. ${area.sectionId} (${area.score})\n`;
      });
    }

    const blob = new Blob([content], { type: "text/plain" });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `questionario-${new Date().toISOString().split("T")[0]}.txt`;
    document.body.appendChild(a);
    a.click();
    window.URL.revokeObjectURL(url);
    document.body.removeChild(a);
  };

  const toggleSection = (sectionId: string) => {
    setExpandedSections((prev) => ({
      ...prev,
      [sectionId]: !prev[sectionId],
    }));
  };

  return (
    <div className="min-h-screen bg-background py-12 px-4 sm:px-6 lg:px-8">
      <style>{`
        * {
          font-family: 'Inter', sans-serif;
        }
        h1, h2, h3, h4, h5, h6 {
          font-family: 'Poppins', sans-serif;
        }
      `}</style>
      
      <div className="max-w-3xl mx-auto">
        {/* CAPA - Com marca */}
        <Card className="mb-8 bg-white border-0 shadow-md hover:shadow-lg transition-shadow duration-300">
          <div className="p-8 sm:p-12 text-center border-b border-border">
            <div className="mb-8 flex justify-center">
              <div
                role="img"
                aria-label="Dra. Cecília Figueira"
                className="inline-flex h-16 w-16 sm:h-20 sm:w-20 items-center justify-center rounded-full border-2 border-[#6B4B9E]/25 bg-[#F5F0FA] text-2xl font-semibold tracking-tight text-[#6B4B9E] shadow-sm"
              >
                CF
              </div>
            </div>
            <h1 className="text-4xl sm:text-5xl font-bold mb-3" style={{ fontFamily: "'Poppins', sans-serif", color: "#6B4B9E" }}>
              {questionnaireData.capa.titulo}
            </h1>
            <p className="text-lg sm:text-xl mb-8" style={{ fontFamily: "'Poppins', sans-serif", color: "#6B4B9E" }}>
              {questionnaireData.capa.subtitulo}
            </p>
            <div className="space-y-2">
              <p className="font-semibold text-lg" style={{ color: "#6B4B9E" }}>
                {questionnaireData.capa.profissional}
              </p>
              <p style={{ color: "#6B4B9E" }}>{questionnaireData.capa.especialidade}</p>
            </div>
          </div>
        </Card>

        {/* INTRODUÇÃO - Exato como no original */}
        <Card className="mb-8 bg-white border-0 shadow-md hover:shadow-lg transition-shadow duration-300">
          <div className="p-8 sm:p-10">
            <div className="text-muted-foreground space-y-4 whitespace-pre-line leading-relaxed text-base sm:text-lg">
              {questionnaireData.introducao}
            </div>
          </div>
        </Card>

        {/* INSTRUÇÕES - Exato como no original */}
        <Card className="mb-8 bg-secondary/10 border border-secondary/20 shadow-md">
          <div className="p-8 sm:p-10">
            <h2 className="text-xl sm:text-2xl font-bold text-primary mb-4" style={{ fontFamily: "'Poppins', sans-serif" }}>
              📌 COMO RESPONDER
            </h2>
            <p className="text-muted-foreground mb-6">{questionnaireData.instrucoes}</p>
            <div className="space-y-3">
              {questionnaireData.escala_resposta.map((opcao, idx) => (
                <div key={idx} className="flex items-center gap-3 text-muted-foreground">
                  <span className="inline-flex items-center justify-center w-6 h-6 rounded-full bg-primary/20 text-primary text-sm font-semibold">
                    {idx + 1}
                  </span>
                  <span>{opcao}</span>
                </div>
              ))}
            </div>
          </div>
        </Card>

        {/* DADOS PESSOAIS - Campo para nome (opcional) */}
        <Card className="mb-8 bg-white border-0 shadow-md hover:shadow-lg transition-shadow duration-300">
          <div className="p-8 sm:p-10">
            <h2 className="text-xl sm:text-2xl font-bold text-primary mb-6" style={{ fontFamily: "'Poppins', sans-serif" }}>
              Dados Pessoais
            </h2>
            <div className="space-y-6">
              <div>
                <Label htmlFor="nome" className="text-primary font-semibold block mb-3">
                  Nome (opcional)
                </Label>
                <input
                  id="nome"
                  type="text"
                  value={nomeCliente}
                  onChange={(e) => setNomeCliente(e.target.value)}
                  placeholder="Seu nome completo"
                  className="w-full px-4 py-3 border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent transition-all"
                />
              </div>
              <div className="flex items-start gap-3 p-4 bg-accent/10 rounded-lg border border-accent/20">
                <input
                  id="menopausa"
                  type="checkbox"
                  checked={menopausaAplicavel}
                  onChange={(e) => setMenopausaAplicavel(e.target.checked)}
                  className="mt-1 cursor-pointer"
                />
                <Label htmlFor="menopausa" className="text-muted-foreground font-medium cursor-pointer">
                  Sou mulher e gostaria de responder a seção de menopausa
                </Label>
              </div>
            </div>
          </div>
        </Card>

        {/* SEÇÕES DO QUESTIONÁRIO - Exato como no original */}
        {questionnaireData.secoes.map((secao, idx) => {
          if (secao.id === "menopausa" && !menopausaAplicavel) return null;

          const isExpanded = expandedSections[secao.id] !== false;

          return (
            <Card 
              key={secao.id} 
              className="mb-6 bg-white border-0 shadow-md hover:shadow-lg transition-all duration-300 overflow-hidden"
              style={{
                animation: `fadeInUp 0.5s ease-out ${idx * 0.05}s both`
              }}
            >
              <style>{`
                @keyframes fadeInUp {
                  from {
                    opacity: 0;
                    transform: translateY(10px);
                  }
                  to {
                    opacity: 1;
                    transform: translateY(0);
                  }
                }
              `}</style>
              
              <div
                className="p-6 sm:p-8 cursor-pointer hover:bg-muted/30 transition-colors duration-200 flex justify-between items-center group"
                onClick={() => toggleSection(secao.id)}
              >
                <div className="flex-1">
                  <h3 className="text-lg sm:text-xl font-bold text-primary" style={{ fontFamily: "'Poppins', sans-serif" }}>
                    {secao.titulo}
                  </h3>
                  {secao.descricao && (
                    <p className="text-muted-foreground text-sm mt-2">{secao.descricao}</p>
                  )}
                </div>
                <div className="ml-4 flex-shrink-0 transition-transform duration-300">
                  {isExpanded ? (
                    <ChevronUp className="text-primary w-5 h-5 group-hover:text-primary/80" />
                  ) : (
                    <ChevronDown className="text-primary w-5 h-5 group-hover:text-primary/80" />
                  )}
                </div>
              </div>

              {isExpanded && (
                <div className="border-t border-border p-6 sm:p-8 space-y-8 bg-white/50 animate-in fade-in duration-300">
                  {secao.perguntas.map((pergunta, idx) => (
                    <div key={idx} className="space-y-4">
                      <p className="font-semibold text-muted-foreground text-base">{pergunta}</p>
                      <RadioGroup
                        value={
                          responses[secao.id]?.[idx] !== -1
                            ? String(responses[secao.id]?.[idx])
                            : ""
                        }
                        onValueChange={(value) =>
                          handleResponseChange(secao.id, idx, parseInt(value))
                        }
                      >
                        <div className="space-y-3 ml-0">
                          {questionnaireData.escala_resposta.map((opcao, optIdx) => (
                            <div 
                              key={optIdx} 
                              className="flex items-center gap-3 p-3 rounded-lg hover:bg-muted/50 transition-colors cursor-pointer group"
                            >
                              <RadioGroupItem
                                value={String(optIdx)}
                                id={`${secao.id}-${idx}-${optIdx}`}
                                className="border-2 border-primary group-hover:border-primary/80"
                              />
                              <Label
                                htmlFor={`${secao.id}-${idx}-${optIdx}`}
                                className="cursor-pointer text-muted-foreground font-medium flex-1"
                              >
                                {opcao}
                              </Label>
                            </div>
                          ))}
                        </div>
                      </RadioGroup>
                    </div>
                  ))}
                </div>
              )}
            </Card>
          );
        })}

        {/* OBSERVAÇÕES - Exato como no original */}
        <Card className="mb-8 bg-white border-0 shadow-md hover:shadow-lg transition-shadow duration-300">
          <div className="p-8 sm:p-10">
            <h2 className="text-xl sm:text-2xl font-bold text-primary mb-6" style={{ fontFamily: "'Poppins', sans-serif" }}>
              📝 OBSERVAÇÕES (opcional)
            </h2>
            <textarea
              value={observacoes}
              onChange={(e) => setObservacoes(e.target.value)}
              placeholder="Escreva aqui qualquer informação adicional que considere relevante sobre sua saúde, sintomas ou preocupações..."
              className="w-full px-4 py-3 border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent transition-all min-h-32 font-base resize-vertical"
            />
          </div>
        </Card>

        {/* BOTÕES DE AÇÃO */}
        <div className="flex flex-col sm:flex-row gap-4 mb-12">
          <Button
            onClick={handleSubmit}
            className="flex-1 bg-primary hover:bg-primary/90 text-white font-semibold py-3 rounded-lg transition-all duration-200 shadow-md hover:shadow-lg"
          >
            Enviar Respostas
          </Button>
          <Button
            onClick={handleDownloadPDF}
            variant="outline"
            className="flex-1 border-2 border-primary text-primary hover:bg-primary/10 font-semibold py-3 rounded-lg transition-all duration-200"
          >
            <Download className="w-4 h-4 mr-2" />
            Baixar Resultado
          </Button>
        </div>

        {/* RESULTADOS - Exato como no original */}
        {showResults && (
          <div className="space-y-6 mb-12 animate-in fade-in duration-500">
            <Card className="bg-gradient-to-br from-primary/5 to-accent/5 border-2 border-primary/20 shadow-lg">
              <div className="p-8 sm:p-12">
                <h2 className="text-2xl sm:text-3xl font-bold text-primary mb-8" style={{ fontFamily: "'Poppins', sans-serif" }}>
                  📊 RESULTADO DO SEU QUESTIONÁRIO
                </h2>

                {/* Texto introdutório exato do original */}
                <div className="mb-8 space-y-4 text-muted-foreground">
                  <p>Seu questionário foi analisado considerando diferentes áreas do funcionamento do organismo, como digestão, energia, sono, foco e outros aspectos importantes.</p>
                  <p className="font-semibold">As áreas que mais chamaram atenção foram:</p>
                </div>

                {/* Áreas prioritárias */}
                <div className="mb-8 space-y-3">
                  {identifyPriorityAreas(responses, menopausaAplicavel).length === 0 ? (
                    <p className="text-muted-foreground text-center py-4">Nenhuma área acima do ponto de corte.</p>
                  ) : (
                    identifyPriorityAreas(responses, menopausaAplicavel).map((area, idx) => {
                      const areaNames: { [key: string]: string } = {
                        intestino: "Intestino / digestão",
                        energia: "Energia ao longo do dia",
                        fome: "Fome e controle do apetite",
                        foco: "Foco e memória",
                        sono: "Sono",
                        musculos: "Músculos e articulações",
                        menopausa: "Sintomas da menopausa",
                      };
                      return (
                        <div key={idx} className="p-4 bg-white rounded-lg border-l-4 border-accent shadow-sm">
                          <p className="text-muted-foreground">• {areaNames[area.sectionId]}</p>
                        </div>
                      );
                    })
                  )}
                </div>

                {/* Texto final exato do original */}
                <div className="space-y-4 text-muted-foreground text-sm sm:text-base">
                  <p>Estes resultados refletem como o seu organismo está funcionando neste momento e indicam as áreas que merecem uma avaliação mais cuidadosa.</p>
                  <p>Esta é uma pré-avaliação, e todas as informações serão complementadas na consulta, onde definiremos, de forma individualizada, a melhor estratégia para a sua saúde.</p>
                  <p className="font-semibold">Obrigada por responder. Seu cuidado começa aqui.</p>
                  <p>Até a sua consulta</p>
                  <p className="font-semibold">Dra. Cecilia Figueira</p>
                </div>
              </div>
            </Card>

            {/* Botão WhatsApp */}
            <Button
              onClick={handleWhatsAppSend}
              className="w-full bg-accent hover:bg-accent/90 text-primary font-semibold py-4 rounded-lg transition-all duration-200 shadow-md hover:shadow-lg text-base"
            >
              <MessageCircle className="w-5 h-5 mr-2" />
              Enviar Resultado via WhatsApp
            </Button>
          </div>
        )}
      </div>
    </div>
  );
}
