"use client";

import { useMemo, useState } from "react";
import { LoadingSpinner } from "@/components/ui/loading-spinner";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { useDelete } from "../../hooks/useApi";
import { useToast } from "../../hooks/use-toast";
import {
  MaterialReactTable,
  useMaterialReactTable,
} from "material-react-table";
import { Badge } from "lucide-react";

export function UsersTable({ users, loading, onEdit, onDelete }) {
  const [isDeleting, setIsDeleting] = useState(null);
  const { toast } = useToast();
  const { deleteById } = useDelete({
    successMessage: "User deleted successfully",
    errorMessage: "Failed to delete user",
  });

  // Make sure users is an array before trying to map over it
  const usersList = Array.isArray(users?.results) ? users?.results : [];
  console.log(usersList);
  const columns = useMemo(
    () => [
      {
        header: "User",
        accessorKey: "full_name",
        Cell: ({ row }) => (
          <div className="flex items-center gap-3">
            <Avatar className="h-9 w-9">
              {row.original.picture || row.original.profile_picture ? (
                <AvatarImage
                  src={
                    row.original.picture || row.original.profile_picture || "SR"
                  }
                  alt={row.original.full_name || row.original.name}
                />
              ) : (
                <AvatarFallback>
                  {row?.original?.full_name?.substring(0, 2) ||
                    row?.original?.name?.substring(0, 2) ||
                    "U"}
                </AvatarFallback>
              )}
            </Avatar>
            <div>
              <div className="font-medium">
                {row.original.full_name || row.original.name}
              </div>
              <div className="text-xs text-muted-foreground">
                {row.original.email}
              </div>
            </div>
          </div>
        ),
      },
      {
        header: "Email",
        accessorKey: "email",
      },
      {
        header: "Status",
        accessorKey: "is_active",
        Cell: ({ row }) => (
          <Badge variant={row.original.is_active ? "success" : "destructive"}>
            {row.original.is_active ? "Active" : "Inactive"}
          </Badge>
        ),
      },
      {
        header: "Last Login",
        accessorKey: "last_login",
      },
      {
        header: "Created",
        accessorKey: "created_at",
      },
      {
        header: "Actions",
        accessorKey: "actions",
      },
    ],
    []
  );

  const table = useMaterialReactTable({
    columns,
    data: usersList,
    enablePagination: true,
    enableRowNumbers: true,
    enableStickyHeader: true,
  });

  const handleDelete = async (id) => {
    if (confirm("Are you sure you want to delete this user?")) {
      setIsDeleting(id);
      try {
        await deleteById("/users", id);
        if (onDelete) onDelete();
      } catch (error) {
        // Error toast is already handled by the API hook
      } finally {
        setIsDeleting(null);
      }
    }
  };

  const handleToggleStatus = async (id, currentStatus) => {
    try {
      // You'll need to implement the API call for toggling user status
      toast({
        title: "Success",
        description: `User ${
          currentStatus ? "deactivated" : "activated"
        } successfully`,
      });
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to update user status",
        variant: "destructive",
      });
    }
  };

  if (loading) {
    return (
      <div className="flex h-96 items-center justify-center">
        <LoadingSpinner />
      </div>
    );
  }

  if (!usersList.length) {
    return (
      <div className="rounded-md border">
        <div className="p-8 text-center text-muted-foreground">
          No users found. Create one to get started.
        </div>
      </div>
    );
  }

  return (
    <div className="rounded-md border">
      <MaterialReactTable table={table} />
    </div>
  );
}
