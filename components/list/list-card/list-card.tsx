import { useThemeColor } from "@/hooks/ui/use-theme-color";
import { GroceryList } from "@/models/grocery";
import { useRouter } from "expo-router";
import { Pressable, StyleSheet, View } from "react-native";
import { GestureHandlerRootView } from "react-native-gesture-handler";
import Swipeable from "react-native-gesture-handler/ReanimatedSwipeable";
import { ThemedText } from "../../themed-text";
import ListCardAction from "./list-card-action";

type ListCardProps = {
  list: GroceryList;
};

const ListCard = ({ list }: ListCardProps) => {
  const background = useThemeColor({}, "surface");
  const router = useRouter();

  return (
    <Pressable
      onPress={() => router.navigate(`/(app)/(tabs)/lists/${list.id}`)}
    >
      <GestureHandlerRootView>
        <Swipeable
          friction={2}
          rightThreshold={40}
          overshootRight={false}
          renderRightActions={(_, drag) => (
            <ListCardAction drag={drag} listId={list.id} />
          )}
          containerStyle={[styles.swipeable, { backgroundColor: background }]}
        >
          <View style={styles.container}>
            <ThemedText>{list.name}</ThemedText>
            <ThemedText type="muted">{list.items.length} items</ThemedText>
          </View>
        </Swipeable>
      </GestureHandlerRootView>
    </Pressable>
  );
};

export default ListCard;

const styles = StyleSheet.create({
  swipeable: {
    padding: 20,
    borderRadius: 8,
    backgroundColor: "red",
    marginBottom: 10,
  },
  container: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
});
