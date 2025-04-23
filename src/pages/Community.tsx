
import React, { useState } from "react";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import CommunityFeed from "@/components/community/CommunityFeed";
import CommunityRanking from "@/components/community/CommunityRanking";
import CommunityMetricsTable from "@/components/community/CommunityMetricsTable";
import { Moon, Sun, Bell, Film, GavelIcon } from "lucide-react";
import NotificationCenter from "@/components/layout/NotificationCenter";
import { Button } from "@/components/ui/button";
import { useTheme } from "next-themes";
import Footer from "@/components/layout/Footer";
import { CommunitySidebar } from "@/components/community/CommunitySidebar";
import { SidebarProvider } from "@/components/ui/sidebar";
import { useIsMobile } from "@/hooks/use-mobile";

// Cabeçalho compacto só com notificações e botão tema
const CommunityHeaderCompact = () => {
  const { setTheme } = useTheme();
  const [mounted, setMounted] = useState(false);

  React.useEffect(() => setMounted(true), []);

  return (
    <div className="flex items-center justify-end gap-2 h-16 px-4 mb-2 border-b border-gray-900 bg-background/80 sticky top-0 z-50">
      <NotificationCenter />
      {mounted ? (
        <>
          <Button variant="ghost" size="icon" onClick={() => setTheme("light")}>
            <Sun className="h-5 w-5" />
            <span className="sr-only">Claro</span>
          </Button>
          <Button variant="ghost" size="icon" onClick={() => setTheme("dark")}>
            <Moon className="h-5 w-5" />
            <span className="sr-only">Escuro</span>
          </Button>
        </>
      ) : null}
    </div>
  );
};

const Community = () => {
  const [fontSize, setFontSize] = useState(16);
  const [communityType, setCommunityType] = useState<'general' | 'legislation' | 'movies'>('general');
  const isMobile = useIsMobile();

  const getCommunityTitle = () => {
    switch(communityType) {
      case 'legislation': return 'Comunidade de Legislação';
      case 'movies': return 'Comunidade de Filmes Jurídicos';
      default: return 'Comunidade Geral';
    }
  };

  return (
    <SidebarProvider>
      <div className="flex min-h-screen w-full">
        {!isMobile && <CommunitySidebar />}
        <div className="flex-1">
          <div className="container max-w-3xl mx-auto pt-0 pb-32 px-0 sm:px-2">
            <CommunityHeaderCompact />
            <Tabs defaultValue="feed" className="w-full">
              <TabsList className="mb-4 mt-1 w-full flex bg-gray-900">
                <TabsTrigger value="feed" className="flex-1">
                  Feed
                </TabsTrigger>
                <TabsTrigger value="ranking" className="flex-1">
                  Ranking & Métricas
                </TabsTrigger>
              </TabsList>

              <TabsContent value="feed" className="p-0">
                <div className="mb-6">
                  <h1 className="text-2xl font-heading font-bold text-primary-300 mb-4">
                    {getCommunityTitle()}
                  </h1>
                  
                  <div className="flex gap-2 mb-4 overflow-x-auto pb-2">
                    <Button 
                      variant={communityType === 'general' ? 'default' : 'outline'}
                      size="sm"
                      onClick={() => setCommunityType('general')}
                      className={communityType === 'general' ? 
                        "bg-primary-300 text-gray-900 hover:bg-primary-400" : 
                        "border-primary-300/30 text-primary-300 hover:bg-primary-300/10"}
                    >
                      Geral
                    </Button>
                    
                    <Button 
                      variant={communityType === 'legislation' ? 'default' : 'outline'}
                      size="sm"
                      onClick={() => setCommunityType('legislation')}
                      className={communityType === 'legislation' ? 
                        "bg-primary-300 text-gray-900 hover:bg-primary-400" : 
                        "border-primary-300/30 text-primary-300 hover:bg-primary-300/10"}
                    >
                      <GavelIcon size={16} className="mr-2" />
                      Legislação
                    </Button>
                    
                    <Button 
                      variant={communityType === 'movies' ? 'default' : 'outline'}
                      size="sm"
                      onClick={() => setCommunityType('movies')}
                      className={communityType === 'movies' ? 
                        "bg-primary-300 text-gray-900 hover:bg-primary-400" : 
                        "border-primary-300/30 text-primary-300 hover:bg-primary-300/10"}
                    >
                      <Film size={16} className="mr-2" />
                      Filmes Jurídicos
                    </Button>
                  </div>
                </div>
                
                <CommunityFeed
                  fontSize={fontSize}
                  onIncreaseFont={() => setFontSize((s) => Math.min(26, s + 2))}
                  onDecreaseFont={() => setFontSize((s) => Math.max(12, s - 2))}
                  communityType={communityType}
                />
              </TabsContent>
              
              <TabsContent value="ranking" className="p-0">
                <div className="mb-6">
                  <CommunityRanking />
                </div>
                <CommunityMetricsTable />
              </TabsContent>
            </Tabs>
          </div>
          <Footer />
        </div>
      </div>
    </SidebarProvider>
  );
};

export default Community;
