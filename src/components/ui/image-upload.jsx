"use client"

import axios from "axios"
import { useState } from "react"
import { Button } from "./button"
import { Input } from "./input"
import { LoadingSpinner } from "./loading-spinner"
import { Upload, X } from "lucide-react"

const getAuthToken = () => localStorage.getItem("token")

export function ImageUpload({ value, onChange, placeholder = "Upload image" }) {
  const [isUploading, setIsUploading] = useState(false)

  const handleUpload = async (e) => {
    const file = e.target.files?.[0]
    if (!file) return

    setIsUploading(true)
    try {
      const formData = new FormData()
      formData.append("image", file)
      const token = getAuthToken()
      const response = await axios.post(
        `${import.meta.env.VITE_URL}newsfeed/api/v1/upload-image/`,
        formData,
        {
          headers: {
            "Content-Type": "multipart/form-data",
            ...(token && { Authorization: `Bearer ${token}` }),
          },
        }
      )
      onChange(response.data.image_url)
    } catch (error) {
      console.error("Error uploading image:", error)
    } finally {
      setIsUploading(false)
    }
  }

  const handleRemove = () => {
    onChange("")
  }

  return (
    <div className="space-y-2">
      {value ? (
        <div className="relative aspect-square w-40 overflow-hidden rounded-md">
          <img src={value || "/placeholder.svg"} alt="Uploaded image" className="object-cover w-full h-full" />
          <Button
            type="button"
            variant="destructive"
            size="icon"
            className="absolute right-2 top-2 h-6 w-6"
            onClick={handleRemove}
          >
            <X className="h-4 w-4" />
          </Button>
        </div>
      ) : (
        <div className="flex items-center gap-4">
          <Button type="button" variant="outline" className="relative" disabled={isUploading}>
            {isUploading ? <LoadingSpinner className="mr-2 h-4 w-4" /> : <Upload className="mr-2 h-4 w-4" />}
            {isUploading ? "Uploading..." : placeholder}
            <Input
              type="file"
              accept="image/*"
              className="absolute inset-0 cursor-pointer opacity-0"
              onChange={handleUpload}
              disabled={isUploading}
            />
          </Button>
        </div>
      )}
    </div>
  )
}

