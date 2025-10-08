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

export function PostsTable({ posts, loading }) {
  const navigate = useNavigate();
  const [isDeleting, setIsDeleting] = useState(null);

  const handleDelete = async (id) => {
    if (window.confirm("Are you sure you want to delete this post?")) {
      setIsDeleting(id);
      // Simulate delete API call
      await new Promise((resolve) => setTimeout(resolve, 1000));
      setIsDeleting(null);
      // In a real app, you would call an API to delete the post
    }
  };

  if (loading) {
    return (
      <div className="flex h-96 items-center justify-center">
        <LoadingSpinner />
      </div>
    );
  }

  if (!posts?.results?.length) {
    return (
      <div className="rounded-md border">
        <div className="p-8 text-center text-muted-foreground">
          No posts found. Create one to get started.
        </div>
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
          {posts?.results?.map((post) => (
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
