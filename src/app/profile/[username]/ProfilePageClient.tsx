"use client";

import {
  getPublicUserInfo,
  getUserPosts,
  updateProfile,
  updateProfileImage,
} from "@/actions/profile.action";
import { sendChatRequest, toggleFollow } from "@/actions/user.action";
import PostCard from "@/components/PostCard";
import { Avatar, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import {
  Dialog,
  DialogClose,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Separator } from "@/components/ui/separator";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Textarea } from "@/components/ui/textarea";
import { useToast } from "@/hooks/use-toast";
import { uploadImageToSupabase } from "@/lib/uploadImageToSupabase";
import { SignInButton, useUser } from "@clerk/nextjs";
import { format } from "date-fns";
import {
  CalendarIcon,
  EditIcon,
  FileTextIcon,
  HeartIcon,
  ImageIcon,
  LinkIcon,
  MapPinIcon,
  X,
} from "lucide-react";
import Link from "next/link";
import { useState } from "react";
import MessageRequestButton from "./_components/MessageRequestButton";

type User = Awaited<ReturnType<typeof getPublicUserInfo>>;
type Posts = Awaited<ReturnType<typeof getUserPosts>>;

interface ProfilePageClientProps {
  user: NonNullable<User>;
  posts: Posts;
  likedPosts: Posts;
  isFollowing: boolean;
  currentProfileImage?: string;
}

export enum ProfileType {
  PUBLIC = "PUBLIC",
  PRIVATE = "PRIVATE",
}

