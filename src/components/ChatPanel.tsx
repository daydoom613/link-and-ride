import { useEffect, useRef, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

interface ChatPanelProps {
  rideId: string;
  otherUserId: string;
  onClose?: () => void;
}

type Message = {
  id: string;
  conversation_id: string;
  sender_id: string;
  content: string;
  created_at: string;
};

const ChatPanel = ({ rideId, otherUserId, onClose }: ChatPanelProps) => {
  const [conversationId, setConversationId] = useState<string | null>(null);
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState("");
  const [currentUserId, setCurrentUserId] = useState<string | null>(null);
  const bottomRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    (async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;
      setCurrentUserId(user.id);

      // get or create conversation
      const { data: convId, error: rpcErr } = await supabase.rpc("get_or_create_conversation", {
        p_ride_id: rideId,
        p_user_a: user.id,
        p_user_b: otherUserId,
      });
      if (rpcErr) {
        console.error(rpcErr);
        return;
      }
      setConversationId(convId as string);
    })();
  }, [rideId, otherUserId]);

  useEffect(() => {
    if (!conversationId) return;

    const fetchMessages = async () => {
      const { data } = await supabase
        .from("messages")
        .select("*")
        .eq("conversation_id", conversationId)
        .order("created_at", { ascending: true })
        .limit(100);
      if (data) setMessages(data as Message[]);
    };

    fetchMessages();

    const channel = supabase
      .channel(`messages-${conversationId}`)
      .on(
        "postgres_changes",
        { event: "INSERT", schema: "public", table: "messages", filter: `conversation_id=eq.${conversationId}` },
        (payload) => {
          const msg = payload.new as Message;
          setMessages((prev) => [...prev, msg]);
        }
      )
      .subscribe();

    return () => { supabase.removeChannel(channel); };
  }, [conversationId]);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  const sendMessage = async () => {
    const text = input.trim();
    if (!text || !conversationId || !currentUserId) return;

    setInput("");
    const optimistic: Message = {
      id: `tmp-${Date.now()}`,
      conversation_id: conversationId,
      sender_id: currentUserId,
      content: text,
      created_at: new Date().toISOString(),
    };
    setMessages((prev) => [...prev, optimistic]);

    const { error } = await supabase.from("messages").insert({
      conversation_id: conversationId,
      sender_id: currentUserId,
      content: text,
    });
    if (error) {
      console.error(error);
      // rollback
      setMessages((prev) => prev.filter((m) => m.id !== optimistic.id));
    }
  };

  return (
    <div className="flex flex-col h-[420px] border rounded-lg">
      <div className="px-4 py-2 border-b flex items-center justify-between">
        <div className="font-semibold">Chat</div>
        {onClose && (
          <Button variant="ghost" size="sm" onClick={onClose}>Close</Button>
        )}
      </div>
      <div className="flex-1 overflow-y-auto p-4 space-y-2 bg-muted/20">
        {messages.map((m) => {
          const isMe = m.sender_id === currentUserId;
          return (
            <div key={m.id} className={`max-w-[75%] px-3 py-2 rounded-md ${isMe ? 'ml-auto bg-primary text-primary-foreground' : 'bg-background border'}`}>
              <div className="text-sm whitespace-pre-wrap">{m.content}</div>
              <div className="text-[10px] opacity-70 mt-1">{new Date(m.created_at).toLocaleTimeString()}</div>
            </div>
          );
        })}
        <div ref={bottomRef} />
      </div>
      <div className="p-3 border-t flex gap-2">
        <Input
          placeholder="Type a message..."
          value={input}
          onChange={(e) => setInput(e.target.value)}
          onKeyDown={(e) => {
            if (e.key === 'Enter' && !e.shiftKey) {
              e.preventDefault();
              sendMessage();
            }
          }}
        />
        <Button onClick={sendMessage}>Send</Button>
      </div>
    </div>
  );
};

export default ChatPanel;


