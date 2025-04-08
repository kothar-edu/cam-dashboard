"use client";
import { useParams } from "react-router-dom";
import { DashboardHeader } from "../components/dashboard/dashboard-header";
import { PostForm } from "../components/posts/post-form";

function EditPostPage() {
  const { id } = useParams();

  return (
    <div className="space-y-6">
      <DashboardHeader heading="Edit Post" text="Update your post or event." />
      <div className="grid gap-8">
        <PostForm id={id} />
      </div>
    </div>
  );
}

export default EditPostPage;