function ProfilePageClient({
  isFollowing: initialIsFollowing,
  likedPosts,
  posts,
  user,
}: ProfilePageClientProps) {
  const { toast } = useToast();
  const { user: currentUser } = useUser();
  const [showEditDialog, setShowEditDialog] = useState(false);
  const [isFollowing, setIsFollowing] = useState(initialIsFollowing);
  const [isUpdatingFollow, setIsUpdatingFollow] = useState(false);
  const [showProfileImageDialog, setShowProfileImageDialog] = useState(false);

  // Chat Requested

  const [sendingChatRequest, setSendingChatRequest] = useState(false);

  // Use State for Edit Profile Form

  const [imageUrl, setImageUrl] = useState<string | null>(null);
  const [uploading, setUploading] = useState(false);
  const [isPosting, setIsPosting] = useState(false);

  const [editForm, setEditForm] = useState({
    name: user.name || "",
    bio: user.bio || "",
    location: user.location || "",
    website: user.website || "",
    profileType: (user.profileType as ProfileType) || ProfileType.PUBLIC,
  });

  const handleEditSubmit = async () => {
    const formData = new FormData();
    Object.entries(editForm).forEach(([key, value]) => {
      formData.append(key, value);
    });

    const result = await updateProfile(formData);
    if (result.success) {
      setShowEditDialog(false);
      toast({
        title: "Profile updated successfully",
        description: "Your profile has been updated successfully",
      });
    }
  };

  const handleFileChange = async (
    event: React.ChangeEvent<HTMLInputElement>
  ) => {
    const file = event.target.files?.[0];
    if (!file) return;

    setUploading(true);

    try {
      const url = await uploadImageToSupabase(file);
      if (url) {
        setImageUrl(url);
        toast({ title: "Image uploaded successfully" });
      }
    } catch (error) {
      console.error("Image upload failed:", error);
      toast({ title: "Failed to upload image", variant: "destructive" });
    } finally {
      setUploading(false);
    }
  };

  const handleProfileImageUpdate = async () => {
    try {
      const result = await updateProfileImage(imageUrl ?? user.image!);
      await currentUser?.update({
        unsafeMetadata: {
          imageUrl: imageUrl ?? user.image!,
        },
      });
      if (result.success) {
        setShowProfileImageDialog(false);
        toast({
          title: "Profile image updated successfully",
          description: "Your profile image has been updated successfully",
        });
      }
    } catch (error) {
      toast({
        variant: "destructive",
        title: "Failed to update profile image",
        description: error instanceof Error ? error.message : String(error),
      });
      console.log(error);
    }
  };

  const handleFollow = async () => {
    if (!currentUser) return;

    try {
      setIsUpdatingFollow(true);
      await toggleFollow(user.id);
      setIsFollowing(!isFollowing);
    } catch (error) {
      toast({
        variant: "destructive",
        title: "Failed to update follow status",
        description: error instanceof Error ? error.message : String(error),
      });
    } finally {
      setIsUpdatingFollow(false);
    }
  };

  const handleMessageSentRequest = async (userId: string) => {
    try {
      setSendingChatRequest(true);

      // Attempt to send the chat request and get the result
      const response = await sendChatRequest(userId);

      toast({
        title: "Message request sent",
        description: `Your message request has been sent to ${user.username}`,
      });
    } catch (error) {
      toast({
        variant: "destructive",
        title: "Failed to send message request",
        description: error instanceof Error ? error.message : String(error),
      });
    } finally {
      setSendingChatRequest(false);
    }
  };

  const isOwnProfile =
    currentUser?.username === user.username ||
    currentUser?.emailAddresses[0].emailAddress.split("@")[0] === user.username;

  const formattedDate = format(new Date(user.createdAt), "MMMM yyyy");

  return (
    <div className="max-w-lg">
      <div className="grid grid-cols-1 gap-6">
        <div className="w-full max-w-lg">
          <Card className="bg-card">
            <CardContent className="pt-6">
              <div className="flex flex-col">
                <Avatar className="w-24 h-24 object-cover">
                  <AvatarImage
                    src={user.image ?? "/avatar.png"}
                    className="object-cover"
                  />
                </Avatar>
                <h1 className="mt-4 text-2xl font-bold">
                  {user.name ?? user.username}
                </h1>
                <p className="text-muted-foreground">@{user.username}</p>
                <p className="mt-2 text-sm">{user.bio}</p>

                {/* PROFILE STATS */}
                <div className="w-full mt-6">
                  <div className="flex justify-between mb-4">
                    <Link href={`/following/${user.username}`}>
                      <div className="font-semibold text-center">
                        {user._count.following.toLocaleString()}
                      </div>
                      <div className="text-sm text-muted-foreground">
                        Following
                      </div>
                    </Link>
                    <Separator orientation="vertical" />
                    <Link href={`/followers/${user.username}`}>
                      <div className="font-semibold text-center">
                        {user._count.followers.toLocaleString()}
                      </div>
                      <div className="text-sm text-muted-foreground">
                        Followers
                      </div>
                    </Link>
                    <Separator orientation="vertical" />
                    <div>
                      <div className="font-semibold text-center">
                        {user._count.posts.toLocaleString()}
                      </div>
                      <div className="text-sm text-muted-foreground">Posts</div>
                    </div>
                  </div>
                </div>

                {/* "FOLLOW & EDIT PROFILE" BUTTONS */}
                {!currentUser ? (
                  <SignInButton mode="modal">
                    <Button className="w-full mt-4">Follow</Button>
                  </SignInButton>
                ) : isOwnProfile ? (
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    <Button
                      className="w-full mt-4"
                      onClick={() => setShowEditDialog(true)}
                    >
                      <EditIcon className="size-4 mr-2" />
                      Edit Profile
                    </Button>

                    <Button
                      className="w-full mt-4"
                      onClick={() => setShowProfileImageDialog(true)}
                    >
                      <EditIcon className="size-4 mr-2" />
                      Update Profile Image
                    </Button>
                  </div>
                ) : (
                  <div className="flex flex-col md:flex-row  gap-4">
                    <Button
                      className="w-full mt-4 md:mt-0 md:w-1/2"
                      onClick={handleFollow}
                      disabled={isUpdatingFollow}
                      variant={isFollowing ? "outline" : "default"}
                    >
                      {isFollowing ? "Unfollow" : "Follow"}
                    </Button>
                    <MessageRequestButton
                      userId={user.id}
                      handleMessageSentRequest={handleMessageSentRequest}
                      sendingChatRequest={sendingChatRequest}
                    />
                    {/* <Button
                      className="w-full md:w-1/2"
                      onClick={() => handleMessageSentRequest(user.id)}
                    >
                      {sendingChatRequest ? "Sending..." : "Message"}
                    </Button> */}
                  </div>
                )}

                {/* LOCATION & WEBSITE */}
                <div className="w-full mt-6 space-y-2 text-sm">
                  {user.location && (
                    <div className="flex items-center text-muted-foreground">
                      <MapPinIcon className="size-4 mr-2" />
                      {user.location}
                    </div>
                  )}
                  {user.website && (
                    <div className="flex items-center text-muted-foreground">
                      <LinkIcon className="size-4 mr-2" />
                      <a
                        href={
                          user.website.startsWith("http")
                            ? user.website
                            : `https://${user.website}`
                        }
                        className="hover:underline"
                        target="_blank"
                        rel="noopener noreferrer"
                      >
                        {user.website}
                      </a>
                    </div>
                  )}
                  <div className="flex items-center text-muted-foreground">
                    <CalendarIcon className="size-4 mr-2" />
                    Joined {formattedDate}
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        <Tabs defaultValue="posts" className="w-full">
          <TabsList className="w-full justify-start border-b rounded-none h-auto p-0 bg-transparent">
            <TabsTrigger
              value="posts"
              className="flex items-center gap-2 rounded-none data-[state=active]:border-b-2 data-[state=active]:border-primary
               data-[state=active]:bg-transparent px-6 font-semibold"
            >
              <FileTextIcon className="size-4" />
              Your Posts
            </TabsTrigger>
            <TabsTrigger
              value="likes"
              className="flex items-center gap-2 rounded-none data-[state=active]:border-b-2 data-[state=active]:border-primary
               data-[state=active]:bg-transparent px-6 font-semibold"
            >
              <HeartIcon className="size-4" />
              Liked Posts
            </TabsTrigger>
          </TabsList>

          <TabsContent value="posts" className="mt-6">
            <div className="space-y-6">
              {posts.length > 0 ? (
                posts.map((post) => (
                  <PostCard key={post.id} post={post} dbUserId={user.id} />
                ))
              ) : (
                <div className="text-center py-8 text-muted-foreground">
                  No posts yet
                </div>
              )}
            </div>
          </TabsContent>

          <TabsContent value="likes" className="mt-6">
            <div className="space-y-6">
              {likedPosts.length > 0 ? (
                likedPosts.map((post) => (
                  <PostCard key={post.id} post={post} dbUserId={user.id} />
                ))
              ) : (
                <div className="text-center py-8 text-muted-foreground">
                  No liked posts to show
                </div>
              )}
            </div>
          </TabsContent>
        </Tabs>

        <Dialog open={showEditDialog} onOpenChange={setShowEditDialog}>
          <DialogContent className="sm:max-w-[500px]">
            <DialogHeader>
              <DialogTitle>Edit Profile</DialogTitle>
            </DialogHeader>
            <div className="space-y-4 py-4">
              <div className="space-y-2">
                <Label>Name</Label>
                <Input
                  name="name"
                  value={editForm.name}
                  onChange={(e) =>
                    setEditForm({ ...editForm, name: e.target.value })
                  }
                  placeholder="Your name"
                />
              </div>
              <div className="space-y-2">
                <Label>Bio</Label>
                <Textarea
                  name="bio"
                  value={editForm.bio}
                  onChange={(e) =>
                    setEditForm({ ...editForm, bio: e.target.value })
                  }
                  className="min-h-[100px]"
                  placeholder="Tell us about yourself"
                />
              </div>
              <div className="space-y-2">
                <Label>Location</Label>
                <Input
                  name="location"
                  value={editForm.location}
                  onChange={(e) =>
                    setEditForm({ ...editForm, location: e.target.value })
                  }
                  placeholder="Where are you based?"
                />
              </div>
              <div className="space-y-2">
                <Label>Website</Label>
                <Input
                  name="website"
                  value={editForm.website}
                  onChange={(e) =>
                    setEditForm({ ...editForm, website: e.target.value })
                  }
                  placeholder="Your personal website"
                />
              </div>

              <div className="space-y-2">
                <Label>Profile Type</Label>
                <Select
                  name="profileType"
                  value={editForm.profileType}
                  onValueChange={(value) =>
                    setEditForm({
                      ...editForm,
                      profileType: value as ProfileType,
                    })
                  }
                >
                  <SelectTrigger className="w-full">
                    <SelectValue placeholder="Select a timezone" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value={ProfileType.PUBLIC}>Public</SelectItem>
                    <SelectItem value={ProfileType.PRIVATE}>Private</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div className="flex justify-end gap-3">
              <DialogClose asChild>
                <Button variant="outline">Cancel</Button>
              </DialogClose>
              <Button onClick={handleEditSubmit}>Save Changes</Button>
            </div>
          </DialogContent>
        </Dialog>

        <Dialog
          open={showProfileImageDialog}
          onOpenChange={setShowProfileImageDialog}
        >
          <DialogContent className="sm:max-w-[500px]">
            <DialogHeader>
              <DialogTitle>Update Profile Image</DialogTitle>
            </DialogHeader>
            <div className="space-y-4 py-4">
              <div className="space-y-2">
                <Label>
                  <span className="text-red-500 font-bold text-lg">Note:</span>{" "}
                  To update your profile image, click the profile icon in the
                  top-right corner. Once updated, click here to sync the image
                  with the database.
                </Label>
              </div>

              {imageUrl && (
                <div className="relative size-40">
                  <img
                    src={imageUrl}
                    alt="Uploaded"
                    className="rounded-md size-40 object-cover"
                  />
                  <button
                    onClick={() => setImageUrl("")}
                    className="absolute top-0 right-0 p-1 bg-red-500 rounded-full shadow-sm"
                    type="button"
                  >
                    <X className="size-4" />
                  </button>
                </div>
              )}

              <div className="flex space-x-2">
                <Button
                  type="button"
                  variant="ghost"
                  size="sm"
                  className="text-muted-foreground hover:text-primary"
                  disabled={uploading || isPosting}
                >
                  <label className="cursor-pointer flex items-center">
                    <ImageIcon className="size-4 mr-2" />
                    <span>Photo</span>
                    <input
                      type="file"
                      accept="image/*"
                      className="hidden"
                      onChange={handleFileChange}
                    />
                  </label>
                </Button>
              </div>
            </div>

            <div className="flex justify-end gap-3">
              <DialogClose asChild>
                <Button variant="outline">Cancel</Button>
              </DialogClose>
              <Button
                onClick={handleProfileImageUpdate}
                disabled={uploading || isPosting || !imageUrl}
              >
                Update Image
              </Button>
            </div>
          </DialogContent>
        </Dialog>
      </div>
    </div>
  );
}
export default ProfilePageClient;
