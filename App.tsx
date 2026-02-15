
import React, { useState } from 'react';
import ConfigurationPanel from './components/ConfigurationPanel';
import PreviewPanel from './components/PreviewPanel';
import { VSLConfig, VSLDuration, VSLFormat, VSLGoal, AppState, GeneratedLead, ScriptBlock } from './types';
import { generateLeads, generateScriptBlockStream } from './services/geminiService';
import { PenTool, Layers, Users, Megaphone, ChevronDown } from 'lucide-react';
import { MOCK_DATABASE, BLOCK_STRUCTURES } from './constants';

const INITIAL_CONFIG: VSLConfig = {
  expert: '',
  audience: '',
  campaign: '',
  duration: VSLDuration.SHORT,
  format: VSLFormat.CAMERA,
  goal: VSLGoal.DIRECT_SALE,
  observations: ''
};

function App() {
  const [config, setConfig] = useState<VSLConfig>(INITIAL_CONFIG);
  const [appState, setAppState] = useState<AppState>('CONFIG');
  
  // Lead Generation State
  const [generatedLeads, setGeneratedLeads] = useState<GeneratedLead[]>([]);
  const [selectedLeadId, setSelectedLeadId] = useState<number | null>(null);
  
  // Block Building State
  const [blocks, setBlocks] = useState<ScriptBlock[]>([]);
  const [currentBlockIndex, setCurrentBlockIndex] = useState<number>(0);
  const [isProcessing, setIsProcessing] = useState(false);

  // Top Bar Inputs Handlers
  const handleTopInputChange = (field: keyof VSLConfig, value: string) => {
    setConfig(prev => ({ ...prev, [field]: value }));
  };

  const handleGenerateLeads = async () => {
    setIsProcessing(true);
    try {
      const leads = await generateLeads(config);
      setGeneratedLeads(leads);
      setAppState('LEADS_GENERATED');
      setSelectedLeadId(null);
    } catch (error) {
      alert("Erro ao gerar leads. Verifique sua API Key ou tente novamente.");
    } finally {
      setIsProcessing(false);
    }
  };

  const handleRegenerateLeads = () => {
    handleGenerateLeads();
  };

  // Step 1: Aprovar Lead -> Cria o Bloco 0 e inicia Bloco 1
  const handleApproveLead = async () => {
    if (!selectedLeadId) return;
    const selectedLead = generatedLeads.find(l => l.id === selectedLeadId);
    if (!selectedLead) return;

    // Pega a estrutura definida para a duração escolhida
    const structure = BLOCK_STRUCTURES[config.duration];

    // Cria o Bloco 0 (Lead) já aprovado
    const leadBlock: ScriptBlock = {
      id: 'lead',
      title: structure[0].title, // Usa o título do primeiro bloco da estrutura
      description: structure[0].description,
      content: selectedLead.content,
      status: 'approved'
    };

    const initialBlocks = [leadBlock];
    setBlocks(initialBlocks);
    setAppState('BLOCK_BUILDER');
    
    // Inicia a geração do próximo bloco (Bloco Index 1)
    if (structure.length > 1) {
      await startGeneratingBlock(1, initialBlocks);
    } else {
      setAppState('COMPLETED');
    }
  };

  // Função central para gerar um bloco específico
  const startGeneratingBlock = async (index: number, currentBlocks: ScriptBlock[], feedback: string | null = null) => {
    const structure = BLOCK_STRUCTURES[config.duration];
    if (index >= structure.length) {
      setAppState('COMPLETED');
      return;
    }

    const targetBlockDef = structure[index];
    setCurrentBlockIndex(index);
    setIsProcessing(true);

    // Prepara o bloco no estado (vazio ou resetado se for regeneração)
    const newBlock: ScriptBlock = {
      id: `block-${index}`,
      title: targetBlockDef.title,
      description: targetBlockDef.description,
      content: '',
      status: 'streaming'
    };

    // Atualiza array de blocos: Se o bloco já existe (regeneração), substitui. Se não, adiciona.
    const updatedBlocks = [...currentBlocks];
    if (index < updatedBlocks.length) {
      updatedBlocks[index] = newBlock;
    } else {
      updatedBlocks.push(newBlock);
    }
    setBlocks(updatedBlocks);

    // Contexto é tudo que veio antes
    const previousContext = updatedBlocks
      .slice(0, index)
      .map(b => b.content)
      .join('\n\n');

    try {
      await generateScriptBlockStream(
        config, 
        targetBlockDef.title, 
        targetBlockDef.description, 
        previousContext, 
        feedback,
        (chunk) => {
          setBlocks(prev => {
            const newArr = [...prev];
            newArr[index].content += chunk;
            return newArr;
          });
        }
      );

      // Finaliza stream
      setBlocks(prev => {
        const newArr = [...prev];
        newArr[index].status = 'waiting_approval';
        return newArr;
      });
    } catch (error) {
      console.error(error);
      alert("Erro ao gerar bloco.");
    } finally {
      setIsProcessing(false);
    }
  };

  // Ação: Aprovar Bloco Atual e ir para o próximo
  const handleApproveBlock = () => {
    setBlocks(prev => {
      const newArr = [...prev];
      newArr[currentBlockIndex].status = 'approved';
      return newArr;
    });

    const nextIndex = currentBlockIndex + 1;
    startGeneratingBlock(nextIndex, blocks);
  };

  // Ação: Refinar/Regenerar Bloco Atual
  const handleRefineBlock = (feedback: string) => {
    // Regenera o MESMO índice, passando o feedback
    startGeneratingBlock(currentBlockIndex, blocks, feedback);
  };

  const handleReset = () => {
    if (window.confirm("Isso apagará o progresso atual. Deseja continuar?")) {
      setAppState('CONFIG');
      setGeneratedLeads([]);
      setBlocks([]);
      setSelectedLeadId(null);
    }
  };

  return (
    <div className="flex flex-col h-screen bg-gray-100">
      {/* Top Bar */}
      <header className="bg-white border-b border-gray-200 px-6 py-4 shadow-sm z-10">
        <div className="flex items-center gap-2 mb-4">
          <div className="bg-primary p-2 rounded-lg text-white">
            <PenTool size={20} />
          </div>
          <h1 className="text-xl font-bold text-gray-800">VSL Copy AI <span className="text-xs font-normal text-gray-500 bg-gray-100 px-2 py-1 rounded ml-2">Step-by-Step Mode</span></h1>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="relative group">
            <label className="absolute -top-2 left-2 bg-white px-1 text-xs font-medium text-gray-500 flex items-center gap-1 z-10">
              <Users size={10} /> Expert
            </label>
            <div className="relative">
              <select 
                value={config.expert}
                onChange={(e) => handleTopInputChange('expert', e.target.value)}
                className="w-full border border-gray-300 rounded-md px-3 py-2 text-sm focus:ring-2 focus:ring-primary outline-none bg-white appearance-none cursor-pointer text-gray-700"
              >
                <option value="" disabled>Selecione...</option>
                {MOCK_DATABASE.experts.map((opt) => (
                  <option key={opt} value={opt}>{opt}</option>
                ))}
              </select>
              <ChevronDown className="absolute right-3 top-2.5 text-gray-400 pointer-events-none" size={16} />
            </div>
          </div>
          
          <div className="relative group">
            <label className="absolute -top-2 left-2 bg-white px-1 text-xs font-medium text-gray-500 flex items-center gap-1 z-10">
              <Layers size={10} /> Público
            </label>
            <div className="relative">
              <select 
                value={config.audience}
                onChange={(e) => handleTopInputChange('audience', e.target.value)}
                className="w-full border border-gray-300 rounded-md px-3 py-2 text-sm focus:ring-2 focus:ring-primary outline-none bg-white appearance-none cursor-pointer text-gray-700"
              >
                <option value="" disabled>Selecione...</option>
                {MOCK_DATABASE.audiences.map((opt) => (
                  <option key={opt} value={opt}>{opt}</option>
                ))}
              </select>
              <ChevronDown className="absolute right-3 top-2.5 text-gray-400 pointer-events-none" size={16} />
            </div>
          </div>

          <div className="relative group">
            <label className="absolute -top-2 left-2 bg-white px-1 text-xs font-medium text-gray-500 flex items-center gap-1 z-10">
              <Megaphone size={10} /> Campanha
            </label>
            <div className="relative">
              <select 
                value={config.campaign}
                onChange={(e) => handleTopInputChange('campaign', e.target.value)}
                className="w-full border border-gray-300 rounded-md px-3 py-2 text-sm focus:ring-2 focus:ring-primary outline-none bg-white appearance-none cursor-pointer text-gray-700"
              >
                <option value="" disabled>Selecione...</option>
                {MOCK_DATABASE.campaigns.map((opt) => (
                  <option key={opt} value={opt}>{opt}</option>
                ))}
              </select>
              <ChevronDown className="absolute right-3 top-2.5 text-gray-400 pointer-events-none" size={16} />
            </div>
          </div>
        </div>
      </header>

      {/* Main Workspace */}
      <main className="flex-1 flex overflow-hidden">
        <div className="w-1/3 min-w-[350px] max-w-[450px] h-full">
          <ConfigurationPanel 
            config={config}
            setConfig={setConfig}
            onGenerateLeads={handleGenerateLeads}
            isGenerating={isProcessing}
            canRegenerate={appState !== 'CONFIG'}
            onReset={handleReset}
          />
        </div>

        <div className="flex-1 h-full bg-gray-50 relative">
          <PreviewPanel 
            appState={appState}
            leads={generatedLeads}
            selectedLeadId={selectedLeadId}
            blocks={blocks}
            onSelectLead={setSelectedLeadId}
            onRegenerateLeads={handleRegenerateLeads}
            onApproveLead={handleApproveLead}
            onApproveBlock={handleApproveBlock}
            onRefineBlock={handleRefineBlock}
            onRestartScript={handleApproveLead}
            isProcessing={isProcessing}
          />
        </div>
      </main>
    </div>
  );
}

export default App;
