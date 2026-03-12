"use client"

import { useState, useEffect } from "react"
import { useNavigate } from "react-router-dom"
import { Button } from "../ui/button"
import { Card, CardContent } from "../ui/card"
import { FormField } from "../ui/form-field"
import { LoadingSpinner } from "../ui/loading-spinner"
import { ImageUpload } from "../ui/image-upload"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "../ui/select"
import { Label } from "../ui/label"
import { Textarea } from "../ui/textarea"
import { useGetById, usePost, useEdit } from "src/hooks/useApi"

const POST_ENDPOINT = "/newsfeed/api/v1/post"

export function PostForm({ id }) {
  const navigate = useNavigate()
  const { post, loading: isCreating } = usePost({
    successMessage: "Post created successfully",
    onSuccess: () => navigate("/dashboard/posts"),
  })
  const { edit, loading: isUpdating } = useEdit({
    successMessage: "Post updated successfully",
    onSuccess: () => navigate("/dashboard/posts"),
  })

  const { data: existingPost, loading: isFetching } = useGetById(POST_ENDPOINT, id)

  const [formData, setFormData] = useState({
    title: "",
    description: "",
    post_date: new Date().toISOString().split("T")[0],
    post_time: new Date().toTimeString().split(" ")[0],
    post_type: "Blog",
    status: "Published",
    image: "",
  })

  useEffect(() => {
    if (existingPost) {
      const coverImage = existingPost.images?.find((img) => img.is_cover) ?? existingPost.images?.[0]
      setFormData({
        title: existingPost.title ?? "",
        description: existingPost.description ?? "",
        post_date: existingPost.post_date ?? new Date().toISOString().split("T")[0],
        post_time: existingPost.post_time ?? new Date().toTimeString().split(" ")[0],
        post_type: existingPost.post_type ?? "Blog",
        status: existingPost.status ?? "Published",
        image: coverImage?.image_url ?? "",
      })
    }
  }, [existingPost])

  const handleChange = (e) => {
    const { name, value } = e.target
    setFormData((prev) => ({ ...prev, [name]: value }))
  }

  const handleSelectChange = (name, value) => {
    setFormData((prev) => ({ ...prev, [name]: value }))
  }

  const handleImageUpload = (url) => {
    setFormData((prev) => ({ ...prev, image: url }))
  }

  const buildPayload = () => {
    const payload = {
      post_type: formData.post_type,
      title: formData.title,
      description: formData.description,
      post_date: formData.post_date,
      post_time: formData.post_time,
      status: formData.status,
      tags: [],
    }
    if (formData.image) {
      payload.images = [{ image_url: formData.image, is_cover: true }]
    }
    return payload
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    const payload = buildPayload()
    if (id) {
      await edit(POST_ENDPOINT, id, payload)
    } else {
      await post(POST_ENDPOINT, payload)
    }
  }

  const isLoading = isCreating || isUpdating

  if (isFetching) {
    return (
      <div className="flex h-96 items-center justify-center">
        <LoadingSpinner />
      </div>
    )
  }

  return (
    <Card>
      <CardContent className="pt-6">
        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="grid gap-4 md:grid-cols-2">
            <FormField
              label="Title"
              name="title"
              value={formData.title}
              onChange={handleChange}
              placeholder="Enter post title"
              required
              className="md:col-span-2"
            />

            <div className="space-y-2 md:col-span-2">
              <Label htmlFor="description">Description</Label>
              <Textarea
                id="description"
                name="description"
                value={formData.description}
                onChange={handleChange}
                placeholder="Enter post description"
                required
                className="min-h-20"
              />
            </div>

            <FormField
              label="Date"
              name="post_date"
              type="date"
              value={formData.post_date}
              onChange={handleChange}
              required
            />

            <div className="space-y-2">
              <Label htmlFor="post_type">Post Type</Label>
              <Select
                value={formData.post_type}
                onValueChange={(value) => handleSelectChange("post_type", value)}
              >
                <SelectTrigger id="post_type">
                  <SelectValue placeholder="Select post type" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="Blog">Blog</SelectItem>
                  <SelectItem value="News">News</SelectItem>
                  <SelectItem value="Event">Event</SelectItem>
                  <SelectItem value="Match Update">Match Update</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="status">Status</Label>
              <Select
                value={formData.status}
                onValueChange={(value) => handleSelectChange("status", value)}
              >
                <SelectTrigger id="status">
                  <SelectValue placeholder="Select status" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="Draft">Draft</SelectItem>
                  <SelectItem value="Published">Published</SelectItem>
                  <SelectItem value="Archived">Archived</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2 md:col-span-2">
              <label className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70">
                Image
              </label>
              <ImageUpload value={formData.image} onChange={handleImageUpload} placeholder="Upload image" />
            </div>
          </div>

          <div className="flex justify-end space-x-2">
            <Button
              type="button"
              variant="outline"
              onClick={() => navigate("/dashboard/posts")}
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
                "Update Post"
              ) : (
                "Create Post"
              )}
            </Button>
          </div>
        </form>
      </CardContent>
    </Card>
  )
}

