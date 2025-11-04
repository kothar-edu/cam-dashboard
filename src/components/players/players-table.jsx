"use client";

import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { LoadingSpinner } from "@/components/ui/loading-spinner";
import { Autocomplete, Box, Button, TextField } from "@mui/material";
import { CheckCircle, Pencil, Plane, Trash, XCircle } from "lucide-react";
import {
  MaterialReactTable,
  useMaterialReactTable,
} from "material-react-table";
import { useEffect, useMemo, useState } from "react";
import { useAuth } from "../../contexts/AuthContext";
import { useToast } from "../../hooks/use-toast";
import { useDelete } from "../../hooks/useApi";
import { PlayerForm } from "./player-form";
import { Flag } from "@mui/icons-material";

export function PlayersTable({ loading, onEdit, onDelete }) {
  const [isDeleting, setIsDeleting] = useState(null);
  const { toast } = useToast();
  const [selectedUser, setSelectedUser] = useState(null);

  const { deleteById } = useDelete({
    successMessage: "User deleted successfully",
    errorMessage: "Failed to delete user",
  });

  const {
    playerPagination,
    setPlayerPagination,
    playersList: players,
    teamsList,
    isFetchingTeams,
    errorTeams,
    refetchTeams,
  } = useAuth();

  useEffect(() => {
    if (teamsList.length === 0) refetchTeams();
  }, []);

  // Make sure users is an array before trying to map over it
  const playersList = Array.isArray(players?.results) ? players?.results : [];

  // Filter options
  const teamsListOptions = [
    { label: "All Teams", value: null },
    ...teamsList.map((team) => ({
      label: team.name,
      value: team.id,
    })),
  ];

  const handleEdit = (user) => {
    setSelectedUser(user);
  };

  const handleFilterChange = (key, newValue) => {
    setPlayerPagination((prev) => ({
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
              {row.original.user?.picture ||
              row.original.user?.profile_picture ? (
                <AvatarImage
                  src={
                    row.original.user?.picture ||
                    row.original.user?.profile_picture ||
                    "SR"
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
              <div className="font-medium capitalize">
                {row.original.full_name || row.original.name}
              </div>
            </div>
          </div>
        ),
      },
      {
        header: "Team",
        accessorKey: "team_name",
        Cell: ({ row }) => {
          return row.original.team_name;
        },
      },

      {
        header: "Jersey Number",
        accessorKey: "jersey_no",
      },
      {
        header: "Active",
        accessorKey: "is_active",

        Cell: ({ row }) => {
          return row.original.is_active ? (
            <span className="flex items-center gap-2">
              <CheckCircle className="h-5 w-5 text-green-500" />{" "}
              <span>Active</span>
            </span>
          ) : (
            <span className="flex items-center gap-2">
              <XCircle className="h-5 w-5 text-red-500" /> <span>Inactive</span>
            </span>
          );
        },
      },
      {
        header: "Is Payment Verified",
        accessorKey: "is_payment_verified",
        Cell: ({ row }) => {
          return row.original.user?.is_payment_verified ? (
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
        header: "Nationality",
        accessorKey: "user.nationality",
        Cell: ({ row }) => {
          return row.original.user?.nationality &&
            row.original.user?.nationality?.toLowerCase() === "nepal" ? (
            <span className="flex items-center gap-2">
              <CheckCircle className="h-5 w-5 text-green-500" />{" "}
              <span>{row.original.user?.nationality}</span>
            </span>
          ) : (
            <span className="flex items-center gap-2">
              <Flag className="h-5 w-5 text-red-500" />{" "}
              <span>{row.original.user?.nationality || "Unknown"}</span>
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
    data: playersList ?? [],
    rowNumberDisplayMode: "original",
    initialState: {
      density: "compact",
      showGlobalFilter: true,
    },
    manualPagination: true,
    manualFiltering: true,
    rowCount: players?.count ?? 0,
    onGlobalFilterChange: (value) => {
      setPlayerPagination((prev) => ({
        ...prev,
        search: value,
        pageIndex: 0, // Reset to first page when searching
      }));
    },
    enablePagination: true,
    state: {
      pagination: playerPagination,
      isLoading: loading,
      showProgressBars: loading,
    },
    onPaginationChange: setPlayerPagination,
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
          options={teamsListOptions}
          value={
            teamsListOptions.find(
              (opt) => opt.value === playerPagination.currentTeam
            ) || teamsListOptions[0]
          }
          onChange={(e, newValue) =>
            handleFilterChange("currentTeam", newValue)
          }
          getOptionLabel={(option) => option.label}
          isOptionEqualToValue={(option, value) => option.value === value.value}
          sx={{ minWidth: 300 }}
          renderInput={(params) => (
            <TextField {...params} label="Current Team" variant="outlined" />
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
        <PlayerForm
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
