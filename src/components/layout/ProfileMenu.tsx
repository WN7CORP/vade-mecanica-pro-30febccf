
import React, { useState, useRef } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetTrigger } from "@/components/ui/sheet";
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar";
import { LogOut, User, Camera } from "lucide-react";
import { toast } from "sonner";

const ProfileMenu = () => {
  const navigate = useNavigate();
  const [isOpen, setIsOpen] = useState(false);
  const [profileImage, setProfileImage] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Fetch user's current profile photo
  React.useEffect(() => {
    const fetchProfilePhoto = async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (user) {
        const { data } = supabase.storage.from('profile_photos').getPublicUrl(`${user.id}/profile.jpg`);
        setProfileImage(data.publicUrl);
      }
    };
    fetchProfilePhoto();
  }, []);

  const handleFileUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        toast.error("Você precisa estar logado para atualizar a foto");
        return;
      }

      // Upload file to Supabase storage
      const { error: uploadError } = await supabase.storage
        .from('profile_photos')
        .upload(`${user.id}/profile.jpg`, file, {
          upsert: true
        });

      if (uploadError) {
        toast.error("Erro ao fazer upload da foto", { description: uploadError.message });
        return;
      }

      // Get public URL
      const { data } = supabase.storage.from('profile_photos').getPublicUrl(`${user.id}/profile.jpg`);
      
      // Update user profile with new avatar URL
      const { error: updateError } = await supabase
        .from('user_profiles')
        .update({ avatar_url: data.publicUrl })
        .eq('id', user.id);

      if (updateError) {
        toast.error("Erro ao atualizar perfil", { description: updateError.message });
        return;
      }

      setProfileImage(data.publicUrl);
      toast.success("Foto de perfil atualizada com sucesso!");
    } catch (error) {
      toast.error("Erro ao atualizar foto de perfil");
      console.error(error);
    }
  };

  const handleSignOut = async () => {
    await supabase.auth.signOut();
    navigate('/auth');
    toast.success('Logout realizado com sucesso');
  };

  const triggerFileInput = () => {
    fileInputRef.current?.click();
  };

  return (
    <>
      <input 
        type="file" 
        ref={fileInputRef} 
        style={{ display: 'none' }} 
        accept="image/*"
        onChange={handleFileUpload}
      />
      <Sheet open={isOpen} onOpenChange={setIsOpen}>
        <SheetTrigger asChild>
          <Button variant="ghost" size="icon">
            <User className="h-5 w-5" />
          </Button>
        </SheetTrigger>
        <SheetContent>
          <SheetHeader>
            <SheetTitle>Perfil</SheetTitle>
          </SheetHeader>

          <div className="py-6 flex flex-col items-center">
            <div className="relative mb-4">
              <Avatar className="w-24 h-24">
                {profileImage ? (
                  <AvatarImage src={profileImage} alt="Foto de perfil" />
                ) : (
                  <AvatarFallback>
                    <User className="w-12 h-12" />
                  </AvatarFallback>
                )}
              </Avatar>
              <Button 
                variant="outline" 
                size="icon" 
                className="absolute bottom-0 right-0 bg-primary text-background"
                onClick={triggerFileInput}
              >
                <Camera className="w-4 h-4" />
              </Button>
            </div>

            <Button
              variant="destructive"
              className="w-full mt-4"
              onClick={handleSignOut}
            >
              <LogOut className="mr-2 h-4 w-4" />
              Sair
            </Button>
          </div>
        </SheetContent>
      </Sheet>
    </>
  );
};

export default ProfileMenu;
