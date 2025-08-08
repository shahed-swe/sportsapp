import { useState, useEffect } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { useTranslation } from "react-i18next";
import { useLocation, useParams } from "wouter";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Navbar } from "@/components/navbar";
import { Footer } from "@/components/footer";
import { PostCard } from "@/components/post-card";
import { useAuth } from "@/hooks/use-auth";
import { apiRequest, queryClient } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import { 
  User, 
  Edit, 
  Award, 
  CheckCircle, 
  Clock, 
  X, 
  Gift,
  Shield,
  MapPin,
  Calendar,
  Users,
  FileText,
  Star,
  Plus,
  Camera
} from "lucide-react";
import { CommentModal } from "@/components/comment-modal";

interface UserProfile {
  id: number;
  fullName: string;
  username: string;
  userType: string;
  email: string;
  bio?: string;
  profilePicture?: string;
  isVerified: boolean;
  verificationStatus: string;
  verificationRequestDate?: string;
  points: number;
  createdAt: string;
  postsCount?: number;
}

export default function UserProfilePage() {
  const { t } = useTranslation();
  const params = useParams();
  const userId = params.id ? parseInt(params.id) : null;
  const { user: currentUser } = useAuth();
  const { toast } = useToast();
  const [, setLocation] = useLocation();
  
  const [editMode, setEditMode] = useState(false);
  const [editedProfile, setEditedProfile] = useState<Partial<UserProfile>>({});
  const [verificationDialogOpen, setVerificationDialogOpen] = useState(false);
  const [showRedeemHistory, setShowRedeemHistory] = useState(false);
  const [usernameAvailability, setUsernameAvailability] = useState<{available: boolean; suggestions?: string[]}>({ available: true });
  const [profilePictureFile, setProfilePictureFile] = useState<File | null>(null);
  const [selectedPost, setSelectedPost] = useState<any>(null);
  const [isCommentModalOpen, setIsCommentModalOpen] = useState(false);

  // If no userId provided, show current user's profile
  const targetUserId = userId || currentUser?.id;
  const isOwnProfile = targetUserId === currentUser?.id;

  // Fetch user profile data with real-time updates for points
  const { data: userProfile, isLoading: profileLoading } = useQuery<UserProfile>({
    queryKey: ["/api/users/profile", targetUserId],
    queryFn: async () => {
      const response = await apiRequest("GET", `/api/users/${targetUserId}/profile`);
      return await response.json();
    },
    enabled: !!targetUserId,
    refetchInterval: 2000, // Auto-refresh every 2 seconds for real-time points updates
    refetchOnWindowFocus: true,
  });

  // Fetch user's redemption history with real-time optimizations
  const { data: redemptionHistory = [] } = useQuery({
    queryKey: ["/api/users", targetUserId, "redemptions"],
    queryFn: async () => {
      const response = await apiRequest("GET", `/api/users/${targetUserId}/redemptions`);
      return await response.json();
    },
    enabled: !!targetUserId && isOwnProfile,
    staleTime: 10000, // Consider data fresh for 10 seconds
    gcTime: 5 * 60 * 1000, // Keep in cache for 5 minutes
    refetchOnWindowFocus: true,
    refetchInterval: 30000, // Auto-refetch every 30 seconds for real-time updates
  });

  // Fetch user's posts with real-time updates
  const { data: userPosts = [], isLoading: postsLoading } = useQuery({
    queryKey: ["/api/users", targetUserId, "posts"],
    queryFn: async () => {
      const response = await apiRequest("GET", `/api/users/${targetUserId}/posts`);
      return await response.json();
    },
    enabled: !!targetUserId,
    refetchInterval: 3000, // Auto-refresh every 3 seconds for real-time post updates
    refetchOnWindowFocus: true,
  });

  // Use points from user profile (this is the correct source)
  const totalPoints = userProfile?.points || 0;

  // Update profile mutation
  const updateProfileMutation = useMutation({
    mutationFn: async (profileData: Partial<UserProfile>) => {
      const response = await apiRequest("PUT", `/api/users/${currentUser?.id}/profile`, profileData);
      return await response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/users/profile"] });
      queryClient.invalidateQueries({ queryKey: ["/api/users/profile", currentUser?.id] });
      setEditMode(false);
      toast({
        title: "Profile updated",
        description: "Your profile has been updated successfully.",
      });
    },
    onError: (error: any) => {
      toast({
        title: "Update failed",
        description: error.message,
        variant: "destructive",
      });
    },
  });

  // Request verification mutation
  const requestVerificationMutation = useMutation({
    mutationFn: async () => {
      const response = await apiRequest("POST", `/api/users/${currentUser?.id}/request-verification`);
      return await response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/users/profile"] });
      queryClient.invalidateQueries({ queryKey: ["/api/users/profile", currentUser?.id] });
      setVerificationDialogOpen(false);
      toast({
        title: "Verification requested",
        description: "Your verification request has been submitted for review.",
      });
    },
    onError: (error: any) => {
      toast({
        title: "Request failed",
        description: error.message,
        variant: "destructive",
      });
    },
  });

  // Post actions
  const givePointMutation = useMutation({
    mutationFn: async (postId: number) => {
      const response = await apiRequest("POST", `/api/posts/${postId}/point`);
      return await response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/users", targetUserId, "posts"] });
      queryClient.invalidateQueries({ queryKey: ["/api/posts"] });
      queryClient.invalidateQueries({ queryKey: ["/api/users/profile", targetUserId] });
      toast({
        title: "Point given!",
        description: "You gave a point to this post.",
      });
    },
    onError: (error: any) => {
      toast({
        title: "Error",
        description: error.message || "Failed to give point.",
        variant: "destructive",
      });
    },
  });

  const deletePostMutation = useMutation({
    mutationFn: async (postId: number) => {
      const response = await apiRequest("DELETE", `/api/posts/${postId}`);
      return await response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/users", targetUserId, "posts"] });
      queryClient.invalidateQueries({ queryKey: ["/api/posts"] });
      queryClient.invalidateQueries({ queryKey: ["/api/users/profile", targetUserId] });
      toast({
        title: "Post deleted",
        description: "Your post has been deleted successfully.",
      });
    },
    onError: (error: any) => {
      toast({
        title: "Error",
        description: error.message || "Failed to delete post.",
        variant: "destructive",
      });
    },
  });

  const reportPostMutation = useMutation({
    mutationFn: async (postId: number) => {
      const response = await apiRequest("POST", `/api/posts/${postId}/report`);
      return await response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/posts"] });
      toast({
        title: "Post reported",
        description: "Thank you for reporting. We'll review this post.",
      });
    },
    onError: (error: any) => {
      toast({
        title: "Error",
        description: error.message || "Failed to report post.",
        variant: "destructive",
      });
    },
  });

  const handleEditSubmit = async () => {
    if (!usernameAvailability.available) {
      toast({
        title: "Username not available",
        description: "Please choose a different username.",
        variant: "destructive",
      });
      return;
    }
    
    let profileData = { ...editedProfile };
    
    // Handle profile picture upload if a file is selected
    if (profilePictureFile) {
      try {
        const formData = new FormData();
        formData.append('profilePicture', profilePictureFile);
        
        const uploadResponse = await fetch(`/api/users/${currentUser?.id}/profile-picture`, {
          method: 'POST',
          body: formData,
          credentials: 'include',
        });
        
        if (uploadResponse.ok) {
          const uploadResult = await uploadResponse.json();
          profileData.profilePicture = uploadResult.profilePicture;
        } else {
          throw new Error('Failed to upload profile picture');
        }
      } catch (error) {
        toast({
          title: "Upload failed",
          description: "Failed to upload profile picture. Please try again.",
          variant: "destructive",
        });
        return;
      }
    }
    
    updateProfileMutation.mutate(profileData);
  };

  // Check username availability when it changes
  const checkUsernameAvailability = async (username: string) => {
    if (username === userProfile?.username) {
      setUsernameAvailability({ available: true });
      return;
    }

    try {
      const response = await apiRequest("POST", "/api/check-username-availability", {
        username,
        currentUserId: currentUser?.id,
      });
      const result = await response.json();
      setUsernameAvailability(result);
    } catch (error) {
      console.error("Error checking username availability:", error);
    }
  };

  const handleRequestVerification = () => {
    requestVerificationMutation.mutate();
  };

  const handleGivePoint = (postId: number) => {
    givePointMutation.mutate(postId);
  };

  const handleDeletePost = (postId: number) => {
    deletePostMutation.mutate(postId);
  };

  const handleReportPost = (postId: number) => {
    reportPostMutation.mutate(postId);
  };

  const handleComment = (post: any) => {
    setSelectedPost(post);
    setIsCommentModalOpen(true);
  };

  const handleUserClick = (userId: number) => {
    setLocation(`/profile/${userId}`);
  };

  const getVerificationButton = () => {
    if (!isOwnProfile || userProfile?.isVerified) return null;

    switch (userProfile?.verificationStatus) {
      case "pending":
        return (
          <Button variant="outline" disabled className="w-full">
            <Clock className="h-4 w-4 mr-2" />
            Verification Under Review
          </Button>
        );
      case "rejected":
        return (
          <Dialog open={verificationDialogOpen} onOpenChange={setVerificationDialogOpen}>
            <DialogTrigger asChild>
              <Button variant="outline" className="w-full text-red-600 border-red-600">
                <X className="h-4 w-4 mr-2" />
                Rejected, Try Again
              </Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Request Verification</DialogTitle>
              </DialogHeader>
              <div className="space-y-4">
                <p className="text-sm text-gray-600">
                  Make sure your profile contains only sports-related content, enough number of posts, 
                  and has recent activity within the past week. Our team will review your profile.
                </p>
                <Button 
                  onClick={handleRequestVerification}
                  disabled={requestVerificationMutation.isPending}
                  className="w-full"
                >
                  {requestVerificationMutation.isPending ? "Requesting..." : "Request Verification"}
                </Button>
              </div>
            </DialogContent>
          </Dialog>
        );
      default:
        return (
          <Dialog open={verificationDialogOpen} onOpenChange={setVerificationDialogOpen}>
            <DialogTrigger asChild>
              <Button variant="outline" className="w-full">
                <Award className="h-4 w-4 mr-2" />
                Verify Yourself
              </Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Request Verification</DialogTitle>
              </DialogHeader>
              <div className="space-y-4">
                <p className="text-sm text-gray-600">
                  Make sure your profile contains only sports-related content, enough number of posts, 
                  and has recent activity within the past week. Our team will review your profile.
                </p>
                <Button 
                  onClick={handleRequestVerification}
                  disabled={requestVerificationMutation.isPending}
                  className="w-full"
                >
                  {requestVerificationMutation.isPending ? "Requesting..." : "Request Verification"}
                </Button>
              </div>
            </DialogContent>
          </Dialog>
        );
    }
  };

  if (profileLoading) {
    return (
      <div className="min-h-screen bg-gray-50">
        <Navbar />
        <div className="flex items-center justify-center min-h-[50vh]">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
            <p className="text-gray-600">Loading profile...</p>
          </div>
        </div>
      </div>
    );
  }

  if (!userProfile) {
    return (
      <div className="min-h-screen bg-gray-50">
        <Navbar />
        <div className="flex items-center justify-center min-h-[50vh]">
          <div className="text-center">
            <h1 className="text-2xl font-bold text-gray-900 mb-2">User Not Found</h1>
            <p className="text-gray-600 mb-4">The user you're looking for doesn't exist.</p>
            <Button onClick={() => setLocation("/feed")}>Back to Feed</Button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 flex flex-col">
      <Navbar />
      
      <main className="main-content flex-1 pt-8 pb-6">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          {/* Profile Header */}
          <Card className="mb-6" style={{ backgroundColor: 'rgba(40, 62, 81, 0.08)' }}>
            <CardContent className="p-6">
              <div className="flex flex-col md:flex-row items-start md:items-center gap-6">
                {/* Profile Picture */}
              <Avatar className="h-24 w-24 md:h-32 md:w-32">
                {userProfile.profilePicture ? (
                  <AvatarImage src={userProfile.profilePicture} alt={userProfile.fullName} />
                ) : null}
                <AvatarFallback className="text-2xl">
                  {userProfile.fullName.split(' ').map(n => n[0]).join('')}
                </AvatarFallback>
              </Avatar>

              {/* Profile Info */}
              <div className="flex-1 space-y-4">
                <div>
                  <div className="flex items-center gap-2 mb-2">
                    <h1 className="text-3xl font-semibold text-gray-900">{userProfile.fullName}</h1>
                    {userProfile.isVerified && (
                      <CheckCircle className="h-6 w-6 text-blue-600" />
                    )}
                  </div>
                  <div className="flex items-center gap-2 mb-2">
                    <span className="text-gray-600">@{userProfile.username}</span>
                    <Badge variant="secondary">{userProfile.userType}</Badge>
                  </div>
                  <p className="text-gray-600">
                    {userProfile.bio || "No bio added"}
                  </p>
                </div>

                {/* Stats */}
                <div className="flex gap-6">
                  <div className="text-center">
                    <div className="text-2xl font-bold text-gray-900">{userPosts.length}</div>
                    <div className="text-sm text-gray-600">Posts</div>
                  </div>
                  {isOwnProfile && (
                    <div className="text-center">
                      <div className="text-2xl font-bold text-blue-600">{totalPoints}</div>
                      <div className="text-sm text-gray-600">Available Points</div>
                    </div>
                  )}
                </div>
              </div>

              {/* Action Buttons */}
              {isOwnProfile && (
                <div className="flex flex-col gap-3 w-full md:w-auto">
                  <Button 
                    variant="outline" 
                    onClick={() => setEditMode(true)}
                    className="w-full"
                  >
                    <Edit className="h-4 w-4 mr-2" />
                    {t('profile.editProfile')}
                  </Button>
                  
                  {getVerificationButton()}
                  
                  {userProfile.isVerified && (
                    <div className="flex gap-2">
                      <Button 
                        variant="default"
                        onClick={() => setLocation("/redeem-points")}
                        className="flex-1 bg-green-600 hover:bg-green-700"
                      >
                        <Gift className="h-4 w-4 mr-2" />
                        {t('common.save') === 'Save' ? 'Redeem' : (t('common.save') === 'सहेजें' ? 'रिडीम' : 'Redeem')}
                      </Button>
                      <Button 
                        variant="outline"
                        onClick={() => setShowRedeemHistory(true)}
                        className="flex-1"
                      >
                        <FileText className="h-4 w-4 mr-2" />
                        {t('common.save') === 'Save' ? 'History' : (t('common.save') === 'सहेजें' ? 'इतिहास' : 'History')}
                      </Button>
                    </div>
                  )}

                  {userProfile.verificationStatus === "pending" && (
                    <p className="text-xs text-gray-500 text-center">
                      (You need to be verified to redeem your points.)
                    </p>
                  )}
                </div>
              )}
              </div>
            </CardContent>
          </Card>

          {/* Posts Section */}
          <div className="space-y-6">
            <h2 className="text-2xl font-bold text-gray-900">Posts</h2>
            
            {postsLoading ? (
            <div className="text-center py-8">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto mb-4"></div>
              <p className="text-gray-600">Loading posts...</p>
            </div>
          ) : userPosts.length === 0 ? (
            <Card>
              <CardContent className="text-center py-12">
                <FileText className="h-16 w-16 text-gray-400 mx-auto mb-4" />
                <h3 className="text-xl font-semibold text-gray-900 mb-2">No posts yet</h3>
                <p className="text-gray-600">
                  {isOwnProfile ? "Start sharing your sports journey!" : "This user hasn't posted anything yet."}
                </p>
              </CardContent>
            </Card>
          ) : (
            <div className="space-y-6">
              {userPosts.map((post: any) => (
                <PostCard
                  key={post.id}
                  post={post}
                  currentUser={currentUser!}
                  onGivePoint={handleGivePoint}
                  onComment={handleComment}
                  onReport={handleReportPost}
                  onDelete={handleDeletePost}
                  onUserClick={handleUserClick}
                />
              ))}
            </div>
            )}
          </div>
        </div>
      </main>

      {/* Edit Profile Modal */}
      <Dialog open={editMode} onOpenChange={setEditMode}>
        <DialogContent className="sm:max-w-[425px]">
          <DialogHeader>
            <DialogTitle>{t('profile.editProfile')}</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <div>
              <Label htmlFor="username">{t('profile.username')}</Label>
              <Input
                id="username"
                value={editedProfile.username || userProfile.username}
                onChange={(e) => {
                  const newUsername = e.target.value;
                  setEditedProfile({...editedProfile, username: newUsername});
                  if (newUsername !== userProfile.username && newUsername.length > 0) {
                    checkUsernameAvailability(newUsername);
                  } else {
                    setUsernameAvailability({ available: true });
                  }
                }}
              />
              {!usernameAvailability.available && (
                <div className="text-sm text-red-600 mt-1">
                  {t('profile.usernameNotAvailable')}: {usernameAvailability.suggestions?.join(', ')}
                </div>
              )}
            </div>
            <div>
              <Label htmlFor="profilePicture">
                {t('common.save') === 'सहेजें' ? 'प्रोफाइल फोटो' : 'Profile Picture'}
              </Label>
              <div className="flex items-center gap-4">
                <div className="relative">
                  <Avatar className="h-16 w-16">
                    {profilePictureFile ? (
                      <img 
                        src={URL.createObjectURL(profilePictureFile)} 
                        alt="Profile preview" 
                        className="h-full w-full object-cover"
                      />
                    ) : userProfile?.profilePicture ? (
                      <AvatarImage src={userProfile.profilePicture} alt={userProfile.fullName} />
                    ) : null}
                    <AvatarFallback>
                      {userProfile?.fullName?.split(' ').map((n: string) => n[0]).join('').toUpperCase()}
                    </AvatarFallback>
                  </Avatar>
                  <Button
                    type="button"
                    size="sm"
                    variant="outline"
                    className="absolute -bottom-2 -right-2 h-8 w-8 rounded-full p-0"
                    onClick={() => document.getElementById('profilePictureInput')?.click()}
                  >
                    <Plus className="h-4 w-4" />
                  </Button>
                </div>
                <input
                  id="profilePictureInput"
                  type="file"
                  accept="image/*"
                  className="hidden"
                  onChange={(e) => {
                    const file = e.target.files?.[0];
                    if (file) {
                      setProfilePictureFile(file);
                      setEditedProfile({...editedProfile, profilePicture: file.name});
                    }
                  }}
                />

              </div>
            </div>
            <div>
              <Label htmlFor="fullName">{t('profile.fullName')}</Label>
              <Input
                id="fullName"
                value={editedProfile.fullName || userProfile.fullName}
                onChange={(e) => setEditedProfile({...editedProfile, fullName: e.target.value})}
              />
            </div>
            <div>
              <Label htmlFor="bio">
                {t('common.save') === 'सहेजें' ? 'बायो' : 'Bio'}
              </Label>
              <Textarea
                id="bio"
                placeholder={t('profile.bioPlaceholder')}
                value={editedProfile.bio || userProfile.bio || ""}
                onChange={(e) => setEditedProfile({...editedProfile, bio: e.target.value})}
              />
            </div>
            <div className="flex gap-2">
              <Button 
                onClick={handleEditSubmit}
                disabled={updateProfileMutation.isPending}
                className="flex-1 text-white font-semibold shadow-lg transform transition-all duration-200 hover:scale-[1.02] rounded-lg"
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
                {updateProfileMutation.isPending ? t('profile.saving') : t('profile.saveChanges')}
              </Button>
              <Button variant="outline" onClick={() => setEditMode(false)}>
                {t('common.cancel')}
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      {/* Redeem History Modal */}
      <Dialog open={showRedeemHistory} onOpenChange={setShowRedeemHistory}>
        <DialogContent className="sm:max-w-[600px]">
          <DialogHeader>
            <DialogTitle>{t('redeem.redeemHistory', { defaultValue: 'Redeem History' })}</DialogTitle>
          </DialogHeader>
          <div className="space-y-4 max-h-[400px] overflow-y-auto">
            {redemptionHistory.length === 0 ? (
              <div className="text-center py-8">
                <Gift className="h-16 w-16 text-gray-400 mx-auto mb-4" />
                <p className="text-gray-600">{t('profile.noRedemptionHistory')}</p>
              </div>
            ) : (
              redemptionHistory.map((redemption: any) => (
                <div key={redemption.id} className="p-4 border rounded-lg space-y-2">
                  <div className="flex justify-between items-start">
                    <div>
                      <div className="font-medium">₹{Math.floor(redemption.pointsRedeemed / 5)}</div>
                      <div className="text-sm text-gray-600">
                        {redemption.pointsRedeemed} {t('redeem.points')} • {redemption.email}
                      </div>
                      <div className="text-xs text-gray-500">
                        {new Date(redemption.createdAt).toLocaleDateString()}
                      </div>
                    </div>
                    <Badge 
                      className={
                        redemption.status === "approved" 
                          ? "bg-green-600" 
                          : redemption.status === "rejected"
                          ? "bg-red-600"
                          : "bg-orange-500"
                      }
                    >
                      {redemption.status === "under review" 
                        ? t('redeem.statusUnderReview')
                        : redemption.status === "approved"
                        ? t('redeem.statusApproved') 
                        : redemption.status === "rejected"
                        ? t('redeem.statusRejected')
                        : redemption.status
                      }
                    </Badge>
                  </div>
                  <div className="text-sm">
                    {redemption.status === "approved" && (
                      <p className="text-green-700 bg-green-50 p-2 rounded">
                        {t('redeem.approvedMessage', { defaultValue: 'Your voucher has been approved and sent to your email.' })}
                      </p>
                    )}
                    {redemption.status === "rejected" && (
                      <p className="text-red-700 bg-red-50 p-2 rounded">
                        {t('redeem.rejectedMessage', { defaultValue: 'Your redemption request was rejected.' })}
                      </p>
                    )}
                    {redemption.status === "under review" && (
                      <p className="text-orange-700 bg-orange-50 p-2 rounded">
                        {t('redeem.underReviewMessage', { defaultValue: 'Your redemption request is under review.' })}
                      </p>
                    )}
                  </div>
                </div>
              ))
            )}
          </div>
        </DialogContent>
      </Dialog>

      {/* Comment Modal */}
      <CommentModal
        isOpen={isCommentModalOpen}
        onClose={() => setIsCommentModalOpen(false)}
        post={selectedPost}
      />

      <Footer />
    </div>
  );
}