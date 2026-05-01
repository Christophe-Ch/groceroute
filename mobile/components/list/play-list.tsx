import { GroceryList } from "@/models/grocery/grocery-list";
import { useThemeColor } from "@/hooks/ui/use-theme-color";
import { useGroceryListStore } from "@/store/grocery-list.store";
import { produce } from "immer";
import { useCallback, useMemo, useState } from "react";
import { Alert, FlatList, StyleSheet, View } from "react-native";
import PlayItemRow from "../item/play-item-row";
import ThemedButton from "../themed-button";
import { ThemedText } from "../themed-text";

// Represents the virtual "start" node for the shopping route graph
const SHOPPING_START_SENTINEL = "_start";

type PlayListProps = {
  list: GroceryList;
  onModeChange: () => void;
};

const PlayList = ({ list: baseList, onModeChange }: PlayListProps) => {
  // Shopping session state is intentionally ephemeral: checked items are held
  // in local state and not persisted to the store. Stopping or backgrounding
  // the app resets progress. GroceryItem.checked is unused during play mode.
  const [list, setList] = useState(baseList);
  const items = useMemo(
    () => [...list.items].sort((a, b) => +a.checked - +b.checked),
    [list.items],
  );
  const primary = useThemeColor({}, "primary");
  const trackColor = useThemeColor({}, "surfaceElevated");
  const checkedCount = useMemo(() => items.filter((i) => i.checked).length, [items]);
  const totalCount = items.length;

  const [checkOrder, setCheckOrder] = useState<Set<string>>(
    new Set([SHOPPING_START_SENTINEL]),
  );
  const { finishShopping } = useGroceryListStore();

  const onItemCheckedChange = useCallback((itemId: string, checked: boolean) => {
    setList((list) =>
      produce(list, (draft) => {
        const target = draft.items.find((i) => i.id === itemId);
        if (target) target.checked = checked;
      }),
    );

    setCheckOrder((order) => {
      const next = new Set(order);
      if (checked) {
        next.add(itemId);
      } else {
        next.delete(itemId);
      }
      return next;
    });
  }, []);

  const onStop = () => {
    Alert.alert(
      "Stop shopping",
      "Are you sure you want to stop shopping? This will uncheck all items and move the list back to the main screen.",
      [
        { text: "Cancel", style: "cancel" },
        {
          text: "Stop",
          style: "destructive",
          onPress: () => {
            onModeChange();
          },
        },
      ],
    );
  };

  const onFinish = () => {
    Alert.alert(
      "Finish shopping",
      "Are you sure you want to finish shopping? This will clear the list and move it back to the main screen.",
      [
        { text: "Cancel", style: "cancel" },
        {
          text: "Finish",
          style: "destructive",
          onPress: () => {
            finishShopping(list.id, Array.from(checkOrder));
            onModeChange();
          },
        },
      ],
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
      <FlatList
        data={items}
        keyExtractor={(item) => item.id}
        renderItem={({ item }) => (
          <PlayItemRow item={item} onItemCheckedChange={onItemCheckedChange} />
        )}
        keyboardShouldPersistTaps="handled"
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
