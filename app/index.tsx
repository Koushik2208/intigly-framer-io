import {
  Entypo,
  EvilIcons,
  Ionicons,
  MaterialIcons,
  SimpleLineIcons,
} from "@expo/vector-icons";
import AsyncStorage from "@react-native-async-storage/async-storage";
import Slider from "@react-native-community/slider";
import { Image } from "expo-image";
import { VideoView, useVideoPlayer } from "expo-video";
import React, { useEffect, useMemo, useRef, useState } from "react";
import {
  Keyboard,
  KeyboardAvoidingView,
  Platform,
  Pressable,
  ScrollView,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";
import AnchorModal from "./components/AnchorModal";
import AnchorOverlay from "./components/AnchorOverlay";
import DrawingOverlay from "./components/DrawingOverlay";
import SwipeOverlay from "./components/SwipeOverlay";

const COMMENTS_KEY = "comments_v3";
const DRAWINGS_KEY = "drawings_v3";

export default function Index() {
  const [isPlaying, setIsPlaying] = useState(false);
  const [currentTime, setCurrentTime] = useState(0);
  const [comments, setComments] = useState<VideoComment[]>([]);
  const [drawingsBySecond, setDrawingsBySecond] = useState<
    Record<string, DrawingPath[]>
  >({});
  const [newInput, setNewInput] = useState("");
  const [replyTo, setReplyTo] = useState<VideoComment | null>(null);
  const [drawingEnabled, setDrawingEnabled] = useState(false);
  const [selectedColor, setSelectedColor] = useState("#EF4444");
  // const [selectedStrokeWidth, setSelectedStrokeWidth] = useState(4);
  const [keyboardVisible, setKeyboardVisible] = useState(false);
  const [activeCommentId, setActiveCommentId] = useState<string | null>(null);
  const [showOverlay, setShowOverlay] = useState(false);
  const [anchorMode, setAnchorMode] = useState(false);
  const [pendingAnchor, setPendingAnchor] = useState<{
    x: number;
    y: number;
  } | null>(null);
  const [anchorModalVisible, setAnchorModalVisible] = useState(false);
  const [videoLayout, setVideoLayout] = useState({ width: 1, height: 1 });

  const AVATARS = {
    noah: require("../assets/images/noah.png"),
    amina: require("../assets/images/amina.png"),
    user: require("../assets/images/user.png"),
    emoji: require("../assets/images/emoji.png"),
  };

  const videoRef = useRef<VideoView>(null);
  const inputRef = useRef<TextInput>(null);

  // const videoSource = require("../assets/NothingPhone(2a).mp4");
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

  // Overlay auto-hide
  const overlayTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const triggerOverlay = () => {
    setShowOverlay(true);
    if (overlayTimerRef.current) clearTimeout(overlayTimerRef.current);
    overlayTimerRef.current = setTimeout(() => setShowOverlay(false), 3000);
  };

  // const enterFullscreen = async () => {
  //   await videoRef.current?.enterFullscreen();
  // };

  // const exitFullscreen = async () => {
  //   await videoRef.current?.exitFullscreen();
  // };

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

  useEffect(() => {
    const showSub = Keyboard.addListener("keyboardDidShow", () => {
      setKeyboardVisible(true);
    });
    const hideSub = Keyboard.addListener("keyboardDidHide", () => {
      setKeyboardVisible(false);
      setReplyTo(null);
      inputRef.current?.blur();
    });

    return () => {
      showSub.remove();
      hideSub.remove();
    };
  }, []);

  const formatTime = (seconds: number): string => {
    if (!Number.isFinite(seconds) || seconds === undefined || seconds < 0) {
      return "--:--";
    }
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

  // Video controls
  const togglePlayPause = () => {
    if (isPlaying) {
      player.pause();
      setIsPlaying(false);
    } else {
      player.play();
      setIsPlaying(true);
    }
  };

  const toggleMute = () => {
    player.muted = !player.muted;
  };

  const handleDraw = () => {
    setDrawingEnabled(!drawingEnabled);
    if (!drawingEnabled) {
      player.pause();
      setIsPlaying(false);
    } else {
      player.play();
      setIsPlaying(true);
    }
  };

  const handleSeek = (offset: number) => {
    const newTime = Math.min(
      player.duration,
      Math.max(0, player.currentTime + offset)
    );
    player.currentTime = newTime;
    setCurrentTime(newTime);
  };

  // Add comment or reply
  const handleSubmit = async () => {
    if (!newInput.trim()) return;
    const ts = Math.floor(currentTime);

    if (replyTo) {
      const reply: Reply = {
        id: Date.now().toString(),
        parentId: replyTo.id,
        timestamp: ts,
        text: newInput.trim(),
        displayTime: formatTime(ts),
      };
      const updated = comments.map((c) =>
        c.id === replyTo.id ? { ...c, replies: [...c.replies, reply] } : c
      );
      await persistComments(updated);
      setReplyTo(null);
    } else {
      const comment: VideoComment = {
        id: Date.now().toString(),
        timestamp: ts,
        text: newInput.trim(),
        displayTime: formatTime(ts),
        replies: [],
      };
      const next = [...comments, comment].sort(
        (a, b) => a.timestamp - b.timestamp
      );
      await persistComments(next);
    }

    setNewInput("");
    player.pause();
    setIsPlaying(false);
  };

  const handleAnchorSubmit = async (
    text: string,
    anchor: { x: number; y: number }
  ) => {
    if (!text.trim()) return;

    const ts = Math.floor(currentTime);

    const comment: VideoComment = {
      id: Date.now().toString(),
      timestamp: ts,
      text: text.trim(),
      displayTime: formatTime(ts),
      replies: [],
      isAnchor: true, // mark it as an anchor comment
      anchorX: anchor.x, // normalized 0–1
      anchorY: anchor.y, // normalized 0–1
    };

    const next = [...comments, comment].sort(
      (a, b) => a.timestamp - b.timestamp
    );

    await persistComments(next);

    // reset modal + pending anchor
    setAnchorModalVisible(false);
    setPendingAnchor(null);

    player.pause();
    setIsPlaying(false);
  };

  const toggleAnchoredCommentActive = () => {
    setAnchorMode(!anchorMode);
    if (!anchorMode) {
      player.pause();
      setIsPlaying(false);
    } else {
      player.play();
      setIsPlaying(true);
    }
  };

  const jumpToComment = (timestamp: number) => {
    player.currentTime = Math.min(player.duration, Math.max(0, timestamp));
  };

  const deleteComment = async (commentId: string) => {
    if (commentId.startsWith("draw-")) {
      const tsKey = commentId.replace("draw-", "");

      const updatedDrawings = { ...drawingsBySecond };
      delete updatedDrawings[tsKey];

      await persistDrawings(updatedDrawings);
    } else {
      // normal or anchor comment
      const next = comments.filter((c) => c.id !== commentId);
      await persistComments(next);
    }
  };

  // Anchor section
  const handleAnchorTap = (x: number, y: number) => {
    setPendingAnchor({ x, y });
    setAnchorModalVisible(true);
    triggerOverlay();
  };

  // Drawing
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
  };

  // Aggregation
  function aggregateFeedback(
    comments: VideoComment[],
    drawingsBySecond: Record<string, DrawingPath[]>
  ): VideoComment[] {
    const textualCommentsMap = new Map<number, VideoComment>();
    comments.forEach((c) => textualCommentsMap.set(c.timestamp, c));

    const aggregated: VideoComment[] = [];

    Object.entries(drawingsBySecond).forEach(([secStr, paths]) => {
      const sec = parseInt(secStr);
      if (!paths.length) return;

      if (!textualCommentsMap.has(sec)) {
        aggregated.push({
          id: `draw-${sec}`,
          timestamp: sec,
          text: "[Drawing feedback]",
          displayTime: formatTime(sec),
          replies: [],
          isDrawing: true,
        });
      }
    });

    return [...comments, ...aggregated].sort(
      (a, b) => a.timestamp - b.timestamp
    );
  }

  const aggregatedComments = useMemo(
    () => aggregateFeedback(comments, drawingsBySecond),
    [comments, drawingsBySecond]
  );

  const visiblePaths: DrawingPath[] = drawingsBySecond[currentSecondStr] ?? [];

  return (
    <View className="flex-1 bg-white">
      {/* Title */}
      <Text className="mb-[16px] mt-[16px] px-[16px] text-center font-ppneuemontreal-medium">
        Big Buck Bunny
      </Text>

      {/* Video container */}
      <View className="items-center mb-[10px]">
        <Pressable
          onLayout={(e) => {
            const { width, height } = e.nativeEvent.layout;
            setVideoLayout({ width, height });
          }}
          onPress={triggerOverlay}
          className="rounded-xl aspect-[16/9] w-[90%] relative overflow-hidden"
        >
          <VideoView
            ref={videoRef}
            style={{
              width: "100%",
              height: "100%",
              borderRadius: 12,
            }}
            player={player}
            allowsFullscreen={true}
            nativeControls={false}
          />

          {!drawingEnabled && (
            <SwipeOverlay triggerOverlay={triggerOverlay} onSeek={handleSeek} />
          )}

          <DrawingOverlay
            isEnabled={drawingEnabled}
            color={selectedColor}
            // strokeWidth={selectedStrokeWidth}
            paths={visiblePaths}
            onAddPath={handleAddPathAtCurrentSecond}
          />

          {anchorMode && (
            <AnchorOverlay
              onTap={handleAnchorTap}
              videoWidth={videoLayout.width}
              videoHeight={videoLayout.height}
            />
          )}

          {comments.map((c) => {
            if (
              !c.isAnchor ||
              c.anchorX == null ||
              c.anchorY == null ||
              Math.floor(currentTime) !== c.timestamp
            )
              return null;

            return (
              <View
                key={c.id}
                style={{
                  position: "absolute",
                  left: c.anchorX * videoLayout.width - 8,
                  top: c.anchorY * videoLayout.height - 8,
                }}
              >
                <MaterialIcons name="location-pin" size={28} color="white" />
              </View>
            );
          })}

          <AnchorModal
            visible={anchorModalVisible}
            onClose={() => setAnchorModalVisible(false)}
            onSubmit={(text) => {
              if (pendingAnchor) {
                handleAnchorSubmit(text, pendingAnchor);
              }
            }}
            timestamp={formatTime(currentTime)}
          />

          {showOverlay && (
            <View className="absolute bottom-0 left-0 right-0 z-30">
              <Slider
                style={{
                  width: "100%",
                  height: 6,
                  backgroundColor: "#0E8747",
                }}
                minimumValue={0}
                maximumValue={player.duration || 0}
                value={currentTime}
                minimumTrackTintColor="#0E8747"
                maximumTrackTintColor="#0E8747"
                thumbTintColor="#fff"
                onSlidingComplete={(val) => {
                  player.currentTime = val;
                  setCurrentTime(val);
                }}
              />

              <View className="bg-[#1E1E1E]/80 px-[16px] py-[12px] flex-row items-center justify-between rounded-b-xl">
                <View className="flex-row items-center gap-[12px]">
                  <TouchableOpacity onPress={togglePlayPause}>
                    <Ionicons
                      name={isPlaying ? "pause" : "play"}
                      size={20}
                      color="white"
                    />
                  </TouchableOpacity>
                  <TouchableOpacity onPress={toggleMute}>
                    {!player.muted ? (
                      <SimpleLineIcons
                        name="volume-1"
                        size={20}
                        color="white"
                      />
                    ) : (
                      <SimpleLineIcons
                        name="volume-off"
                        size={20}
                        color="white"
                      />
                    )}
                  </TouchableOpacity>
                </View>
                <Text className="text-white font-ppneuemontreal">
                  {formatTime(currentTime)}/{formatTime(player.duration)}
                </Text>
                <View className="flex-row items-center gap-[12px]">
                  <TouchableOpacity onPress={toggleAnchoredCommentActive}>
                    <EvilIcons
                      name="location"
                      size={28}
                      color={`${anchorMode ? "#0E8747" : "white"}`}
                    />
                  </TouchableOpacity>
                  {/* <TouchableOpacity onPress={enterFullscreen}>
                    <Ionicons name="expand" size={20} color="white" />
                  </TouchableOpacity> */}
                </View>
              </View>
            </View>
          )}
        </Pressable>
      </View>

      {/* Comments */}
      <View className="flex-row items-center gap-[8px] mb-[16px]">
        <Text className="px-[16px] mb-2 font-ppneuemontreal-medium">
          Comments
        </Text>
        <Text className="font-ppneuemontreal border border-[#EFEFEF] py-[5px] px-[10px] rounded-xl">
          {aggregatedComments.length}
        </Text>
      </View>

      <ScrollView
        className="flex-1"
        contentContainerStyle={{ paddingBottom: 80 }}
      >
        {aggregatedComments.map((item) => (
          <View key={item.id} className="gap-[12px]">
            <TouchableOpacity
              onPress={() => {
                setActiveCommentId(item.id);
                jumpToComment(item.timestamp);
              }}
              className={`gap-[12px] px-[16px] py-[12px] ${
                activeCommentId === item.id ? "bg-[#FAFFEC]" : ""
              }`}
            >
              <View className="flex-row justify-between gap-2 items-center">
                <View className="flex-row items-center gap-[8px]">
                  <Image
                    source={AVATARS.user}
                    style={{ width: 32, height: 32 }}
                    contentFit="contain"
                    className="rounded-full"
                  />
                  <View className="flex-row gap-[4px] items-center">
                    <Text className="text-[#1E1E1E] font-semibold font-ppneuemontreal-medium">
                      Placeholder User
                    </Text>
                    <View className="w-[4px] h-[4px] rounded-full bg-gray-100" />
                  </View>
                  <Text className="text-gray-500 text-sm">
                    {item.displayTime}
                  </Text>
                </View>
                {activeCommentId === item.id && (
                  <TouchableOpacity onPress={() => deleteComment(item.id)}>
                    <Entypo
                      name="dots-three-horizontal"
                      size={16}
                      color="#333"
                    />
                  </TouchableOpacity>
                )}
              </View>

              <View className="flex-row gap-[8px]">
                <Text className="text-[#0E8747] text-sm">
                  {item.displayTime}
                </Text>
                <Text className="font-ppneuemontreal">{item.text}</Text>
              </View>

              <Pressable
                onPress={() => {
                  setReplyTo(item);
                  setTimeout(() => inputRef.current?.focus(), 100); // focus input
                }}
                className="flex-row items-center gap-2 px-[40px]"
              >
                <Text className="text-[#0E8747] font-ppneuemontreal">
                  Reply
                </Text>
              </Pressable>
            </TouchableOpacity>
            {/* Replies */}
            <View className="px-[40px]">
              {item.replies.map((reply) => (
                <View key={reply.id}>
                  <View className="flex-row gap-2 items-center mb-2">
                    {/* <View className="w-8 h-8 bg-gray-400 rounded-full" /> */}
                    <Image
                      source={AVATARS.amina}
                      style={{ width: 32, height: 32 }}
                      contentFit="contain"
                      className="rounded-full"
                    />
                    <Text className="font-ppneuemontreal">{reply.text}</Text>
                    <Text className="text-xs text-gray-500">
                      {reply.displayTime}
                    </Text>
                  </View>
                  <Pressable
                    onPress={() => {
                      setReplyTo(item);
                      setTimeout(() => inputRef.current?.focus(), 100); // focus input
                    }}
                    className="flex-row items-center gap-2 px-[40px]"
                  >
                    <Text className="text-[#0E8747] font-ppneuemontreal">
                      Reply
                    </Text>
                  </Pressable>
                </View>
              ))}
            </View>
          </View>
        ))}
      </ScrollView>

      {/* Footer */}
      <KeyboardAvoidingView
        behavior="padding"
        keyboardVerticalOffset={
          keyboardVisible ? (Platform.OS === "ios" ? 100 : 60) : 0
        }
        className="px-[16px] pt-[16px] pb-[16px] bg-[#EFEFEF]"
      >
        <View className="flex-row items-center gap-[10px] mb-[12px]">
          {/* <View className="w-8 h-8 bg-gray-300 rounded-full" /> */}
          <Image
            source={AVATARS.user}
            style={{ width: 32, height: 32 }}
            contentFit="contain"
            className="rounded-full"
          />
          <TextInput
            ref={inputRef}
            placeholder={replyTo ? "Replying..." : "Write your comment here"}
            className="flex-1 bg-[#EFEFEF] px-3 py-2 rounded-lg font-ppneuemontreal"
            value={newInput}
            onChangeText={(txt) => {
              setNewInput(txt);
              if (isPlaying) {
                player.pause();
                setIsPlaying(false);
              }
            }}
          />
        </View>

        <View className="flex-row justify-between items-center mb-[16px]">
          <View className="flex-row items-center gap-[6px] border border-[#F9F9F9] px-[12px] py-[6px] rounded-xl">
            <SimpleLineIcons name="clock" size={15} color="#604800" />
            <Text className="font-ppneuemontreal">
              {formatTime(currentTime)}
            </Text>
            <Entypo name="chevron-small-down" size={16} color="#604800" />
          </View>

          <View className="flex-row gap-2 items-center border border-[#F9F9F9] p-1 h-[30px] rounded-xl">
            <EvilIcons
              name="pencil"
              size={28}
              color="black"
              onPress={handleDraw}
            />
            {drawingEnabled && (
              <>
                <Text className="text-[#F9F9F9]">|</Text>
                <View className="flex-row gap-2">
                  <Pressable
                    className={`w-5 h-5 bg-red-500 rounded ${
                      selectedColor === "#EF4444" ? "border border-black" : ""
                    }`}
                    onPress={() => setSelectedColor("#EF4444")}
                  />
                  <Pressable
                    className={`w-5 h-5 bg-green-500 rounded ${
                      selectedColor === "#22C55E" ? "border border-black" : ""
                    }`}
                    onPress={() => setSelectedColor("#22C55E")}
                  />
                </View>
              </>
            )}
          </View>

          <Pressable
            onPress={handleSubmit}
            className="bg-[#604800] px-[16px] py-[8px] rounded-xl"
          >
            <Text className="text-white font-ppneuemontreal">
              {replyTo ? "Reply" : "Comment"}
            </Text>
          </Pressable>
        </View>
      </KeyboardAvoidingView>
    </View>
  );
}
