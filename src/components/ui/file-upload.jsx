"use client"

import { useState, useRef, forwardRef } from "react"
import { Upload, X } from "lucide-react"
import { Button } from "./button"

export const FileUpload = forwardRef(
  ({ label, accept = "image/*", error, onChange, value, multiple = false, className = "", ...props }, ref) => {
    const [preview, setPreview] = useState(value ? (multiple ? value : [value]) : [])
    const fileInputRef = useRef(null)

    const handleFileChange = (e) => {
      const files = Array.from(e.target.files)

      if (files.length === 0) return

      // Create preview URLs
      const fileUrls = files.map((file) => URL.createObjectURL(file))

      setPreview(multiple ? [...preview, ...fileUrls] : [fileUrls[0]])

      // Call the onChange handler with the actual files
      if (onChange) {
        onChange(multiple ? files : files[0])
      }
    }

    const handleRemoveFile = (index) => {
      const newPreview = [...preview]
      newPreview.splice(index, 1)
      setPreview(newPreview)

      // Reset the file input
      if (fileInputRef.current && newPreview.length === 0) {
        fileInputRef.current.value = ""
      }

      // Call onChange with null or empty array
      if (onChange) {
        onChange(multiple ? newPreview : null)
      }
    }

    return (
      <div className={`w-full ${className}`}>
        {label && <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">{label}</label>}

        <div className="mt-1 flex flex-col items-center">
          {/* File input (hidden) */}
          <input
            ref={(node) => {
              // Handle both refs
              if (ref) {
                if (typeof ref === "function") {
                  ref(node)
                } else {
                  ref.current = node
                }
              }
              fileInputRef.current = node
            }}
            type="file"
            accept={accept}
            multiple={multiple}
            className="hidden"
            onChange={handleFileChange}
            {...props}
          />

          {/* Upload button */}
          <Button type="button" variant="outline" className="w-full" onClick={() => fileInputRef.current?.click()}>
            <Upload className="mr-2 h-4 w-4" />
            {multiple ? "Upload Files" : "Upload File"}
          </Button>

          {/* Preview */}
          {preview.length > 0 && (
            <div className="mt-4 grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4 w-full">
              {preview.map((url, index) => (
                <div key={index} className="relative group">
                  {accept.includes("image") ? (
                    <img
                      src={url || "/placeholder.svg"}
                      alt={`Preview ${index}`}
                      className="h-24 w-full object-cover rounded-md border border-gray-300 dark:border-gray-600"
                    />
                  ) : (
                    <div className="h-24 w-full flex items-center justify-center bg-gray-100 dark:bg-gray-700 rounded-md border border-gray-300 dark:border-gray-600">
                      <span className="text-sm text-gray-500 dark:text-gray-400">File</span>
                    </div>
                  )}
                  <button
                    type="button"
                    className="absolute top-1 right-1 bg-red-500 text-white rounded-full p-1 opacity-0 group-hover:opacity-100 transition-opacity"
                    onClick={() => handleRemoveFile(index)}
                  >
                    <X className="h-4 w-4" />
                  </button>
                </div>
              ))}
            </div>
          )}
        </div>

        {error && <p className="mt-1 text-sm text-red-500">{error}</p>}
      </div>
    )
  },
)

FileUpload.displayName = "FileUpload"

