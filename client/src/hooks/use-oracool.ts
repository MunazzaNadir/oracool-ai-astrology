import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { api, buildUrl } from "@shared/routes";
import { type InsertUser, type ChatResponse, type Message } from "@shared/schema";
import { useToast } from "@/hooks/use-toast";
import { useLocation } from "wouter";

// === USER HOOKS ===

export function useCreateUser() {
  const { toast } = useToast();
  const [, setLocation] = useLocation();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (userData: InsertUser) => {
      const res = await fetch(api.users.create.path, {
        method: api.users.create.method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(userData),
      });

      if (!res.ok) {
        const error = await res.json();
        throw new Error(error.message || "Failed to create cosmic profile");
      }

      return api.users.create.responses[201].parse(await res.json());
    },
    onSuccess: (data) => {
      // Store ID in local storage for persistence across reloads
      localStorage.setItem("oracool_user_id", data.id.toString());
      
      toast({
        title: "Blueprint Created ✨",
        description: "Your cosmic journey begins now.",
      });
      
      // Navigate to chat
      setLocation("/chat");
    },
    onError: (error) => {
      toast({
        title: "Alignment Error",
        description: error.message,
        variant: "destructive",
      });
    },
  });
}

// === CHAT HOOKS ===

export function useChatHistory(userId: number | null) {
  return useQuery({
    queryKey: [api.chat.history.path, userId],
    queryFn: async () => {
      if (!userId) return [];
      const url = buildUrl(api.chat.history.path, { userId });
      const res = await fetch(url);
      if (!res.ok) throw new Error("Failed to fetch cosmic history");
      return api.chat.history.responses[200].parse(await res.json());
    },
    enabled: !!userId,
  });
}

export function useSendMessage() {
  const queryClient = useQueryClient();
  const { toast } = useToast();

  return useMutation({
    mutationFn: async ({ userId, message }: { userId: number; message: string }) => {
      const res = await fetch(api.chat.send.path, {
        method: api.chat.send.method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ userId, message }),
      });

      if (!res.ok) throw new Error("Failed to consult the stars");
      return api.chat.send.responses[200].parse(await res.json());
    },
    onMutate: async ({ userId, message }) => {
      // Optimistic update
      await queryClient.cancelQueries({ queryKey: [api.chat.history.path, userId] });
      const previousHistory = queryClient.getQueryData([api.chat.history.path, userId]);

      queryClient.setQueryData(
        [api.chat.history.path, userId],
        (old: Message[] | undefined) => {
          const optimisticMessage: Message = {
            id: -1, // Temp ID
            userId,
            role: "user",
            content: message,
            createdAt: new Date(),
          };
          return old ? [...old, optimisticMessage] : [optimisticMessage];
        }
      );

      return { previousHistory };
    },
    onError: (err, variables, context) => {
      if (context?.previousHistory) {
        queryClient.setQueryData(
          [api.chat.history.path, variables.userId],
          context.previousHistory
        );
      }
      toast({
        title: "Connection Interrupted",
        description: "The cosmic energies are turbulent. Please try again.",
        variant: "destructive",
      });
    },
    onSuccess: (data, variables) => {
      // Invalidate to get clean state
      queryClient.invalidateQueries({ queryKey: [api.chat.history.path, variables.userId] });
    },
  });
}

export function useCurrentUser() {
  // Simple hook to get current user ID from local storage
  const storedId = localStorage.getItem("oracool_user_id");
  return storedId ? parseInt(storedId) : null;
}
