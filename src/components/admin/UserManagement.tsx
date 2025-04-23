import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "@/components/ui/use-toast";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
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
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  Pagination,
  PaginationContent,
  PaginationItem,
  PaginationLink,
  PaginationNext,
  PaginationPrevious,
} from "@/components/ui/pagination";
import { 
  Search, 
  MoreVertical, 
  UserPlus, 
  Trash2,
  Ban,
  MailOpen,
  UserCheck,
  AlertCircle
} from "lucide-react";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Textarea } from "@/components/ui/textarea";
import { format } from "date-fns";

interface User {
  id: string;
  email: string;
  username?: string;
  full_name?: string;
  created_at: string;
  points?: number;
  last_active?: string;
  banned?: boolean;
}

const newUserSchema = z.object({
  email: z.string().email("Email inválido"),
  password: z.string().min(6, "A senha deve ter pelo menos 6 caracteres"),
  full_name: z.string().min(3, "Nome completo é obrigatório"),
});

const banUserSchema = z.object({
  reason: z.string().min(5, "Motivo é obrigatório"),
  duration: z.string(),
});

const messageSchema = z.object({
  content: z.string().min(5, "Mensagem é obrigatória"),
});

const UserManagement = () => {
  const [users, setUsers] = useState<User[]>([]);
  const [filteredUsers, setFilteredUsers] = useState<User[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [searchTerm, setSearchTerm] = useState<string>("");
  const [currentPage, setCurrentPage] = useState<number>(1);
  const [totalPages, setTotalPages] = useState<number>(1);
  const [selectedUser, setSelectedUser] = useState<User | null>(null);
  const [isNewUserDialogOpen, setIsNewUserDialogOpen] = useState<boolean>(false);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState<boolean>(false);
  const [isBanDialogOpen, setIsBanDialogOpen] = useState<boolean>(false);
  const [isMessageDialogOpen, setIsMessageDialogOpen] = useState<boolean>(false);
  
  const ITEMS_PER_PAGE = 10;

  const newUserForm = useForm<z.infer<typeof newUserSchema>>({
    resolver: zodResolver(newUserSchema),
    defaultValues: {
      email: "",
      password: "",
      full_name: "",
    },
  });

  const banUserForm = useForm<z.infer<typeof banUserSchema>>({
    resolver: zodResolver(banUserSchema),
    defaultValues: {
      reason: "",
      duration: "permanent", // 'permanent', '1d', '7d', '30d'
    },
  });

  const messageForm = useForm<z.infer<typeof messageSchema>>({
    resolver: zodResolver(messageSchema),
    defaultValues: {
      content: "",
    },
  });

  const fetchUsers = async (page: number = 1) => {
    setIsLoading(true);
    
    try {
      const { data: profileData, error: profileError, count } = await supabase
        .from('user_profiles')
        .select('*', { count: 'exact' })
        .range((page - 1) * ITEMS_PER_PAGE, page * ITEMS_PER_PAGE - 1);
      
      if (profileError) throw profileError;
      
      const userIds = profileData?.map(profile => profile.id) || [];
      
      const { data: bans, error: bansError } = await supabase
        .from('user_bans')
        .select('user_id')
        .in('user_id', userIds)
        .or('expires_at.gt.now,expires_at.is.null');
      
      if (bansError) throw bansError;
      
      const bannedUserIds = new Set(bans?.map(ban => ban.user_id) || []);
      
      const combinedUsers = profileData?.map(profile => ({
        id: profile.id,
        email: profile.username || '',
        username: profile.username || '',
        full_name: profile.full_name || '',
        created_at: profile.created_at,
        points: profile.points || 0,
        last_active: profile.updated_at || '',
        banned: bannedUserIds.has(profile.id)
      })) || [];
      
      const totalCount = count || 0;
      const calculatedTotalPages = Math.max(1, Math.ceil(totalCount / ITEMS_PER_PAGE));
      
      setUsers(combinedUsers);
      setFilteredUsers(combinedUsers);
      setTotalPages(calculatedTotalPages);
      
      await supabase.rpc('log_admin_action', {
        action_type: 'view_users',
        details: { page: page }
      });
      
    } catch (error) {
      console.error("Erro ao buscar usuários:", error);
      toast({
        title: "Erro",
        description: "Não foi possível carregar a lista de usuários",
        variant: "destructive",
      });
      setUsers([]);
      setFilteredUsers([]);
      setTotalPages(1);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchUsers();
  }, []);

  useEffect(() => {
    if (searchTerm) {
      const filtered = users.filter(
        user =>
          user.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
          user.full_name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
          user.username?.toLowerCase().includes(searchTerm.toLowerCase())
      );
      setFilteredUsers(filtered);
    } else {
      setFilteredUsers(users);
    }
  }, [searchTerm, users]);

  const handlePageChange = (page: number) => {
    setCurrentPage(page);
    fetchUsers(page);
  };

  const handleCreateUser = async (values: z.infer<typeof newUserSchema>) => {
    try {
      const { data, error } = await supabase.auth.signUp({
        email: values.email,
        password: values.password,
        options: {
          data: { full_name: values.full_name }
        }
      });

      if (error) throw error;

      await supabase.rpc('log_admin_action', {
        action_type: 'create_user',
        details: { 
          email: values.email,
          created_at: new Date().toISOString() 
        }
      });
      
      toast({
        title: "Usuário criado com sucesso",
        description: `O usuário ${values.email} foi criado`,
      });
      
      setIsNewUserDialogOpen(false);
      newUserForm.reset();
      fetchUsers(currentPage);
      
    } catch (error: any) {
      console.error("Erro ao criar usuário:", error);
      toast({
        title: "Erro ao criar usuário",
        description: error?.message || "Não foi possível criar o usuário",
        variant: "destructive",
      });
    }
  };

  const handleDeleteUser = async () => {
    if (!selectedUser) return;
    
    try {
      const { error: profileError } = await supabase
        .from('user_profiles')
        .delete()
        .eq('id', selectedUser.id);
        
      if (profileError) throw profileError;
      
      await supabase.rpc('log_admin_action', {
        action_type: 'delete_user',
        details: { 
          user_id: selectedUser.id,
          email: selectedUser.email,
          deleted_at: new Date().toISOString() 
        }
      });

      toast({
        title: "Usuário excluído com sucesso",
        description: `O usuário ${selectedUser.email} foi excluído`,
      });
      
      setIsDeleteDialogOpen(false);
      setSelectedUser(null);
      fetchUsers(currentPage);
      
    } catch (error: any) {
      console.error("Erro ao excluir usuário:", error);
      toast({
        title: "Erro ao excluir usuário",
        description: error?.message || "Não foi possível excluir o usuário",
        variant: "destructive",
      });
    }
  };

  const handleBanUser = async (values: z.infer<typeof banUserSchema>) => {
    if (!selectedUser) return;
    
    try {
      let expiresAt = null;
      
      if (values.duration !== 'permanent') {
        const days = parseInt(values.duration.replace('d', ''));
        const date = new Date();
        date.setDate(date.getDate() + days);
        expiresAt = date.toISOString();
      }
      
      const { data: { session } } = await supabase.auth.getSession();
      
      if (!session) throw new Error("Sessão administrativa não encontrada");
      
      const { error } = await supabase
        .from('user_bans')
        .insert({
          user_id: selectedUser.id,
          admin_id: session.user.id,
          reason: values.reason,
          expires_at: expiresAt
        });

      if (error) throw error;
      
      await supabase.rpc('log_admin_action', {
        action_type: 'ban_user',
        details: { 
          user_id: selectedUser.id,
          email: selectedUser.email,
          reason: values.reason,
          duration: values.duration,
          banned_at: new Date().toISOString() 
        }
      });

      toast({
        title: "Usuário banido com sucesso",
        description: `O usuário ${selectedUser.email} foi banido`,
      });
      
      setIsBanDialogOpen(false);
      banUserForm.reset();
      setSelectedUser(null);
      fetchUsers(currentPage);
      
    } catch (error: any) {
      console.error("Erro ao banir usuário:", error);
      toast({
        title: "Erro ao banir usuário",
        description: error?.message || "Não foi possível banir o usuário",
        variant: "destructive",
      });
    }
  };

  const handleSendMessage = async (values: z.infer<typeof messageSchema>) => {
    if (!selectedUser) return;
    
    try {
      const { data: { session } } = await supabase.auth.getSession();
      
      if (!session) throw new Error("Sessão administrativa não encontrada");
      
      const { error } = await supabase
        .from('admin_messages')
        .insert({
          admin_id: session.user.id,
          user_id: selectedUser.id,
          content: values.content
        });

      if (error) throw error;
      
      await supabase.rpc('log_admin_action', {
        action_type: 'send_message',
        details: { 
          user_id: selectedUser.id,
          email: selectedUser.email,
          sent_at: new Date().toISOString() 
        }
      });

      toast({
        title: "Mensagem enviada com sucesso",
        description: `Mensagem enviada para ${selectedUser.email}`,
      });
      
      setIsMessageDialogOpen(false);
      messageForm.reset();
      setSelectedUser(null);
      
    } catch (error: any) {
      console.error("Erro ao enviar mensagem:", error);
      toast({
        title: "Erro ao enviar mensagem",
        description: error?.message || "Não foi possível enviar a mensagem",
        variant: "destructive",
      });
    }
  };

  const handleUnbanUser = async (user: User) => {
    try {
      const { error } = await supabase
        .from('user_bans')
        .delete()
        .eq('user_id', user.id);

      if (error) throw error;
      
      await supabase.rpc('log_admin_action', {
        action_type: 'unban_user',
        details: { 
          user_id: user.id,
          email: user.email,
          unbanned_at: new Date().toISOString() 
        }
      });

      toast({
        title: "Usuário desbanido com sucesso",
        description: `O usuário ${user.email} foi desbanido`,
      });
      
      fetchUsers(currentPage);
      
    } catch (error: any) {
      console.error("Erro ao desbanir usuário:", error);
      toast({
        title: "Erro ao desbanir usuário",
        description: error?.message || "Não foi possível desbanir o usuário",
        variant: "destructive",
      });
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-bold">Gerenciamento de Usuários</h2>
        <Dialog open={isNewUserDialogOpen} onOpenChange={setIsNewUserDialogOpen}>
          <DialogTrigger asChild>
            <Button className="flex items-center gap-1">
              <UserPlus size={16} />
              <span>Novo Usuário</span>
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Cadastrar Novo Usuário</DialogTitle>
              <DialogDescription>
                Preencha os campos abaixo para criar um novo usuário no sistema.
              </DialogDescription>
            </DialogHeader>
            <Form {...newUserForm}>
              <form onSubmit={newUserForm.handleSubmit(handleCreateUser)} className="space-y-4">
                <FormField
                  control={newUserForm.control}
                  name="email"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Email</FormLabel>
                      <FormControl>
                        <Input placeholder="usuario@exemplo.com" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={newUserForm.control}
                  name="password"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Senha</FormLabel>
                      <FormControl>
                        <Input type="password" placeholder="******" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={newUserForm.control}
                  name="full_name"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Nome Completo</FormLabel>
                      <FormControl>
                        <Input placeholder="Nome do usuário" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <DialogFooter>
                  <Button type="submit">Cadastrar</Button>
                </DialogFooter>
              </form>
            </Form>
          </DialogContent>
        </Dialog>
      </div>

      <div className="flex items-center space-x-2">
        <div className="relative flex-1">
          <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Buscar usuário por nome ou email..."
            className="pl-8"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
      </div>

      <div className="border rounded-lg overflow-hidden">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Nome / Email</TableHead>
              <TableHead>Data de Criação</TableHead>
              <TableHead>Última Atividade</TableHead>
              <TableHead>Pontos</TableHead>
              <TableHead className="text-right">Ações</TableHead>
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
            ) : filteredUsers.length === 0 ? (
              <TableRow>
                <TableCell colSpan={5} className="h-24 text-center text-muted-foreground">
                  Nenhum usuário encontrado
                </TableCell>
              </TableRow>
            ) : (
              filteredUsers.map(user => (
                <TableRow key={user.id} className={user.banned ? "bg-red-50" : ""}>
                  <TableCell>
                    <div className="font-medium">{user.full_name || "Sem nome"}</div>
                    <div className="text-sm text-muted-foreground">{user.email}</div>
                    {user.banned && (
                      <span className="inline-flex items-center rounded-md bg-red-50 px-2 py-1 text-xs font-medium text-red-700 ring-1 ring-inset ring-red-600/10">
                        Banido
                      </span>
                    )}
                  </TableCell>
                  <TableCell>
                    {user.created_at ? format(new Date(user.created_at), 'dd/MM/yyyy') : 'N/A'}
                  </TableCell>
                  <TableCell>
                    {user.last_active ? format(new Date(user.last_active), 'dd/MM/yyyy HH:mm') : 'N/A'}
                  </TableCell>
                  <TableCell>{user.points}</TableCell>
                  <TableCell className="text-right">
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button variant="ghost" size="sm">
                          <MoreVertical size={16} />
                          <span className="sr-only">Abrir menu</span>
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end">
                        <DropdownMenuLabel>Ações</DropdownMenuLabel>
                        <DropdownMenuSeparator />
                        <DropdownMenuItem
                          onClick={() => {
                            setSelectedUser(user);
                            setIsMessageDialogOpen(true);
                          }}
                          className="flex items-center gap-2 cursor-pointer"
                        >
                          <MailOpen size={16} />
                          <span>Enviar Mensagem</span>
                        </DropdownMenuItem>
                        {user.banned ? (
                          <DropdownMenuItem
                            onClick={() => handleUnbanUser(user)}
                            className="flex items-center gap-2 cursor-pointer"
                          >
                            <UserCheck size={16} />
                            <span>Desbanir</span>
                          </DropdownMenuItem>
                        ) : (
                          <DropdownMenuItem
                            onClick={() => {
                              setSelectedUser(user);
                              setIsBanDialogOpen(true);
                            }}
                            className="flex items-center gap-2 cursor-pointer text-amber-600"
                          >
                            <Ban size={16} />
                            <span>Banir</span>
                          </DropdownMenuItem>
                        )}
                        <DropdownMenuItem
                          onClick={() => {
                            setSelectedUser(user);
                            setIsDeleteDialogOpen(true);
                          }}
                          className="flex items-center gap-2 cursor-pointer text-destructive"
                        >
                          <Trash2 size={16} />
                          <span>Excluir</span>
                        </DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </div>

      {totalPages > 1 && (
        <Pagination className="mt-4">
          <PaginationContent>
            <PaginationItem>
              <PaginationPrevious 
                href="#"
                onClick={(e) => {
                  e.preventDefault();
                  if (currentPage > 1) {
                    handlePageChange(currentPage - 1);
                  }
                }}
                className={currentPage === 1 ? "pointer-events-none opacity-50" : ""}
              />
            </PaginationItem>
            {Array.from({ length: totalPages }, (_, i) => i + 1).map((page) => (
              <PaginationItem key={page}>
                <PaginationLink
                  href="#"
                  onClick={(e) => {
                    e.preventDefault();
                    handlePageChange(page);
                  }}
                  isActive={page === currentPage}
                >
                  {page}
                </PaginationLink>
              </PaginationItem>
            ))}
            <PaginationItem>
              <PaginationNext
                href="#"
                onClick={(e) => {
                  e.preventDefault();
                  if (currentPage < totalPages) {
                    handlePageChange(currentPage + 1);
                  }
                }}
                className={currentPage === totalPages ? "pointer-events-none opacity-50" : ""}
              />
            </PaginationItem>
          </PaginationContent>
        </Pagination>
      )}

      <Dialog open={isDeleteDialogOpen} onOpenChange={setIsDeleteDialogOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <AlertCircle className="h-5 w-5 text-destructive" />
              <span>Excluir Usuário</span>
            </DialogTitle>
            <DialogDescription>
              Tem certeza de que deseja excluir o usuário <strong>{selectedUser?.email}</strong>? Esta ação é irreversível.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsDeleteDialogOpen(false)}>
              Cancelar
            </Button>
            <Button variant="destructive" onClick={handleDeleteUser}>
              Excluir
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <Dialog open={isBanDialogOpen} onOpenChange={setIsBanDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Banir Usuário</DialogTitle>
            <DialogDescription>
              Você está banindo o usuário <strong>{selectedUser?.email}</strong>. Defina a duração e o motivo.
            </DialogDescription>
          </DialogHeader>
          <Form {...banUserForm}>
            <form onSubmit={banUserForm.handleSubmit(handleBanUser)} className="space-y-4">
              <FormField
                control={banUserForm.control}
                name="duration"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Duração</FormLabel>
                    <FormControl>
                      <select
                        className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                        {...field}
                      >
                        <option value="1d">1 dia</option>
                        <option value="7d">7 dias</option>
                        <option value="30d">30 dias</option>
                        <option value="permanent">Permanente</option>
                      </select>
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={banUserForm.control}
                name="reason"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Motivo</FormLabel>
                    <FormControl>
                      <Textarea 
                        placeholder="Descreva o motivo do banimento..."
                        {...field}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <DialogFooter>
                <Button type="submit" variant="destructive">Banir Usuário</Button>
              </DialogFooter>
            </form>
          </Form>
        </DialogContent>
      </Dialog>

      <Dialog open={isMessageDialogOpen} onOpenChange={setIsMessageDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Enviar Mensagem</DialogTitle>
            <DialogDescription>
              Envie uma mensagem privada para <strong>{selectedUser?.email}</strong>.
            </DialogDescription>
          </DialogHeader>
          <Form {...messageForm}>
            <form onSubmit={messageForm.handleSubmit(handleSendMessage)} className="space-y-4">
              <FormField
                control={messageForm.control}
                name="content"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Mensagem</FormLabel>
                    <FormControl>
                      <Textarea 
                        placeholder="Digite sua mensagem..."
                        className="min-h-[100px]"
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
  );
};

export default UserManagement;
