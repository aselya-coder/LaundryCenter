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
  WashingMachine,
  ChevronLeft,
  Settings,
  HelpCircle,
} from 'lucide-react';
import { NavLink } from 'react-router-dom';
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
  SidebarHeader,
} from '@/components/ui/sidebar';
import { Button } from '@/components/ui/button';
import { Separator } from '@/components/ui/separator';

const adminItems = [
  { title: 'Dashboard', url: '/admin', icon: LayoutDashboard },
  { title: 'Semua Order', url: '/admin/orders', icon: Package },
  { title: 'Kelola Mitra', url: '/admin/mitra', icon: Building2 },
  { title: 'Laporan Keuangan', url: '/admin/reports', icon: FileText },
];

const mitraItems = [
  { title: 'Dashboard', url: '/mitra', icon: LayoutDashboard },
  { title: 'Input Order Baru', url: '/mitra/new-order', icon: PlusCircle },
  { title: 'Riwayat Order', url: '/mitra/orders', icon: History },
];

export function AppSidebar() {
  const { user, logout, mitra } = useAuth();
  const { state, toggleSidebar } = useSidebar();
  const isCollapsed = state === 'collapsed';
  const items = user?.role === 'admin' ? adminItems : mitraItems;

  return (
    <Sidebar collapsible="icon" className="border-r border-slate-200 bg-white">
      <SidebarHeader className="p-4 flex flex-row items-center justify-between">
        <div className={`flex items-center gap-3 transition-all duration-300 ${isCollapsed ? 'opacity-0 scale-0 w-0' : 'opacity-100 scale-100'}`}>
          <div className="h-10 w-10 rounded-xl bg-blue-600 flex items-center justify-center shadow-lg shadow-blue-200 shrink-0">
            <WashingMachine className="h-6 w-6 text-white" />
          </div>
          <div className="overflow-hidden">
            <p className="font-bold text-slate-900 leading-tight">LaundryCenter</p>
            <p className="text-[10px] font-bold uppercase tracking-widest text-blue-600">Management System</p>
          </div>
        </div>
        {isCollapsed && (
          <div className="h-10 w-10 rounded-xl bg-blue-600 flex items-center justify-center mx-auto shadow-lg shadow-blue-200">
            <WashingMachine className="h-6 w-6 text-white" />
          </div>
        )}
      </SidebarHeader>

      <SidebarContent className="px-3 pt-4">
        <SidebarGroup>
          <SidebarGroupLabel className="text-[10px] font-bold uppercase tracking-[0.2em] text-slate-400 px-3 mb-2">
            {!isCollapsed && 'Main Menu'}
          </SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu className="gap-1">
              {items.map((item) => (
                <SidebarMenuItem key={item.title}>
                  <SidebarMenuButton asChild tooltip={item.title}>
                    <NavLink
                      to={item.url}
                      className={({ isActive }) => 
                        `flex items-center gap-3 px-3 py-2.5 rounded-xl transition-all duration-200 group ${
                          isActive 
                          ? 'bg-blue-600 text-white shadow-lg shadow-blue-100' 
                          : 'text-slate-500 hover:bg-slate-50 hover:text-slate-900'
                        }`
                      }
                    >
                      <item.icon className={`h-5 w-5 shrink-0 transition-transform duration-200 group-hover:scale-110`} />
                      {!isCollapsed && <span className="font-semibold text-sm">{item.title}</span>}
                    </NavLink>
                  </SidebarMenuButton>
                </SidebarMenuItem>
              ))}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>

        <SidebarGroup className="mt-4">
          <SidebarGroupLabel className="text-[10px] font-bold uppercase tracking-[0.2em] text-slate-400 px-3 mb-2">
            {!isCollapsed && 'Lainnya'}
          </SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu className="gap-1">
              <SidebarMenuItem>
                <SidebarMenuButton asChild tooltip="Pengaturan">
                  <NavLink
                    to={user?.role === 'admin' ? '/admin/settings' : '/mitra/settings'}
                    className={({ isActive }) => 
                      `flex items-center gap-3 px-3 py-2.5 rounded-xl transition-all duration-200 group ${
                        isActive 
                        ? 'bg-blue-600 text-white shadow-lg shadow-blue-100' 
                        : 'text-slate-500 hover:bg-slate-50 hover:text-slate-900'
                      }`
                    }
                  >
                    <Settings className="h-5 w-5 shrink-0" />
                    {!isCollapsed && <span className="font-semibold text-sm">Pengaturan</span>}
                  </NavLink>
                </SidebarMenuButton>
              </SidebarMenuItem>
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>
      </SidebarContent>

      <SidebarFooter className="p-4 mt-auto">
        <div className={`p-4 rounded-2xl bg-slate-50 border border-slate-100 transition-all duration-300 ${isCollapsed ? 'p-1 bg-transparent border-transparent' : ''}`}>
          {!isCollapsed && (
            <div className="mb-4">
              <div className="flex items-center gap-3 mb-3">
                <div className="h-10 w-10 rounded-full bg-blue-100 border-2 border-white shadow-sm flex items-center justify-center font-bold text-blue-600 text-sm">
                  {user?.nama.charAt(0)}
                </div>
                <div className="overflow-hidden">
                  <p className="font-bold text-slate-900 text-sm truncate">{user?.nama}</p>
                  <p className="text-xs text-slate-400 font-medium truncate uppercase">{user?.role === 'admin' ? 'Administrator' : mitra?.nama_toko}</p>
                </div>
              </div>
              <Separator className="bg-slate-200/60" />
            </div>
          )}
          <Button
            variant="ghost"
            className={`w-full justify-start text-slate-500 hover:text-red-600 hover:bg-red-50 rounded-xl transition-colors ${isCollapsed ? 'justify-center p-0 h-10 w-10' : 'px-2 h-10'}`}
            onClick={logout}
          >
            <LogOut className={`h-5 w-5 ${isCollapsed ? '' : 'mr-3'}`} />
            {!isCollapsed && <span className="font-bold text-sm">Keluar Akun</span>}
          </Button>
        </div>
      </SidebarFooter>
    </Sidebar>
  );
}
