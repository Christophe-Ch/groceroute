import ListActionSheet from "@/components/list/list-action-sheet";
import ListCard from "@/components/list/list-card";
import { ThemedIcon } from "@/components/themed-icon";
import ThemedButton from "@/components/themed-button";
import { ThemedText } from "@/components/themed-text";
import { ThemedView } from "@/components/themed-view";
import { useThemeColor } from "@/hooks/ui/use-theme-color";
import { GroceryList } from "@/models/grocery";
import { useGroceryListStore } from "@/store/grocery-list.store";
import { useCallback, useState } from "react";
import { FlatList, ListRenderItem, StyleSheet, View } from "react-native";
import { useShallow } from "zustand/react/shallow";

const Index = () => {
  const lists = useGroceryListStore(
    useShallow((s) =>
      Object.values(s.lists).sort(
        (a, b) =>
          new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime(),
      ),
    ),
  );
  const [sheet, setSheet] = useState<"create" | "join">("create");
  const [showSheet, setShowSheet] = useState(false);
  const iconColor = useThemeColor({}, "icon");

  const onOpenSheet = useCallback((sheet: "create" | "join") => {
    setSheet(sheet);
    setShowSheet(true);
  }, []);
  const onCloseSheet = useCallback(() => setShowSheet(false), []);

  const renderItem: ListRenderItem<GroceryList> = useCallback(
    ({ item }) => <ListCard list={item} />,
    [],
  );

  const keyExtractor = useCallback((item: GroceryList) => item.id, []);

  const ListEmpty = useCallback(
    () => (
      <View style={styles.emptyState}>
        <ThemedIcon
          name="cart-outline"
          size={64}
          color={iconColor}
          importantForAccessibility="no-hide-descendants"
          accessibilityElementsHidden={true}
        />
        <ThemedText type="title" style={styles.emptyTitle}>
          No lists yet
        </ThemedText>
        <ThemedText type="muted" style={styles.emptySubtext}>
          Tap + to create your first grocery list
        </ThemedText>
      </View>
    ),
    [iconColor],
  );

  return (
    <ThemedView style={{ flex: 1, paddingBlock: 20 }}>
      <ThemedText
        type="title"
        style={{ padding: 20 }}
        accessibilityRole="header"
      >
        My lists
      </ThemedText>
      <FlatList
        data={lists}
        renderItem={renderItem}
        keyExtractor={keyExtractor}
        ListEmptyComponent={ListEmpty}
        contentContainerStyle={
          lists.length > 0 ? { paddingHorizontal: 20 } : { flex: 1 }
        }
        keyboardShouldPersistTaps="handled"
      />

      <View
        style={{
          position: "absolute",
          bottom: 20,
          right: 20,
          borderRadius: 50,
          flexDirection: "row",
          gap: 8,
        }}
      >
        <ThemedButton
          iconName={"add"}
          text="Create"
          style={{
            borderRadius: 50,
          }}
          onPress={() => onOpenSheet("create")}
          accessibilityLabel="Create new list"
          hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
        />

        <ThemedButton
          iconName={"person-add"}
          text="Join"
          style={{
            borderRadius: 50,
          }}
          onPress={() => onOpenSheet("join")}
          accessibilityLabel="Join list"
          hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
        />
      </View>

      <ListActionSheet
        sheet={sheet}
        visible={showSheet}
        onClose={onCloseSheet}
      />
    </ThemedView>
  );
};

export default Index;

const styles = StyleSheet.create({
  emptyState: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    paddingHorizontal: 40,
    gap: 12,
  },
  emptyTitle: {
    marginTop: 8,
  },
  emptySubtext: {
    textAlign: "center",
    lineHeight: 22,
  },
});
