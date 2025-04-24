
import { useState } from "react";
import { ChevronDown } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from "@/components/ui/collapsible";
import { StudyPerformanceView } from "./StudyPerformanceView";
import { PerformanceData } from "./StudyPerformanceView";

interface StudyStatsProps {
  performanceData: PerformanceData[];
}

export const StudyStats = ({ performanceData }: StudyStatsProps) => {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <Collapsible
      open={isOpen}
      onOpenChange={setIsOpen}
      className="w-full mt-8"
    >
      <div className="flex items-center justify-between">
        <h3 className="text-lg font-semibold text-primary-100">
          Estatísticas de Estudo
        </h3>
        <CollapsibleTrigger asChild>
          <Button 
            variant="outline" 
            size="sm"
            className="w-9 p-0"
          >
            <ChevronDown
              className={`h-4 w-4 transition-transform duration-200 ${
                isOpen ? "transform rotate-180" : ""
              }`}
            />
            <span className="sr-only">Toggle stats</span>
          </Button>
        </CollapsibleTrigger>
      </div>
      
      <CollapsibleContent className="mt-4">
        <StudyPerformanceView performanceData={performanceData} />
      </CollapsibleContent>
    </Collapsible>
  );
};
