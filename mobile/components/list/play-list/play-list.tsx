import { GroceryList } from "@/models/grocery/grocery-list";
import { useThemeColor } from "@/hooks/ui/use-theme-color";
import { useGroceryListStore } from "@/stores/groceries/grocery-list.store";
import { useCallback, useMemo, useState } from "react";
import { Pressable, StyleSheet, View } from "react-native";
import ThemedButton from "../../themed-button";
import { ThemedText } from "../../themed-text";
import PlayListParticipantScreen from "./play-list-participant-screen";
import { ThemedIcon } from "@/components/themed-icon";
import { SHOPPING_START_SENTINEL } from "@/domain/grocery/distance";
import { confirmDestructive } from "@/utils/confirm-destructive";

type PlayListProps = {
  list: GroceryList;
};

const PlayList = ({ list }: PlayListProps) => {
  const [currentParticipantIndex, setCurrentParticipantIndex] =
    useState<number>(0);
  const primary = useThemeColor({}, "primary");
  const trackColor = useThemeColor({}, "surfaceElevated");

  const checkedCount = list.items.filter((i) => i.checked).length;
  const totalCount = list.items.length;

  const participants = list.participants;
  const currentParticipant = participants[currentParticipantIndex];

  const participantItems = useMemo(() => {
    const participantCount = participants.length;
    if (participantCount === 0) return list.items;

    const bound = (index: number) =>
      Math.round((index * list.items.length) / participantCount);

    return list.items.slice(
      bound(currentParticipantIndex),
      bound(currentParticipantIndex + 1),
    );
  }, [currentParticipantIndex, list.items, participants.length]);

  const [checkOrder, setCheckOrder] = useState<Set<string>>(
    new Set([SHOPPING_START_SENTINEL]),
  );
  const { checkItem, uncheckItem, finishShopping, abandonShopping } =
    useGroceryListStore();

  const onItemCheckChange = useCallback(
    (itemId: string, checked: boolean) => {
      if (checked) {
        checkItem(list.id, itemId);
      } else {
        uncheckItem(list.id, itemId);
      }

      setCheckOrder((order) => {
        const next = new Set(order);
        if (checked) {
          next.add(itemId);
        } else {
          next.delete(itemId);
        }
        return next;
      });
    },
    [checkItem, list.id, uncheckItem],
  );

  const onStop = () =>
    confirmDestructive({
      title: "Stop shopping",
      message:
        "Are you sure you want to stop shopping? This will uncheck all items and move the list back to the main screen.",
      confirmLabel: "Stop",
      onConfirm: () => {
        abandonShopping(list.id);
      },
    });

  const onFinish = () =>
    confirmDestructive({
      title: "Finish shopping",
      message:
        "Are you sure you want to finish shopping? This will clear the list and move it back to the main screen.",
      confirmLabel: "Finish",
      onConfirm: () => {
        finishShopping(list.id, Array.from(checkOrder));
      },
    });

  const onParticipantChange = (delta: 1 | -1) => {
    setCurrentParticipantIndex(
      (i) => (i + delta + participants.length) % participants.length,
    );
  };

  return (
    <>
      <ThemedText
        type="title"
        style={{ margin: 20 }}
        accessibilityRole="header"
      >
        {list.name}
      </ThemedText>

      <View style={styles.listHeader}>
        <ThemedText type="muted">
          {totalCount - checkedCount} items left
        </ThemedText>
        {totalCount > 0 && (
          <View
            style={[styles.progressTrack, { backgroundColor: trackColor }]}
            accessibilityRole="progressbar"
            accessibilityValue={{
              min: 0,
              max: totalCount,
              now: checkedCount,
              text: `${checkedCount} of ${totalCount} items checked`,
            }}
          >
            <View style={{ flex: checkedCount, backgroundColor: primary }} />
            <View style={{ flex: Math.max(0, totalCount - checkedCount) }} />
          </View>
        )}
      </View>
      <View style={styles.participantHeader}>
        <Pressable onPress={() => onParticipantChange(-1)}>
          <ThemedIcon name={"arrow-back"} />
        </Pressable>
        <ThemedText>{currentParticipant.email}</ThemedText>
        <Pressable onPress={() => onParticipantChange(1)}>
          <ThemedIcon name={"arrow-forward"} />
        </Pressable>
      </View>
      <PlayListParticipantScreen
        items={participantItems}
        onItemCheckChange={onItemCheckChange}
      />
      <View style={styles.actions}>
        <ThemedButton
          iconName="stop"
          style={{ height: "100%" }}
          onPress={onStop}
          type="danger"
          accessibilityLabel="Stop shopping"
        />
        <ThemedButton
          iconName="checkmark-done"
          text="Finish"
          style={{ flex: 1 }}
          onPress={onFinish}
          type="success"
        />
      </View>
    </>
  );
};

export default PlayList;

const styles = StyleSheet.create({
  listHeader: {
    paddingInline: 20,
    paddingBottom: 10,
    gap: 8,
  },
  participantHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginHorizontal: 16,
    marginVertical: 16,
  },
  progressTrack: {
    height: 4,
    flexDirection: "row",
    borderRadius: 2,
    overflow: "hidden",
  },
  actions: {
    flexDirection: "row",
    paddingInline: 20,
    paddingTop: 20,
    gap: 12,
  },
});
