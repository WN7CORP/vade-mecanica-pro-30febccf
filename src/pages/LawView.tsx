
import LawHeader from "@/components/law/LawHeader";
import LawTabbedView from "@/components/law/LawTabbedView";
import { Card } from "@/components/ui/card";
import { useParams } from "react-router-dom";
import { motion } from "framer-motion";

const LawView = () => {
  const { lawName } = useParams<{ lawName: string }>();

  // Function to determine law category
  const getLawCategory = (name: string | undefined): 'codigo' | 'estatuto' | 'outros' => {
    if (!name) return 'outros';
    
    const lowerName = name.toLowerCase();
    if (lowerName.includes('código') || lowerName.includes('consolidação') || lowerName === 'constituição federal') {
      return 'codigo';
    } else if (lowerName.includes('estatuto')) {
      return 'estatuto';
    }
    return 'outros';
  };

  const lawCategory = getLawCategory(lawName);

  return (
    <motion.div 
      className="space-y-6"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.4 }}
    >
      <Card className={`p-6 ${
        lawCategory === 'codigo' ? 'border-blue-200 dark:border-blue-800/50' : 
        lawCategory === 'estatuto' ? 'border-green-200 dark:border-green-800/50' : 
        ''
      }`}>
        <LawHeader />
      </Card>
      
      <LawTabbedView />
    </motion.div>
  );
};

export default LawView;
