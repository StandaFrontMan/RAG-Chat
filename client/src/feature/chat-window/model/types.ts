export interface ChatWindowProps {
  className?: string;
  chatTitle?: string;
  onSendMessage?: (text: string) => void;
  isLoading?: boolean;
}
