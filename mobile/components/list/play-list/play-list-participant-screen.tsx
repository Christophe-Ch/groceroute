import { useCallback, useMemo } from "react";
import { FlatList } from "react-native";
import PlayItemRow from "../../item/play-item-row";
import { GroceryItem } from "@/models/grocery";

type PlayListParticipantScreenProps = {
  items: GroceryItem[];
  onItemCheckChange: (itemId: string, checked: boolean) => void;
};

const PlayListParticipantScreen = ({
  items,
  onItemCheckChange,
}: PlayListParticipantScreenProps) => {
  const sortedItems = useMemo(
    () => [...items].sort((a, b) => +a.checked - +b.checked),
    [items],
  );

  const renderItem = useCallback(
    ({ item }: { item: GroceryItem }) => (
      <PlayItemRow item={item} onItemCheckChange={onItemCheckChange} />
    ),
    [onItemCheckChange],
  );

  return (
    <>
      <FlatList
        data={sortedItems}
        keyExtractor={(item) => item.id}
        renderItem={renderItem}
        keyboardShouldPersistTaps="handled"
      />
    </>
  );
};

export default PlayListParticipantScreen;
