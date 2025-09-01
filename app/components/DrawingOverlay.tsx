import React, { useRef, useState } from "react";
import { PanResponder, View } from "react-native";
import Svg, { Path } from "react-native-svg";

export default function DrawingOverlay({
  isEnabled,
  color = "#FF0000",
  strokeWidth = 3,
  paths,
  onAddPath,
}: DrawingOverlayProps) {
  const [currentPath, setCurrentPath] = useState<string>("");
  const pathRef = useRef<string>("");

  const panResponder = PanResponder.create({
    onStartShouldSetPanResponder: () => isEnabled,
    onMoveShouldSetPanResponder: () => isEnabled,

    onPanResponderGrant: (event) => {
      if (!isEnabled) return;
      const { locationX, locationY } = event.nativeEvent;
      pathRef.current = `M${locationX},${locationY}`;
      setCurrentPath(pathRef.current);
    },

    onPanResponderMove: (event) => {
      if (!isEnabled) return;
      const { locationX, locationY } = event.nativeEvent;
      pathRef.current += ` L${locationX},${locationY}`;
      setCurrentPath(pathRef.current);
    },

    onPanResponderRelease: () => {
      if (isEnabled && pathRef.current) {
        const finishedPath = pathRef.current;
        onAddPath({
          data: finishedPath,
          color,
          strokeWidth,
        });
        pathRef.current = "";
        setCurrentPath("");
      }
    },
  });

  return (
    <View
      className="absolute top-0 left-0 w-full h-full"
      pointerEvents={isEnabled ? "auto" : "none"}
      {...panResponder.panHandlers}
    >
      <Svg className="w-full h-full">
        {paths.map((p) => (
          <Path
            key={p.id}
            d={p.data}
            stroke={p.color}
            strokeWidth={p.strokeWidth}
            fill="none"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
        ))}
        {currentPath ? (
          <Path
            d={currentPath}
            stroke={color}
            strokeWidth={strokeWidth}
            fill="none"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
        ) : null}
      </Svg>
    </View>
  );
}
