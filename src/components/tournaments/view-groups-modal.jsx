const getTeamName = (id) => getDisplayName(teams, id);
("use client");

import { useState } from "react";
import { useData } from "../../contexts/DataContext";
import { Button } from "../ui/button";
import { Badge } from "../ui/badge";
import { Plus, Pencil, Trash } from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "../ui/dialog";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "../ui/table";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "../ui/alert-dialog";
import { GroupModal } from "./group-modal";
import { useToast } from "../../hooks/use-toast";

export function ViewGroupsModal({ isOpen, onClose, tournamentId }) {
  const { toast } = useToast();
  const { tournamentGroups } = [];

  const [isGroupModalOpen, setIsGroupModalOpen] = useState(false);
  const [groupToEdit, setGroupToEdit] = useState(null);
  const [groupToDelete, setGroupToDelete] = useState(null);

  const getDisplayName = (array, value) => {
    if (!value) return "";
    const item = array.find(
      (item) => item.id?.toString() === value?.toString()
    );
    return item ? item.name : "";
  };

  const getTournamentName = (id) => getDisplayName(tournaments, id);
  const getTeamName = (id) => getDisplayName(teams, id);

  // Get groups for this tournament
  const groups = tournamentGroups[tournamentId] || [];

  // Handle add new group
  const handleAddGroup = () => {
    setGroupToEdit(null);
    setIsGroupModalOpen(true);
  };

  // Handle edit group
  const handleEditGroup = (group) => {
    setGroupToEdit(group);
    setIsGroupModalOpen(true);
  };

  // Handle delete group
  const handleDeleteGroup = (group) => {
    setGroupToDelete(group);
  };

  // Confirm delete group
  const confirmDeleteGroup = async () => {
    try {
      // In a real app, you would call an API here
      // For now, we'll just show a success message
      toast({
        title: "Group deleted",
        description: `Group "${groupToDelete?.name}" has been deleted`,
      });

      // Close the delete dialog
      setGroupToDelete(null);

      // Refresh the groups list
      //   refreshTournamentGroups();
    } catch (error) {
      console.error("Error deleting group:", error);
      toast({
        title: "Error",
        description: "Failed to delete group. Please try again.",
        variant: "destructive",
      });
    }
  };

  // Handle group modal close
  const handleGroupModalClose = (success) => {
    setIsGroupModalOpen(false);
    if (success) {
      // Refresh the groups list
      //   refreshTournamentGroups();
    }
  };

  return (
    <>
      <Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
        <DialogContent className="sm:max-w-[700px]">
          <DialogHeader>
            <DialogTitle>
              Tournament Groups - {getTournamentName(tournamentId)}
            </DialogTitle>
            <DialogDescription>
              Manage groups and team assignments for this tournament.
            </DialogDescription>
          </DialogHeader>

          <div className="py-4">
            <div className="flex justify-end mb-4">
              <Button onClick={handleAddGroup}>
                <Plus className="mr-2 h-4 w-4" />
                Add Group
              </Button>
            </div>

            {groups.length === 0 ? (
              <div className="text-center py-8 text-muted-foreground">
                <p>No groups have been created for this tournament yet.</p>
                <Button
                  onClick={handleAddGroup}
                  variant="outline"
                  className="mt-4"
                >
                  Create your first group
                </Button>
              </div>
            ) : (
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Name</TableHead>
                    <TableHead>Teams</TableHead>
                    <TableHead className="w-[100px]">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {groups.map((group) => (
                    <TableRow key={group.id}>
                      <TableCell className="font-medium">
                        {group.name}
                      </TableCell>
                      <TableCell>
                        <div className="flex flex-wrap gap-1">
                          {group.opponents.map((teamId) => (
                            <Badge key={teamId} variant="outline">
                              {getTeamName(teamId)}
                            </Badge>
                          ))}
                        </div>
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center gap-2">
                          <Button
                            variant="ghost"
                            size="icon"
                            onClick={() => handleEditGroup(group)}
                          >
                            <Pencil className="h-4 w-4" />
                          </Button>
                          <Button
                            variant="ghost"
                            size="icon"
                            className="text-destructive"
                            onClick={() => handleDeleteGroup(group)}
                          >
                            <Trash className="h-4 w-4" />
                          </Button>
                        </div>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            )}
          </div>
        </DialogContent>
      </Dialog>

      {/* Group Modal for adding/editing groups */}
      {isGroupModalOpen && (
        <GroupModal
          isOpen={isGroupModalOpen}
          onClose={handleGroupModalClose}
          tournamentId={tournamentId}
          groupToEdit={groupToEdit}
        />
      )}

      {/* Delete Confirmation Dialog */}
      <AlertDialog
        open={!!groupToDelete}
        onOpenChange={(open) => !open && setGroupToDelete(null)}
      >
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Are you sure?</AlertDialogTitle>
            <AlertDialogDescription>
              This will permanently delete the group "{groupToDelete?.name}" and
              cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={confirmDeleteGroup}
              className="bg-destructive text-destructive-foreground"
            >
              Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
}
