import { useState } from 'react';
import { Outlet } from 'react-router-dom';
import { Menu } from 'lucide-react';
import { ShellSidebar } from '@/components/shell/ShellSidebar';
import { TenantPicker } from '@/components/shell/TenantPicker';
import { Button } from '@/components/ui/button';
import { Sheet, SheetContent, SheetTitle } from '@/components/ui/sheet';
import { useAuth } from '@/contexts/AuthContext';
import { useTenant } from '@/contexts/TenantContext';

export default function DashboardLayout() {
  const { user } = useAuth();
  const { activeTenant } = useTenant();
  const [mobileNavOpen, setMobileNavOpen] = useState(false);

  return (
    <div className="flex h-[100dvh] overflow-hidden bg-gray-50">
      {/* Desktop sidebar */}
      <div className="hidden h-full shrink-0 lg:block">
        <ShellSidebar />
      </div>

      {/* Mobile sidebar drawer */}
      <Sheet open={mobileNavOpen} onOpenChange={setMobileNavOpen}>
        <SheetContent side="left" className="border-0 bg-transparent p-0 shadow-none">
          <SheetTitle className="sr-only">Navigation</SheetTitle>
          <ShellSidebar
            className="h-full w-full max-w-[18rem] border-0"
            onNavigate={() => setMobileNavOpen(false)}
          />
        </SheetContent>
      </Sheet>

      <div className="flex min-h-0 min-w-0 flex-1 flex-col">
        <header className="flex shrink-0 flex-wrap items-center gap-3 border-b bg-white px-3 py-3 sm:px-4 sm:py-4 lg:px-6">
          <div className="flex min-w-0 flex-1 items-center gap-2 sm:gap-3">
            <Button
              type="button"
              variant="outline"
              size="sm"
              className="shrink-0 lg:hidden"
              onClick={() => setMobileNavOpen(true)}
              aria-label="Open navigation menu"
            >
              <Menu className="h-5 w-5" />
            </Button>
            <div className="min-w-0">
              <h1 className="truncate text-base font-semibold text-[#12233D] sm:text-lg">
                CAM Dashboard
              </h1>
              <p className="truncate text-xs text-muted-foreground sm:text-sm">
                {activeTenant?.name ?? 'Select an organization to manage cricket data'}
              </p>
            </div>
          </div>

          <div className="flex w-full min-w-0 items-center justify-between gap-3 sm:w-auto sm:justify-end">
            <TenantPicker />
            <div className="hidden min-w-0 text-right text-sm md:block">
              <p className="truncate font-medium text-[#12233D]">{user?.full_name}</p>
              <p className="truncate text-muted-foreground">{user?.email}</p>
            </div>
          </div>
        </header>

        <main className="min-h-0 min-w-0 flex-1 overflow-y-auto overflow-x-hidden p-3 sm:p-4 lg:p-6">
          <div className="mx-auto w-full max-w-[1600px]">
            <Outlet />
          </div>
        </main>
      </div>
    </div>
  );
}
