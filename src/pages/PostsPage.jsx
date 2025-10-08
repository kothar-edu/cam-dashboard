import { Link } from "react-router-dom";
import { DashboardHeader } from "../components/dashboard/dashboard-header";
import { PostsTable } from "../components/posts/posts-table";
import { Button } from "../components/ui/button";
import { Plus } from "lucide-react";
import { useGet } from "src/hooks/useApi";

function PostsPage() {
  const { data: posts = [], loading: isLoading } = useGet(
    "/newsfeed/api/v1/post/"
  );

  return (
    <div className="space-y-6">
      <DashboardHeader
        heading="Posts"
        text="Manage your posts and events."
        count={posts?.count}
      >
        <Link to="/dashboard/posts/new">
          <Button variant="secondary">
            <Plus className="mr-2 h-4 w-4" />
            Add Post
          </Button>
        </Link>
      </DashboardHeader>
      <PostsTable posts={posts} loading={isLoading} />
    </div>
  );
}

export default PostsPage;
