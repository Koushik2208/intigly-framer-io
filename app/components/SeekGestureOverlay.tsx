import { VideoPlayer } from "expo-video";
import React from "react";
import { StyleSheet, Text } from "react-native";
import { Gesture, GestureDetector } from "react-native-gesture-handler"; // New imports
import Animated, {
  runOnJS,
  useAnimatedStyle,
  useSharedValue,
} from "react-native-reanimated"; // Add if using Reanimated

type SeekGestureOverlayProps = {
  className?: string;
  duration: number;
  player: VideoPlayer;
  isDrawingEnabled: boolean;
  onSeek: (newTime: number) => void;
  currentTime: number;
};

const SeekGestureOverlay: React.FC<SeekGestureOverlayProps> = ({
  className,
  duration,
  player,
  isDrawingEnabled,
  onSeek,
  currentTime,
}) => {
  const seekPreviewTime = useSharedValue(0);
  const seekPreviewDelta = useSharedValue(0);
  const isPreviewVisible = useSharedValue(false);

  // Sensitivity based on duration
  const getSensitivity = () => {
    if (duration < 600) return 0.05;
    if (duration < 3600) return 0.1;
    return 0.15;
  };

  // Format time utility (moved inside for Reanimated compatibility if needed)
  const formatTime = (seconds: number): string => {
    const mins = Math.floor(seconds / 60);
    const secs = Math.floor(seconds % 60);
    return `${mins.toString().padStart(2, "0")}:${secs.toString().padStart(2, "0")}`;
  };

  // Gesture config using new API
  const panGesture = Gesture.Pan()
    .enabled(!isDrawingEnabled) // Disable when drawing
    .onChange((event) => {
      // Calculate seek during active pan (replaces onActive)
      const sensitivity = getSensitivity();
      const distanceSeek =
        (event.translationX / 300) * (duration * sensitivity);
      const velocityMultiplier = Math.min(Math.abs(event.velocityX) / 1000, 2);
      const seekDelta = distanceSeek * (1 + velocityMultiplier);
      const newTime = Math.min(Math.max(currentTime + seekDelta, 0), duration);

      // Update shared values for preview
      seekPreviewTime.value = newTime;
      seekPreviewDelta.value = seekDelta;
      isPreviewVisible.value = true;
    })
    .onFinalize(() => {
      // On gesture end (replaces state === 5 check)
      const finalTime = seekPreviewTime.value;
      player.currentTime = finalTime;
      runOnJS(onSeek)(finalTime); // Call JS callback
      isPreviewVisible.value = false;
    });

  // Animated style for preview (using Reanimated for smoothness)
  const previewStyle = useAnimatedStyle(() => {
    return {
      opacity: isPreviewVisible.value ? 1 : 0,
      transform: [{ scale: isPreviewVisible.value ? 1 : 0.8 }],
    };
  });

  // Render preview conditionally
  const renderPreview = () => {
    if (!isPreviewVisible.value) return null;
    return (
      <Animated.View style={[styles.previewContainer, previewStyle]}>
        <Text style={styles.previewText}>
          {seekPreviewDelta.value > 0 ? "+" : ""}
          {Math.round(seekPreviewDelta.value)}s (
          {formatTime(seekPreviewTime.value)} / {formatTime(duration)})
        </Text>
      </Animated.View>
    );
  };

  return (
    <GestureDetector gesture={panGesture}>
      <Animated.View
        className={`absolute top-0 left-0 right-0 bottom-0 ${className}`}
      >
        {renderPreview()}
      </Animated.View>
    </GestureDetector>
  );
};

const styles = StyleSheet.create({
  previewContainer: {
    position: "absolute",
    top: "50%",
    left: "50%",
    transform: [{ translateX: -50 }, { translateY: -20 }],
    backgroundColor: "rgba(0, 0, 0, 0.7)",
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 8,
  },
  previewText: {
    color: "white",
    fontSize: 16,
    fontFamily: "ppneuemontreal-medium",
  },
});

export default SeekGestureOverlay;
