import { useState, useEffect } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { useTranslation } from "react-i18next";
import { useLocation } from "wouter";
import { useAuth } from "@/hooks/use-auth";
import { useIsMobile } from "@/hooks/use-mobile";
import { Navbar } from "@/components/navbar";
import { Footer } from "@/components/footer";
import { CreatePostModal } from "@/components/create-post-modal";
import { PostCard } from "@/components/post-card";
import { CommentModal } from "@/components/comment-modal";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Loader2, Plus } from "lucide-react";
import { apiRequest, queryClient } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";

type PostType = "all" | "text" | "photo" | "video";

export default function FeedPage() {
  const { user } = useAuth();
  const { toast } = useToast();
  const [, setLocation] = useLocation();
  const isMobile = useIsMobile();
  const { t } = useTranslation();
  const [activeFilter, setActiveFilter] = useState<PostType>("all");
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [selectedPost, setSelectedPost] = useState<any>(null);
  const [isCommentModalOpen, setIsCommentModalOpen] = useState(false);

  const { 
    data: posts = [], 
    isLoading: isLoadingPosts 
  } = useQuery({
    queryKey: ["/api/posts", activeFilter],
    queryFn: () => apiRequest("GET", `/api/posts${activeFilter !== "all" ? `?type=${activeFilter}` : ""}`).then(res => res.json()),
    refetchInterval: 5000, // Real-time updates every 5 seconds
  });

  // Handle scrolling to specific post from notification
  useEffect(() => {
    const urlParams = new URLSearchParams(window.location.search);
    const postId = urlParams.get('postId');
    
    if (postId && posts.length > 0) {
      // Remove the query parameter to clean up URL
      const newUrl = window.location.pathname;
      window.history.replaceState({}, '', newUrl);
      
      // Scroll to the post after a brief delay to ensure DOM is rendered
      setTimeout(() => {
        const postElement = document.querySelector(`[data-post-id="${postId}"]`);
        if (postElement) {
          postElement.scrollIntoView({ 
            behavior: 'smooth', 
            block: 'center' 
          });
          // Add a highlight effect
          postElement.classList.add('ring-2', 'ring-blue-400', 'ring-opacity-50');
          setTimeout(() => {
            postElement.classList.remove('ring-2', 'ring-blue-400', 'ring-opacity-50');
          }, 3000);
        }
      }, 500);
    }
  }, [posts]);

  const givePointMutation = useMutation({
    mutationFn: async (postId: number) => {
      await apiRequest("POST", `/api/posts/${postId}/point`);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/posts"] });
      toast({
        title: "Success",
        description: "Point given successfully!",
      });
    },
    onError: (error: any) => {
      toast({
        title: "Error",
        description: error.message || "Failed to give point",
        variant: "destructive",
      });
    },
  });

  const reportPostMutation = useMutation({
    mutationFn: async ({ postId, reason }: { postId: number; reason?: string }) => {
      await apiRequest("POST", `/api/posts/${postId}/report`, { reason });
    },
    onSuccess: () => {
      // Invalidate reported posts for real-time admin updates
      queryClient.invalidateQueries({ queryKey: ["/api/admin/reported-posts"] });
      toast({
        title: "Post reported",
        description: "Thank you for helping keep our community safe. This has been sent to administrators for review.",
      });
    },
    onError: (error: any) => {
      toast({
        title: "Error",
        description: error.message || "Failed to report post",
        variant: "destructive",
      });
    },
  });

  const deletePostMutation = useMutation({
    mutationFn: async (postId: number) => {
      await apiRequest("DELETE", `/api/posts/${postId}`);
    },
    onSuccess: () => {
      // Invalidate all related queries for real-time updates
      queryClient.invalidateQueries({ queryKey: ["/api/posts"] });
      queryClient.invalidateQueries({ queryKey: ["/api/admin/posts"] });
      queryClient.invalidateQueries({ queryKey: ["/api/admin/posts/stats"] });
      queryClient.invalidateQueries({ queryKey: ["/api/admin/reported-posts"] });
      toast({
        title: "Post deleted",
        description: "Your post has been deleted successfully.",
      });
    },
    onError: (error: any) => {
      toast({
        title: "Error",
        description: error.message || "Failed to delete post",
        variant: "destructive",
      });
    },
  });

  const handleGivePoint = (postId: number) => {
    givePointMutation.mutate(postId);
  };

  const handleReportPost = (postId: number) => {
    if (confirm("Are you sure you want to report this post?")) {
      reportPostMutation.mutate({ postId, reason: "Inappropriate content" });
    }
  };

  const handleDeletePost = (postId: number) => {
    if (confirm("Are you sure you want to delete this post?")) {
      deletePostMutation.mutate(postId);
    }
  };

  const handleCommentClick = (post: any) => {
    setSelectedPost(post);
    setIsCommentModalOpen(true);
  };

  const handleUserClick = (userId: number) => {
    setLocation(`/profile/${userId}`);
  };

  const filters = [
    { id: "all" as PostType, label: t('feed.allPosts'), active: activeFilter === "all" },
    { id: "text" as PostType, label: t('feed.textPosts'), active: activeFilter === "text" },
    { id: "photo" as PostType, label: t('feed.photoPosts'), active: activeFilter === "photo" },
    { id: "video" as PostType, label: t('feed.videoPosts'), active: activeFilter === "video" },
  ];

  if (!user) return null;

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 flex flex-col">
      <Navbar />
      
      {/* Main Content */}
      <main className="main-content flex-1 pt-8 pb-6">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          {/* Filters and Create Post Button */}
          <div className={`space-y-4 mb-6 ${isMobile ? 'mt-6' : 'mt-4'}`}>
            {/* Filters */}
            <div className="grid grid-cols-4 gap-2">
            {filters.map((filter) => (
              <Button
                key={filter.id}
                variant={filter.active ? "default" : "outline"}
                size="sm"
                onClick={() => setActiveFilter(filter.id)}
                className={`w-full whitespace-nowrap ${
                  filter.active 
                    ? 'text-white border-none shadow-md hover:opacity-90' 
                    : 'bg-white border-gray-300 text-gray-700 hover:bg-gray-50'
                }`}
                style={filter.active ? { backgroundColor: '#283E51' } : {}}
              >
                {filter.label}
              </Button>
            ))}
          </div>

          {/* Create Post Button */}
          <Button
            onClick={() => setIsCreateModalOpen(true)}
            className="w-full text-white font-semibold shadow-lg transform transition-all duration-200 hover:scale-[1.02] hover:shadow-xl"
            style={{
              backgroundImage: 'linear-gradient(to right, #4B79A1 0%, #283E51 51%, #4B79A1 100%)',
              backgroundSize: '200% auto',
              transition: 'background-position 0.5s ease'
            }}
            size="lg"
            onMouseEnter={(e) => {
              e.currentTarget.style.backgroundPosition = 'right center';
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.backgroundPosition = 'left center';
            }}
          >
            <Plus className="h-5 w-5 mr-2" />
            {t('feed.createPost')}
          </Button>
        </div>

        {/* Posts Feed */}
        {isLoadingPosts ? (
          <div className="flex justify-center items-center py-12">
            <Loader2 className="h-8 w-8 animate-spin text-blue-600" />
          </div>
        ) : posts.length === 0 ? (
          <div className="text-center py-12">
            <div className="max-w-md mx-auto">
              <div className="h-16 w-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <Plus className="h-8 w-8 text-gray-400" />
              </div>
              <h3 className="text-lg font-semibold text-gray-900 mb-2">{t('feed.noPostsTitle')}</h3>
              <p className="text-gray-600 mb-4">{t('feed.noPostsDescription')}</p>
              <Button
                onClick={() => setIsCreateModalOpen(true)}
                className="text-white font-semibold shadow-lg transform transition-all duration-200 hover:scale-[1.02]"
                style={{
                  backgroundImage: 'linear-gradient(to right, #4B79A1 0%, #283E51 51%, #4B79A1 100%)',
                  backgroundSize: '200% auto',
                  transition: 'background-position 0.5s ease'
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.backgroundPosition = 'right center';
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.backgroundPosition = 'left center';
                }}
              >
                {t('feed.createFirstPost')}
              </Button>
            </div>
          </div>
        ) : (
          <div className="space-y-6">
            {posts.map((post: any) => (
              <PostCard
                key={post.id}
                post={post}
                currentUser={user}
                onGivePoint={handleGivePoint}
                onComment={handleCommentClick}
                onReport={handleReportPost}
                onDelete={handleDeletePost}
                onUserClick={handleUserClick}
              />
            ))}
          </div>
        )}
        </div>
      </main>

      {/* Modals */}
      <CreatePostModal
        isOpen={isCreateModalOpen}
        onClose={() => setIsCreateModalOpen(false)}
      />

      <CommentModal
        isOpen={isCommentModalOpen}
        onClose={() => setIsCommentModalOpen(false)}
        post={selectedPost}
      />

      <Footer />
    </div>
  );
}