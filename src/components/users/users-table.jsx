"use client";

import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { LoadingSpinner } from "@/components/ui/loading-spinner";
import { Autocomplete, Box, Button, TextField } from "@mui/material";
import { CheckCircle, Pencil, Trash, XCircle } from "lucide-react";
import {
  MaterialReactTable,
  useMaterialReactTable,
} from "material-react-table";
import { useMemo, useState } from "react";
import { useAuth } from "../../contexts/AuthContext";
import { useToast } from "../../hooks/use-toast";
import { useDelete } from "../../hooks/useApi";
import { UserForm } from "./user-form";

export function UsersTable({ loading, onEdit, onDelete }) {
  const [isDeleting, setIsDeleting] = useState(null);
  const { toast } = useToast();
  const [selectedUser, setSelectedUser] = useState(null);

  const { deleteById } = useDelete({
    successMessage: "User deleted successfully",
    errorMessage: "Failed to delete user",
  });

  const { userPagination, setUserPagination, usersList: users } = useAuth();

  // Make sure users is an array before trying to map over it
  const usersList = Array.isArray(users?.results) ? users?.results : [];

  // Filter options
  const paymentStatusOptions = [
    { label: "All Statuses", value: null },
    { label: "Pending", value: "pending" },
    { label: "Verified", value: "verified" },
    { label: "Unverified", value: "unverified" },
    { label: "Rejected", value: "rejected" },
  ];

  const accountStatusOptions = [
    { label: "All Accounts", value: null },
    { label: "Active", value: true },
    { label: "Inactive", value: false },
  ];

  const paymentVerifiedOptions = [
    { label: "All", value: null },
    { label: "Verified", value: true },
    { label: "Not Verified", value: false },
  ];

  const staffStatusOptions = [
    { label: "All Users", value: null },
    { label: "Staff", value: true },
    { label: "Non-Staff", value: false },
  ];

  const handleEdit = (user) => {
    setSelectedUser(user);
  };

  const handleFilterChange = (key, newValue) => {
    setUserPagination((prev) => ({
      ...prev,
      [key]: newValue?.value ?? null,
      pageIndex: 0,
    }));
  };
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
                  className="object-cover"
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
        header: "Is Email Verified",
        accessorKey: "is_email_verified",
        Cell: ({ row }) => {
          return row.original.is_email_verified ? (
            <span className="flex items-center gap-2">
              <CheckCircle className="h-5 w-5 text-green-500" />{" "}
              <span>Verified</span>
            </span>
          ) : (
            <span className="flex items-center gap-2">
              <XCircle className="h-5 w-5 text-red-500" />{" "}
              <span>Not Verified</span>
            </span>
          );
        },
      },
      {
        header: "Is Payment Verified",
        accessorKey: "is_payment_verified",
        Cell: ({ row }) => {
          return row.original.is_payment_verified ? (
            <span className="flex items-center gap-2">
              <CheckCircle className="h-5 w-5 text-green-500" />{" "}
              <span>Verified</span>
            </span>
          ) : (
            <span className="flex items-center gap-2">
              <XCircle className="h-5 w-5 text-red-500" />{" "}
              <span>Not Verified</span>
            </span>
          );
        },
      },
      {
        header: "Is Phone Verified",
        accessorKey: "is_phone_verified",
        Cell: ({ row }) => {
          return row.original.is_phone_verified ? (
            <span className="flex items-center gap-2">
              <CheckCircle className="h-5 w-5 text-green-500" />{" "}
              <span>Verified</span>
            </span>
          ) : (
            <span className="flex items-center gap-2">
              <XCircle className="h-5 w-5 text-red-500" />{" "}
              <span>Not Verified</span>
            </span>
          );
        },
      },
      {
        header: "Subscription End Date",
        accessorKey: "subscription_end_date",
        Cell: ({ row }) => {
          return row.original.subscription_end_date ? (
            <span className="flex items-center gap-2">
              <span>{row.original.subscription_end_date}</span>
            </span>
          ) : (
            <span className="flex items-center gap-2">
              <span>No subscription</span>
            </span>
          );
        },
      },

      {
        header: "Actions",
        accessorKey: "actions",
        Cell: ({ row }) => (
          <div className="flex gap-0">
            <Button
              variant="secondary"
              size="icon"
              onClick={() => onEdit(row.original)}
            >
              <Pencil className="h-4 w-4" />
            </Button>
            <Button
              variant="secondary"
              size="icon"
              onClick={() => handleDelete(row.original.id)}
            >
              <Trash className="h-4 w-4" />
            </Button>
          </div>
        ),
      },
    ],
    []
  );

  const table = useMaterialReactTable({
    columns,
    data: usersList ?? [],
    rowNumberDisplayMode: "original",
    initialState: {
      density: "compact",
      showGlobalFilter: true,
    },
    manualPagination: true,
    manualFiltering: true,
    rowCount: users?.count ?? 0,
    onGlobalFilterChange: (value) => {
      setUserPagination((prev) => ({
        ...prev,
        search: value,
        pageIndex: 0, // Reset to first page when searching
      }));
    },
    enablePagination: true,
    state: {
      pagination: userPagination,
      isLoading: loading,
      showProgressBars: loading,
    },
    onPaginationChange: setUserPagination,
    paginationDisplayMode: "pages",
    enableRowNumbers: true,
    enableStickyHeader: true,
    muiTableContainerProps: {
      sx: {
        maxHeight: "calc(100vh - 350px)", // Adjust this value based on your header height
        minHeight: "calc(100vh - 350px)", // Set a minimum height
        overflowY: "auto",
        position: "relative", // Important for sticky positioning
      },
    },
    renderTopToolbarCustomActions: () => (
      <Box
        sx={{
          display: "flex",
          gap: 2,
          flexWrap: "wrap",
          alignItems: "center",
          p: 1,
        }}
      >
        <Autocomplete
          size="small"
          options={paymentStatusOptions}
          value={
            paymentStatusOptions.find(
              (opt) => opt.value === userPagination.paymentStatus
            ) || paymentStatusOptions[0]
          }
          onChange={(e, newValue) =>
            handleFilterChange("paymentStatus", newValue)
          }
          getOptionLabel={(option) => option.label}
          isOptionEqualToValue={(option, value) => option.value === value.value}
          sx={{ minWidth: 180 }}
          renderInput={(params) => (
            <TextField {...params} label="Payment Status" variant="outlined" />
          )}
        />

        <Autocomplete
          size="small"
          options={accountStatusOptions}
          value={
            accountStatusOptions.find(
              (opt) => opt.value === userPagination.isActive
            ) || accountStatusOptions[0]
          }
          onChange={(e, newValue) => handleFilterChange("isActive", newValue)}
          getOptionLabel={(option) => option.label}
          isOptionEqualToValue={(option, value) => option.value === value.value}
          sx={{ minWidth: 180 }}
          renderInput={(params) => (
            <TextField {...params} label="Account Status" variant="outlined" />
          )}
        />

        <Autocomplete
          size="small"
          options={paymentVerifiedOptions}
          value={
            paymentVerifiedOptions.find(
              (opt) => opt.value === userPagination.isPaymentVerified
            ) || paymentVerifiedOptions[0]
          }
          onChange={(e, newValue) =>
            handleFilterChange("isPaymentVerified", newValue)
          }
          getOptionLabel={(option) => option.label}
          isOptionEqualToValue={(option, value) => option.value === value.value}
          sx={{ minWidth: 180 }}
          renderInput={(params) => (
            <TextField
              {...params}
              label="Payment Verified"
              variant="outlined"
            />
          )}
        />

        <Autocomplete
          size="small"
          options={staffStatusOptions}
          value={
            staffStatusOptions.find(
              (opt) => opt.value === userPagination.isStaff
            ) || staffStatusOptions[0]
          }
          onChange={(e, newValue) => handleFilterChange("isStaff", newValue)}
          getOptionLabel={(option) => option.label}
          isOptionEqualToValue={(option, value) => option.value === value.value}
          sx={{ minWidth: 180 }}
          renderInput={(params) => (
            <TextField {...params} label="Staff Status" variant="outlined" />
          )}
        />
      </Box>
    ),
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

  return (
    <div className="rounded-md border">
      <MaterialReactTable table={table} />
      {selectedUser && (
        <UserForm
          user={selectedUser}
          onClose={() => setSelectedUser(null)}
          onSuccess={() => {
            setSelectedUser(null);
            table.refetch();
          }}
          open={!!selectedUser}
          setSelectedUser={setSelectedUser}
        />
      )}
    </div>
  );
}
