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

export function SponsorsTable() {
  const navigate = useNavigate();
  const [isLoading, setIsLoading] = useState(false);
  const [isDeleting, setIsDeleting] = useState(null);

  // Mock sponsors data
  const sponsors = [
    {
      id: "1",
      name: "SportsTech",
      website: "https://sportstech.com",
      logo: "/placeholder.svg",
      createdAt: "2023-01-15T00:00:00.000Z",
    },
    {
      id: "2",
      name: "CricketGear",
      website: "https://cricketgear.com",
      logo: "/placeholder.svg",
      createdAt: "2023-02-10T00:00:00.000Z",
    },
    {
      id: "3",
      name: "AthleteZone",
      website: "https://athletezone.com",
      logo: "/placeholder.svg",
      createdAt: "2023-03-05T00:00:00.000Z",
    },
    {
      id: "4",
      name: "Global Sports",
      website: "https://globalsports.com",
      logo: "/placeholder.svg",
      createdAt: "2023-04-12T00:00:00.000Z",
    },
  ];

  const handleDelete = async (id) => {
    if (window.confirm("Are you sure you want to delete this sponsor?")) {
      setIsDeleting(id);
      // Simulate delete API call
      await new Promise((resolve) => setTimeout(resolve, 1000));
      setIsDeleting(null);
      // In a real app, you would call an API to delete the sponsor
    }
  };

  if (isLoading) {
    return (
      <div className="flex h-96 items-center justify-center">
        <LoadingSpinner />
      </div>
    );
  }

  return (
    <div className="rounded-md border">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Sponsor</TableHead>
            <TableHead className="hidden md:table-cell">Website</TableHead>
            <TableHead className="hidden md:table-cell">Added On</TableHead>
            <TableHead className="text-right">Actions</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {sponsors.map((sponsor) => (
            <TableRow key={sponsor.id}>
              <TableCell>
                <div className="flex items-center gap-3">
                  <Avatar className="h-9 w-9">
                    <AvatarImage src={sponsor.logo} alt={sponsor.name} />
                    <AvatarFallback>
                      {sponsor.name.substring(0, 2)}
                    </AvatarFallback>
                  </Avatar>
                  <div className="font-medium">{sponsor.name}</div>
                </div>
              </TableCell>
              <TableCell className="hidden md:table-cell">
                <a
                  href={sponsor.website}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center text-blue-600 hover:underline"
                >
                  {sponsor.website}
                  <ExternalLink className="ml-1 h-3 w-3" />
                </a>
              </TableCell>
              <TableCell className="hidden md:table-cell">
                {new Date(sponsor.createdAt).toLocaleDateString()}
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
