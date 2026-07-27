import { ThemedIcon } from "@/components/themed-icon";
import { useThemeColor } from "@/hooks/ui/use-theme-color";
import { useGroceryListStore } from "@/stores/groceries/grocery-list.store";
import { Alert, Pressable, StyleSheet } from "react-native";
import Reanimated, {
  SharedValue,
  useAnimatedStyle,
} from "react-native-reanimated";

type DeleteActionProps = {
  drag: SharedValue<number>;
  listId: string;
};

const DELETE_ACTION_WIDTH = 80;

const DeleteAction = ({ drag, listId }: DeleteActionProps) => {
  const alertColor = useThemeColor({}, "error");
  const styleAnimation = useAnimatedStyle(() => {
    return {
      transform: [{ translateX: drag.value + DELETE_ACTION_WIDTH }],
    };
  });

  const { deleteList } = useGroceryListStore();

  const onDelete = () => {
    Alert.alert("Delete list", "Are you sure you want to delete this list?", [
      { text: "Cancel", style: "cancel" },
      {
        text: "Delete",
        style: "destructive",
        onPress: () => deleteList(listId),
      },
    ]);
  };

  return (
    <Reanimated.View style={[styleAnimation, { backgroundColor: alertColor }]}>
      <Pressable
        style={styles.container}
        onPress={onDelete}
        accessibilityRole="button"
        accessibilityLabel="Delete list"
        accessibilityHint="Shows delete confirmation"
      >
        <ThemedIcon
          name={"trash-bin-outline"}
          importantForAccessibility="no"
          accessibilityElementsHidden={true}
        />
      </Pressable>
    </Reanimated.View>
  );
};

export default DeleteAction;

const styles = StyleSheet.create({
  container: {
    width: DELETE_ACTION_WIDTH,
    height: "100%",
    justifyContent: "center",
    alignItems: "center",
  },
});
