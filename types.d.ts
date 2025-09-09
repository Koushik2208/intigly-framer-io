type VideoComment = {
  id: string;
  timestamp: number;
  text: string;
  displayTime: string;
  replies: Reply[];
  createdAt: number;
  isDrawing?: boolean;
  isAnchor?: boolean;
  anchorX?: number;
  anchorY?: number;
};

type VideoPlayerProps = {
  source: number;
  onTimeUpdate: (time: number) => void;
};

type SwipeOverlayProps = {
  triggerOverlay: () => void;
  onSeek: (offset: number) => void;
};

type AnchorOverlayProps = {
  onTap: (x: number, y: number) => void;
  videoWidth: number;
  videoHeight: number;
};

type AnchorComment = {
  id: string;
  timestamp: number;
  x: number;
  y: number;
  text: string;
  displayTime: string;
};

type Reply = {
  id: string;
  parentId: string;
  timestamp: number;
  text: string;
  displayTime: string;
};

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
