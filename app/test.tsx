import Entypo from "@expo/vector-icons/Entypo";
import EvilIcons from "@expo/vector-icons/EvilIcons";
import FontAwesome5 from "@expo/vector-icons/FontAwesome5";
import SimpleLineIcons from "@expo/vector-icons/SimpleLineIcons";
import { Image } from "expo-image";
import React, { useEffect, useState } from "react";
import {
  Keyboard,
  KeyboardAvoidingView,
  Pressable,
  ScrollView,
  Text,
  TextInput,
  View,
} from "react-native";

type Comment = {
  id: number;
  user: string;
  comment: string;
  time: string;
  active?: boolean;
  replies: string[];
};

const AVATARS = {
  noah: require("../assets/images/noah.png"),
  amina: require("../assets/images/amina.png"),
  user: require("../assets/images/user.png"),
  emoji: require("../assets/images/emoji.png"),
};

const dummyComments: Comment[] = [
  {
    id: 1,
    user: "Noah Green",
    comment: "I think you forgot to change this one",
    time: "09:30 AM",
    active: true,
    replies: ["Yeah, I think so too."],
  },
  {
    id: 2,
    user: "Amina Grace",
    comment: "Looks good to me",
    time: "Just now",
    replies: [],
  },
];

type ReplyItemProps = {
  reply: string;
};

const ReplyItem: React.FC<ReplyItemProps> = ({ reply }) => (
  <View className="flex-row gap-2 items-center mb-2">
    <Image
      source={AVATARS.amina}
      style={{ width: 32, height: 32 }}
      contentFit="contain"
      className="rounded-full"
    />
    <Text className="font-ppneuemontreal">{reply}</Text>
  </View>
);

type CommentItemProps = {
  item: Comment;
};

const CommentItem: React.FC<CommentItemProps> = ({ item }) => (
  <View
    key={item.id}
    className={`gap-[12px] px-[16px] py-[12px] ${
      item.active ? "bg-[#FAFFEC]" : ""
    }`}
  >
    <View className="flex-row gap-2 items-center">
      <Image
        source={AVATARS.noah}
        style={{ width: 32, height: 32 }}
        contentFit="contain"
        className="rounded-full"
      />
      <Text className="text-[#1E1E1E] font-semibold font-ppneuemontreal-medium">
        {item.user}
      </Text>
      <Text className="text-gray-500 text-sm">{item.time}</Text>
    </View>

    <Text className="px-[40px] font-ppneuemontreal">{item.comment}</Text>

    <View className="px-[40px]">
      {item.replies.map((reply, idx) => (
        <ReplyItem key={idx} reply={reply} />
      ))}
    </View>

    <View className="flex-row items-center gap-2 px-[40px]">
      <Image
        source={AVATARS.emoji}
        style={{ width: 14, height: 14 }}
        contentFit="contain"
      />
      <Text className="text-[#0E8747] font-ppneuemontreal">Reply</Text>
    </View>
  </View>
);

const Test: React.FC = () => {
  const [keyboardVisible, setKeyboardVisible] = useState<boolean>(false);

  useEffect(() => {
    const showSub = Keyboard.addListener("keyboardDidShow", () =>
      setKeyboardVisible(true)
    );
    const hideSub = Keyboard.addListener("keyboardDidHide", () =>
      setKeyboardVisible(false)
    );
    return () => {
      showSub.remove();
      hideSub.remove();
    };
  }, []);

  return (
    <View className="flex-1 bg-white">
      <ScrollView
        className="flex-1"
        contentContainerStyle={{ paddingBottom: 80 }}
      >
        {/* Centered Title */}
        <Text className="mb-[16px] mt-[16px] px-[16px] text-center font-ppneuemontreal-medium">
          Nothing 14 Launch
        </Text>

        {/* Centered Video */}
        <View className="items-center mb-[10px]">
          <View className="border rounded-xl aspect-[16/9] w-[90%] relative">
            <Text className="font-ppneuemontreal text-center mt-4">
              Actual Video
            </Text>
            <View className="absolute bottom-0 left-0 right-0">
              <View className="h-[6px] bg-[#0E8747]"></View>
              <View className="bg-[#1E1E1E] px-[16px] py-[12px] flex-row items-center justify-between rounded-b-xl">
                <View className="flex-row items-center gap-[12px]">
                  <FontAwesome5 name="pause" size={20} color="white" />
                  <SimpleLineIcons name="volume-1" size={20} color="white" />
                </View>
                <View>
                  <Text className="text-white font-ppneuemontreal">
                    00:19/00:48
                  </Text>
                </View>
                <View className="flex-row items-center gap-[12px]">
                  <EvilIcons name="location" size={28} color="white" />
                  <FontAwesome5 name="expand-alt" size={20} color="white" />
                </View>
              </View>
            </View>
          </View>
        </View>

        <View className="flex-row items-center gap-[8px] mb-[16px]">
          <Text className="px-[16px] mb-2 font-ppneuemontreal-medium">
            Comments
          </Text>
          <Text className="font-ppneuemontreal border border-[#EFEFEF] py-[5px] px-[10px] rounded-xl">
            2
          </Text>
        </View>

        {dummyComments.map((item) => (
          <CommentItem key={item.id} item={item} />
        ))}
      </ScrollView>

      {/* Footer with top + bottom padding */}
      <KeyboardAvoidingView
        behavior="padding"
        keyboardVerticalOffset={keyboardVisible ? 50 : 0}
        className="px-[16px] bg-[#EFEFEF]"
      >
        <View className="flex-row items-center gap-[10px] mb-[40px] mt-[16px]">
          <Image
            source={AVATARS.user}
            style={{ width: 32, height: 32 }}
            contentFit="contain"
            className="rounded-full"
          />
          <TextInput
            placeholder="Write your comment here"
            className="flex-1 bg-[#EFEFEF] px-3 py-2 rounded-lg font-ppneuemontreal"
          />
        </View>

        <View className="flex-row justify-between items-center mb-[16px]">
          <View className="flex-row items-center gap-[6px] border border-[#F9F9F9] px-[12px] py-[6px] rounded-xl">
            <SimpleLineIcons name="clock" size={15} color="#604800" />
            <Text className="font-ppneuemontreal">00:04</Text>
            <Entypo name="chevron-small-down" size={16} color="#604800" />
          </View>

          <View className="flex-row gap-2 items-center border border-[#F9F9F9] px-[18px] rounded-xl">
            <View className="p-1">
              <EvilIcons name="pencil" size={28} color="black" />
            </View>
            <Text className="text-[#F9F9F9]">|</Text>
            <View className="flex-row gap-2">
              <View className="w-5 h-5 bg-red-500 rounded" />
              <View className="w-5 h-5 bg-green-500 rounded" />
            </View>
          </View>

          <Pressable className="bg-[#604800] px-[16px] py-[8px] rounded-xl">
            <Text className="text-white font-ppneuemontreal">Comment</Text>
          </Pressable>
        </View>
      </KeyboardAvoidingView>
    </View>
  );
};

export default Test;
