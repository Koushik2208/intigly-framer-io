import React from "react";
import { Pressable } from "react-native";

const AnchorOverlay = ({
  onTap,
  videoWidth,
  videoHeight,
}: AnchorOverlayProps) => {
  return (
    <Pressable
      className="absolute top-0 left-0 w-full h-full z-20"
      onPress={(e) => {
        const { locationX, locationY } = e.nativeEvent;
        const normX = locationX / videoWidth;
        const normY = locationY / videoHeight;
        onTap(normX, normY);
      }}
    ></Pressable>
  );
};

export default AnchorOverlay;
