
import React from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { useRankings } from "@/hooks/useRankings";
import {
  Sidebar,
  SidebarContent,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
} from "@/components/ui/sidebar";
import { MessageSquare, TrendingUp, Users } from "lucide-react";

export function CommunitySidebar() {
  const navigate = useNavigate();
  const location = useLocation();
  const { data: rankings } = useRankings();

  const topUsers = rankings?.slice(0, 5) || [];

  return (
    <Sidebar>
      <SidebarHeader className="p-4">
        <h2 className="text-lg font-semibold text-primary-300">Comunidade</h2>
      </SidebarHeader>
      <SidebarContent>
        <SidebarGroup>
          <SidebarGroupLabel>Navegação</SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu>
              <SidebarMenuItem>
                <SidebarMenuButton asChild>
                  <button onClick={() => navigate("/comunidade")}>
                    <MessageSquare />
                    <span>Feed</span>
                  </button>
                </SidebarMenuButton>
              </SidebarMenuItem>
              <SidebarMenuItem>
                <SidebarMenuButton asChild>
                  <button onClick={() => navigate("/comunidade?tab=ranking")}>
                    <TrendingUp />
                    <span>Ranking & Métricas</span>
                  </button>
                </SidebarMenuButton>
              </SidebarMenuItem>
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>

        <SidebarGroup>
          <SidebarGroupLabel>Top Usuários</SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu>
              {topUsers.map((user, index) => (
                <SidebarMenuItem key={user.id}>
                  <SidebarMenuButton className="justify-between">
                    <div className="flex items-center gap-2">
                      <Users className="h-4 w-4" />
                      <span>{user.full_name}</span>
                    </div>
                    <span className="text-xs text-primary-300">{user.total_points}pts</span>
                  </SidebarMenuButton>
                </SidebarMenuItem>
              ))}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>
      </SidebarContent>
    </Sidebar>
  );
}
