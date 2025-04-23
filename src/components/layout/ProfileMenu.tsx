
import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetTrigger } from "@/components/ui/sheet";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Label } from "@/components/ui/label";
import { Avatar } from "@/components/ui/avatar";
import { LogOut, User } from "lucide-react";
import { toast } from "sonner";

const ProfileMenu = () => {
  const navigate = useNavigate();
  const [isOpen, setIsOpen] = useState(false);
  const [selectedGender, setSelectedGender] = useState<'male' | 'female'>('male');
  const [selectedTone, setSelectedTone] = useState('light');
  const [avatars, setAvatars] = useState<any[]>([]);

  React.useEffect(() => {
    fetchAvatars();
  }, [selectedGender]);

  const fetchAvatars = async () => {
    const { data } = await supabase
      .from('default_avatars')
      .select('*')
      .eq('gender', selectedGender);
    setAvatars(data || []);
  };

  const handleSignOut = async () => {
    await supabase.auth.signOut();
    navigate('/auth');
    toast.success('Logout realizado com sucesso');
  };

  const updateAvatar = async (avatarId: string) => {
    const { error } = await supabase
      .from('user_profiles')
      .update({ default_avatar_id: avatarId })
      .eq('id', (await supabase.auth.getUser()).data.user?.id);

    if (error) {
      toast.error('Erro ao atualizar avatar');
      return;
    }

    toast.success('Avatar atualizado com sucesso');
    setIsOpen(false);
  };

  return (
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

        <div className="py-6">
          <div className="mb-6">
            <h4 className="text-sm font-medium mb-3">Escolha seu Avatar</h4>
            <RadioGroup
              defaultValue="male"
              onValueChange={(v) => setSelectedGender(v as 'male' | 'female')}
              className="flex gap-4 mb-4"
            >
              <div className="flex items-center space-x-2">
                <RadioGroupItem value="male" id="male" />
                <Label htmlFor="male">Masculino</Label>
              </div>
              <div className="flex items-center space-x-2">
                <RadioGroupItem value="female" id="female" />
                <Label htmlFor="female">Feminino</Label>
              </div>
            </RadioGroup>

            <div className="grid grid-cols-3 gap-4 mb-6">
              {avatars.map((avatar) => (
                <button
                  key={avatar.id}
                  onClick={() => updateAvatar(avatar.id)}
                  className="p-2 rounded-lg hover:bg-primary-300/10 transition-colors"
                >
                  <Avatar className="w-16 h-16">
                    <img src={avatar.url} alt={`Avatar ${avatar.skin_tone}`} className="w-full h-full" />
                  </Avatar>
                  <span className="text-xs mt-1 block">
                    {avatar.skin_tone.replace('-', ' ')}
                  </span>
                </button>
              ))}
            </div>
          </div>

          <Button
            variant="destructive"
            className="w-full"
            onClick={handleSignOut}
          >
            <LogOut className="mr-2 h-4 w-4" />
            Sair
          </Button>
        </div>
      </SheetContent>
    </Sheet>
  );
};

export default ProfileMenu;
