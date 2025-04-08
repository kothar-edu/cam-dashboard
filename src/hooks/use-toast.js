"use client"

import { toast } from "react-hot-toast"

export function useToast() {
  const showToast = (message, type = "default") => {
    switch (type) {
      case "success":
        return toast.success(message)
      case "error":
        return toast.error(message)
      case "loading":
        return toast.loading(message)
      default:
        return toast(message)
    }
  }

  return {
    success: (message) => showToast(message, "success"),
    error: (message) => showToast(message, "error"),
    loading: (message) => showToast(message, "loading"),
    custom: (message) => showToast(message),
    dismiss: toast.dismiss,
  }
}

