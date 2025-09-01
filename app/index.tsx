import { Ionicons } from "@expo/vector-icons";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { VideoView, useVideoPlayer } from "expo-video";
import React, { useEffect, useMemo, useState } from "react";
import {
  Dimensions,
  ScrollView,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";
import DrawingOverlay from "./components/DrawingOverlay";

const COMMENTS_KEY = "comments_v1";
const DRAWINGS_KEY = "drawings_v1";

export default function Index() {
  const [isPlaying, setIsPlaying] = useState(false);
  const [currentTime, setCurrentTime] = useState(0);
  const [comments, setComments] = useState<VideoComment[]>([]);
  const [drawingsBySecond, setDrawingsBySecond] = useState<
    Record<string, DrawingPath[]>
  >({});
  const [newComment, setNewComment] = useState("");

  const [drawingEnabled, setDrawingEnabled] = useState(false);
  const [selectedColor, setSelectedColor] = useState("#00FF00");
  const [selectedStrokeWidth, setSelectedStrokeWidth] = useState(4);

  const width = Dimensions.get("window").width;

  const videoSource =
    "https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/BigBuckBunny.mp4";

  const player = useVideoPlayer(videoSource, (player) => {
    player.loop = false;
    player.play();
    setIsPlaying(true);
  });

  const currentSecondStr = useMemo(
    () => String(Math.floor(currentTime)),
    [currentTime]
  );

  useEffect(() => {
    (async () => {
      try {
        const savedComments = await AsyncStorage.getItem(COMMENTS_KEY);
        if (savedComments) setComments(JSON.parse(savedComments));

        const savedDrawings = await AsyncStorage.getItem(DRAWINGS_KEY);
        if (savedDrawings) setDrawingsBySecond(JSON.parse(savedDrawings));
      } catch {}
    })();
  }, []);

  useEffect(() => {
    const interval = setInterval(() => {
      if (player) setCurrentTime(player.currentTime);
    }, 500);
    return () => clearInterval(interval);
  }, [player]);

  const formatTime = (seconds: number): string => {
    const whole = Math.floor(seconds);
    const mins = Math.floor(whole / 60);
    const secs = whole % 60;
    return `${mins.toString().padStart(2, "0")}:${secs
      .toString()
      .padStart(2, "0")}`;
  };

  const persistComments = async (next: VideoComment[]) => {
    setComments(next);
    try {
      await AsyncStorage.setItem(COMMENTS_KEY, JSON.stringify(next));
    } catch {}
  };

  const persistDrawings = async (next: Record<string, DrawingPath[]>) => {
    setDrawingsBySecond(next);
    try {
      await AsyncStorage.setItem(DRAWINGS_KEY, JSON.stringify(next));
    } catch {}
  };

  // video controls
  const togglePlayPause = () => {
    if (isPlaying) {
      player.pause();
      setIsPlaying(false);
    } else {
      player.play();
      setIsPlaying(true);
    }
  };

  const seekForward = () => {
    player.currentTime = Math.min(player.currentTime + 10, player.duration);
  };

  const seekBackward = () => {
    player.currentTime = Math.max(player.currentTime - 10, 0);
  };

  const addComment = async () => {
    if (!newComment.trim()) return;
    const ts = Math.floor(currentTime);
    const comment: VideoComment = {
      id: Date.now().toString(),
      timestamp: ts,
      text: newComment.trim(),
      displayTime: formatTime(ts),
    };
    const next = [...comments, comment].sort(
      (a, b) => a.timestamp - b.timestamp
    );
    await persistComments(next);
    setNewComment("");
  };

  const jumpToComment = (timestamp: number) => {
    player.currentTime = Math.min(player.duration, Math.max(0, timestamp));
  };

  const deleteComment = async (commentId: string) => {
    const next = comments.filter((c) => c.id !== commentId);
    await persistComments(next);
  };

  const openDrawMode = () => {
    player.pause();
    setIsPlaying(false);
    setDrawingEnabled(true);
  };

  const closeDrawMode = () => {
    setDrawingEnabled(false);
  };

  const handleAddPathAtCurrentSecond = async (p: {
    data: string;
    color: string;
    strokeWidth: number;
  }) => {
    const sec = currentSecondStr;
    const newPath: DrawingPath = {
      id: Date.now().toString(),
      data: p.data,
      color: p.color,
      strokeWidth: p.strokeWidth,
    };

    const updatedDrawings = {
      ...drawingsBySecond,
      [sec]: [...(drawingsBySecond[sec] ?? []), newPath],
    };
    await persistDrawings(updatedDrawings);

    if (!comments.some((c) => c.timestamp === Math.floor(currentTime))) {
      if (updatedDrawings[sec]?.length > 0) {
        const drawComment: VideoComment = {
          id: `draw-${Date.now()}`,
          timestamp: Math.floor(currentTime),
          text: "[Drawing feedback]",
          displayTime: formatTime(currentTime),
        };
        await persistComments(
          [...comments, drawComment].sort((a, b) => a.timestamp - b.timestamp)
        );
      }
    }
  };

  const undoAtCurrentSecond = async () => {
    const sec = currentSecondStr;
    const list = drawingsBySecond[sec] ?? [];
    if (!list.length) return;

    const next = { ...drawingsBySecond, [sec]: list.slice(0, -1) };
    await persistDrawings(next);

    if (!next[sec]?.length) {
      const filtered = comments.filter(
        (c) => c.timestamp !== Math.floor(currentTime)
      );
      await persistComments(filtered);
    }
  };

  const clearAtCurrentSecond = async () => {
    const sec = currentSecondStr;
    if (!drawingsBySecond[sec]?.length) return;

    const next = { ...drawingsBySecond, [sec]: [] };
    await persistDrawings(next);

    const filtered = comments.filter(
      (c) => c.timestamp !== Math.floor(currentTime)
    );
    await persistComments(filtered);
  };

  const visiblePaths: DrawingPath[] = drawingsBySecond[currentSecondStr] ?? [];

  return (
    <View className="flex-1 bg-white pt-8 px-3">
      <ScrollView
        className="flex-1"
        showsVerticalScrollIndicator={false}
        contentContainerStyle={{ paddingBottom: 190 }}
      >
        <View className="relative">
          <VideoView
            style={{
              width: width - 24,
              height: ((width - 24) * 9) / 16,
              borderRadius: 12,
            }}
            player={player}
            allowsFullscreen
            allowsPictureInPicture
          />
          {drawingEnabled && (
            <DrawingOverlay
              isEnabled={drawingEnabled}
              color={selectedColor}
              strokeWidth={selectedStrokeWidth}
              paths={visiblePaths}
              onAddPath={handleAddPathAtCurrentSecond}
            />
          )}
        </View>

        <View className="flex-row justify-center items-center p-4 mt-2">
          <TouchableOpacity
            className="p-3 mx-2 rounded-full border border-gray-300"
            onPress={seekBackward}
          >
            <Ionicons name="play-back" size={24} color="#333" />
          </TouchableOpacity>

          <TouchableOpacity
            className="p-3 mx-2 rounded-full border border-gray-300"
            onPress={togglePlayPause}
          >
            <Ionicons
              name={isPlaying ? "pause" : "play"}
              size={24}
              color="#333"
            />
          </TouchableOpacity>

          <TouchableOpacity
            className="p-3 mx-2 rounded-full border border-gray-300"
            onPress={seekForward}
          >
            <Ionicons name="play-forward" size={24} color="#333" />
          </TouchableOpacity>
        </View>

        <Text className="text-gray-700 text-center text-base my-2">
          {formatTime(currentTime)}
        </Text>

        <Text className="text-gray-800 font-semibold p-3">
          Comments ({comments.length})
        </Text>

        <ScrollView className="flex-1">
          {comments.map((comment) => (
            <View
              key={comment.id}
              className="bg-white border border-gray-200 m-2 p-3 rounded-lg flex-row justify-between items-start"
            >
              <TouchableOpacity
                onPress={() => jumpToComment(comment.timestamp)}
                className="flex-1"
              >
                <Text className="text-blue-600 text-xs font-semibold mb-1">
                  {comment.displayTime}
                </Text>
                <Text className="text-gray-800 text-sm">{comment.text}</Text>
              </TouchableOpacity>

              <TouchableOpacity
                className="w-6 h-6 rounded-full justify-center items-center ml-2 bg-red-500"
                onPress={() => deleteComment(comment.id)}
              >
                <Ionicons name="close" size={16} color="white" />
              </TouchableOpacity>
            </View>
          ))}
        </ScrollView>
      </ScrollView>

      <View className="absolute bottom-0 left-0 right-0 bg-white border-t border-gray-200 p-2">
        <View className="flex-row items-center">
          <Text className="text-gray-700 mx-2">{formatTime(currentTime)}</Text>

          {!drawingEnabled && (
            <TouchableOpacity onPress={openDrawMode} className="mx-2">
              <Ionicons name="brush" size={22} color="#333" />
            </TouchableOpacity>
          )}

          <TextInput
            className="flex-1 bg-white border border-gray-300 text-gray-800 px-3 py-2 rounded-lg mr-2 max-h-20"
            value={newComment}
            onChangeText={setNewComment}
            placeholder="Add a comment..."
            placeholderTextColor="#999"
            multiline
          />

          <TouchableOpacity
            className="bg-blue-500 p-3 rounded-full justify-center items-center"
            onPress={addComment}
          >
            <Ionicons name="send" size={18} color="white" />
          </TouchableOpacity>
        </View>

        {drawingEnabled && (
          <View className="flex-row items-center justify-between mt-2 px-4">
            <View className="flex-row items-center">
              {["#FF0000", "#00FF00", "#0000FF", "#000000"].map((c) => (
                <TouchableOpacity key={c} onPress={() => setSelectedColor(c)}>
                  <View
                    className="w-8 h-8 rounded-full mr-3"
                    style={{
                      backgroundColor: c,
                      borderWidth: selectedColor === c ? 3 : 0,
                      borderColor: "#333",
                    }}
                  />
                </TouchableOpacity>
              ))}
            </View>

            <View className="flex-row items-center">
              {[2, 4, 6, 8].map((sw) => (
                <TouchableOpacity
                  key={sw}
                  onPress={() => setSelectedStrokeWidth(sw)}
                >
                  <View
                    style={{
                      width: sw * 3,
                      height: sw * 3,
                      borderRadius: sw * 1.5,
                      backgroundColor: "#555",
                      marginHorizontal: 8,
                      borderWidth: selectedStrokeWidth === sw ? 2 : 0,
                      borderColor: "#333",
                    }}
                  />
                </TouchableOpacity>
              ))}
            </View>

            <View className="flex-row items-center">
              <TouchableOpacity
                onPress={undoAtCurrentSecond}
                className="px-3 py-2 rounded-lg border border-gray-300 mr-3"
              >
                <Ionicons name="arrow-undo" size={24} color="#333" />
              </TouchableOpacity>

              <TouchableOpacity
                onPress={clearAtCurrentSecond}
                className="px-3 py-2 rounded-lg border border-gray-300 mr-3"
              >
                <Ionicons name="trash" size={24} color="#333" />
              </TouchableOpacity>

              <TouchableOpacity
                onPress={closeDrawMode}
                className="px-3 py-2 rounded-lg border border-gray-300"
              >
                <Ionicons name="close-circle" size={26} color="#333" />
              </TouchableOpacity>
            </View>
          </View>
        )}
      </View>
    </View>
  );
}
