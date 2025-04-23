
import React, { useState, useRef, useEffect } from "react";
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
  const [loading, setLoading] = useState(false);

  // Fetch user's current profile photo
  useEffect(() => {
    const fetchProfilePhoto = async () => {
      try {
        const { data: { user } } = await supabase.auth.getUser();
        if (user) {
          // First check if we can get the user profile
          const { data: profile } = await supabase
            .from('user_profiles')
            .select('avatar_url')
            .eq('id', user.id)
            .single();
            
          if (profile?.avatar_url) {
            setProfileImage(profile.avatar_url);
          }
        }
      } catch (error) {
        console.error("Error fetching profile:", error);
      }
    };
    fetchProfilePhoto();
  }, []);

  const handleFileUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;
    
    setLoading(true);

    try {
      // First check if bucket exists
      const { data: buckets } = await supabase.storage.listBuckets();
      const bucketExists = buckets?.some(bucket => bucket.name === 'profile_photos');
      
      if (!bucketExists) {
        toast.error("Bucket de armazenamento não encontrado", { 
          description: "Entre em contato com o suporte técnico." 
        });
        setLoading(false);
        return;
      }

      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        toast.error("Você precisa estar logado para atualizar a foto");
        setLoading(false);
        return;
      }

      // Create folder for user if it doesn't exist
      const folderPath = `${user.id}`;
      const fileName = 'profile.jpg';
      const filePath = `${folderPath}/${fileName}`;

      // Upload file to Supabase storage
      const { error: uploadError } = await supabase.storage
        .from('profile_photos')
        .upload(filePath, file, {
          upsert: true,
          contentType: file.type
        });

      if (uploadError) {
        toast.error("Erro ao fazer upload da foto", { description: uploadError.message });
        setLoading(false);
        return;
      }

      // Get public URL
      const { data } = supabase.storage.from('profile_photos').getPublicUrl(filePath);
      
      // Update user profile with new avatar URL
      const { error: updateError } = await supabase
        .from('user_profiles')
        .update({ avatar_url: data.publicUrl })
        .eq('id', user.id);

      if (updateError) {
        toast.error("Erro ao atualizar perfil", { description: updateError.message });
        setLoading(false);
        return;
      }

      setProfileImage(data.publicUrl);
      toast.success("Foto de perfil atualizada com sucesso!");
    } catch (error: any) {
      toast.error("Erro ao atualizar foto de perfil", { 
        description: error.message || "Tente novamente mais tarde" 
      });
      console.error(error);
    } finally {
      setLoading(false);
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
                disabled={loading}
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
