import { useThemeColor } from "@/hooks/ui/use-theme-color";
import { GroceryList } from "@/models/grocery";
import { StyleSheet, View } from "react-native";
import { ThemedText } from "../themed-text";

type ListCardProps = {
  list: GroceryList;
};

const ListCard = ({ list }: ListCardProps) => {
  const background = useThemeColor({}, "surface");

  return (
    <View style={[styles.card, { backgroundColor: background }]}>
      <ThemedText>{list.name}</ThemedText>
      <ThemedText type="muted">{list.items.length} items</ThemedText>
    </View>
  );
};

export default ListCard;

const styles = StyleSheet.create({
  card: {
    padding: 20,
    borderRadius: 8,
    backgroundColor: "red",
    marginBottom: 10,
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
});
