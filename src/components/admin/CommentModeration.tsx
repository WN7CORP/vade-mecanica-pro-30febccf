
import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "@/components/ui/use-toast";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  AlertTriangle,
  CheckCircle2,
  XCircle,
  Flag,
  RefreshCw,
  MessageSquare,
} from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { format } from "date-fns";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

interface CommentReport {
  id: string;
  comment_id: string;
  comment_content: string;
  comment_author: string;
  author_id: string;
  post_content: string;
  post_id: string;
  reporter_id: string;
  reporter_name: string;
  reason: string;
  status: "pending" | "resolved" | "approved";
  reported_at: string;
}

const CommentModeration = () => {
  const [reports, setReports] = useState<CommentReport[]>([]);
  const [filteredReports, setFilteredReports] = useState<CommentReport[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [selectedReport, setSelectedReport] = useState<CommentReport | null>(null);
  const [isDetailsDialogOpen, setIsDetailsDialogOpen] = useState<boolean>(false);
  const [activeTab, setActiveTab] = useState<string>("pending");

  const fetchReports = async () => {
    setIsLoading(true);
    
    try {
      // Modificação para buscar comentários e posts em queries separadas para evitar erro de relação
      // Buscar denúncias primeiro
      const { data: reportData, error: reportError } = await supabase
        .from('comment_reports')
        .select(`
          id,
          comment_id,
          reason,
          status,
          reported_at,
          reporter_id
        `)
        .order('reported_at', { ascending: false });
      
      if (reportError) throw reportError;
      
      if (!reportData || reportData.length === 0) {
        setReports([]);
        setFilteredReports([]);
        return;
      }
      
      // Buscar comentários relacionados
      const commentIds = reportData.map(report => report.comment_id).filter(Boolean);
      
      const { data: commentData, error: commentError } = await supabase
        .from('community_comments')
        .select('id, content, author_id, post_id')
        .in('id', commentIds);
      
      if (commentError) throw commentError;
      
      // Mapear comentários por ID para fácil acesso
      const commentMap = new Map();
      commentData?.forEach(comment => {
        commentMap.set(comment.id, comment);
      });
      
      // Buscar posts relacionados aos comentários
      const postIds = commentData?.map(comment => comment.post_id).filter(Boolean) || [];
      
      const { data: postData, error: postError } = await supabase
        .from('community_posts')
        .select('id, content')
        .in('id', postIds);
      
      if (postError) throw postError;
      
      // Mapear posts por ID
      const postMap = new Map();
      postData?.forEach(post => {
        postMap.set(post.id, post);
      });
      
      // Buscar informações de usuários
      const userIds = [
        ...reportData.map(report => report.reporter_id),
        ...(commentData?.map(comment => comment.author_id) || [])
      ].filter(Boolean);
      
      const uniqueUserIds = [...new Set(userIds)] as string[];
      
      const { data: userData, error: userError } = await supabase
        .from('user_profiles')
        .select('id, full_name')
        .in('id', uniqueUserIds);
      
      if (userError) throw userError;
      
      const userMap = new Map();
      userData?.forEach(user => {
        userMap.set(user.id, user.full_name || 'Usuário desconhecido');
      });
      
      // Combinar os dados
      const formattedReports = reportData.map(report => {
        const comment = commentMap.get(report.comment_id);
        const post = comment ? postMap.get(comment.post_id) : null;
        
        return {
          id: report.id,
          comment_id: report.comment_id,
          comment_content: comment?.content || 'Comentário excluído',
          comment_author: userMap.get(comment?.author_id) || 'Usuário desconhecido',
          author_id: comment?.author_id || '',
          post_content: post?.content || 'Post não encontrado',
          post_id: comment?.post_id || '',
          reporter_id: report.reporter_id || '',
          reporter_name: userMap.get(report.reporter_id) || 'Usuário desconhecido',
          reason: report.reason,
          status: report.status as "pending" | "resolved" | "approved",
          reported_at: report.reported_at,
        };
      });
      
      setReports(formattedReports || []);
      filterReports(formattedReports || [], activeTab);
      
      // Log da ação
      await supabase.rpc('log_admin_action', {
        action_type: 'view_comment_reports',
        details: { timestamp: new Date().toISOString() }
      });
      
    } catch (error) {
      console.error("Erro ao buscar denúncias:", error);
      toast({
        title: "Erro",
        description: "Não foi possível carregar as denúncias de comentários",
        variant: "destructive",
      });
      setReports([]);
      setFilteredReports([]);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchReports();
  }, []);

  // Filtrar por status
  const filterReports = (reports: CommentReport[], status: string) => {
    if (status === 'all') {
      setFilteredReports(reports);
    } else {
      setFilteredReports(reports.filter(report => report.status === status));
    }
  };

  // Aprovar comentário (rejeitar a denúncia)
  const handleApproveComment = async () => {
    if (!selectedReport) return;
    
    try {
      const { error } = await supabase
        .from('comment_reports')
        .update({ 
          status: 'approved',
          resolved_at: new Date().toISOString(),
          resolved_by: (await supabase.auth.getSession()).data.session?.user.id
        })
        .eq('id', selectedReport.id);

      if (error) throw error;
      
      // Log da ação
      await supabase.rpc('log_admin_action', {
        action_type: 'approve_comment',
        details: { 
          report_id: selectedReport.id,
          comment_id: selectedReport.comment_id,
          timestamp: new Date().toISOString() 
        }
      });

      toast({
        title: "Comentário aprovado",
        description: "A denúncia foi marcada como aprovada",
      });
      
      // Fechar diálogo e atualizar lista
      setIsDetailsDialogOpen(false);
      await fetchReports();
      
    } catch (error) {
      console.error("Erro ao aprovar comentário:", error);
      toast({
        title: "Erro",
        description: "Não foi possível aprovar o comentário",
        variant: "destructive",
      });
    }
  };

  // Remover comentário (resolver a denúncia)
  const handleRemoveComment = async () => {
    if (!selectedReport) return;
    
    try {
      // Primeiro, remove o comentário
      const { error: deleteError } = await supabase
        .from('community_comments')
        .delete()
        .eq('id', selectedReport.comment_id);

      if (deleteError) throw deleteError;
      
      // Depois, marca a denúncia como resolvida
      const { error: updateError } = await supabase
        .from('comment_reports')
        .update({ 
          status: 'resolved',
          resolved_at: new Date().toISOString(),
          resolved_by: (await supabase.auth.getSession()).data.session?.user.id
        })
        .eq('id', selectedReport.id);

      if (updateError) throw updateError;
      
      // Log da ação
      await supabase.rpc('log_admin_action', {
        action_type: 'remove_comment',
        details: { 
          report_id: selectedReport.id,
          comment_id: selectedReport.comment_id,
          timestamp: new Date().toISOString() 
        }
      });

      toast({
        title: "Comentário removido",
        description: "O comentário foi removido e a denúncia resolvida",
      });
      
      // Fechar diálogo e atualizar lista
      setIsDetailsDialogOpen(false);
      await fetchReports();
      
    } catch (error) {
      console.error("Erro ao remover comentário:", error);
      toast({
        title: "Erro",
        description: "Não foi possível remover o comentário",
        variant: "destructive",
      });
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-bold">Moderação de Comentários</h2>
        <Button 
          variant="outline" 
          size="sm" 
          onClick={fetchReports} 
          disabled={isLoading}
          className="flex items-center gap-1"
        >
          <RefreshCw size={16} className={isLoading ? "animate-spin" : ""} />
          <span>Atualizar</span>
        </Button>
      </div>
      
      {/* Tabs para filtrar por status */}
      <Tabs 
        value={activeTab} 
        onValueChange={(v) => {
          setActiveTab(v);
          filterReports(reports, v);
        }}
      >
        <TabsList>
          <TabsTrigger value="pending" className="flex items-center gap-1">
            <AlertTriangle size={14} />
            <span>Pendentes</span>
            <Badge variant="secondary" className="ml-1">
              {reports.filter(r => r.status === 'pending').length}
            </Badge>
          </TabsTrigger>
          <TabsTrigger value="approved" className="flex items-center gap-1">
            <CheckCircle2 size={14} />
            <span>Aprovados</span>
          </TabsTrigger>
          <TabsTrigger value="resolved" className="flex items-center gap-1">
            <XCircle size={14} />
            <span>Removidos</span>
          </TabsTrigger>
          <TabsTrigger value="all">Todos</TabsTrigger>
        </TabsList>
      </Tabs>
      
      {/* Lista de denúncias */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {isLoading ? (
          // Placeholder de carregamento
          Array.from({ length: 3 }).map((_, i) => (
            <Card key={i} className="animate-pulse">
              <CardHeader>
                <div className="h-5 w-3/4 bg-muted rounded"></div>
                <div className="h-4 w-1/2 bg-muted rounded"></div>
              </CardHeader>
              <CardContent>
                <div className="h-16 bg-muted rounded"></div>
              </CardContent>
              <CardFooter>
                <div className="h-9 w-full bg-muted rounded"></div>
              </CardFooter>
            </Card>
          ))
        ) : filteredReports.length === 0 ? (
          <div className="col-span-full flex flex-col items-center justify-center py-12 text-muted-foreground">
            <Flag size={40} className="mb-4" />
            <p>Nenhuma denúncia {activeTab !== 'all' && activeTab === 'pending' ? 'pendente' : (activeTab === 'approved' ? 'aprovada' : 'resolvida')} encontrada</p>
          </div>
        ) : (
          filteredReports.map(report => (
            <Card key={report.id} className="overflow-hidden">
              <CardHeader className={`pb-2 ${report.status === 'pending' ? 'bg-amber-50' : (report.status === 'approved' ? 'bg-green-50' : 'bg-red-50')}`}>
                <div className="flex justify-between items-start">
                  <CardTitle className="text-base">
                    <span className="flex items-center gap-1">
                      <MessageSquare size={16} />
                      <span>Denúncia de Comentário</span>
                    </span>
                  </CardTitle>
                  <Badge variant={
                    report.status === 'pending' ? 'outline' :
                    report.status === 'approved' ? 'secondary' : 'destructive'
                  }>
                    {report.status === 'pending' ? 'Pendente' :
                     report.status === 'approved' ? 'Aprovado' : 'Removido'}
                  </Badge>
                </div>
                <CardDescription>
                  Denunciado por {report.reporter_name} em {format(new Date(report.reported_at), 'dd/MM/yyyy HH:mm')}
                </CardDescription>
              </CardHeader>
              <CardContent className="py-3">
                <div className="mb-3">
                  <p className="font-medium text-sm">Motivo da denúncia:</p>
                  <p className="text-muted-foreground">{report.reason}</p>
                </div>
                <div>
                  <p className="font-medium text-sm">Comentário:</p>
                  <p className="line-clamp-2">{report.comment_content}</p>
                </div>
              </CardContent>
              <CardFooter className="pt-0">
                <Button 
                  variant="default" 
                  size="sm" 
                  className="w-full"
                  onClick={() => {
                    setSelectedReport(report);
                    setIsDetailsDialogOpen(true);
                  }}
                >
                  Ver Detalhes
                </Button>
              </CardFooter>
            </Card>
          ))
        )}
      </div>

      {/* Diálogo de detalhes da denúncia */}
      {selectedReport && (
        <Dialog open={isDetailsDialogOpen} onOpenChange={setIsDetailsDialogOpen}>
          <DialogContent className="sm:max-w-md">
            <DialogHeader>
              <DialogTitle>Detalhes da Denúncia</DialogTitle>
              <DialogDescription>
                Analisar comentário e tomar uma decisão
              </DialogDescription>
            </DialogHeader>
            
            <div className="space-y-4 my-2">
              <div>
                <p className="text-sm font-medium">Status:</p>
                <Badge variant={
                  selectedReport.status === 'pending' ? 'outline' :
                  selectedReport.status === 'approved' ? 'secondary' : 'destructive'
                }>
                  {selectedReport.status === 'pending' ? 'Pendente' :
                   selectedReport.status === 'approved' ? 'Aprovado' : 'Removido'}
                </Badge>
              </div>
              
              <div>
                <p className="text-sm font-medium">Denunciado por:</p>
                <p>{selectedReport.reporter_name}</p>
              </div>
              
              <div>
                <p className="text-sm font-medium">Data da denúncia:</p>
                <p>{format(new Date(selectedReport.reported_at), 'dd/MM/yyyy HH:mm')}</p>
              </div>
              
              <div>
                <p className="text-sm font-medium">Motivo:</p>
                <p>{selectedReport.reason}</p>
              </div>
              
              <div>
                <p className="text-sm font-medium">Autor do comentário:</p>
                <p>{selectedReport.comment_author}</p>
              </div>
              
              <div className="border rounded-md p-3 bg-muted/30">
                <p className="text-sm font-medium mb-1">Comentário:</p>
                <p>{selectedReport.comment_content}</p>
              </div>
              
              <div>
                <p className="text-sm font-medium mb-1">Contexto (Post):</p>
                <p className="text-sm text-muted-foreground line-clamp-3">{selectedReport.post_content}</p>
              </div>
            </div>
            
            {selectedReport.status === 'pending' && (
              <DialogFooter className="gap-2 sm:gap-0">
                <Button
                  variant="secondary"
                  onClick={handleApproveComment}
                  className="flex items-center gap-2"
                >
                  <CheckCircle2 size={16} />
                  <span>Aprovar Comentário</span>
                </Button>
                <Button
                  variant="destructive"
                  onClick={handleRemoveComment}
                  className="flex items-center gap-2"
                >
                  <XCircle size={16} />
                  <span>Remover Comentário</span>
                </Button>
              </DialogFooter>
            )}
          </DialogContent>
        </Dialog>
      )}
    </div>
  );
};

export default CommentModeration;
