import { GroceryItem } from "@/models/grocery";
import { GroceryList } from "@/models/grocery/grocery-list";
import { useGroceryListStore } from "@/stores/groceries/grocery-list.store";
import { useCallback, useMemo, useState } from "react";
import {
  KeyboardAvoidingView,
  Pressable,
  StyleSheet,
  TouchableOpacity,
  View,
} from "react-native";
import DraggableFlatList from "react-native-draggable-flatlist";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import AddItemRow from "../item/add-item-row";
import EditItemRow from "../item/edit-item-row";
import ThemedButton from "../themed-button";
import ThemedInput from "../themed-input";
import { ThemedText } from "../themed-text";
import { useSheet } from "@/contexts/sheet-context";
import InviteToList from "./invite-to-list";
import { ThemedIcon } from "../themed-icon";
import ViewParticipants from "./participants/view-participants";
import PickParticipants from "./participants/pick-participants";

type EditListProps = {
  list: GroceryList;
};

const EditList = ({ list }: EditListProps) => {
  const { renameList, reorderItems } = useGroceryListStore();
  const { openSheet } = useSheet();
  const insets = useSafeAreaInsets();

  const currentItemIds = useMemo(
    () => new Set(list.items.map((i) => i.id)),
    [list.items],
  );
  const [listName, setListName] = useState(list.name);

  const onUpdateTitle = useCallback(() => {
    const trimmed = listName.trim();
    if (trimmed && trimmed !== list.name) {
      renameList(list.id, trimmed);
    }
  }, [listName, list.name, list.id, renameList]);

  const onDragEnd = useCallback(
    ({ data }: { data: GroceryItem[] }) => reorderItems(list.id, data),

    [list.id, reorderItems],
  );

  const renderItem = useCallback(
    ({ item, drag }: { item: GroceryItem; drag: () => void }) => (
      <TouchableOpacity onLongPress={drag}>
        <EditItemRow key={item.id} listId={list.id} item={item} />
      </TouchableOpacity>
    ),

    [list.id],
  );

  return (
    <>
      <View style={{ flexDirection: "row", alignItems: "center", margin: 20 }}>
        <ThemedInput
          style={styles.title}
          value={listName}
          onChangeText={setListName}
          onBlur={onUpdateTitle}
          maxLength={20}
        />
        <Pressable
          style={{ flexDirection: "row", alignItems: "center", gap: 4 }}
          onPress={() =>
            openSheet(<ViewParticipants participants={list.participants} />)
          }
        >
          <ThemedIcon name="person" size={16} />
          <ThemedText>{list.participants.length}</ThemedText>
        </Pressable>
      </View>

      <View style={styles.listHeader}>
        <ThemedText type="muted">{list.items.length} items</ThemedText>
      </View>

      <KeyboardAvoidingView
        behavior="padding"
        keyboardVerticalOffset={insets.top + KEYBOARD_OFFSET_PADDING}
        style={{ flex: 1 }}
      >
        <View style={{ zIndex: 1 }}>
          <AddItemRow
            listId={list.id}
            pastItems={list.pastItems}
            currentItemIds={currentItemIds}
          />
        </View>
        <DraggableFlatList
          data={list.items}
          onDragEnd={onDragEnd}
          keyExtractor={(item) => item.id}
          renderItem={renderItem}
          keyboardShouldPersistTaps="handled"
          containerStyle={{ flex: 1 }}
          activationDistance={10}
        />
      </KeyboardAvoidingView>

      <View style={styles.actions}>
        <ThemedButton
          iconName="person-add"
          style={{ height: "100%" }}
          onPress={() => openSheet(<InviteToList list={list} />)}
        />
        <ThemedButton
          iconName="play"
          text="Let's shop"
          onPress={() => openSheet(<PickParticipants list={list} />)}
          style={{ flex: 1 }}
        />
      </View>
    </>
  );
};

export default EditList;

const KEYBOARD_OFFSET_PADDING = 16;

const styles = StyleSheet.create({
  title: {
    fontSize: 32,
    fontWeight: "bold",
    lineHeight: 32,
    backgroundColor: "transparent",
    borderWidth: 0,
    padding: 0,
    flex: 1,
  },
  listHeader: {
    paddingInline: 20,
    paddingBottom: 10,
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  actions: {
    flexDirection: "row",
    paddingInline: 20,
    paddingTop: 20,
    gap: 12,
  },
});
