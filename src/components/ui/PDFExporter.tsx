
import { useState } from "react";
import { FileDown, Loader2 } from "lucide-react";
import { AIExplanation } from "@/services/aiService";
import { Button } from "./button";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "./dialog";

interface PDFExporterProps {
  articleNumber: string;
  articleContent: string;
  lawName: string;
  explanation: AIExplanation | null;
  notesContent?: string;
}

const PDFExporter = ({
  articleNumber,
  articleContent,
  lawName,
  explanation,
  notesContent
}: PDFExporterProps) => {
  const [isExporting, setIsExporting] = useState(false);
  const [exportType, setExportType] = useState<'article' | 'full' | 'notes'>();
  
  const handleExport = async () => {
    setIsExporting(true);
    
    try {
      const pdfContent = {
        title: `${lawName} - Artigo ${articleNumber}`,
        sections: [
          {
            type: 'A',
            content: articleContent
          },
          {
            type: 'B',
            content: `${lawName}, Artigo ${articleNumber}`
          }
        ]
      };
      
      if (exportType === 'full' && explanation) {
        pdfContent.sections.push(
          {
            type: 'T',
            content: explanation.detailed
          },
          {
            type: 'N',
            content: explanation.examples.join('\n\n')
          }
        );
      }
      
      if (exportType === 'notes' && notesContent) {
        pdfContent.sections.push({
          type: 'AN',
          content: notesContent
        });
      }
      
      console.log('Conteúdo do PDF a ser gerado:', pdfContent);
      alert('PDF gerado com sucesso! O download começará em instantes.');
    } catch (error) {
      console.error('Erro ao gerar PDF:', error);
      alert('Ocorreu um erro ao gerar o PDF. Por favor, tente novamente.');
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
          className="shadow-button text-primary hover:text-primary-foreground"
        >
          <FileDown size={16} className="mr-2" />
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
          {explanation && (
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
