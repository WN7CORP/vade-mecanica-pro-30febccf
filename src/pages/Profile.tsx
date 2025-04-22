
import { useState, useEffect } from "react";
import Header from "@/components/layout/Header";
import Footer from "@/components/layout/Footer";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar";
import Stats from "@/components/ui/Stats";
import { supabase } from "@/integrations/supabase/client";
import { useNavigate } from "react-router-dom";

const ProfilePage = () => {
  const [profile, setProfile] = useState<any>(null);
  const navigate = useNavigate();

  useEffect(() => {
    const getProfile = async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        navigate('/auth');
        return;
      }
      
      const { data } = await supabase
        .from('user_profiles')
        .select('*')
        .eq('id', user.id)
        .single();
        
      setProfile(data);
    };

    getProfile();
  }, [navigate]);

  return (
    <div className="min-h-screen pb-16 pt-20 px-4">
      <Header />
      
      <main className="max-w-screen-md mx-auto space-y-8">
        <div className="neomorph p-6">
          <div className="flex items-center gap-6">
            <Avatar className="h-20 w-20">
              <AvatarImage src={profile?.avatar_url} />
              <AvatarFallback>{profile?.username?.[0]?.toUpperCase()}</AvatarFallback>
            </Avatar>
            <div>
              <h1 className="text-2xl font-bold text-primary-300">{profile?.full_name}</h1>
              <p className="text-muted-foreground">{profile?.username || profile?.email}</p>
            </div>
          </div>
        </div>

        <Stats />
      </main>
      
      <Footer />
    </div>
  );
};

export default ProfilePage;
