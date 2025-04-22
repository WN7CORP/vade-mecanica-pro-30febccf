
import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import Header from "@/components/layout/Header";
import Footer from "@/components/layout/Footer";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { ScrollText, Search, ChartBar, FileDown, Loader2 } from "lucide-react";
import PDFExporter from "@/components/ui/PDFExporter";

const Notes = () => {
  const navigate = useNavigate();
  const [notes, setNotes] = useState<any[]>([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [isLoading, setIsLoading] = useState(true);
  
  useEffect(() => {
    const loadNotes = () => {
      const allNotes: any[] = [];
      for (let i = 0; i < localStorage.length; i++) {
        const key = localStorage.key(i);
        if (key?.startsWith('article-notes-')) {
          const noteData = JSON.parse(localStorage.getItem(key) || '{}');
          const [, articleNumber, lawName] = key.split('-');
          allNotes.push({
            articleNumber,
            lawName,
            ...noteData
          });
        }
      }
      setNotes(allNotes);
      setIsLoading(false);
    };
    
    loadNotes();
  }, []);

  const filteredNotes = notes.filter(note => 
    note.notes.toLowerCase().includes(searchTerm.toLowerCase()) ||
    note.topics.some((topic: string) => 
      topic.toLowerCase().includes(searchTerm.toLowerCase())
    )
  );

  return (
    <div className="flex flex-col min-h-screen pb-16 pt-20 px-4">
      <Header />
      
      <main className="flex-1 max-w-screen-md mx-auto w-full">
        <div className="flex items-center justify-between mb-6">
          <h1 className="text-2xl font-heading font-bold text-primary-300">
            Suas Anotações
          </h1>
          
          <div className="flex gap-2">
            <div className="neomorph p-3 text-primary-300">
              <ChartBar size={20} />
            </div>
          </div>
        </div>
        
        <div className="mb-6">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={20} />
            <Input
              type="search"
              placeholder="Buscar em suas anotações..."
              className="pl-10"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
        </div>
        
        {isLoading ? (
          <div className="text-center py-8">
            <Loader2 className="animate-spin h-8 w-8 text-primary-300 mx-auto mb-4" />
            <p className="text-gray-400">Carregando suas anotações...</p>
          </div>
        ) : filteredNotes.length > 0 ? (
          <div className="space-y-4 animate-fade-in">
            {filteredNotes.map((note, index) => (
              <div
                key={index}
                className="p-4 neomorph hover:scale-[1.02] transition-all duration-300"
              >
                <div className="flex items-center justify-between mb-2">
                  <div>
                    <h3 className="text-primary-200 font-medium">{note.lawName}</h3>
                    <p className="text-sm text-gray-400">Art. {note.articleNumber}</p>
                  </div>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => navigate(`/lei/${encodeURIComponent(note.lawName)}`)}
                    className="text-primary-300"
                  >
                    Ver artigo
                  </Button>
                </div>
                
                {note.topics.length > 0 && (
                  <div className="flex flex-wrap gap-2 mb-2">
                    {note.topics.map((topic: string, i: number) => (
                      <span key={i} className="px-2 py-1 bg-primary/10 rounded-md text-xs text-primary-300">
                        {topic}
                      </span>
                    ))}
                  </div>
                )}
                
                <p className="text-gray-300 text-sm line-clamp-3">{note.notes}</p>
              </div>
            ))}
          </div>
        ) : (
          <div className="text-center py-8 neomorph">
            <ScrollText className="h-12 w-12 text-gray-500 mx-auto mb-4" />
            <h3 className="text-xl font-heading font-semibold text-primary-100 mb-2">
              Nenhuma anotação ainda
            </h3>
            <p className="text-gray-400">
              Faça anotações nos artigos para encontrá-las facilmente aqui.
            </p>
          </div>
        )}
      </main>
      
      <Footer />
    </div>
  );
};

export default Notes;
