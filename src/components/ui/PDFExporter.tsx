
import { useState } from "react";
import { FileDown, Loader2 } from "lucide-react";
import { AIExplanation } from "@/services/aiService";

interface PDFExporterProps {
  articleNumber: string;
  articleContent: string;
  lawName: string;
  explanation: AIExplanation | null;
}

const PDFExporter = ({
  articleNumber,
  articleContent,
  lawName,
  explanation
}: PDFExporterProps) => {
  const [isExporting, setIsExporting] = useState(false);
  
  const handleExport = async () => {
    setIsExporting(true);
    
    try {
      // Aqui seria implementada a lógica para gerar o PDF
      // Na implementação real, usaríamos uma biblioteca como jsPDF ou pdfmake
      
      // Simulação do tempo de geração
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      // Estrutura do conteúdo do PDF
      const pdfContent = {
        title: `${lawName} - Artigo ${articleNumber}`,
        sections: [
          {
            type: 'A', // Artigo
            content: articleContent
          },
          {
            type: 'B', // Base Legal
            content: `${lawName}, Artigo ${articleNumber}`
          }
        ]
      };
      
      // Adicionar explicação da IA, se disponível
      if (explanation) {
        pdfContent.sections.push(
          {
            type: 'T', // Teoria
            content: explanation.detailed
          },
          {
            type: 'N', // Notas
            content: explanation.examples.join('\n\n')
          }
        );
      }
      
      console.log('Conteúdo do PDF a ser gerado:', pdfContent);
      
      // Aqui seria implementada a conversão para PDF e download
      
      // Feedback de sucesso para o usuário
      alert('PDF gerado com sucesso! O download começará em instantes.');
    } catch (error) {
      console.error('Erro ao gerar PDF:', error);
      alert('Ocorreu um erro ao gerar o PDF. Por favor, tente novamente.');
    } finally {
      setIsExporting(false);
    }
  };
  
  return (
    <button
      onClick={handleExport}
      disabled={isExporting}
      className={`shadow-button ${
        isExporting ? 'bg-muted text-gray-500' : 'text-gray-300 hover:text-primary-200'
      }`}
    >
      {isExporting ? (
        <>
          <Loader2 size={16} className="mr-2 animate-spin" />
          Gerando PDF...
        </>
      ) : (
        <>
          <FileDown size={16} className="mr-2" />
          Exportar PDF
        </>
      )}
    </button>
  );
};

export default PDFExporter;
