
import React, { useState } from "react";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import CommunityFeed from "@/components/community/CommunityFeed";
import CommunityMetricsTable from "@/components/community/CommunityMetricsTable";
import { BackButton } from "@/components/ui/BackButton";
import NotificationCenter from "@/components/layout/NotificationCenter";
import { Button } from "@/components/ui/button";
import { useTheme } from "next-themes";
import Footer from "@/components/layout/Footer";

const Community = () => {
  const [fontSize, setFontSize] = useState(16);

  return (
    <>
      <div className="container max-w-3xl mx-auto pt-0 pb-32 px-0 sm:px-2">
        <div className="flex items-center justify-between h-16 px-4 mb-2 border-b border-gray-900 bg-background/80 sticky top-0 z-50">
          <BackButton />
          <div className="flex items-center gap-2">
            <NotificationCenter />
          </div>
        </div>
        <Tabs defaultValue="feed" className="w-full">
          <TabsList className="mb-4 mt-1 w-full flex bg-gray-900">
            <TabsTrigger value="feed" className="flex-1">
              Feed
            </TabsTrigger>
            <TabsTrigger value="metrics" className="flex-1">
              Métricas
            </TabsTrigger>
          </TabsList>
          <TabsContent value="feed" className="p-0">
            <CommunityFeed
              fontSize={fontSize}
              onIncreaseFont={() => setFontSize((s) => Math.min(26, s + 2))}
              onDecreaseFont={() => setFontSize((s) => Math.max(12, s - 2))}
            />
          </TabsContent>
          <TabsContent value="metrics" className="p-0">
            <CommunityMetricsTable />
          </TabsContent>
        </Tabs>
      </div>
      <Footer />
    </>
  );
};

export default Community;
