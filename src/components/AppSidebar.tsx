import {
  LayoutDashboard,
  Package,
  Users,
  FileText,
  LogOut,
  Search,
  PlusCircle,
  History,
  Building2,
} from 'lucide-react';
import { NavLink } from '@/components/NavLink';
import { useAuth } from '@/lib/auth-context';
import {
  Sidebar,
  SidebarContent,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarFooter,
  useSidebar,
} from '@/components/ui/sidebar';
import { Button } from '@/components/ui/button';

const adminItems = [
  { title: 'Dashboard', url: '/admin', icon: LayoutDashboard },
  { title: 'Semua Order', url: '/admin/orders', icon: Package },
  { title: 'Kelola Mitra', url: '/admin/mitra', icon: Building2 },
  { title: 'Laporan', url: '/admin/reports', icon: FileText },
];

const mitraItems = [
  { title: 'Dashboard', url: '/mitra', icon: LayoutDashboard },
  { title: 'Order Baru', url: '/mitra/new-order', icon: PlusCircle },
  { title: 'Riwayat Order', url: '/mitra/orders', icon: History },
];

export function AppSidebar() {
  const { user, logout } = useAuth();
  const { state } = useSidebar();
  const collapsed = state === 'collapsed';
  const items = user?.role === 'admin' ? adminItems : mitraItems;

  return (
    <Sidebar collapsible="icon" className="border-r-0">
      <SidebarContent className="bg-sidebar">
        <SidebarGroup>
          <SidebarGroupLabel className="text-sidebar-foreground/60 px-4 pt-6 pb-2">
            {!collapsed && (
              <div className="flex items-center gap-2">
                <div className="h-8 w-8 rounded-lg bg-sidebar-primary flex items-center justify-center">
                  <span className="text-sidebar-primary-foreground font-bold text-sm">LC</span>
                </div>
                <div>
                  <p className="text-sidebar-foreground font-semibold text-sm">LaundryCenter</p>
                  <p className="text-sidebar-foreground/50 text-xs capitalize">{user?.role}</p>
                </div>
              </div>
            )}
          </SidebarGroupLabel>
          <SidebarGroupContent className="mt-4">
            <SidebarMenu>
              {items.map((item) => (
                <SidebarMenuItem key={item.title}>
                  <SidebarMenuButton asChild>
                    <NavLink
                      to={item.url}
                      end={item.url === '/admin' || item.url === '/mitra'}
                      className="text-sidebar-foreground/70 hover:bg-sidebar-accent hover:text-sidebar-accent-foreground transition-colors rounded-lg px-3 py-2.5"
                      activeClassName="bg-sidebar-primary text-sidebar-primary-foreground hover:bg-sidebar-primary hover:text-sidebar-primary-foreground"
                    >
                      <item.icon className="mr-3 h-4 w-4" />
                      {!collapsed && <span className="text-sm font-medium">{item.title}</span>}
                    </NavLink>
                  </SidebarMenuButton>
                </SidebarMenuItem>
              ))}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>
      </SidebarContent>
      <SidebarFooter className="bg-sidebar p-3">
        {!collapsed && (
          <div className="px-2 pb-2">
            <p className="text-sidebar-foreground text-sm font-medium truncate">{user?.nama}</p>
            <p className="text-sidebar-foreground/50 text-xs truncate">{user?.email}</p>
          </div>
        )}
        <Button
          variant="ghost"
          className="w-full justify-start text-sidebar-foreground/60 hover:text-destructive hover:bg-destructive/10"
          onClick={logout}
        >
          <LogOut className="mr-2 h-4 w-4" />
          {!collapsed && 'Keluar'}
        </Button>
      </SidebarFooter>
    </Sidebar>
  );
}
