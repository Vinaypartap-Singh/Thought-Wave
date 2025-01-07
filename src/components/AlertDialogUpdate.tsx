"use client";

import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import { Button } from "@/components/ui/button";
import { Loader2Icon, NotebookPen } from "lucide-react";

interface AlertDialogUpdateProps {
  isLoading: boolean;
  btnFunction: () => Promise<void>;
  title?: string;
  description?: string;
  postId: string;
}

export function AlertDialogUpdate({
  isLoading,
  btnFunction,
  title = "Update Post",
  description = "Only content can be updated.",
  postId,
}: AlertDialogUpdateProps) {
  return (
    <AlertDialog>
      <AlertDialogTrigger asChild>
        <Button
          variant="ghost"
          size="sm"
          className="text-muted-foreground hover:text-red-500 -mr-2"
        >
          {isLoading ? (
            <Loader2Icon className="size-4 animate-spin" />
          ) : (
            <NotebookPen className="size-4" />
          )}
        </Button>
      </AlertDialogTrigger>
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>{title}</AlertDialogTitle>
          <AlertDialogDescription>{description}</AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogCancel>Cancel</AlertDialogCancel>
          <AlertDialogAction
            onClick={btnFunction}
            className="bg-red-500 hover:bg-red-600"
            disabled={isLoading}
          >
            {isLoading ? "Deleting..." : "Delete"}
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
}
