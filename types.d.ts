type VideoComment = {
  id: string;
  timestamp: number;
  text: string;
  displayTime: string;
  replies: Reply[];
  isDrawing?: boolean;
  isAnchor?: boolean;
  anchorX?: number; // normalized 0–1
  anchorY?: number; // normalized 0–1
};

type VideoPlayerProps = {
  source: number;
  onTimeUpdate: (time: number) => void;
};

type SwipeOverlayProps = {
  triggerOverlay: () => void;
  onSeek: (offset: number) => void; // in seconds
};

type AnchorOverlayProps = {
  onTap: (x: number, y: number) => void;
  videoWidth: number;
  videoHeight: number;
};

type AnchorComment = {
  id: string;
  timestamp: number; // same as text/drawings
  x: number; // normalized 0–1
  y: number; // normalized 0–1
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
