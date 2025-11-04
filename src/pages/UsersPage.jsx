import { Plus } from "lucide-react";
import { useState } from "react";
import { DashboardHeader } from "../components/dashboard/dashboard-header";
import { Button } from "../components/ui/button";
import { UserForm } from "../components/users/user-form";
import { UsersTable } from "../components/users/users-table";
import { useAuth } from "../contexts/AuthContext";

function UsersPage() {
  const [isDrawerOpen, setIsDrawerOpen] = useState(false);
  const [selectedUser, setSelectedUser] = useState(null);
  const {
    refetchPaginatedUsers,
    usersList: users,
    isFetchingUsers,
  } = useAuth();

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
    refetchPaginatedUsers();
  };

  const handleDeleteUser = () => {
    refetchPaginatedUsers();
  };

  return (
    <div className="space-y-6">
      <DashboardHeader
        heading="Users"
        text="Manage system users and their permissions."
        count={users?.count}
        refetch={refetchPaginatedUsers}
        loading={isFetchingUsers}
      >
        <Button onClick={handleAddUser}>
          <Plus className="mr-2 h-4 w-4" />
          Add User
        </Button>
      </DashboardHeader>

      <UsersTable
        loading={isFetchingUsers}
        onEdit={handleEditUser}
        onDelete={handleDeleteUser}
      />

      {isDrawerOpen && (
        <UserForm
          user={selectedUser}
          onClose={handleCloseDrawer}
          onSuccess={handleUserSuccess}
          open={isDrawerOpen}
          setSelectedUser={setSelectedUser}
        />
      )}
    </div>
  );
}

export default UsersPage;
