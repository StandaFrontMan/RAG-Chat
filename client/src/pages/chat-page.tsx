import { ChatSidebar, ChatWindow } from "../feature";

export function ChatPage() {
  return (
    <div className="flex h-screen w-full overflow-hidden bg-background text-foreground">
      <ChatSidebar />
      <ChatWindow />
    </div>
  );
}
