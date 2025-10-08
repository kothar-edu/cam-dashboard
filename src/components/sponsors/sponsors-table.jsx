"use client";

import { useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "../ui/table";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "../ui/dropdown-menu";
import { Button } from "../ui/button";
import { MoreHorizontal, Pencil, Trash, ExternalLink } from "lucide-react";
import { LoadingSpinner } from "../ui/loading-spinner";
import { Avatar, AvatarFallback, AvatarImage } from "../ui/avatar";
import { useDelete } from "../../hooks/useApi";

export function SponsorsTable({ sponsors, loading }) {
  const navigate = useNavigate();
  const [isDeleting, setIsDeleting] = useState(null);
  const { deleteById } = useDelete();
  // Mock sponsors data

  const handleDelete = async (id) => {
    if (window.confirm("Are you sure you want to delete this sponsor?")) {
      setIsDeleting(id);
      await deleteById("/game/sponsor/", id);
      setIsDeleting(null);
    }
  };

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
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Sponsor</TableHead>
            <TableHead className="hidden md:table-cell">Website</TableHead>
            <TableHead className="hidden md:table-cell">Extra Info</TableHead>
            <TableHead className="text-right">Actions</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {sponsors?.results?.map((sponsor) => (
            <TableRow key={sponsor.id}>
              <TableCell>
                <div className="flex items-center gap-3">
                  <Avatar className="h-9 w-9">
                    {sponsor.image ? (
                      <AvatarImage src={sponsor.image} alt={sponsor.name} />
                    ) : (
                      <AvatarFallback>
                        {sponsor.name.substring(0, 2)}
                      </AvatarFallback>
                    )}
                  </Avatar>
                  <div className="font-medium">{sponsor.name}</div>
                </div>
              </TableCell>
              <TableCell className="hidden md:table-cell">
                <a
                  href={sponsor.supported_url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center text-blue-600 hover:underline"
                >
                  {sponsor.supported_url}
                  <ExternalLink className="ml-1 h-3 w-3" />
                </a>
              </TableCell>
              <TableCell className="hidden md:table-cell">
                {sponsor.extra_info}
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
                    <DropdownMenuItem
                      onClick={() =>
                        navigate(`/dashboard/sponsors/${sponsor.id}`)
                      }
                    >
                      <Pencil className="mr-2 h-4 w-4" />
                      Edit
                    </DropdownMenuItem>
                    <DropdownMenuItem
                      onClick={() => handleDelete(sponsor.id)}
                      disabled={isDeleting === sponsor.id}
                    >
                      {isDeleting === sponsor.id ? (
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
