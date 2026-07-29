import { ThemedIcon } from "@/components/themed-icon";
import { useThemeColor } from "@/hooks/ui/use-theme-color";
import { Pressable, StyleSheet } from "react-native";
import Reanimated, {
  SharedValue,
  useAnimatedStyle,
} from "react-native-reanimated";

type DeleteActionProps = {
  drag: SharedValue<number>;
  onDelete: () => void;
};

const DELETE_ACTION_WIDTH = 80;

const DeleteAction = ({ drag, onDelete }: DeleteActionProps) => {
  const alertColor = useThemeColor({}, "error");
  const styleAnimation = useAnimatedStyle(() => {
    return {
      transform: [{ translateX: drag.value + DELETE_ACTION_WIDTH }],
    };
  });

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
