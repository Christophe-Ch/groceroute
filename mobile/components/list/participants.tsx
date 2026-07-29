import { ScrollView, StyleSheet, View } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { ThemedText } from "../themed-text";
import { ThemedView } from "../themed-view";
import { Participant } from "@/models/grocery";

type ParticipantsProps = {
  participants: Participant[];
};

const Participants = ({ participants }: ParticipantsProps) => {
  const insets = useSafeAreaInsets();

  return (
    <ThemedView
      style={[styles.container, { paddingBottom: insets.bottom + 16 }]}
    >
      <ThemedView style={styles.backgroundBleed} />
      <ThemedText type="title" accessibilityRole="header">
        Participants
      </ThemedText>
      <ThemedText type="subtitle">
        This list has {participants.length} participants
      </ThemedText>
      <ScrollView style={{ marginTop: 8 }}>
        {participants.map((participant) => (
          <View
            key={participant.id}
            style={{
              flexDirection: "row",
              gap: 8,
              alignItems: "center",
              marginTop: 8,
            }}
          >
            <View
              style={{
                borderRadius: "50%",
                backgroundColor: "grey",
                aspectRatio: 1,
                height: 36,
                alignItems: "center",
                justifyContent: "center",
              }}
            >
              <ThemedText>
                {participant.email.charAt(0).toUpperCase()}
              </ThemedText>
            </View>
            <ThemedText>{participant.email}</ThemedText>
          </View>
        ))}
      </ScrollView>
    </ThemedView>
  );
};

export default Participants;

// Extends the panel background below the visible area to cover the overscroll reveal
const BACKGROUND_BLEED_HEIGHT = 400;

const styles = StyleSheet.create({
  container: {
    paddingHorizontal: 20,
    paddingTop: 24,
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
  },
  backgroundBleed: {
    position: "absolute",
    bottom: -BACKGROUND_BLEED_HEIGHT,
    left: 0,
    right: 0,
    height: BACKGROUND_BLEED_HEIGHT,
  },
});
