import React from "react";
import { Pressable } from "react-native";
import { Gesture, GestureDetector } from "react-native-gesture-handler";

const SwipeOverlay = ({ triggerOverlay, onSeek }: SwipeOverlayProps) => {
  const panGesture = Gesture.Pan()
    .runOnJS(true)
    .onUpdate((e) => {
      // Pixels → seconds: tune this ratio
      const pixelsPerSecond = 50; // 50px swipe = 1s
      const seekOffset = e.translationX / pixelsPerSecond;

      if (Math.abs(seekOffset) >= 1) {
        onSeek(seekOffset);
      }

      triggerOverlay();
    });

  return (
    <GestureDetector gesture={panGesture}>
      <Pressable
        className="absolute top-0 left-0 w-full h-full z-10"
        onPress={triggerOverlay}
      >
        {/* transparent overlay for swipe */}
      </Pressable>
    </GestureDetector>
  );
};

export default SwipeOverlay;
