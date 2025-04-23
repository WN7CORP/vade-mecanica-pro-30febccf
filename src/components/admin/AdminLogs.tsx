
import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "@/components/ui/use-toast";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Pagination,
  PaginationContent,
  PaginationItem,
  PaginationNext,
  PaginationPrevious,
} from "@/components/ui/pagination";
import { Search, RefreshCw, FileText, Info } from "lucide-react";
import { format } from "date-fns";

import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";

interface AdminLog {
  id: string;
  admin_id: string;
  admin_name: string;
  action_type: string;
  details: any;
  created_at: string;
}

const AdminLogs = () => {
  const [logs, setLogs] = useState<AdminLog[]>([]);
  const [filteredLogs, setFilteredLogs] = useState<AdminLog[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [searchTerm, setSearchTerm] = useState<string>("");
  const [currentPage, setCurrentPage] = useState<number>(1);
  const [totalPages, setTotalPages] = useState<number>(1);
  const [selectedLog, setSelectedLog] = useState<AdminLog | null>(null);
  const [isDetailsDialogOpen, setIsDetailsDialogOpen] = useState<boolean>(false);
  
  const ITEMS_PER_PAGE = 10;

  const fetchLogs = async (page: number = 1) => {
    setIsLoading(true);
    
    try {
      // Buscar logs com paginação
      const from = (page - 1) * ITEMS_PER_PAGE;
      const to = from + ITEMS_PER_PAGE - 1;
      
      const { data, error, count } = await supabase
        .from('admin_logs')
        .select('*', { count: 'exact' })
        .order('created_at', { ascending: false })
        .range(from, to);
      
      if (error) throw error;
      
      // Buscar informações dos administradores
      const adminIds = data?.map(log => log.admin_id).filter(Boolean) as string[];
      const uniqueAdminIds = [...new Set(adminIds)];
      
      const { data: adminData, error: adminError } = await supabase
        .from('admin_users')
        .select('id, email')
        .in('id', uniqueAdminIds);
      
      if (adminError) throw adminError;
      
      // Mapear IDs para nomes de admin
      const adminMap = new Map();
      adminData?.forEach(admin => {
        adminMap.set(admin.id, admin.email || 'Admin não identificado');
      });
      
      // Combinar os dados
      const formattedLogs = data?.map(log => ({
        id: log.id,
        admin_id: log.admin_id,
        admin_name: adminMap.get(log.admin_id) || 'Admin não identificado',
        action_type: log.action_type,
        details: log.details,
        created_at: log.created_at,
      }));
      
      setLogs(formattedLogs || []);
      setFilteredLogs(formattedLogs || []);
      
      // Calcular total de páginas
      if (count !== null) {
        setTotalPages(Math.ceil(count / ITEMS_PER_PAGE));
      }
      
    } catch (error) {
      console.error("Erro ao buscar logs:", error);
      toast({
        title: "Erro",
        description: "Não foi possível carregar os logs administrativos",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  // Carregar logs iniciais
  useEffect(() => {
    fetchLogs();
  }, []);

  // Filtrar logs quando o termo de busca é alterado
  useEffect(() => {
    if (searchTerm) {
      const filtered = logs.filter(
        log =>
          log.admin_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
          log.action_type.toLowerCase().includes(searchTerm.toLowerCase())
      );
      setFilteredLogs(filtered);
    } else {
      setFilteredLogs(logs);
    }
  }, [searchTerm, logs]);

  // Mudar de página
  const handlePageChange = (page: number) => {
    setCurrentPage(page);
    fetchLogs(page);
  };

  // Formatação do tipo de ação
  const formatActionType = (actionType: string) => {
    return actionType
      .split('_')
      .map(word => word.charAt(0).toUpperCase() + word.slice(1))
      .join(' ');
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-bold">Logs de Atividades</h2>
        <Button 
          variant="outline" 
          size="sm" 
          onClick={() => fetchLogs(currentPage)} 
          disabled={isLoading}
          className="flex items-center gap-1"
        >
          <RefreshCw size={16} className={isLoading ? "animate-spin" : ""} />
          <span>Atualizar</span>
        </Button>
      </div>

      {/* Busca */}
      <div className="flex items-center space-x-2">
        <div className="relative flex-1">
          <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Buscar por admin ou tipo de ação..."
            className="pl-8"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
      </div>

      {/* Tabela de logs */}
      <div className="border rounded-lg overflow-hidden">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Admin</TableHead>
              <TableHead>Tipo de Ação</TableHead>
              <TableHead>Data/Hora</TableHead>
              <TableHead className="text-right">Detalhes</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {isLoading ? (
              <TableRow>
                <TableCell colSpan={4} className="h-24 text-center">
                  <div className="flex justify-center items-center h-full">
                    <div className="animate-spin h-6 w-6 border-4 border-primary border-t-transparent rounded-full"></div>
                  </div>
                </TableCell>
              </TableRow>
            ) : filteredLogs.length === 0 ? (
              <TableRow>
                <TableCell colSpan={4} className="h-24 text-center text-muted-foreground">
                  <div className="flex justify-center">
                    <div className="flex flex-col items-center">
                      <FileText className="h-8 w-8 mb-2" />
                      <span>Nenhum log encontrado</span>
                    </div>
                  </div>
                </TableCell>
              </TableRow>
            ) : (
              filteredLogs.map(log => (
                <TableRow key={log.id}>
                  <TableCell>{log.admin_name}</TableCell>
                  <TableCell>
                    <span className="font-medium">
                      {formatActionType(log.action_type)}
                    </span>
                  </TableCell>
                  <TableCell>
                    {format(new Date(log.created_at), 'dd/MM/yyyy HH:mm:ss')}
                  </TableCell>
                  <TableCell className="text-right">
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => {
                        setSelectedLog(log);
                        setIsDetailsDialogOpen(true);
                      }}
                      className="flex items-center gap-1"
                    >
                      <Info size={16} />
                      <span>Detalhes</span>
                    </Button>
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </div>

      {/* Paginação */}
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
                <Button
                  variant={page === currentPage ? "default" : "outline"}
                  size="sm"
                  onClick={() => handlePageChange(page)}
                  className="w-8 h-8 p-0"
                >
                  {page}
                </Button>
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

      {/* Diálogo de detalhes do log */}
      {selectedLog && (
        <Dialog open={isDetailsDialogOpen} onOpenChange={setIsDetailsDialogOpen}>
          <DialogContent className="sm:max-w-md">
            <DialogHeader>
              <DialogTitle>Detalhes do Log</DialogTitle>
              <DialogDescription>
                {format(new Date(selectedLog.created_at), 'dd/MM/yyyy HH:mm:ss')}
              </DialogDescription>
            </DialogHeader>
            
            <div className="space-y-4 my-2">
              <div>
                <p className="text-sm font-medium">Admin:</p>
                <p>{selectedLog.admin_name}</p>
              </div>
              
              <div>
                <p className="text-sm font-medium">Tipo de Ação:</p>
                <p>{formatActionType(selectedLog.action_type)}</p>
              </div>
              
              <div>
                <p className="text-sm font-medium">Detalhes:</p>
                <div className="bg-muted/50 rounded-md p-3 overflow-auto max-h-60">
                  <pre className="text-xs whitespace-pre-wrap">
                    {JSON.stringify(selectedLog.details, null, 2)}
                  </pre>
                </div>
              </div>
            </div>
          </DialogContent>
        </Dialog>
      )}
    </div>
  );
};

export default AdminLogs;
