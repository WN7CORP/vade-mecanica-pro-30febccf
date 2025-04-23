import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "@/components/ui/use-toast";
import {
  Card,
  CardContent,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Users,
  Search,
  Mail,
  RefreshCw,
  PenSquare,
  MessageSquare,
} from "lucide-react";
import { format } from "date-fns";
import { z } from "zod";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

interface User {
  id: string;
  email: string;
  full_name: string;
}

interface Message {
  id: string;
  admin_id: string;
  admin_name: string;
  user_id: string;
  user_name: string;
  content: string;
  is_read: boolean;
  created_at: string;
}

interface AuthUser {
  id: string;
  email?: string;
  [key: string]: any;
}

interface ProfileData {
  id: string;
  full_name?: string;
  [key: string]: any;
}

const messageSchema = z.object({
  user_id: z.string().min(1, "Selecione um usuário"),
  content: z.string().min(5, "Mensagem deve ter pelo menos 5 caracteres"),
});

const AdminMessages = () => {
  const [messages, setMessages] = useState<Message[]>([]);
  const [users, setUsers] = useState<User[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [isLoadingUsers, setIsLoadingUsers] = useState<boolean>(true);
  const [searchTerm, setSearchTerm] = useState<string>("");
  const [activeTab, setActiveTab] = useState<string>("all");
  const [selectedUserId, setSelectedUserId] = useState<string | null>(null);
  const [isNewMessageOpen, setIsNewMessageOpen] = useState<boolean>(false);

  const messageForm = useForm<z.infer<typeof messageSchema>>({
    resolver: zodResolver(messageSchema),
    defaultValues: {
      user_id: "",
      content: "",
    },
  });

  const fetchMessages = async () => {
    setIsLoading(true);
    
    try {
      let query = supabase
        .from('admin_messages')
        .select(`
          id, 
          admin_id, 
          user_id, 
          content, 
          is_read, 
          created_at
        `)
        .order('created_at', { ascending: false });
      
      if (selectedUserId) {
        query = query.eq('user_id', selectedUserId);
      }
      
      if (activeTab === "sent") {
        const { data: { session } } = await supabase.auth.getSession();
        if (session) {
          query = query.eq('admin_id', session.user.id);
        }
      }
      
      const { data, error } = await query;
      
      if (error) throw error;
      
      const userIds = data?.map(message => [message.admin_id, message.user_id]).flat();
      const uniqueUserIds = [...new Set(userIds)];
      
      const { data: userData, error: userError } = await supabase
        .from('user_profiles')
        .select('id, full_name')
        .in('id', uniqueUserIds);
      
      if (userError) throw userError;
      
      const userMap = new Map();
      userData?.forEach(user => {
        userMap.set(user.id, user.full_name || 'Usuário não identificado');
      });
      
      const formattedMessages = data?.map(message => ({
        id: message.id,
        admin_id: message.admin_id,
        admin_name: userMap.get(message.admin_id) || 'Admin não identificado',
        user_id: message.user_id,
        user_name: userMap.get(message.user_id) || 'Usuário não identificado',
        content: message.content,
        is_read: message.is_read,
        created_at: message.created_at,
      }));
      
      setMessages(formattedMessages || []);
      
      await supabase.rpc('log_admin_action', {
        action_type: 'view_messages',
        details: { timestamp: new Date().toISOString() }
      });
      
    } catch (error) {
      console.error("Erro ao buscar mensagens:", error);
      toast({
        title: "Erro",
        description: "Não foi possível carregar as mensagens",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const fetchUsers = async () => {
    setIsLoadingUsers(true);
    
    try {
      const { data: profileData, error: profileError } = await supabase
        .from('user_profiles')
        .select('id, full_name')
        .order('full_name');
      
      if (profileError) throw profileError;
      
      const { data: authData, error: authError } = await supabase.auth.admin.listUsers();
      
      if (authError) {
        console.error("Error fetching user emails:", authError);
        const formattedUsers: User[] = (profileData || []).map((user: ProfileData) => ({
          id: user.id,
          full_name: user.full_name || 'Sem nome',
          email: 'Email não disponível',
        }));
        
        setUsers(formattedUsers);
      } else {
        const emailMap = new Map<string, string>();
        if (authData && authData.users && Array.isArray(authData.users)) {
          authData.users.forEach((user: AuthUser) => {
            if (user && user.id && user.email) {
              emailMap.set(user.id, user.email);
            }
          });
        }
        
        const formattedUsers: User[] = (profileData || []).map((user: ProfileData) => ({
          id: user.id,
          full_name: user.full_name || 'Sem nome',
          email: emailMap.get(user.id) || 'Email não disponível',
        }));
        
        setUsers(formattedUsers);
      }
    } catch (error) {
      console.error("Erro ao buscar usuários:", error);
      toast({
        title: "Erro",
        description: "Não foi possível carregar a lista de usuários",
        variant: "destructive",
      });
      setUsers([]);
    } finally {
      setIsLoadingUsers(false);
    }
  };

  useEffect(() => {
    fetchUsers();
    fetchMessages();
  }, []);

  useEffect(() => {
    fetchMessages();
  }, [activeTab, selectedUserId]);

  const handleSendMessage = async (values: z.infer<typeof messageSchema>) => {
    try {
      const { data: { session } } = await supabase.auth.getSession();
      
      if (!session) throw new Error("Sessão administrativa não encontrada");
      
      const { error } = await supabase
        .from('admin_messages')
        .insert({
          admin_id: session.user.id,
          user_id: values.user_id,
          content: values.content
        });

      if (error) throw error;
      
      await supabase.rpc('log_admin_action', {
        action_type: 'send_message',
        details: { 
          user_id: values.user_id,
          sent_at: new Date().toISOString() 
        }
      });

      toast({
        title: "Mensagem enviada com sucesso",
        description: "Sua mensagem foi enviada para o usuário",
      });
      
      setIsNewMessageOpen(false);
      messageForm.reset();
      
      fetchMessages();
      
    } catch (error: any) {
      console.error("Erro ao enviar mensagem:", error);
      toast({
        title: "Erro ao enviar mensagem",
        description: error?.message || "Não foi possível enviar a mensagem",
        variant: "destructive",
      });
    }
  };

  const handleMarkAsRead = async (messageId: string) => {
    try {
      const { error } = await supabase
        .from('admin_messages')
        .update({ is_read: true })
        .eq('id', messageId);

      if (error) throw error;
      
      setMessages(messages.map(msg => 
        msg.id === messageId ? { ...msg, is_read: true } : msg
      ));
      
      toast({
        title: "Mensagem marcada como lida",
        description: "A mensagem foi atualizada com sucesso",
      });
      
    } catch (error: any) {
      console.error("Erro ao marcar mensagem como lida:", error);
      toast({
        title: "Erro",
        description: error?.message || "Não foi possível atualizar a mensagem",
        variant: "destructive",
      });
    }
  };

  const filteredMessages = messages.filter(message =>
    message.user_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    message.admin_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    message.content.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-bold">Mensagens</h2>
        <div className="flex items-center gap-2">
          <Button
            variant="outline"
            size="sm"
            onClick={fetchMessages}
            disabled={isLoading}
            className="flex items-center gap-1"
          >
            <RefreshCw size={16} className={isLoading ? "animate-spin" : ""} />
            <span>Atualizar</span>
          </Button>
          
          <Dialog open={isNewMessageOpen} onOpenChange={setIsNewMessageOpen}>
            <DialogTrigger asChild>
              <Button className="flex items-center gap-1">
                <PenSquare size={16} />
                <span>Nova Mensagem</span>
              </Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Enviar Nova Mensagem</DialogTitle>
                <DialogDescription>
                  Selecione um usuário e digite sua mensagem
                </DialogDescription>
              </DialogHeader>
              <Form {...messageForm}>
                <form onSubmit={messageForm.handleSubmit(handleSendMessage)} className="space-y-4">
                  <FormField
                    control={messageForm.control}
                    name="user_id"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Destinatário</FormLabel>
                        <FormControl>
                          <Select 
                            onValueChange={field.onChange} 
                            defaultValue={field.value}
                          >
                            <SelectTrigger>
                              <SelectValue placeholder="Selecione um usuário" />
                            </SelectTrigger>
                            <SelectContent>
                              {isLoadingUsers ? (
                                <div className="flex justify-center p-2">
                                  <div className="animate-spin h-4 w-4 border-2 border-primary border-t-transparent rounded-full"></div>
                                </div>
                              ) : (
                                users.map(user => (
                                  <SelectItem key={user.id} value={user.id}>
                                    {user.full_name} ({user.email})
                                  </SelectItem>
                                ))
                              )}
                            </SelectContent>
                          </Select>
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={messageForm.control}
                    name="content"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Mensagem</FormLabel>
                        <FormControl>
                          <Textarea 
                            placeholder="Digite sua mensagem aqui..."
                            className="min-h-[120px]"
                            {...field}
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <DialogFooter>
                    <Button type="submit">Enviar Mensagem</Button>
                  </DialogFooter>
                </form>
              </Form>
            </DialogContent>
          </Dialog>
        </div>
      </div>
      
      <div className="flex flex-col sm:flex-row justify-between gap-4">
        <div className="flex-1 flex items-center space-x-2">
          <div className="relative flex-1">
            <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Buscar mensagens..."
              className="pl-8"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
        </div>
        
        <div className="flex flex-col sm:flex-row gap-2">
          <Select 
            value={selectedUserId || "all-users"}
            onValueChange={(value) => setSelectedUserId(value === "all-users" ? null : value)}
          >
            <SelectTrigger className="w-full sm:w-[200px]">
              <SelectValue placeholder="Todos os usuários" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all-users">Todos os usuários</SelectItem>
              {users.map(user => (
                <SelectItem key={user.id} value={user.id}>
                  {user.full_name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          
          <Tabs value={activeTab} onValueChange={setActiveTab} className="sm:w-[200px]">
            <TabsList className="grid grid-cols-2 w-full">
              <TabsTrigger value="all">Todas</TabsTrigger>
              <TabsTrigger value="sent">Enviadas</TabsTrigger>
            </TabsList>
          </Tabs>
        </div>
      </div>

      <div className="border rounded-lg overflow-hidden">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>De</TableHead>
              <TableHead>Para</TableHead>
              <TableHead>Mensagem</TableHead>
              <TableHead>Data</TableHead>
              <TableHead className="w-[80px]">Status</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {isLoading ? (
              <TableRow>
                <TableCell colSpan={5} className="h-24 text-center">
                  <div className="flex justify-center items-center h-full">
                    <div className="animate-spin h-6 w-6 border-4 border-primary border-t-transparent rounded-full"></div>
                  </div>
                </TableCell>
              </TableRow>
            ) : filteredMessages.length === 0 ? (
              <TableRow>
                <TableCell colSpan={5} className="h-24 text-center text-muted-foreground">
                  <div className="flex justify-center">
                    <div className="flex flex-col items-center">
                      <MessageSquare className="h-8 w-8 mb-2" />
                      <span>Nenhuma mensagem encontrada</span>
                    </div>
                  </div>
                </TableCell>
              </TableRow>
            ) : (
              filteredMessages.map(message => (
                <TableRow key={message.id} className={message.is_read ? "" : "bg-primary-50"}>
                  <TableCell>{message.admin_name}</TableCell>
                  <TableCell>{message.user_name}</TableCell>
                  <TableCell>
                    <div className="max-w-xs truncate">{message.content}</div>
                  </TableCell>
                  <TableCell>
                    {format(new Date(message.created_at), 'dd/MM/yyyy HH:mm')}
                  </TableCell>
                  <TableCell>
                    {message.is_read ? (
                      <span className="inline-flex items-center rounded-md bg-green-50 px-2 py-1 text-xs font-medium text-green-700 ring-1 ring-inset ring-green-600/20">
                        Lida
                      </span>
                    ) : (
                      <Button 
                        variant="ghost" 
                        size="sm"
                        onClick={() => handleMarkAsRead(message.id)}
                      >
                        Não lida
                      </Button>
                    )}
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </div>
    </div>
  );
};

export default AdminMessages;
