
import LawHeader from "@/components/law/LawHeader";
import LawTabbedView from "@/components/law/LawTabbedView";
import { Card } from "@/components/ui/card";

const LawView = () => {
  return (
    <div className="space-y-6">
      <Card className="p-6">
        <LawHeader />
      </Card>
      
      <LawTabbedView />
    </div>
  );
};

export default LawView;
