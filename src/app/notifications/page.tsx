"use client";

// pages/notifications.tsx
import { NotificationsSkeleton } from "@/components/NotificationSkeleton";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useNotifications } from "../hooks/useNotificationRealtime";
import NotificationsComponent from "./_components/notifications";
import RejectedComponent from "./_components/Rejected";
import RequestsComponent from "./_components/Requests";

function NotificationsPage() {
  const { notifications, isLoading } = useNotifications();

  if (isLoading) return <NotificationsSkeleton />;

  return (
    <div className="space-y-4 max-w-lg w-full">
      {/* Tabs */}

      <Tabs defaultValue="notifications" className="w-full">
        <TabsList className="grid grid-cols-3 w-full">
          <TabsTrigger value="notifications" className="w-full">
            Notifications
          </TabsTrigger>
          <TabsTrigger value="requests" className="w-full">
            Requests
          </TabsTrigger>
          <TabsTrigger value="rejected" className="w-full">
            Rejected
          </TabsTrigger>
        </TabsList>
        <TabsContent value="notifications">
          <NotificationsComponent notifications={notifications} />
        </TabsContent>
        <TabsContent value="requests">
          <RequestsComponent />
        </TabsContent>
        <TabsContent value="rejected">
          <RejectedComponent />
        </TabsContent>
      </Tabs>
    </div>
  );
}

export default NotificationsPage;
