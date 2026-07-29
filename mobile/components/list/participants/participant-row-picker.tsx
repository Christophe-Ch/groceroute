import { ThemedText } from "@/components/themed-text";
import { useThemeColor } from "@/hooks/ui/use-theme-color";
import { Participant } from "@/models/grocery";
import { Ionicons } from "@expo/vector-icons";
import { useState } from "react";
import { Pressable, StyleSheet } from "react-native";

type ParticipantRowPickerProps = {
  participant: Participant;
  onParticipantPickChanged: (checked: boolean) => void;
};

const ParticipantRowPicker = ({
  participant,
  onParticipantPickChanged,
}: ParticipantRowPickerProps) => {
  const [checked, setChecked] = useState(false);
  const muted = useThemeColor({}, "textMuted");
  const primary = useThemeColor({}, "primary");

  const toggle = () => {
    const next = !checked;
    setChecked(next);
    onParticipantPickChanged(next);
  };

  return (
    <Pressable
      style={styles.row}
      onPress={toggle}
      accessibilityRole="checkbox"
      accessibilityState={{ checked }}
      accessibilityLabel={participant.email}
      accessibilityHint="Double tap to toggle"
    >
      <Ionicons
        name={checked ? "checkmark-circle" : "ellipse-outline"}
        size={24}
        color={checked ? primary : muted}
        importantForAccessibility="no"
        accessibilityElementsHidden={true}
      />
      <ThemedText>{participant.email}</ThemedText>
    </Pressable>
  );
};

export default ParticipantRowPicker;

const styles = StyleSheet.create({
  row: {
    paddingVertical: 8,
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
  },
});
