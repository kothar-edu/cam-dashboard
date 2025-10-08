import { useState } from "react";
import { DashboardHeader } from "../components/dashboard/dashboard-header";
import { UsersTable } from "../components/users/users-table";
import { UserForm } from "../components/users/user-form";
import { Button } from "../components/ui/button";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
} from "../components/ui/sheet";
import { Plus } from "lucide-react";
import { useGet } from "../hooks/useApi";

function UsersPage() {
  const [isDrawerOpen, setIsDrawerOpen] = useState(false);
  const [selectedUser, setSelectedUser] = useState(null);

  const { data: users, loading: isLoading, error } = useGet("/user/");

  const handleAddUser = () => {
    setSelectedUser(null);
    setIsDrawerOpen(true);
  };

  const handleEditUser = (user) => {
    setSelectedUser(user);
    setIsDrawerOpen(true);
  };

  const handleCloseDrawer = () => {
    setIsDrawerOpen(false);
    setSelectedUser(null);
  };

  const handleUserSuccess = () => {
    setRefreshKey((prev) => prev + 1);
  };

  const handleDeleteUser = () => {
    setRefreshKey((prev) => prev + 1);
  };

  return (
    <div className="space-y-6">
      <DashboardHeader
        heading="Users"
        text="Manage system users and their permissions."
        count={users?.count}
      >
        <Button onClick={handleAddUser}>
          <Plus className="mr-2 h-4 w-4" />
          Add User
        </Button>
      </DashboardHeader>

      <UsersTable
        users={users}
        loading={isLoading}
        onEdit={handleEditUser}
        onDelete={handleDeleteUser}
      />

      {/* Side Drawer for Add/Edit User */}
      <Sheet open={isDrawerOpen} onOpenChange={setIsDrawerOpen}>
        <SheetContent className="w-[400px] sm:w-[540px] overflow-y-auto z-[10000]">
          <SheetHeader>
            <SheetTitle>
              {selectedUser ? "Edit User" : "Add New User"}
            </SheetTitle>
          </SheetHeader>
          <div className="mt-6">
            <UserForm
              user={selectedUser}
              onClose={handleCloseDrawer}
              onSuccess={handleUserSuccess}
            />
          </div>
        </SheetContent>
      </Sheet>
    </div>
  );
}

export default UsersPage;
