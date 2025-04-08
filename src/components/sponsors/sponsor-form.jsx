"use client"

import { useState, useEffect } from "react"
import { useNavigate } from "react-router-dom"
import { Button } from "../ui/button"
import { Card, CardContent } from "../ui/card"
import { FormField } from "../ui/form-field"
import { LoadingSpinner } from "../ui/loading-spinner"
import { ImageUpload } from "../ui/image-upload"

export function SponsorForm({ id }) {
  const navigate = useNavigate()
  const [isLoading, setIsLoading] = useState(false)
  const [isFetching, setIsFetching] = useState(!!id)

  const [formData, setFormData] = useState({
    name: "",
    website: "",
    logo: "",
  })

  useEffect(() => {
    const fetchSponsor = async () => {
      if (id) {
        try {
          setIsFetching(true)
          // Simulate API call
          await new Promise((resolve) => setTimeout(resolve, 1000))

          // Mock sponsor data
          setFormData({
            name: "SportsTech",
            website: "https://sportstech.com",
            logo: "/placeholder.svg",
          })
        } catch (error) {
          console.error("Error fetching sponsor:", error)
        } finally {
          setIsFetching(false)
        }
      }
    }

    fetchSponsor()
  }, [id])

  const handleChange = (e) => {
    const { name, value } = e.target
    setFormData((prev) => ({ ...prev, [name]: value }))
  }

  const handleImageUpload = (url) => {
    setFormData((prev) => ({ ...prev, logo: url }))
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    setIsLoading(true)

    try {
      // Validate website URL
      if (formData.website && !formData.website.match(/^https?:\/\/.+\..+/)) {
        throw new Error("Please enter a valid website URL (e.g., https://example.com)")
      }

      // Simulate API call
      await new Promise((resolve) => setTimeout(resolve, 1500))

      navigate("/dashboard/sponsors")
    } catch (error) {
      console.error("Error saving sponsor:", error)
      alert(error.message)
    } finally {
      setIsLoading(false)
    }
  }

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
              label="Sponsor Name"
              name="name"
              value={formData.name}
              onChange={handleChange}
              placeholder="Enter sponsor name"
              required
            />

            <FormField
              label="Website"
              name="website"
              type="url"
              value={formData.website}
              onChange={handleChange}
              placeholder="https://example.com"
              required
            />

            <div className="space-y-2 md:col-span-2">
              <label className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70">
                Sponsor Logo
              </label>
              <ImageUpload value={formData.logo} onChange={handleImageUpload} placeholder="Upload sponsor logo" />
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
  )
}

