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
  const primary = useThemeColor({}, "primary");
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
            <View style={[styles.accentBar, { backgroundColor: primary }]} />
            <View style={styles.content}>
              <ThemedText>{list.name}</ThemedText>
              <View style={[styles.badge, { backgroundColor: primary + "26" }]}>
                <ThemedText style={[styles.badgeText, { color: primary }]}>
                  {list.items.length} items
                </ThemedText>
              </View>
            </View>
          </View>
        </Swipeable>
      </GestureHandlerRootView>
    </Pressable>
  );
};

export default ListCard;

const styles = StyleSheet.create({
  swipeable: {
    borderRadius: 8,
    overflow: "hidden",
    marginBottom: 10,
  },
  container: {
    flexDirection: "row",
  },
  accentBar: {
    width: 4,
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
