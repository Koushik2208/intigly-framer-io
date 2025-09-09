import { Entypo, SimpleLineIcons } from "@expo/vector-icons";
import React, { useState } from "react";
import {
  Image,
  Pressable,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";

type AnchorModalProps = {
  visible: boolean;
  onClose: () => void;
  onSubmit: (text: string) => void;
  timestamp: string;
};

const AnchorModal = ({
  visible,
  onClose,
  onSubmit,
  timestamp,
}: AnchorModalProps) => {
  const [text, setText] = useState("");

  if (!visible) return null; // don’t render at all if hidden

  return (
    <Pressable
      className="absolute w-full h-full items-center justify-center z-40 bg-black/30"
      onPress={onClose} // tapping backdrop closes modal
    >
      {/* Modal card */}
      <Pressable
        className="bg-white rounded-xl shadow-lg p-4 w-[80%] max-w-sm"
        onPress={(e) => e.stopPropagation()} // prevent backdrop close
      >
        <View className="flex-row items-center gap-[6px] mb-2">
          <Image
            source={require("../../assets/images/user.png")}
            className="w-[17px] h-[17px] rounded-full"
          />
          <TextInput
            className="font-ppneuemontreal text-sm flex-1"
            placeholder="Add an anchor comment"
            value={text}
            onChangeText={setText}
          />
        </View>

        <View className="flex-row items-center justify-between mt-4">
          <View className="flex-row items-center gap-[6px] border border-[#F9F9F9] px-[12px] py-[6px] rounded-xl">
            <SimpleLineIcons name="clock" size={12} color="#604800" />
            <Text className="font-ppneuemontreal text-xs">{timestamp}</Text>
            <Entypo name="chevron-small-down" size={16} color="#604800" />
          </View>

          <TouchableOpacity
            className="bg-[#604800] py-2 px-6 rounded-xl"
            onPress={() => {
              if (text.trim()) {
                onSubmit(text.trim());
                setText("");
              }
            }}
          >
            <Text className="text-white text-xs font-ppneuemontreal">
              Comment
            </Text>
          </TouchableOpacity>
        </View>
      </Pressable>
    </Pressable>
  );
};

export default AnchorModal;
