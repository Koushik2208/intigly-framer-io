interface VideoComment {
  id: string;
  timestamp: number;
  text: string;
  displayTime: string;
}

interface DrawingPath {
  id: string;
  data: string;
  color: string;
  strokeWidth: number;
}

interface DrawingOverlayProps {
  isEnabled: boolean;
  color?: string;
  strokeWidth?: number;
  paths: DrawingPath[];
  onAddPath: (p: { data: string; color: string; strokeWidth: number }) => void;
}
