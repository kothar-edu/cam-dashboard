import { Outlet } from 'react-router-dom';
import { ShellSidebar } from '@/components/shell/ShellSidebar';
import { TenantPicker } from '@/components/shell/TenantPicker';
import { useAuth } from '@/contexts/AuthContext';
import { useTenant } from '@/contexts/TenantContext';

export default function DashboardLayout() {
  const { user } = useAuth();
  const { activeTenant } = useTenant();

  return (
    <div className="flex h-screen overflow-hidden bg-gray-50">
      <ShellSidebar />
      <div className="flex min-h-0 flex-1 flex-col">
        <header className="flex shrink-0 items-center justify-between border-b bg-white px-6 py-4">
          <div>
            <h1 className="text-lg font-semibold text-[#12233D]">CAM Dashboard</h1>
            <p className="text-sm text-muted-foreground">
              {activeTenant?.name ?? 'Select an organization to manage cricket data'}
            </p>
          </div>
          <div className="flex items-center gap-4">
            <TenantPicker />
            <div className="text-right text-sm">
              <p className="font-medium text-[#12233D]">{user?.full_name}</p>
              <p className="text-muted-foreground">{user?.email}</p>
            </div>
          </div>
        </header>
        <main className="min-h-0 flex-1 overflow-y-auto p-6">
          <Outlet />
        </main>
      </div>
    </div>
  );
}
