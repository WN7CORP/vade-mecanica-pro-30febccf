
import React, { useState } from "react";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import CommunityFeed from "@/components/community/CommunityFeed";
import CommunityRanking from "@/components/community/CommunityRanking";
import CommunityMetricsTable from "@/components/community/CommunityMetricsTable";
import { Moon, Sun, Bell } from "lucide-react";
import NotificationCenter from "@/components/ui/NotificationCenter";
import { Button } from "@/components/ui/button";
import { useTheme } from "next-themes";

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

  return (
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
          <CommunityFeed
            fontSize={fontSize}
            onIncreaseFont={() => setFontSize((s) => Math.min(26, s + 2))}
            onDecreaseFont={() => setFontSize((s) => Math.max(12, s - 2))}
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
  );
};

export default Community;
