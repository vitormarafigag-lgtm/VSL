
import React, { useState, useRef, useEffect } from 'react';
import ReactMarkdown, { Components } from 'react-markdown';
import { GeneratedLead, AppState, ScriptBlock } from '../types';
import { RefreshCw, CheckCircle, FileText, Wand2, ArrowRight, MessageSquarePlus, Copy, RotateCcw } from 'lucide-react';

interface Props {
  appState: AppState;
  leads: GeneratedLead[];
  selectedLeadId: number | null;
  blocks: ScriptBlock[];
  onSelectLead: (id: number) => void;
  onRegenerateLeads: () => void;
  onApproveLead: () => void;
  onApproveBlock: () => void;
  onRefineBlock: (feedback: string) => void;
  onRestartScript?: () => void;
  isProcessing: boolean;
}

const PreviewPanel: React.FC<Props> = ({
  appState,
  leads,
  selectedLeadId,
  blocks,
  onSelectLead,
  onRegenerateLeads,
  onApproveLead,
  onApproveBlock,
  onRefineBlock,
  onRestartScript,
  isProcessing
}) => {
  const [refineMode, setRefineMode] = useState(false);
  const [refineFeedback, setRefineFeedback] = useState('');
  const bottomRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (blocks.length > 0 && isProcessing) {
        bottomRef.current?.scrollIntoView({ behavior: 'smooth' });
    }
  }, [blocks, isProcessing]);

  // Função para copiar roteiro completo
  const handleCopyFullScript = () => {
    const text = blocks.map(b => b.content).join('\n\n');
    navigator.clipboard.writeText(text);
    alert("Script completo copiado!");
  };

  const markdownComponents: Components = {
    h1: ({ children }) => <h1 className="text-2xl font-bold mb-4">{children}</h1>,
    h2: ({ children }) => <h2 className="text-xl font-bold mt-6 mb-3 text-blue-700">{children}</h2>,
    p: ({ children }) => {
      // Helper to safe extract text
      const getText = (nodes: React.ReactNode): string => {
        if (typeof nodes === 'string') return nodes;
        if (Array.isArray(nodes)) return nodes.map(getText).join('');
        if (React.isValidElement(nodes) && nodes.props.children) return getText(nodes.props.children);
        return '';
      };

      const content = getText(children);
      // Detect visual directions (starts with [ or ( or includes CENA:)
      const isScene = content.trim().startsWith('[') || content.trim().startsWith('(') || content.includes('CENA:') || content.includes('CORTA PARA:');
      
      if (isScene) {
        return (
            <div className="text-xs font-bold text-indigo-600 bg-indigo-50 border-l-4 border-indigo-300 p-2 pl-3 rounded-r my-3 uppercase tracking-wider shadow-sm">
                {children}
            </div>
        );
      }
      return <p className="text-lg text-gray-800 leading-relaxed mb-4">{children}</p>;
    },
    li: ({ children }) => <li className="ml-4 list-disc mb-2">{children}</li>,
    strong: ({ children }) => <span className="font-bold text-blue-900 bg-blue-50 px-1 rounded">{children}</span>, // Highlight bold text slightly
  };

  if (appState === 'CONFIG') {
    return (
      <div className="w-full h-full flex flex-col items-center justify-center text-gray-400 bg-gray-50 p-8 text-center">
        <Wand2 size={48} className="mb-4 text-gray-300" />
        <h3 className="text-lg font-medium text-gray-500">Aguardando Configuração</h3>
        <p className="max-w-md mt-2 text-sm">Configure sua VSL à esquerda e clique em "Gerar Leads".</p>
      </div>
    );
  }

  // Render Leads Selection Screen
  if (appState === 'LEADS_GENERATED') {
    return (
        <div className="w-full h-full flex flex-col bg-slate-100 overflow-hidden">
             <div className="border-b border-gray-200 px-6 py-4 flex justify-between items-center bg-white shadow-sm z-10">
                <h2 className="font-bold text-gray-800 flex items-center gap-2">
                    <FileText size={20} className="text-primary" /> Selecione o Lead
                </h2>
                <button onClick={onRegenerateLeads} disabled={isProcessing} className="text-sm text-gray-600 hover:text-primary flex items-center gap-1">
                    <RefreshCw size={14} className={isProcessing ? "animate-spin" : ""} /> Regerar
                </button>
             </div>
             <div className="flex-1 overflow-y-auto p-8">
                <div className="flex flex-col gap-6 max-w-4xl mx-auto pb-20">
                    <div className="bg-blue-50 border border-blue-200 p-4 rounded-lg text-blue-800 text-sm">
                        Selecione a melhor abertura. Isso definirá o tom de todo o resto do script.
                    </div>
                    {leads.map((lead) => (
                    <div key={lead.id} onClick={() => onSelectLead(lead.id)}
                        className={`border-2 rounded-xl p-6 cursor-pointer transition-all ${selectedLeadId === lead.id ? 'border-primary bg-white ring-4 ring-blue-50 shadow-lg' : 'border-transparent bg-white shadow-sm hover:border-blue-200'}`}>
                        <div className="flex justify-between items-center mb-4 border-b border-gray-100 pb-2">
                            <h3 className="font-bold text-lg text-gray-800">{lead.title}</h3>
                            {selectedLeadId === lead.id && <span className="bg-primary text-white text-xs px-2 py-1 rounded-full flex items-center gap-1"><CheckCircle size={12} /> Selecionado</span>}
                        </div>
                        {/* Applied markdownComponents here */}
                        <div className="prose prose-sm max-w-none text-gray-600 leading-relaxed">
                            <ReactMarkdown components={markdownComponents}>{lead.content}</ReactMarkdown>
                        </div>
                    </div>
                    ))}
                    <div className="sticky bottom-4 flex justify-center pt-4 pointer-events-none">
                        <button onClick={onApproveLead} disabled={!selectedLeadId || isProcessing}
                            className={`pointer-events-auto py-3 px-8 rounded-full shadow-xl font-bold text-white text-lg transition-all flex items-center gap-2 ${!selectedLeadId ? 'bg-gray-400 cursor-not-allowed opacity-0 translate-y-10' : 'bg-green-600 hover:bg-green-700 opacity-100 translate-y-0'}`}>
                            {isProcessing ? <><RefreshCw className="animate-spin" /> Processando...</> : <><CheckCircle /> Aprovar e Continuar</>}
                        </button>
                    </div>
                </div>
             </div>
        </div>
    );
  }

  // Block Builder View
  return (
    <div className="w-full h-full flex flex-col bg-slate-100 overflow-hidden">
      <div className="border-b border-gray-200 px-6 py-4 flex justify-between items-center bg-white shadow-sm z-10">
        <h2 className="font-bold text-gray-800 flex items-center gap-2">
          <FileText size={20} className="text-primary" /> 
          {appState === 'COMPLETED' ? 'Script Finalizado' : 'Construção do Script'}
        </h2>
        {appState === 'COMPLETED' && (
             <div className="flex items-center gap-2">
                 {onRestartScript && (
                    <button 
                        onClick={onRestartScript} 
                        disabled={isProcessing}
                        className="px-4 py-2 border border-red-200 text-red-600 bg-red-50 hover:bg-red-100 rounded-md text-sm flex items-center gap-2 transition-colors disabled:opacity-50"
                    >
                        <RotateCcw size={16} /> Reescrever VSL
                    </button>
                 )}
                 <button onClick={handleCopyFullScript} className="px-4 py-2 bg-gray-800 text-white rounded-md text-sm hover:bg-gray-900 flex items-center gap-2 transition-colors">
                     <Copy size={16} /> Copiar Tudo
                 </button>
             </div>
        )}
      </div>

      <div className="flex-1 overflow-y-auto p-4 md:p-8 scroll-smooth">
        <div className="max-w-4xl mx-auto space-y-8 pb-32">
            
            {/* Approved Blocks (Read Only) */}
            {blocks.filter(b => b.status === 'approved').map((block) => (
                <div key={block.id} className="bg-white rounded-xl p-8 shadow-sm border border-gray-200 opacity-80 hover:opacity-100 transition-opacity">
                    <div className="border-b border-gray-100 pb-2 mb-4">
                        <span className="text-xs font-bold text-green-600 uppercase tracking-wider bg-green-50 px-2 py-1 rounded">Aprovado</span>
                        <h3 className="text-sm font-medium text-gray-400 mt-1">{block.title}</h3>
                    </div>
                    <ReactMarkdown components={markdownComponents}>{block.content}</ReactMarkdown>
                </div>
            ))}

            {/* Active Block (Working Area) */}
            {blocks.filter(b => b.status !== 'approved').map((block) => (
                <div key={block.id} className="bg-white rounded-xl shadow-xl border-2 border-primary overflow-hidden relative" ref={bottomRef}>
                    {/* Header do Bloco Atual */}
                    <div className="bg-primary px-6 py-3 flex justify-between items-center">
                        <div>
                            <h3 className="text-white font-bold text-lg">{block.title}</h3>
                            <p className="text-blue-100 text-xs">{block.description}</p>
                        </div>
                        {isProcessing && <RefreshCw className="text-white animate-spin" size={20} />}
                    </div>

                    {/* Conteúdo */}
                    <div className="p-8 min-h-[200px]">
                        <ReactMarkdown components={markdownComponents}>{block.content}</ReactMarkdown>
                        {isProcessing && (
                            <div className="animate-pulse flex space-x-2 mt-4">
                                <div className="h-2 w-2 bg-primary rounded-full"></div>
                                <div className="h-2 w-2 bg-primary rounded-full animation-delay-200"></div>
                                <div className="h-2 w-2 bg-primary rounded-full animation-delay-400"></div>
                            </div>
                        )}
                    </div>

                    {/* Actions Bar (Only if not processing) */}
                    {!isProcessing && block.status === 'waiting_approval' && (
                        <div className="bg-gray-50 border-t border-gray-200 p-6">
                            {!refineMode ? (
                                <div className="flex gap-4 justify-end">
                                    <button 
                                        onClick={() => setRefineMode(true)}
                                        className="px-6 py-3 rounded-lg border border-gray-300 text-gray-700 font-medium hover:bg-gray-100 hover:text-gray-900 transition-colors flex items-center gap-2"
                                    >
                                        <MessageSquarePlus size={18} />
                                        Refinar / Ajustar
                                    </button>
                                    <button 
                                        onClick={() => onApproveBlock()}
                                        className="px-8 py-3 rounded-lg bg-green-600 text-white font-bold hover:bg-green-700 shadow-lg hover:shadow-xl transition-all flex items-center gap-2"
                                    >
                                        Aprovar e Continuar <ArrowRight size={18} />
                                    </button>
                                </div>
                            ) : (
                                <div className="animate-fadeIn">
                                    <label className="block text-sm font-bold text-gray-700 mb-2">O que você gostaria de mudar neste bloco?</label>
                                    <textarea 
                                        value={refineFeedback}
                                        onChange={(e) => setRefineFeedback(e.target.value)}
                                        placeholder="Ex: Deixe mais agressivo, remova a parte sobre preço, conte uma história sobre..."
                                        className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary outline-none mb-4 text-sm"
                                        rows={3}
                                    />
                                    <div className="flex gap-3 justify-end">
                                        <button 
                                            onClick={() => { setRefineMode(false); setRefineFeedback(''); }}
                                            className="px-4 py-2 text-gray-500 hover:text-gray-700 text-sm"
                                        >
                                            Cancelar
                                        </button>
                                        <button 
                                            onClick={() => {
                                                onRefineBlock(refineFeedback);
                                                setRefineMode(false);
                                                setRefineFeedback('');
                                            }}
                                            disabled={!refineFeedback.trim()}
                                            className="px-6 py-2 bg-primary text-white rounded-lg font-medium hover:bg-blue-700 disabled:opacity-50 flex items-center gap-2"
                                        >
                                            <Wand2 size={16} />
                                            Regerar com Feedback
                                        </button>
                                    </div>
                                </div>
                            )}
                        </div>
                    )}
                </div>
            ))}
            
            {appState === 'COMPLETED' && (
                <div className="text-center py-10">
                    <div className="w-16 h-16 bg-green-100 text-green-600 rounded-full flex items-center justify-center mx-auto mb-4">
                        <CheckCircle size={32} />
                    </div>
                    <h3 className="text-2xl font-bold text-gray-800">VSL Finalizada com Sucesso!</h3>
                    <p className="text-gray-600 mb-6">Todos os blocos foram aprovados.</p>
                </div>
            )}
        </div>
      </div>
    </div>
  );
};

export default PreviewPanel;
