import { useThemeColor } from "@/hooks/ui/use-theme-color";
import { GroceryList } from "@/models/grocery";
import { useGroceryListStore } from "@/stores/groceries/grocery-list.store";
import { useRouter } from "expo-router";
import { memo, useCallback } from "react";
import { Pressable, StyleSheet, View } from "react-native";
import Swipeable from "react-native-gesture-handler/ReanimatedSwipeable";
import { SharedValue } from "react-native-reanimated";
import { ThemedText } from "../../themed-text";
import DeleteAction from "./delete-action";
import { confirmDestructive } from "@/utils/confirm-destructive";

// "26" = ~15% opacity hex suffix appended to 6-digit hex colors
const BADGE_OPACITY_HEX = "26";

type ListCardProps = {
  list: GroceryList;
};

const ListCard = ({ list }: ListCardProps) => {
  const background = useThemeColor({}, "surface");
  const primary = useThemeColor({}, "primary");
  const router = useRouter();
  const { deleteList } = useGroceryListStore();

  const onPress = useCallback(
    () => router.navigate(`/(app)/(tabs)/lists/${list.id}`),
    [router, list.id],
  );

  const onDeleteWithAlert = useCallback(
    () =>
      confirmDestructive({
        title: "Delete list",
        message: "Are you sure you want to delete this list?",
        confirmLabel: "Delete",
        onConfirm: () => deleteList(list.id),
      }),
    [list.id, deleteList],
  );

  const renderRightActions = useCallback(
    (_: SharedValue<number>, drag: SharedValue<number>) => (
      <DeleteAction drag={drag} onDelete={onDeleteWithAlert} />
    ),
    [onDeleteWithAlert],
  );

  return (
    <Pressable
      onPress={onPress}
      accessibilityRole="button"
      accessibilityLabel={`${list.name}, ${list.items.length} items`}
      accessibilityHint="Opens the list"
      accessibilityActions={[{ name: "delete", label: "Delete list" }]}
      onAccessibilityAction={(event) => {
        if (event.nativeEvent.actionName === "delete") onDeleteWithAlert();
      }}
    >
      <Swipeable
        friction={2}
        rightThreshold={40}
        overshootRight={false}
        renderRightActions={renderRightActions}
        containerStyle={[styles.swipeable, { backgroundColor: background }]}
      >
        <View style={styles.container}>
          <View style={styles.content}>
            <ThemedText>{list.name}</ThemedText>
            <View
              style={[
                styles.badge,
                { backgroundColor: primary + BADGE_OPACITY_HEX },
              ]}
            >
              <ThemedText style={[styles.badgeText, { color: primary }]}>
                {list.items.length} items
              </ThemedText>
            </View>
          </View>
        </View>
      </Swipeable>
    </Pressable>
  );
};

export default memo(ListCard);

const styles = StyleSheet.create({
  swipeable: {
    borderRadius: 8,
    overflow: "hidden",
    marginBottom: 10,
  },
  container: {
    flexDirection: "row",
  },
  content: {
    flex: 1,
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingHorizontal: 16,
    paddingVertical: 22,
  },
  badge: {
    borderRadius: 12,
    paddingVertical: 3,
    paddingHorizontal: 8,
  },
  badgeText: {
    fontSize: 12,
    fontWeight: "500",
  },
});
