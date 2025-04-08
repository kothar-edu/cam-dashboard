"use client";

import { useState, useEffect } from "react";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "../ui/table";
import { Card, CardContent, CardHeader, CardTitle } from "../ui/card";
import { Button } from "../ui/button";
import { LoadingSpinner } from "../ui/loading-spinner";
import { Badge } from "../ui/badge";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "../ui/dialog";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "../ui/tabs";
import { CheckCircle, XCircle, FileText, Eye } from "lucide-react";
import { useToast } from "../../hooks/use-toast";
import { useGet } from "../../hooks/useApi";

export function VerificationTable() {
  const toast = useToast();
  const [isLoading, setIsLoading] = useState(true);
  const [isVerifying, setIsVerifying] = useState(false);
  // const [players, setPlayers] = useState([]);
  const [selectedPlayer, setSelectedPlayer] = useState(null);
  const [activeTab, setActiveTab] = useState("identity");
  const [isDialogOpen, setIsDialogOpen] = useState(false);

  // Mock players data
  const mockPlayers = [
    {
      id: "1",
      fullName: "Virat Kohli",
      email: "virat@example.com",
      teamName: "Royal Challengers",
      identityVerified: true,
      paymentVerified: true,
      identityDocument: "/placeholder.svg",
      paymentDocument: "/placeholder.svg",
    },
    {
      id: "2",
      fullName: "MS Dhoni",
      email: "dhoni@example.com",
      teamName: "Super Kings",
      identityVerified: true,
      paymentVerified: true,
      identityDocument: "/placeholder.svg",
      paymentDocument: "/placeholder.svg",
    },
    {
      id: "3",
      fullName: "Rohit Sharma",
      email: "rohit@example.com",
      teamName: "Mumbai Indians",
      identityVerified: false,
      paymentVerified: true,
      identityDocument: "/placeholder.svg",
      paymentDocument: "/placeholder.svg",
    },
    {
      id: "4",
      fullName: "KL Rahul",
      email: "rahul@example.com",
      teamName: "Punjab Kings",
      identityVerified: true,
      paymentVerified: false,
      identityDocument: "/placeholder.svg",
      paymentDocument: "/placeholder.svg",
    },
    {
      id: "5",
      fullName: "Rishabh Pant",
      email: "pant@example.com",
      teamName: "Delhi Capitals",
      identityVerified: false,
      paymentVerified: false,
      identityDocument: "/placeholder.svg",
      paymentDocument: "/placeholder.svg",
    },
  ];

  // useEffect(() => {
  //   const fetchData = async () => {
  //     setIsLoading(true);
  //     try {
  //       // Simulate API call
  //       await new Promise((resolve) => setTimeout(resolve, 1000));

  //       setPlayers(mockPlayers);
  //     } catch (error) {
  //       console.error("Error fetching data:", error);
  //     } finally {
  //       setIsLoading(false);
  //     }
  //   };

  //   fetchData();
  // }, []);

  const { data: players, loading } = useGet("/user/?limit=4000&offset=0");

  const handleVerify = async (type, approved) => {
    if (!selectedPlayer) return;

    setIsVerifying(true);

    try {
      // Simulate API call
      await new Promise((resolve) => setTimeout(resolve, 1500));

      // Update local state
      // setPlayers((prev) =>
      //   prev.map((player) => {
      //     if (player.id === selectedPlayer.id) {
      //       return {
      //         ...player,
      //         [type === "identity" ? "identityVerified" : "paymentVerified"]:
      //           approved,
      //       };
      //     }
      //     return player;
      //   })
      // );

      toast.success(
        `${selectedPlayer.fullName}'s ${type} verification ${
          approved ? "approved" : "rejected"
        }`
      );
      setIsDialogOpen(false);
      setSelectedPlayer(null);
    } catch (error) {
      console.error("Error verifying player:", error);
      toast.error("Failed to update verification status");
    } finally {
      setIsVerifying(false);
    }
  };

  const openVerificationDialog = (player, tab) => {
    setSelectedPlayer(player);
    setActiveTab(tab);
    setIsDialogOpen(true);
  };

  if (loading) {
    return (
      <div className="flex h-96 items-center justify-center">
        <LoadingSpinner />
      </div>
    );
  }
  // Make sure tournaments is an array before trying to map over it
  const playerList = Array.isArray(players?.results) ? players?.results : [];

  if (!playerList?.length) {
    return (
      <div className="rounded-md border">
        <div className="p-8 text-center text-muted-foreground">
          No Players found. Create one to get started.
        </div>
      </div>
    );
  }
  return (
    <Card>
      <CardHeader>
        <CardTitle>Player Verification</CardTitle>
      </CardHeader>
      <CardContent>
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Player</TableHead>
              <TableHead>Team</TableHead>
              <TableHead>Identity Verification</TableHead>{" "}
              <TableHead>Email Verification</TableHead>{" "}
              <TableHead>Phone Verification</TableHead>
              <TableHead>Payment Verification</TableHead>
              <TableHead className="text-right">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {playerList?.map((player) => (
              <TableRow key={player.id}>
                <TableCell className="font-medium">
                  <div>
                    <div>{player.full_name}</div>
                    <div className="text-xs text-muted-foreground">
                      {player.email}
                    </div>
                  </div>
                </TableCell>
                <TableCell>{player.teamName}</TableCell>
                <TableCell>
                  {player.identityVerified ? (
                    <Badge
                      variant="success"
                      className="flex items-center gap-1"
                    >
                      <CheckCircle className="h-3 w-3" />
                      Verified
                    </Badge>
                  ) : (
                    <Badge
                      variant="outline"
                      className="flex items-center gap-1"
                    >
                      <XCircle className="h-3 w-3" />
                      Pending
                    </Badge>
                  )}
                </TableCell>{" "}
                <TableCell>
                  {player.is_email_verified ? (
                    <Badge
                      variant="success"
                      className="flex items-center gap-1"
                    >
                      <CheckCircle className="h-3 w-3" />
                      Verified
                    </Badge>
                  ) : (
                    <Badge
                      variant="rejected"
                      className="flex items-center gap-1"
                    >
                      <XCircle className="h-3 w-3" />
                      Not Verified
                    </Badge>
                  )}
                </TableCell>
                <TableCell>
                  {player.is_phone_verified ? (
                    <Badge
                      variant="success"
                      className="flex items-center gap-1"
                    >
                      <CheckCircle className="h-3 w-3" />
                      Verified
                    </Badge>
                  ) : (
                    <Badge
                      variant="rejected"
                      className="flex items-center gap-1"
                    >
                      <XCircle className="h-3 w-3" />
                      Not Verified
                    </Badge>
                  )}
                </TableCell>
                <TableCell>
                  {player.is_payment_verified ? (
                    <Badge
                      variant="success"
                      className="flex items-center gap-1"
                    >
                      <CheckCircle className="h-3 w-3" />
                      Verified
                    </Badge>
                  ) : (
                    <Badge
                      variant="rejected"
                      className="flex items-center gap-1"
                    >
                      <XCircle className="h-3 w-3" />
                      Not Verified
                    </Badge>
                  )}
                </TableCell>
                <TableCell className="text-right">
                  <div className="flex justify-end gap-2">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => openVerificationDialog(player, "identity")}
                      disabled={player.identityVerified}
                    >
                      <FileText className="mr-1 h-3 w-3" />
                      ID
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => openVerificationDialog(player, "payment")}
                      disabled={player.paymentVerified}
                    >
                      <FileText className="mr-1 h-3 w-3" />
                      Payment
                    </Button>
                  </div>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>

        {/* Verification Dialog */}
        <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
          <DialogContent className="sm:max-w-md">
            <DialogHeader>
              <DialogTitle>Verify Player</DialogTitle>
            </DialogHeader>
            {selectedPlayer && (
              <div className="space-y-4 py-4">
                <div className="text-center mb-4">
                  <h3 className="font-medium">{selectedPlayer.fullName}</h3>
                  <p className="text-sm text-muted-foreground">
                    {selectedPlayer.email}
                  </p>
                </div>

                <Tabs value={activeTab} onValueChange={setActiveTab}>
                  <TabsList className="grid w-full grid-cols-2">
                    <TabsTrigger value="identity">
                      Identity Verification
                    </TabsTrigger>
                    <TabsTrigger value="payment">
                      Payment Verification
                    </TabsTrigger>
                  </TabsList>

                  <TabsContent value="identity" className="space-y-4 mt-4">
                    <div className="border rounded-md p-4">
                      <div className="flex justify-center mb-2">
                        <Button variant="outline" size="sm">
                          <Eye className="mr-1 h-3 w-3" />
                          View Document
                        </Button>
                      </div>
                      <div className="flex justify-center">
                        <img
                          src={
                            selectedPlayer.identityDocument ||
                            "/placeholder.svg"
                          }
                          alt="Identity Document"
                          className="max-h-40 object-contain border rounded-md"
                        />
                      </div>
                    </div>

                    <div className="flex justify-between space-x-2">
                      <Button
                        variant="destructive"
                        className="flex-1"
                        onClick={() => handleVerify("identity", false)}
                        disabled={isVerifying}
                      >
                        {isVerifying ? (
                          <LoadingSpinner className="mr-2 h-4 w-4" />
                        ) : (
                          <XCircle className="mr-2 h-4 w-4" />
                        )}
                        Reject
                      </Button>
                      <Button
                        variant="default"
                        className="flex-1"
                        onClick={() => handleVerify("identity", true)}
                        disabled={isVerifying}
                      >
                        {isVerifying ? (
                          <LoadingSpinner className="mr-2 h-4 w-4" />
                        ) : (
                          <CheckCircle className="mr-2 h-4 w-4" />
                        )}
                        Approve
                      </Button>
                    </div>
                  </TabsContent>

                  <TabsContent value="payment" className="space-y-4 mt-4">
                    <div className="border rounded-md p-4">
                      <div className="flex justify-center mb-2">
                        <Button variant="outline" size="sm">
                          <Eye className="mr-1 h-3 w-3" />
                          View Document
                        </Button>
                      </div>
                      <div className="flex justify-center">
                        <img
                          src={
                            selectedPlayer.paymentDocument || "/placeholder.svg"
                          }
                          alt="Payment Document"
                          className="max-h-40 object-contain border rounded-md"
                        />
                      </div>
                    </div>

                    <div className="flex justify-between space-x-2">
                      <Button
                        variant="destructive"
                        className="flex-1"
                        onClick={() => handleVerify("payment", false)}
                        disabled={isVerifying}
                      >
                        {isVerifying ? (
                          <LoadingSpinner className="mr-2 h-4 w-4" />
                        ) : (
                          <XCircle className="mr-2 h-4 w-4" />
                        )}
                        Reject
                      </Button>
                      <Button
                        variant="default"
                        className="flex-1"
                        onClick={() => handleVerify("payment", true)}
                        disabled={isVerifying}
                      >
                        {isVerifying ? (
                          <LoadingSpinner className="mr-2 h-4 w-4" />
                        ) : (
                          <CheckCircle className="mr-2 h-4 w-4" />
                        )}
                        Approve
                      </Button>
                    </div>
                  </TabsContent>
                </Tabs>
              </div>
            )}
          </DialogContent>
        </Dialog>
      </CardContent>
    </Card>
  );
}
