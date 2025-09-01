import React, { useRef, useState } from "react";
import {
  Alert,
  Dimensions,
  PanResponder,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import Svg, { Path } from "react-native-svg";

interface DrawingPath {
  id: string;
  data: string;
  color: string;
  strokeWidth: number;
}

interface Point {
  x: number;
  y: number;
}

const { width, height } = Dimensions.get("window");
const CANVAS_HEIGHT = height * 0.6;

export default function Canvas() {
  const [paths, setPaths] = useState<DrawingPath[]>([]);
  const [currentPath, setCurrentPath] = useState<string>("");
  const [currentColor, setCurrentColor] = useState("#FF0000");
  const [strokeWidth, setStrokeWidth] = useState(3);
  const [isDrawing, setIsDrawing] = useState(false);

  const pathRef = useRef<string>("");
  const colors = [
    "#FF0000",
    "#00FF00",
    "#0000FF",
    "#FFFF00",
    "#FF00FF",
    "#00FFFF",
    "#000000",
    "#FFFFFF",
  ];
  const strokeWidths = [2, 3, 5, 8];

  const panResponder = PanResponder.create({
    onStartShouldSetPanResponder: () => true,
    onMoveShouldSetPanResponder: () => true,

    onPanResponderGrant: (event) => {
      const { locationX, locationY } = event.nativeEvent;
      setIsDrawing(true);
      // Start new path with Move command
      pathRef.current = `M${locationX},${locationY}`;
      setCurrentPath(pathRef.current);
    },

    onPanResponderMove: (event) => {
      const { locationX, locationY } = event.nativeEvent;
      if (isDrawing) {
        // Add line to current position
        pathRef.current += ` L${locationX},${locationY}`;
        setCurrentPath(pathRef.current);
      }
    },

    onPanResponderRelease: () => {
      if (pathRef.current && isDrawing) {
        const newPath: DrawingPath = {
          id: Date.now().toString(),
          data: pathRef.current,
          color: currentColor,
          strokeWidth: strokeWidth,
        };
        setPaths((prev) => [...prev, newPath]);
      }
      setIsDrawing(false);
      setCurrentPath("");
      pathRef.current = "";
    },
  });

  const clearCanvas = () => {
    Alert.alert(
      "Clear Canvas",
      "Are you sure you want to clear all drawings?",
      [
        { text: "Cancel", style: "cancel" },
        {
          text: "Clear",
          style: "destructive",
          onPress: () => {
            setPaths([]);
            setCurrentPath("");
            pathRef.current = "";
          },
        },
      ]
    );
  };

  const undoLastPath = () => {
    if (paths.length > 0) {
      setPaths((prev) => prev.slice(0, -1));
    }
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Drawing Canvas Test</Text>

      {/* Drawing Canvas */}
      <View style={styles.canvasContainer}>
        <View style={styles.canvas} {...panResponder.panHandlers}>
          <Svg
            style={StyleSheet.absoluteFillObject}
            width="100%"
            height={CANVAS_HEIGHT}
          >
            {/* Render all completed paths */}
            {paths.map((path) => (
              <Path
                key={path.id}
                d={path.data}
                stroke={path.color}
                strokeWidth={path.strokeWidth}
                fill="none"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
            ))}

            {/* Render current path being drawn */}
            {currentPath && (
              <Path
                d={currentPath}
                stroke={currentColor}
                strokeWidth={strokeWidth}
                fill="none"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
            )}
          </Svg>
        </View>
      </View>

      {/* Color Picker */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Colors:</Text>
        <View style={styles.colorPicker}>
          {colors.map((color) => (
            <TouchableOpacity
              key={color}
              style={[
                styles.colorButton,
                { backgroundColor: color },
                currentColor === color && styles.selectedColor,
              ]}
              onPress={() => setCurrentColor(color)}
            />
          ))}
        </View>
      </View>

      {/* Stroke Width Picker */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Stroke Width:</Text>
        <View style={styles.strokePicker}>
          {strokeWidths.map((width) => (
            <TouchableOpacity
              key={width}
              style={[
                styles.strokeButton,
                strokeWidth === width && styles.selectedStroke,
              ]}
              onPress={() => setStrokeWidth(width)}
            >
              <Text
                style={[
                  styles.strokeText,
                  strokeWidth === width && { color: "#fff" },
                ]}
              >
                {width}px
              </Text>
            </TouchableOpacity>
          ))}
        </View>
      </View>

      {/* Action Buttons */}
      <View style={styles.actionButtons}>
        <TouchableOpacity
          style={[
            styles.undoButton,
            paths.length === 0 && styles.disabledButton,
          ]}
          onPress={undoLastPath}
          disabled={paths.length === 0}
        >
          <Text style={styles.buttonText}>Undo ({paths.length})</Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={[
            styles.clearButton,
            paths.length === 0 && styles.disabledButton,
          ]}
          onPress={clearCanvas}
          disabled={paths.length === 0}
        >
          <Text style={styles.buttonText}>Clear All</Text>
        </TouchableOpacity>
      </View>

      {/* Status */}
      <View style={styles.status}>
        <Text style={styles.statusText}>
          Total Strokes: {paths.length} | Drawing: {isDrawing ? "Yes" : "No"}
        </Text>
        <Text style={styles.statusText}>
          Color: {currentColor} | Width: {strokeWidth}px
        </Text>
        <Text style={styles.statusText}>
          Tip: Draw with your finger for smooth lines and curves!
        </Text>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#f0f0f0",
    paddingTop: 50,
  },
  title: {
    fontSize: 24,
    fontWeight: "bold",
    textAlign: "center",
    marginBottom: 20,
    color: "#333",
  },
  canvasContainer: {
    backgroundColor: "#ffffff",
    marginHorizontal: 10,
    borderRadius: 10,
    elevation: 5,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
    overflow: "hidden",
  },
  canvas: {
    width: "100%",
    height: CANVAS_HEIGHT,
    backgroundColor: "#ffffff",
    borderRadius: 10,
  },
  section: {
    marginVertical: 15,
    paddingHorizontal: 20,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: "bold",
    marginBottom: 10,
    color: "#333",
  },
  colorPicker: {
    flexDirection: "row",
    flexWrap: "wrap",
    justifyContent: "space-between",
  },
  colorButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    margin: 5,
    borderWidth: 2,
    borderColor: "#ddd",
  },
  selectedColor: {
    borderColor: "#000",
    borderWidth: 3,
  },
  strokePicker: {
    flexDirection: "row",
    justifyContent: "space-around",
  },
  strokeButton: {
    backgroundColor: "#e0e0e0",
    paddingHorizontal: 15,
    paddingVertical: 8,
    borderRadius: 5,
    minWidth: 60,
    alignItems: "center",
  },
  selectedStroke: {
    backgroundColor: "#007AFF",
  },
  strokeText: {
    fontSize: 14,
    fontWeight: "bold",
    color: "#333",
  },
  actionButtons: {
    flexDirection: "row",
    justifyContent: "space-around",
    paddingHorizontal: 40,
    marginVertical: 20,
  },
  undoButton: {
    backgroundColor: "#FF9500",
    paddingHorizontal: 20,
    paddingVertical: 12,
    borderRadius: 8,
    flex: 0.4,
    alignItems: "center",
  },
  clearButton: {
    backgroundColor: "#FF3B30",
    paddingHorizontal: 20,
    paddingVertical: 12,
    borderRadius: 8,
    flex: 0.4,
    alignItems: "center",
  },
  disabledButton: {
    backgroundColor: "#cccccc",
  },
  buttonText: {
    color: "#fff",
    fontSize: 16,
    fontWeight: "bold",
  },
  status: {
    backgroundColor: "#333",
    padding: 15,
    marginTop: "auto",
  },
  statusText: {
    color: "#fff",
    fontSize: 12,
    textAlign: "center",
    marginVertical: 2,
  },
});
