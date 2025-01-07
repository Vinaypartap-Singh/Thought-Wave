"use client";

import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabaseClient";
import { useToast } from "@/hooks/use-toast";
import {
  getNotifications,
  markNotificationsAsRead,
} from "@/actions/notification.action";

export const useNotifications = () => {
  type Notifications = Awaited<ReturnType<typeof getNotifications>>;
  type Notification = Notifications[number];

  const { toast } = useToast();
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchNotifications = async () => {
      setIsLoading(true);
      try {
        const data = await getNotifications();
        setNotifications(data);

        const unreadIds = data.filter((n) => !n.read).map((n) => n.id);
        if (unreadIds.length > 0) await markNotificationsAsRead(unreadIds);
      } catch (error) {
        toast({
          variant: "destructive",
          title: "Failed to fetch notifications",
          description: error instanceof Error ? error.message : String(error),
        });
      } finally {
        setIsLoading(false);
      }
    };

    fetchNotifications();

    const notificationChannel = supabase
      .channel("custom-all-channel")
      .on(
        "postgres_changes",
        { event: "*", schema: "public", table: "Notification" },
        (payload) => {
          const newNotification = payload.new as Notification;

          // Append new notification to state
          try {
            setNotifications((prevNotifications) => [
              ...prevNotifications,
              newNotification,
            ]);
          } catch (error) {
            toast({
              variant: "destructive",
              title: "Failed to update notifications",
              description:
                error instanceof Error ? error.message : String(error),
            });
          }
        }
      )
      .subscribe();

    // Cleanup on unmount
    return () => {
      supabase.removeChannel(notificationChannel);
    };
  }, [toast]);

  return { notifications, isLoading };
};
