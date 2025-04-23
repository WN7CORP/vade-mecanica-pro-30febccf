
import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { useToast } from "@/hooks/use-toast";
import { useMobile } from "@/hooks/use-mobile";
import { ChevronLeft } from "lucide-react";
import CommunityHeader from "@/components/community/CommunityHeader";
import CommunityFeed from "@/components/community/CommunityFeed";

const Community = () => {
  const navigate = useNavigate();
  const { toast } = useToast();
  const isMobile = useMobile();
  const [showFilters, setShowFilters] = useState(false);

  const handleBackClick = () => {
    navigate(-1);
  };

  return (
    <div className="container max-w-4xl mx-auto px-4 py-6">
      <div className="flex items-center mb-6">
        <Button
          variant="ghost"
          className="p-0 mr-2 text-gray-400 hover:text-primary-200 hover:bg-transparent"
          onClick={handleBackClick}
        >
          <ChevronLeft size={24} />
        </Button>
        <h1 className="text-2xl font-heading font-bold text-primary-300">
          Comunidade Jurídica
        </h1>
      </div>

      <CommunityHeader onFilterToggle={() => setShowFilters(!showFilters)} />
      <CommunityFeed showFilters={showFilters} />
    </div>
  );
};

export default Community;
