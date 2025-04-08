import { DashboardHeader } from "../components/dashboard/dashboard-header";
import { PostForm } from "../components/posts/post-form";

function NewPostPage() {
  return (
    <div className="space-y-6">
      <DashboardHeader heading="Create Post" text="Add a new post or event." />
      <div className="grid gap-8">
        <PostForm />
      </div>
    </div>
  );
}

export default NewPostPage;
