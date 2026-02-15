
import React, { useRef } from 'react';
import { VSLConfig, VSLDuration, VSLFormat, VSLGoal, UploadedFile } from '../types';
import { Play, RotateCcw, Package, Paperclip, X, FileText, Image as ImageIcon } from 'lucide-react';
import { MOCK_DATABASE } from '../constants';

interface Props {
  config: VSLConfig;
  setConfig: React.Dispatch<React.SetStateAction<VSLConfig>>;
  onGenerateLeads: () => void;
  isGenerating: boolean;
  canRegenerate: boolean;
  onReset: () => void;
}

const ConfigurationPanel: React.FC<Props> = ({ 
  config, 
  setConfig, 
  onGenerateLeads, 
  isGenerating,
  canRegenerate,
  onReset
}) => {
  const fileInputRef = useRef<HTMLInputElement>(null);
  
  const handleChange = (field: keyof VSLConfig, value: string) => {
    setConfig(prev => ({ ...prev, [field]: value }));
  };

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      const newFiles: UploadedFile[] = [];
      
      for (let i = 0; i < e.target.files.length; i++) {
        const file = e.target.files[i];
        
        // Simples validação de tamanho (ex: 4MB)
        if (file.size > 4 * 1024 * 1024) {
          alert(`O arquivo ${file.name} é muito grande (max 4MB).`);
          continue;
        }

        try {
          const base64 = await convertFileToBase64(file);
          newFiles.push({
            name: file.name,
            mimeType: file.type,
            data: base64
          });
        } catch (error) {
          console.error("Erro ao ler arquivo", error);
        }
      }

      setConfig(prev => ({
        ...prev,
        files: [...(prev.files || []), ...newFiles]
      }));
      
      // Reset input
      if (fileInputRef.current) fileInputRef.current.value = '';
    }
  };

  const removeFile = (index: number) => {
    setConfig(prev => ({
      ...prev,
      files: prev.files?.filter((_, i) => i !== index)
    }));
  };

  const convertFileToBase64 = (file: File): Promise<string> => {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.readAsDataURL(file);
      reader.onload = () => {
        // Remove o prefixo "data:image/png;base64," para enviar apenas os bytes
        const result = reader.result as string;
        const base64Data = result.split(',')[1];
        resolve(base64Data);
      };
      reader.onerror = error => reject(error);
    });
  };

  const showProductSelection = config.goal === VSLGoal.DIRECT_SALE || config.goal === VSLGoal.APPLICATION;

  return (
    <div className="w-full h-full flex flex-col bg-white border-r border-gray-200 overflow-y-auto">
      <div className="p-6 space-y-6">
        <div className="flex justify-between items-center">
          <h2 className="text-xl font-bold text-gray-800">Configuração da VSL</h2>
          {canRegenerate && (
            <button 
              onClick={onReset}
              className="text-sm text-gray-500 hover:text-red-500 flex items-center gap-1 transition-colors"
            >
              <RotateCcw size={14} /> Resetar
            </button>
          )}
        </div>

        {/* Duração */}
        <div className="space-y-3">
          <label className="block text-sm font-medium text-gray-700">1. Duração</label>
          <div className="space-y-2">
            {Object.values(VSLDuration).map((duration) => (
              <label key={duration} className="flex items-start gap-3 p-3 border rounded-lg cursor-pointer hover:bg-gray-50 transition-colors has-[:checked]:border-primary has-[:checked]:bg-blue-50">
                <input
                  type="radio"
                  name="duration"
                  value={duration}
                  checked={config.duration === duration}
                  onChange={(e) => handleChange('duration', e.target.value)}
                  className="mt-1 text-primary focus:ring-primary"
                />
                <span className="text-sm text-gray-600">{duration}</span>
              </label>
            ))}
          </div>
          
          {config.duration === VSLDuration.LONG && (
            <div className="mt-2 animate-fadeIn">
              <label className="block text-xs font-medium text-gray-500 mb-1">Insumos sobre o Conteúdo (Recomendado)</label>
              <textarea
                value={config.contentInput || ''}
                onChange={(e) => handleChange('contentInput', e.target.value)}
                placeholder="Descreva os 3 segredos, pilares ou conteúdo que será ensinado..."
                className="w-full p-2 text-sm border rounded-md focus:ring-2 focus:ring-primary outline-none min-h-[80px]"
              />
            </div>
          )}
        </div>

        {/* Formato */}
        <div className="space-y-3">
          <label className="block text-sm font-medium text-gray-700">2. Formato de Apresentação</label>
          <div className="space-y-2">
            {Object.values(VSLFormat).map((format) => (
              <label key={format} className="flex items-center gap-3 p-3 border rounded-lg cursor-pointer hover:bg-gray-50 transition-colors has-[:checked]:border-primary has-[:checked]:bg-blue-50">
                <input
                  type="radio"
                  name="format"
                  value={format}
                  checked={config.format === format}
                  onChange={(e) => handleChange('format', e.target.value)}
                  className="text-primary focus:ring-primary"
                />
                <span className="text-sm text-gray-600">{format}</span>
              </label>
            ))}
          </div>
        </div>

        {/* Objetivo */}
        <div className="space-y-3">
          <label className="block text-sm font-medium text-gray-700">3. Objetivo de Conversão</label>
          <div className="space-y-2">
            {Object.values(VSLGoal).map((goal) => (
              <div key={goal}>
                <label className="flex items-center gap-3 p-3 border rounded-lg cursor-pointer hover:bg-gray-50 transition-colors has-[:checked]:border-primary has-[:checked]:bg-blue-50">
                  <input
                    type="radio"
                    name="goal"
                    value={goal}
                    checked={config.goal === goal}
                    onChange={(e) => handleChange('goal', e.target.value)}
                    className="text-primary focus:ring-primary"
                  />
                  <span className="text-sm text-gray-600">{goal}</span>
                </label>
                {goal === VSLGoal.OTHER && config.goal === VSLGoal.OTHER && (
                  <input
                    type="text"
                    value={config.goalOther || ''}
                    onChange={(e) => handleChange('goalOther', e.target.value)}
                    placeholder="Qual o objetivo?"
                    className="w-full mt-2 p-2 text-sm border rounded-md focus:ring-2 focus:ring-primary outline-none"
                  />
                )}
              </div>
            ))}
          </div>
        </div>

        {/* Produto (Condicional) */}
        {showProductSelection && (
          <div className="space-y-3 animate-fadeIn">
            <label className="block text-sm font-medium text-gray-700 flex items-center gap-2">
              <Package size={16} className="text-primary" />
              3.1 Produto Ofertado
            </label>
            <select
              value={config.product || ''}
              onChange={(e) => handleChange('product', e.target.value)}
              className="w-full p-2 text-sm border rounded-md focus:ring-2 focus:ring-primary outline-none bg-white"
            >
              <option value="" disabled>Selecione o produto...</option>
              {MOCK_DATABASE.products.map((p) => (
                <option key={p} value={p}>{p}</option>
              ))}
            </select>
          </div>
        )}

        {/* Observações com Upload */}
        <div className="space-y-3">
          <div className="flex justify-between items-center">
             <label className="block text-sm font-medium text-gray-700">4. Observações / Anexos</label>
             <button 
                onClick={() => fileInputRef.current?.click()}
                className="text-xs flex items-center gap-1 text-primary hover:text-blue-700 font-medium"
             >
                <Paperclip size={14} /> Anexar Arquivo
             </button>
             <input 
                type="file" 
                ref={fileInputRef} 
                className="hidden" 
                accept="image/*,application/pdf"
                multiple
                onChange={handleFileChange}
             />
          </div>
          
          <div className="relative">
            <textarea
                value={config.observations || ''}
                onChange={(e) => handleChange('observations', e.target.value)}
                placeholder="Tom de voz, referências. Você pode anexar prints ou PDFs para contexto."
                className="w-full p-3 text-sm border rounded-md focus:ring-2 focus:ring-primary outline-none min-h-[100px]"
            />
          </div>

          {/* Lista de Arquivos */}
          {config.files && config.files.length > 0 && (
            <div className="flex flex-wrap gap-2 mt-2">
                {config.files.map((file, index) => (
                    <div key={index} className="flex items-center gap-2 bg-gray-100 border border-gray-200 px-3 py-1.5 rounded-full text-xs text-gray-700">
                        {file.mimeType.includes('image') ? <ImageIcon size={12} /> : <FileText size={12} />}
                        <span className="truncate max-w-[150px]">{file.name}</span>
                        <button onClick={() => removeFile(index)} className="hover:text-red-500">
                            <X size={12} />
                        </button>
                    </div>
                ))}
            </div>
          )}
        </div>

        {/* Botão de Ação */}
        <div className="pt-4 pb-10">
          <button
            onClick={onGenerateLeads}
            disabled={isGenerating || !config.expert || !config.audience || !config.campaign || (showProductSelection && !config.product)}
            className={`w-full py-3 px-4 rounded-lg flex items-center justify-center gap-2 text-white font-medium shadow-md transition-all
              ${isGenerating || !config.expert || !config.audience || !config.campaign || (showProductSelection && !config.product)
                ? 'bg-gray-400 cursor-not-allowed' 
                : 'bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 active:scale-[0.98]'}`}
          >
            {isGenerating ? (
              <>
                <svg className="animate-spin h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                </svg>
                Gerando...
              </>
            ) : (
              <>
                <Play size={18} fill="currentColor" />
                Gerar Leads
              </>
            )}
          </button>
          {(!config.expert || !config.audience || !config.campaign) && (
            <p className="text-xs text-red-500 mt-2 text-center">Preencha os campos do topo (Especialista, Público, Campanha) primeiro.</p>
          )}
        </div>
      </div>
    </div>
  );
};

export default ConfigurationPanel;
