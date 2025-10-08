"use client";

import { useState } from "react";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Button } from "@/components/ui/button";
import {
  MoreHorizontal,
  Pencil,
  Trash,
  CheckCircle,
  XCircle,
  Shield,
  ShieldOff,
} from "lucide-react";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { LoadingSpinner } from "@/components/ui/loading-spinner";
import { Badge } from "@/components/ui/badge";
import { useGet, useDelete } from "../../hooks/useApi";
import { useToast } from "../../hooks/use-toast";

export function UsersTable({ users, loading, onEdit, onDelete }) {
  const [isDeleting, setIsDeleting] = useState(null);
  const { toast } = useToast();
  const { deleteById } = useDelete({
    successMessage: "User deleted successfully",
    errorMessage: "Failed to delete user",
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

  // Make sure users is an array before trying to map over it
  const usersList = Array.isArray(users?.results) ? users?.results : [];
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
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>SN</TableHead>
            <TableHead>User</TableHead>
            <TableHead className="hidden md:table-cell">Status</TableHead>
            <TableHead className="hidden md:table-cell">Last Login</TableHead>
            <TableHead className="hidden md:table-cell">Created</TableHead>
            <TableHead className="text-right">Actions</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {usersList?.map((user, index) => (
            <TableRow key={user.id}>
              <TableCell>{index + 1}</TableCell>
              <TableCell>
                <div className="flex items-center gap-3">
                  <Avatar className="h-9 w-9">
                    {user.picture || user.profile_picture ? (
                      <AvatarImage
                        src={user.picture || user.profile_picture || "SR"}
                        alt={user.full_name || user.name}
                      />
                    ) : (
                      <AvatarFallback>
                        {user.full_name?.substring(0, 2) ||
                          user.name?.substring(0, 2) ||
                          "U"}
                      </AvatarFallback>
                    )}
                  </Avatar>
                  <div>
                    <div className="font-medium">
                      {user.full_name || user.name}
                    </div>
                    <div className="text-xs text-muted-foreground">
                      {user.email}
                    </div>
                  </div>
                </div>
              </TableCell>

              <TableCell className="hidden md:table-cell">
                <Badge
                  variant={user.is_active ? "success" : "destructive"}
                  className="flex items-center gap-1"
                >
                  {user.is_active ? (
                    <>
                      <CheckCircle className="h-3 w-3" />
                      <span>Active</span>
                    </>
                  ) : (
                    <>
                      <XCircle className="h-3 w-3" />
                      <span>Inactive</span>
                    </>
                  )}
                </Badge>
              </TableCell>
              <TableCell className="hidden md:table-cell">
                {user.last_login
                  ? new Date(user.last_login).toLocaleDateString()
                  : "Never"}
              </TableCell>
              <TableCell className="hidden md:table-cell">
                {user.created_at
                  ? new Date(user.created_at).toLocaleDateString()
                  : "-"}
              </TableCell>
              <TableCell className="text-right">
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button variant="secondary" size="icon">
                      <MoreHorizontal className="h-4 w-4" />
                      <span className="sr-only">Open menu</span>
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end">
                    <DropdownMenuLabel>Actions</DropdownMenuLabel>
                    <DropdownMenuSeparator />
                    <DropdownMenuItem onClick={() => onEdit(user)}>
                      <Pencil className="mr-2 h-4 w-4" />
                      Edit
                    </DropdownMenuItem>
                    <DropdownMenuItem
                      onClick={() =>
                        handleToggleStatus(user.id, user.is_active)
                      }
                    >
                      {user.is_active ? (
                        <>
                          <ShieldOff className="mr-2 h-4 w-4" />
                          Deactivate
                        </>
                      ) : (
                        <>
                          <Shield className="mr-2 h-4 w-4" />
                          Activate
                        </>
                      )}
                    </DropdownMenuItem>
                    <DropdownMenuItem
                      onClick={() => handleDelete(user.id)}
                      disabled={isDeleting === user.id}
                    >
                      {isDeleting === user.id ? (
                        <>
                          <LoadingSpinner className="mr-2 h-4 w-4" />
                          Deleting...
                        </>
                      ) : (
                        <>
                          <Trash className="mr-2 h-4 w-4" />
                          Delete
                        </>
                      )}
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  );
}
