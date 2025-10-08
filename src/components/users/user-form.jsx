"use client";

import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { FormField } from "@/components/ui/form-field";
import { LoadingSpinner } from "@/components/ui/loading-spinner";
import { ImageUpload } from "@/components/ui/image-upload";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Label } from "@/components/ui/label";
import { Checkbox } from "@/components/ui/checkbox";
import { useGet, usePost, useEdit } from "../../hooks/useApi";
import { useToast } from "../../hooks/use-toast";

export function UserForm({ user, onClose, onSuccess }) {
  const [isLoading, setIsLoading] = useState(false);
  const [isFetching, setIsFetching] = useState(!!user?.id);
  const { toast } = useToast();
  const { post } = usePost({
    successMessage: "User created successfully",
    errorMessage: "Failed to create user",
    onSuccess: (data) => {
      if (onSuccess) onSuccess();
      if (onClose) onClose();
    },
  });

  const { edit } = useEdit({
    successMessage: "User updated successfully",
    errorMessage: "Failed to update user",
  });

  const [formData, setFormData] = useState({
    full_name: "",
    email: "",
    password: "",
    role: "user",
    is_active: true,
    profile_picture: "",
    phone_number: "",
    nationality: "",
    date_of_birth: "",
    gender: "male",
  });

  useEffect(() => {
    if (user?.id) {
      setFormData({
        full_name: user.full_name || "",
        email: user.email || "",
        password: "",
        role: user.role || "user",
        is_active: user.is_active !== undefined ? user.is_active : true,
        profile_picture: user.profile_picture || user.picture || "",
        phone_number: user.phone_number || "",
        nationality: user.nationality || "",
        date_of_birth: user.date_of_birth || "",
        gender: user.gender || "male",
      });
      setIsFetching(false);
    }
  }, [user]);

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: type === "checkbox" ? checked : value,
    }));
  };

  const handleSelectChange = (name, value) => {
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleImageUpload = (url) => {
    setFormData((prev) => ({ ...prev, profile_picture: url }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsLoading(true);

    try {
      // Remove empty password field if editing
      const submitData = { ...formData };
      if (user?.id && !submitData.password) {
        delete submitData.password;
      }

      if (user?.id) {
        await edit("/users", user.id, submitData);
        if (onSuccess) onSuccess();
        if (onClose) onClose();
      } else {
        await post("/users", submitData);
        // onSuccess and onClose are handled by the usePost hook
      }
    } catch (error) {
      // Error toast is already handled by the API hooks
    } finally {
      setIsLoading(false);
    }
  };

  if (isFetching) {
    return (
      <div className="flex h-96 items-center justify-center">
        <LoadingSpinner />
      </div>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>{user?.id ? "Edit User" : "Add New User"}</CardTitle>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="grid gap-4 md:grid-cols-2">
            <FormField
              label="Full Name"
              name="full_name"
              value={formData.full_name}
              onChange={handleChange}
              placeholder="Enter full name"
              required
            />

            <FormField
              label="Email"
              name="email"
              type="email"
              value={formData.email}
              onChange={handleChange}
              placeholder="Enter email address"
              required
            />

            <FormField
              label={
                user?.id
                  ? "New Password (leave blank to keep current)"
                  : "Password"
              }
              name="password"
              type="password"
              value={formData.password}
              onChange={handleChange}
              placeholder="Enter password"
              required={!user?.id}
            />

            <div className="space-y-2">
              <Label htmlFor="role">Role</Label>
              <Select
                value={formData.role}
                onValueChange={(value) => handleSelectChange("role", value)}
              >
                <SelectTrigger id="role">
                  <SelectValue placeholder="Select role" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="user">User</SelectItem>
                  <SelectItem value="admin">Admin</SelectItem>
                  <SelectItem value="moderator">Moderator</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <FormField
              label="Phone Number"
              name="phone_number"
              value={formData.phone_number}
              onChange={handleChange}
              placeholder="Enter phone number"
            />

            <FormField
              label="Nationality"
              name="nationality"
              value={formData.nationality}
              onChange={handleChange}
              placeholder="Enter nationality"
            />

            <FormField
              label="Date of Birth"
              name="date_of_birth"
              type="date"
              value={formData.date_of_birth}
              onChange={handleChange}
            />

            <div className="space-y-2">
              <Label htmlFor="gender">Gender</Label>
              <Select
                value={formData.gender}
                onValueChange={(value) => handleSelectChange("gender", value)}
              >
                <SelectTrigger id="gender">
                  <SelectValue placeholder="Select gender" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="male">Male</SelectItem>
                  <SelectItem value="female">Female</SelectItem>
                  <SelectItem value="other">Other</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2 md:col-span-2">
              <label className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70">
                Profile Picture
              </label>
              <ImageUpload
                value={formData.profile_picture}
                onChange={handleImageUpload}
                placeholder="Upload profile picture"
              />
            </div>

            <div className="flex items-center space-x-2 md:col-span-2">
              <Checkbox
                id="is_active"
                name="is_active"
                checked={formData.is_active}
                onCheckedChange={(checked) =>
                  setFormData((prev) => ({ ...prev, is_active: checked }))
                }
              />
              <Label htmlFor="is_active">Active User</Label>
            </div>
          </div>

          <div className="flex justify-end space-x-2">
            <Button
              type="button"
              variant="outline"
              onClick={onClose}
              disabled={isLoading}
            >
              Cancel
            </Button>
            <Button type="submit" disabled={isLoading}>
              {isLoading ? (
                <>
                  <LoadingSpinner className="mr-2 h-4 w-4" />
                  {user?.id ? "Updating..." : "Creating..."}
                </>
              ) : user?.id ? (
                "Update User"
              ) : (
                "Create User"
              )}
            </Button>
          </div>
        </form>
      </CardContent>
    </Card>
  );
}
