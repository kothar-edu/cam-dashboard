"use client";

import { Pencil, Trash } from "lucide-react";
import {
  MaterialReactTable,
  useMaterialReactTable,
} from "material-react-table";
import { useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useDelete } from "../../hooks/useApi";
import { Button } from "../ui/button";
import { LoadingSpinner } from "../ui/loading-spinner";

export function SponsorsTable({ sponsors, loading, onRefresh }) {
  const navigate = useNavigate();

  const { deleteById, loading: deleteLoading } = useDelete({
    successMessage: "Sponsor deleted successfully",
    errorMessage: "Failed to delete sponsor",
    onSuccess: () => {
      if (onRefresh) onRefresh();
    },
  });
  console.log(deleteLoading);
  const handleDelete = async (id) => {
    if (window.confirm("Are you sure you want to delete this sponsor?")) {
      await deleteById("/game/sponsor", id);
    }
  };

  const columns = useMemo(
    () => [
      {
        header: "Sponsor",
        accessorKey: "name",
      },

      {
        header: "Website",
        accessorKey: "supported_url",
      },

      {
        header: "Extra Info",
        accessorKey: "extra_info",
      },
      {
        header: "Actions",
        accessorKey: "actions",
        Cell: ({ row }) => (
          <div className="flex gap-2">
            <Button
              variant="secondary"
              size="icon"
              onClick={() => navigate(`/dashboard/sponsors/${row.original.id}`)}
            >
              {" "}
              <Pencil className="mr-2 h-4 w-4" /> Edit
            </Button>
            <Button
              variant="secondary"
              size="icon"
              onClick={() => handleDelete(row.original.id)}
            >
              {deleteLoading ? (
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
            </Button>
          </div>
        ),
      },
    ],
    []
  );

  const table = useMaterialReactTable({
    columns,
    data: sponsors?.results ?? [],
    enableStickyHeader: true,
    enablePagination: true,
    enableRowNumbers: true,
  });

  if (loading) {
    return (
      <div className="flex h-96 items-center justify-center">
        <LoadingSpinner />
      </div>
    );
  }

  if (!sponsors?.results?.length) {
    return (
      <div className="rounded-md border">
        <div className="p-8 text-center text-muted-foreground">
          No sponsors found. Create one to get started.
        </div>
      </div>
    );
  }

  return (
    <div className="rounded-md border s">
      <MaterialReactTable table={table} />
    </div>
  );
}
