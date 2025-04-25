
import { useState, useEffect } from "react";
import Header from "@/components/layout/Header";
import Footer from "@/components/layout/Footer";
import { useNavigate } from "react-router-dom";
import { BackButton } from "@/components/ui/BackButton";
import { fetchAvailableLaws } from "@/services/lawService";
import { Scale, Search, Loader2 } from "lucide-react";
import { Input } from "@/components/ui/input";
import { motion } from "framer-motion";
import LawCategorySeparator from "@/components/law/LawCategorySeparator";

const categoryClassifier = (lawName: string): 'codigo' | 'estatuto' | 'outros' => {
  const name = lawName.toLowerCase();
  if (name.includes('código') || name.includes('consolidação') || name === 'constituição federal') {
    return 'codigo';
  } else if (name.includes('estatuto')) {
    return 'estatuto';
  }
  return 'outros';
};

const Laws = () => {
  const navigate = useNavigate();
  const [laws, setLaws] = useState<string[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [activeCategory, setActiveCategory] = useState<'codigo' | 'estatuto' | 'all'>('all');
  
  const filteredLaws = laws.filter(law => {
    // Filter by search term
    const matchesSearch = law.toLowerCase().includes(searchTerm.toLowerCase());
    
    // Filter by category
    if (activeCategory !== 'all') {
      const category = categoryClassifier(law);
      return matchesSearch && category === activeCategory;
    }
    
    return matchesSearch;
  });
  
  // Count laws by category
  const codigoCount = laws.filter(law => categoryClassifier(law) === 'codigo').length;
  const estatutoCount = laws.filter(law => categoryClassifier(law) === 'estatuto').length;

  useEffect(() => {
    const loadLaws = async () => {
      try {
        setIsLoading(true);
        const fetchedLaws = await fetchAvailableLaws();
        setLaws(fetchedLaws);
      } catch (error) {
        console.error("Error loading laws:", error);
      } finally {
        setIsLoading(false);
      }
    };
    loadLaws();
  }, []);

  return (
    <div className="flex flex-col min-h-screen pb-16 pt-20 px-4">
      <Header />
      
      <main className="flex-1 max-w-screen-md mx-auto w-full">
        <div className="flex justify-between items-center mb-6">
          <div className="flex items-center gap-3">
            <BackButton />
            <h1 className="text-2xl font-heading font-bold text-primary-300">
              Legislação
            </h1>
          </div>
        </div>
        
        <div className="relative mb-6">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
          <Input
            type="search"
            placeholder="Buscar legislação..."
            className="pl-10"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
        
        <LawCategorySeparator 
          onCategoryChange={setActiveCategory}
          activeCategory={activeCategory}
          codigoCount={codigoCount}
          estatutoCount={estatutoCount}
        />
        
        {isLoading ? (
          <div className="flex flex-col items-center justify-center py-8">
            <Loader2 className="h-8 w-8 text-primary-300 animate-spin mb-4" />
            <p className="text-gray-400">Carregando legislação...</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {filteredLaws.map((law, index) => {
              const category = categoryClassifier(law);
              return (
                <motion.button
                  key={law}
                  onClick={() => navigate(`/lei/${encodeURIComponent(law)}`)}
                  className="p-4 neomorph hover:scale-[1.02] transition-all duration-300"
                  whileHover={{ scale: 1.02 }}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: index * 0.05 }}
                >
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <div className={`p-2 rounded-md ${
                        category === 'codigo' ? 'bg-primary-300/20' : 
                        category === 'estatuto' ? 'bg-emerald-500/20' : 'bg-gray-500/20'
                      }`}>
                        <Scale size={18} className={`${
                          category === 'codigo' ? 'text-primary-300' : 
                          category === 'estatuto' ? 'text-emerald-500' : 'text-gray-400'
                        }`} />
                      </div>
                      <div className="text-left">
                        <h3 className="font-medium text-gray-200">{law}</h3>
                        <p className="text-xs text-gray-400">
                          {category === 'codigo' ? 'Código' : 
                           category === 'estatuto' ? 'Estatuto' : 'Outro'}
                        </p>
                      </div>
                    </div>
                    <Scale size={16} className="text-gray-500" />
                  </div>
                </motion.button>
              );
            })}
            
            {filteredLaws.length === 0 && (
              <div className="col-span-2 text-center py-8 neomorph">
                <p className="text-gray-400">
                  Nenhuma legislação encontrada com o termo "{searchTerm}".
                </p>
              </div>
            )}
          </div>
        )}
      </main>
      
      <Footer />
    </div>
  );
};

export default Laws;
