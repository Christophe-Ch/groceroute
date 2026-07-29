import { ScrollView, StyleSheet } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { ThemedText } from "../../themed-text";
import { ThemedView } from "../../themed-view";
import { GroceryList, Participant } from "@/models/grocery";
import ParticipantRowPicker from "./participant-row-picker";
import ThemedButton from "@/components/themed-button";
import { useCallback, useState } from "react";
import { useGroceryListStore } from "@/stores/groceries/grocery-list.store";
import { orderItems } from "@/domain/grocery/distance";
import { useSheet } from "@/contexts/sheet-context";

type ParticipantsProps = {
  list: GroceryList;
};

const PickParticipants = ({ list }: ParticipantsProps) => {
  const insets = useSafeAreaInsets();
  const [pickedParticipants, setPickedParticipants] = useState(new Set());
  const { closeSheet } = useSheet();

  const startShopping = useGroceryListStore((s) => s.startShopping);
  const reorderItems = useGroceryListStore((s) => s.reorderItems);

  const onStartShopping = useCallback(async () => {
    if (!list) return;
    const orderedItems = orderItems(list.items, list.distances);
    await reorderItems(list.id, orderedItems);
    startShopping(list.id);
    closeSheet();
  }, [list, reorderItems, startShopping, closeSheet]);

  const onParticipantPickChanged = (
    participant: Participant,
    checked: boolean,
  ) => {
    const updated = new Set(pickedParticipants);

    if (checked) {
      updated.add(participant.id);
    } else {
      updated.delete(participant.id);
    }

    setPickedParticipants(updated);
  };

  return (
    <ThemedView
      style={[styles.container, { paddingBottom: insets.bottom + 16 }]}
    >
      <ThemedView style={styles.backgroundBleed} />
      <ThemedText type="title" accessibilityRole="header">
        Pick participants
      </ThemedText>
      <ThemedText type="subtitle">
        This list has {list.participants.length} participants
      </ThemedText>
      <ScrollView style={{ marginVertical: 16 }}>
        {list.participants.map((participant) => (
          <ParticipantRowPicker
            key={participant.id}
            participant={participant}
            onParticipantPickChanged={(checked) =>
              onParticipantPickChanged(participant, checked)
            }
          />
        ))}
      </ScrollView>
      <ThemedButton
        text={
          pickedParticipants.size > 0
            ? "Start shopping with " + pickedParticipants.size + " participants"
            : "Pick at least one participant"
        }
        style={{ alignSelf: "stretch" }}
        disabled={pickedParticipants.size === 0}
        onPress={onStartShopping}
      />
    </ThemedView>
  );
};

export default PickParticipants;

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
