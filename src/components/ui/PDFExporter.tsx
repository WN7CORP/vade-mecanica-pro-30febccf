
import { useState } from "react";
import { FileDown, Loader2 } from "lucide-react";
import { AIExplanation } from "@/services/aiService";
import { Button } from "./button";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "./dialog";
import { toast } from "@/hooks/use-toast";

interface PDFExporterProps {
  articleNumber: string;
  articleContent: string;
  lawName: string;
  explanation?: AIExplanation | null;
  notesContent?: string;
  example?: string;
}

const PDFExporter = ({
  articleNumber,
  articleContent,
  lawName,
  explanation,
  notesContent,
  example
}: PDFExporterProps) => {
  const [isExporting, setIsExporting] = useState(false);
  const [exportType, setExportType] = useState<'article' | 'full' | 'notes'>();
  
  const handleExport = async () => {
    setIsExporting(true);
    
    try {
      const title = `${lawName} - Artigo ${articleNumber}`;
      
      // Create PDF content based on the exportType
      let pdfContent = `# ${title}\n\n`;
      
      if (exportType === 'article' || exportType === 'full') {
        pdfContent += `## Artigo ${articleNumber}\n\n${articleContent}\n\n`;
      }
      
      if (exportType === 'full' && example) {
        pdfContent += `## Exemplo\n\n${example}\n\n`;
      }
      
      if (exportType === 'full' && explanation) {
        pdfContent += `## Explicação Técnica\n\n${explanation.detailed}\n\n`;
        
        if (explanation.examples && explanation.examples.length > 0) {
          pdfContent += `## Exemplos Práticos\n\n`;
          explanation.examples.forEach((ex, index) => {
            pdfContent += `### Exemplo ${index + 1}\n\n${ex}\n\n`;
          });
        }
      }
      
      if (exportType === 'notes' && notesContent) {
        pdfContent += `## Anotações\n\n${notesContent}\n\n`;
      }
      
      // Create a Google Drive shareable link as a simple mock for now
      // In a real implementation, we would use the Google Drive API
      
      // Encode the PDF content to Base64 to simulate a file creation
      const encodedContent = btoa(unescape(encodeURIComponent(pdfContent)));
      
      // Create a "shareable link" - in a real implementation this would be a Google Drive link
      const driveLink = `https://drive.google.com/file/d/${encodedContent.substring(0, 20)}/view?usp=sharing`;
      
      // Just to show something useful for the user, let's open the content in a new tab
      const blob = new Blob([pdfContent], { type: 'text/plain' });
      const url = URL.createObjectURL(blob);
      window.open(url, '_blank');
      
      toast({
        title: "PDF Gerado com Sucesso",
        description: "O arquivo foi gerado e está pronto para download",
      });
      
    } catch (error) {
      console.error('Erro ao gerar PDF:', error);
      toast({
        title: "Erro ao gerar PDF",
        description: "Ocorreu um erro ao gerar o PDF. Por favor, tente novamente.",
        variant: "destructive"
      });
    } finally {
      setIsExporting(false);
      setExportType(undefined);
    }
  };
  
  return (
    <Dialog>
      <DialogTrigger asChild>
        <Button
          variant="outline"
          size="sm"
          className="flex items-center gap-2 bg-primary/10 text-primary hover:text-primary-foreground hover:bg-primary font-medium transition-all duration-300"
        >
          <FileDown size={16} />
          Exportar PDF
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Exportar PDF</DialogTitle>
          <DialogDescription>
            Escolha o que você deseja incluir no PDF
          </DialogDescription>
        </DialogHeader>
        <div className="flex flex-col gap-4 py-4">
          <Button
            variant="outline"
            onClick={() => {
              setExportType('article');
              handleExport();
            }}
            disabled={isExporting}
            className="justify-start"
          >
            Apenas o artigo
          </Button>
          {(explanation || example) && (
            <Button
              variant="outline"
              onClick={() => {
                setExportType('full');
                handleExport();
              }}
              disabled={isExporting}
              className="justify-start"
            >
              Artigo com explicação e exemplos
            </Button>
          )}
          {notesContent && (
            <Button
              variant="outline"
              onClick={() => {
                setExportType('notes');
                handleExport();
              }}
              disabled={isExporting}
              className="justify-start"
            >
              Exportar anotações
            </Button>
          )}
        </div>
        {isExporting && (
          <div className="flex items-center justify-center">
            <Loader2 size={24} className="animate-spin text-primary" />
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
};

export default PDFExporter;
