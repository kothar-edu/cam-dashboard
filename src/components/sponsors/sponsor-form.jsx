"use client";

import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "../ui/button";
import { Card, CardContent } from "../ui/card";
import { FormField } from "../ui/form-field";
import { LoadingSpinner } from "../ui/loading-spinner";
import { ImageUpload } from "../ui/image-upload";
import { usePost } from "src/hooks/useApi";

export function SponsorForm({ id }) {
  const navigate = useNavigate();
  const [isLoading, setIsLoading] = useState(false);
  const [isFetching, setIsFetching] = useState(!!id);
  const { post } = usePost({
    successMessage: "Sponsor created successfully",
    errorMessage: "Failed to create sponsor",
    onSuccess: "/dashboard/sponsors",
  });

  const [formData, setFormData] = useState({
    name: "",
    supported_url: "",
    extra_info: "",
    image: null,
  });

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleImageUpload = (url) => {
    setFormData((prev) => ({ ...prev, logo: url }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsLoading(true);

    try {
      // Validate website URL
      if (formData.website && !formData.website.match(/^https?:\/\/.+\..+/)) {
        throw new Error(
          "Please enter a valid website URL (e.g., https://example.com)"
        );
      }

      // Post will handle success navigation automatically
      await post("/game/sponsor/", formData);
    } catch (error) {
      console.error("Error saving sponsor:", error);
      // Error handling is done by the usePost hook
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
      <CardContent className="pt-6">
        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="grid gap-4 md:grid-cols-2">
            <FormField
              label="Sponsor Name"
              name="name"
              value={formData.name}
              onChange={handleChange}
              placeholder="Enter sponsor name"
              required
            />
            <FormField
              label="Website"
              name="supported_url"
              value={formData.supported_url}
              onChange={handleChange}
              placeholder="https://example.com"
              required
            />{" "}
            <FormField
              label="Extra Info"
              name="extra_info"
              value={formData.extra_info}
              onChange={handleChange}
              placeholder="Enter extra info"
              required
            />
            <div className="space-y-2">
              <label className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70">
                Sponsor Logo
              </label>
              <ImageUpload
                value={formData.image}
                onChange={handleImageUpload}
                placeholder="Upload sponsor logo"
              />
            </div>
          </div>

          <div className="flex justify-end space-x-2">
            <Button
              type="button"
              variant="outline"
              onClick={() => navigate("/dashboard/sponsors")}
              disabled={isLoading}
            >
              Cancel
            </Button>
            <Button type="submit" disabled={isLoading}>
              {isLoading ? (
                <>
                  <LoadingSpinner className="mr-2 h-4 w-4" />
                  {id ? "Updating..." : "Creating..."}
                </>
              ) : id ? (
                "Update Sponsor"
              ) : (
                "Create Sponsor"
              )}
            </Button>
          </div>
        </form>
      </CardContent>
    </Card>
  );
}
