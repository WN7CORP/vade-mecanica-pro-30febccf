
import { useState } from "react";
import { FileDown, Loader2 } from "lucide-react";
import { Button } from "./button";
import { AIExplanation } from "@/services/aiService";

interface PDFExporterProps {
  articleNumber: string;
  articleContent: string;
  lawName: string;
  explanation?: AIExplanation | null;
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
      // In a real implementation, this would generate a PDF
      // For now, just simulate PDF generation with a timeout
      await new Promise(resolve => setTimeout(resolve, 1500));
      
      // Create a simple text file with the content
      let content = `
Lei: ${lawName}
Artigo: ${articleNumber}

${articleContent}
`;
      
      // Add explanation content if available
      if (explanation) {
        content += `\nEXPLICAÇÃO:`;
        
        if (explanation.summary) {
          content += `\nResumo: ${explanation.summary}`;
        }
        
        if (explanation.detailed) {
          content += `\nDetalhado: ${explanation.detailed}`;
        }
        
        if (explanation.examples && explanation.examples.length > 0) {
          content += `\n\nEXEMPLOS:`;
          explanation.examples.forEach((example, index) => {
            content += `\nExemplo ${index + 1}: ${example}`;
          });
        }
      }
      
      // Create a blob
      const blob = new Blob([content], { type: 'text/plain' });
      const url = URL.createObjectURL(blob);
      
      // Create temporary link element to download the file
      const link = document.createElement('a');
      link.href = url;
      link.download = `artigo-${articleNumber}-${lawName.replace(/\s+/g, '-')}.txt`;
      document.body.appendChild(link);
      link.click();
      
      // Clean up
      document.body.removeChild(link);
      URL.revokeObjectURL(url);
      
    } catch (error) {
      console.error("Erro ao exportar PDF:", error);
    } finally {
      setIsExporting(false);
    }
  };
  
  return (
    <Button
      onClick={handleExport}
      disabled={isExporting}
      variant="outline"
      size="sm"
      className="flex items-center gap-2 ml-auto"
    >
      {isExporting ? (
        <Loader2 size={16} className="animate-spin" />
      ) : (
        <FileDown size={16} />
      )}
      {isExporting ? "Exportando..." : "Exportar artigo"}
    </Button>
  );
};

export default PDFExporter;
