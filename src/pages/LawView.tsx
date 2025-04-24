
import Header from "@/components/layout/Header";
import Footer from "@/components/layout/Footer";
import LawHeader from "@/components/law/LawHeader";
import LawTabbedView from "@/components/law/LawTabbedView";

const LawView = () => {
  return (
    <div 
      style={{ background: '#131620' }} 
      className="flex flex-col min-h-screen px-[9px]"
    >
      <Header />
      
      <main className="flex-1 max-w-screen-md mx-auto w-full pt-20">
        <div className="space-y-4">
          <LawHeader />
          <LawTabbedView />
        </div>
      </main>
      
      <Footer />
    </div>
  );
};

export default LawView;
