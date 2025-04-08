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
import { MoreHorizontal, Pencil, Trash, Calendar } from "lucide-react";
import { LoadingSpinner } from "../ui/loading-spinner";
import { Badge } from "../ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "../ui/avatar";

export function PostsTable() {
  const navigate = useNavigate();
  const [isLoading, setIsLoading] = useState(false);
  const [isDeleting, setIsDeleting] = useState(null);

  // Mock posts data
  const posts = [
    {
      id: "1",
      title: "Tournament Announcement",
      description:
        "We are excited to announce our upcoming tournament starting next month!",
      date: "2025-03-01",
      writtenBy: "Admin",
      type: "post",
      image: "/placeholder.svg",
      createdAt: "2023-01-15T00:00:00.000Z",
    },
    {
      id: "2",
      title: "Team Selection Event",
      description: "Join us for the team selection event this weekend.",
      date: "2025-03-15",
      writtenBy: "Admin",
      type: "event",
      going: 24,
      image: "/placeholder.svg",
      createdAt: "2023-02-10T00:00:00.000Z",
    },
    {
      id: "3",
      title: "New Sponsorship",
      description:
        "We are pleased to announce our new partnership with XYZ Sports.",
      date: "2025-03-20",
      writtenBy: "Admin",
      type: "post",
      image: "/placeholder.svg",
      createdAt: "2023-03-05T00:00:00.000Z",
    },
    {
      id: "4",
      title: "Annual Cricket Awards",
      description:
        "The annual cricket awards ceremony will be held next month.",
      date: "2025-04-10",
      writtenBy: "Admin",
      type: "event",
      going: 56,
      image: "/placeholder.svg",
      createdAt: "2023-04-12T00:00:00.000Z",
    },
  ];

  const handleDelete = async (id) => {
    if (window.confirm("Are you sure you want to delete this post?")) {
      setIsDeleting(id);
      // Simulate delete API call
      await new Promise((resolve) => setTimeout(resolve, 1000));
      setIsDeleting(null);
      // In a real app, you would call an API to delete the post
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
            <TableHead>Title</TableHead>
            <TableHead>Type</TableHead>
            <TableHead className="hidden md:table-cell">Date</TableHead>
            <TableHead className="hidden md:table-cell">Author</TableHead>
            <TableHead className="text-right">Actions</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {posts.map((post) => (
            <TableRow key={post.id}>
              <TableCell>
                <div className="flex items-center gap-3">
                  <Avatar className="h-9 w-9">
                    <AvatarImage src={post.image} alt={post.title} />
                    <AvatarFallback>
                      {post.title.substring(0, 2)}
                    </AvatarFallback>
                  </Avatar>
                  <div>
                    <div className="font-medium">{post.title}</div>
                    <div className="text-xs text-muted-foreground line-clamp-1">
                      {post.description}
                    </div>
                  </div>
                </div>
              </TableCell>
              <TableCell>
                <Badge
                  variant={post.type === "event" ? "secondary" : "outline"}
                >
                  {post.type === "event" ? "Event" : "Post"}
                </Badge>
              </TableCell>
              <TableCell className="hidden md:table-cell">
                {new Date(post.date).toLocaleDateString()}
              </TableCell>
              <TableCell className="hidden md:table-cell">
                {post.writtenBy}
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
                      onClick={() => navigate(`/dashboard/posts/${post.id}`)}
                    >
                      <Pencil className="mr-2 h-4 w-4" />
                      Edit
                    </DropdownMenuItem>
                    {post.type === "event" && (
                      <DropdownMenuItem
                        onClick={() =>
                          navigate(`/dashboard/posts/${post.id}/attendees`)
                        }
                      >
                        <Calendar className="mr-2 h-4 w-4" />
                        View Attendees
                      </DropdownMenuItem>
                    )}
                    <DropdownMenuItem
                      onClick={() => handleDelete(post.id)}
                      disabled={isDeleting === post.id}
                    >
                      {isDeleting === post.id ? (
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
