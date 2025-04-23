
import { useState } from "react";
import { useTheme } from "next-themes";
import React from "react";
import ProfileMenu from "./ProfileMenu";
import NotificationCenter from "@/components/layout/NotificationCenter";

const Header = () => {
  const [mounted, setMounted] = useState(false);
  const { setTheme } = useTheme();

  React.useEffect(() => {
    setMounted(true);
  }, []);

  return (
    <header className="sticky top-0 z-50 w-full border-b border-border/40 bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="container h-14 flex items-center justify-between">
        <div className="mr-4">
          <span className="font-heading font-bold text-xl">JurisAI</span>
        </div>
        
        <div className="flex items-center gap-2">
          <NotificationCenter />
          <ProfileMenu />
        </div>
      </div>
    </header>
  );
};

export default Header;
