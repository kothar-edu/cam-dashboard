"use client";

import { Button } from "@/components/ui/button";
import { LoadingSpinner } from "@/components/ui/loading-spinner";
import { Close } from "@mui/icons-material";
import {
  Autocomplete,
  Checkbox,
  Drawer,
  IconButton,
  TextField,
} from "@mui/material";
import { useMutation } from "@tanstack/react-query";
import axios from "axios";
import { useEffect, useState } from "react";
import { useToast } from "../../hooks/use-toast";
import { useAuth } from "../../contexts/AuthContext.legacy";

export function UserForm({ user, onClose, onSuccess, open, setSelectedUser }) {
  const toast = useToast();
  const [isImageUpdated, setIsImageUpdated] = useState(false);
  const { rolesList, refetchRoles } = useAuth();
  const [formData, setFormData] = useState({
    email: "",
    picture: "",
    full_name: "",
    phone: "",
    gender: "m",
    groups: [],
    is_staff: false,
    is_active: true,
    is_phone_verified: false,
    is_email_verified: false,
    is_verified: false,
    is_payment_verified: false,
    payment_status: "unverified",
    subscription_end_date: "",
    password: "",
  });

  useEffect(() => {
    if (rolesList.length === 0) {
      refetchRoles();
    }
  }, [rolesList]);

  useEffect(() => {
    if (user?.id) {
      getUserData(user.id);
      setIsImageUpdated(false); // Reset image updated flag when opening edit form
    } else {
      setIsImageUpdated(false); // Reset for new user form
    }
  }, [user?.id]);

  const { mutate: getUserData, isPending: isGettingUserData } = useMutation({
    mutationFn: (id) => axios.get(`/user/${id}/`),
    onSuccess: (data) => {
      setFormData({
        ...data?.data,
        groups: data?.data?.roles || data?.data?.groups || [],
      });
    },
    onError: (error) => {
      toast.error("Failed to get user data");
    },
  });
  const { mutate: postUser, isPending: isPostingUser } = useMutation({
    mutationFn: (data) =>
      user?.id
        ? axios.patch(`/user/${user.id}/`, data)
        : axios.post("/user/", data),
    onSuccess: (data) => {
      toast.success(
        user?.id ? "User updated successfully" : "User created successfully"
      );
      onSuccess && onSuccess();
      onClose && onClose();
      setSelectedUser && setSelectedUser(null);
    },
    onError: (error) => {
      toast.error(error.message);
    },
  });

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: type === "checkbox" ? checked : value,
    }));
  };

  console.log(formData);

  const handleSelectChange = (name, value, type = "single") => {
    if (type === "array") {
      setFormData((prev) => ({ ...prev, [name]: [value] }));
    } else {
      setFormData((prev) => ({ ...prev, [name]: value }));
    }
  };

  const handleImageUpload = (e) => {
    const file = e.target.files?.[0];
    if (file) {
      // Here you would typically upload to your server
      // For now, we'll just create a local URL
      const url = URL.createObjectURL(file);
      setFormData((prev) => ({ ...prev, picture: url }));
      setIsImageUpdated(true);
    }
  };

  // Options for dropdowns
  const roleOptions = rolesList.map((role) => ({
    label: role.name,
    value: role.id,
  }));

  const genderOptions = [
    { label: "Male", value: "m" },
    { label: "Female", value: "f" },
    { label: "Other", value: "o" },
  ];

  const paymentStatusOptions = [
    { label: "Pending", value: "pending" },
    { label: "Verified", value: "verified" },
    { label: "Unverified", value: "unverified" },
    { label: "Rejected", value: "rejected" },
  ];

  const handleSubmit = async (e) => {
    e.preventDefault();

    // Create a copy of formData
    const submitData = { ...formData };

    // Remove picture key if image wasn't updated
    if (!isImageUpdated) {
      delete submitData.picture;
    }
    if (typeof submitData.groups[0] === "string") {
      submitData.roles = rolesList?.filter(
        (item) => item.name === submitData.groups[0]
      )[0]?.id;
      delete submitData.groups;
    }

    console.log(submitData);

    postUser(submitData);
  };

  return (
    <Drawer
      anchor="right"
      open={open}
      onClose={onClose}
      slotProps={{ paper: { style: { width: "35%", height: "100vh " } } }}
    >
      <form onSubmit={handleSubmit}>
        <div className="flex items-center justify-between p-4 border-b">
          <div className="text-lg font-medium">
            {user?.id ? "Edit User" : "Add New User"}
          </div>
          <IconButton variant="outline" onClick={onClose}>
            <Close className="h-4 w-4" />
          </IconButton>
        </div>
        <div onSubmit={handleSubmit} className="space-y-6 p-4 mt-4 relative">
          {isGettingUserData ? (
            <div className="flex h-96 items-center justify-center">
              <LoadingSpinner />
            </div>
          ) : (
            <>
              <div className="flex flex-col gap-6">
                <TextField
                  fullWidth
                  label="Full Name"
                  name="full_name"
                  value={formData.full_name}
                  onChange={handleChange}
                  placeholder="Enter full name"
                  required
                  size="small"
                  className="w-full"
                />

                <TextField
                  fullWidth
                  label="Email"
                  name="email"
                  type="email"
                  value={formData.email}
                  onChange={handleChange}
                  placeholder="Enter email address"
                  required
                  size="small"
                />

                {/* <TextField
                fullWidth
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
                size="small"
              /> */}

                <Autocomplete
                  size="small"
                  options={roleOptions}
                  value={
                    roleOptions.find(
                      (opt) =>
                        opt.label === formData.groups[0] ||
                        opt.value === formData.groups[0]
                    ) || null
                  }
                  onChange={(e, newValue) => {
                    console.log(newValue);
                    handleSelectChange(
                      "groups",
                      newValue?.value || "",
                      "array"
                    );
                  }}
                  getOptionLabel={(option) => option.label}
                  isOptionEqualToValue={(option, value) =>
                    option.value === value.value
                  }
                  renderInput={(params) => (
                    <TextField
                      {...params}
                      label="Role"
                      placeholder="Select role"
                    />
                  )}
                />

                <TextField
                  fullWidth
                  label="Phone Number"
                  name="phone"
                  value={formData.phone}
                  onChange={handleChange}
                  placeholder="+1234567890"
                  size="small"
                />

                <Autocomplete
                  size="small"
                  options={genderOptions}
                  value={
                    genderOptions.find(
                      (opt) => opt.value === formData.gender
                    ) || null
                  }
                  onChange={(e, newValue) =>
                    handleSelectChange("gender", newValue?.value || "m")
                  }
                  getOptionLabel={(option) => option.label}
                  isOptionEqualToValue={(option, value) =>
                    option.value === value.value
                  }
                  renderInput={(params) => (
                    <TextField
                      {...params}
                      label="Gender"
                      placeholder="Select gender"
                    />
                  )}
                />

                <Autocomplete
                  size="small"
                  options={paymentStatusOptions}
                  value={
                    paymentStatusOptions.find(
                      (opt) => opt.value === formData.payment_status
                    ) || null
                  }
                  onChange={(e, newValue) =>
                    handleSelectChange(
                      "payment_status",
                      newValue?.value || "unverified"
                    )
                  }
                  getOptionLabel={(option) => option.label}
                  isOptionEqualToValue={(option, value) =>
                    option.value === value.value
                  }
                  renderInput={(params) => (
                    <TextField
                      {...params}
                      label="Payment Status"
                      placeholder="Select payment status"
                    />
                  )}
                />

                <div className="w-full">
                  <label
                    htmlFor="subscription_end_date"
                    className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1"
                  >
                    Subscription End Date
                  </label>
                  <TextField
                    fullWidth
                    placeholder="Subscription End Date"
                    name="subscription_end_date"
                    type="date"
                    value={formData.subscription_end_date}
                    onChange={handleChange}
                    size="small"
                  />
                </div>
                <div className="md:col-span-2 space-y-2">
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                    Profile Picture
                  </label>
                  <input
                    type="file"
                    onChange={handleImageUpload}
                    accept="image/*"
                    className="block w-full text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-md file:border-0 file:text-sm file:font-semibold  file:text-primary-foreground hover:file:bg-primary/90"
                  />
                  {formData.picture && (
                    <div className="mt-2">
                      <img
                        src={formData.picture}
                        alt="Profile preview"
                        className="max-w-[200px] max-h-[200px] object-cover rounded-lg"
                      />
                    </div>
                  )}
                </div>

                <div className="md:col-span-2 grid grid-cols-2 gap-2">
                  <div className="flex items-center space-x-2">
                    <Checkbox
                      checked={formData.is_active}
                      onChange={(e) =>
                        setFormData((prev) => ({
                          ...prev,
                          is_active: e.target.checked,
                        }))
                      }
                      name="is_active"
                      size="small"
                    />
                    <label className="text-sm font-medium">Active</label>
                  </div>

                  <div className="flex items-center space-x-2">
                    <Checkbox
                      checked={formData.is_staff}
                      onChange={(e) =>
                        setFormData((prev) => ({
                          ...prev,
                          is_staff: e.target.checked,
                        }))
                      }
                      name="is_staff"
                      size="small"
                    />
                    <label className="text-sm font-medium">Staff</label>
                  </div>

                  <div className="flex items-center space-x-2">
                    <Checkbox
                      checked={formData.is_email_verified}
                      onChange={(e) =>
                        setFormData((prev) => ({
                          ...prev,
                          is_email_verified: e.target.checked,
                        }))
                      }
                      name="is_email_verified"
                      size="small"
                    />
                    <label className="text-sm font-medium">
                      Email Verified
                    </label>
                  </div>

                  <div className="flex items-center space-x-2">
                    <Checkbox
                      checked={formData.is_phone_verified}
                      onChange={(e) =>
                        setFormData((prev) => ({
                          ...prev,
                          is_phone_verified: e.target.checked,
                        }))
                      }
                      name="is_phone_verified"
                      size="small"
                    />
                    <label className="text-sm font-medium">
                      Phone Verified
                    </label>
                  </div>

                  <div className="flex items-center space-x-2">
                    <Checkbox
                      checked={formData.is_verified}
                      onChange={(e) =>
                        setFormData((prev) => ({
                          ...prev,
                          is_verified: e.target.checked,
                        }))
                      }
                      name="is_verified"
                      size="small"
                    />
                    <label className="text-sm font-medium">Verified</label>
                  </div>

                  <div className="flex items-center space-x-2">
                    <Checkbox
                      checked={formData.is_payment_verified}
                      onChange={(e) =>
                        setFormData((prev) => ({
                          ...prev,
                          is_payment_verified: e.target.checked,
                        }))
                      }
                      name="is_payment_verified"
                      size="small"
                    />
                    <label className="text-sm font-medium">
                      Payment Verified
                    </label>
                  </div>
                </div>
              </div>
            </>
          )}
        </div>{" "}
        <div className="flex justify-end space-x-2 absolute bottom-0 right-0 p-4 w-full border-t">
          <Button
            type="button"
            variant="outline"
            onClick={onClose}
            disabled={isPostingUser}
          >
            Cancel
          </Button>
          <Button type="submit" disabled={isPostingUser}>
            {isPostingUser ? (
              <>
                <LoadingSpinner className="mr-2 h-4 w-4" />
                {isPostingUser ? "Updating..." : "Creating..."}
              </>
            ) : (
              "Submit"
            )}
          </Button>
        </div>
      </form>
    </Drawer>
  );
}
