"use client";

import { useState, useEffect } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { Button } from "../ui/button";
import { Card, CardContent } from "../ui/card";
import { FormField } from "../ui/form-field";
import { LoadingSpinner } from "../ui/loading-spinner";
import { ImageUpload } from "../ui/image-upload";
import { usePost } from "../../hooks/useApi";

export function TeamForm({ id: propId }) {
  const navigate = useNavigate();
  const { id: urlId } = useParams();
  const id = propId || urlId;

  const [isLoading, setIsLoading] = useState(false);
  const [isFetching, setIsFetching] = useState(!!id);

  const [formData, setFormData] = useState({
    name: "",
    code: "",
    logo: "",
  });
  const { post } = usePost();

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleImageUpload = (url) => {
    setFormData((prev) => ({ ...prev, logo: url }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    await post("/game/teams/", formData);
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
              label="Team Name"
              name="name"
              value={formData.name}
              onChange={handleChange}
              placeholder="Enter team name"
              required
            />

            <FormField
              label="code"
              name="code"
              value={formData.code}
              onChange={handleChange}
              placeholder="E.g., RCB, CSK"
              required
              maxLength={5}
            />

            <div className="space-y-2 md:col-span-2">
              <label className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70">
                Team Logo
              </label>
              <ImageUpload
                value={formData.logo}
                onChange={handleImageUpload}
                placeholder="Upload team logo"
              />
            </div>
          </div>

          <div className="flex justify-end space-x-2">
            <Button
              type="button"
              variant="outline"
              onClick={() => navigate("/dashboard/teams")}
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
                "Update Team"
              ) : (
                "Create Team"
              )}
            </Button>
          </div>
        </form>
      </CardContent>
    </Card>
  );
}
