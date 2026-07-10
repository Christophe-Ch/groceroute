import { useGroceryListStore } from "@/store/grocery-list.store";
import { useForm } from "react-hook-form";
import { StyleSheet } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import ThemedButton from "../themed-button";
import ThemedInput from "../themed-input";
import { ThemedText } from "../themed-text";
import { ThemedView } from "../themed-view";

type JoinListFormValues = {
  listId: string;
};

type JoinListProps = {
  onJoin: () => void;
};

const JoinList = ({ onJoin }: JoinListProps) => {
  const insets = useSafeAreaInsets();
  const {
    control,
    handleSubmit,
    formState: { errors },
  } = useForm<JoinListFormValues>();
  const { joinList } = useGroceryListStore();

  const onSubmit = async (data: JoinListFormValues) => {
    await joinList(data.listId);
    onJoin();
  };

  return (
    <ThemedView
      style={[styles.container, { paddingBottom: insets.bottom + 16 }]}
    >
      <ThemedView style={styles.backgroundBleed} />
      <ThemedText type="title" accessibilityRole="header">
        Join a list
      </ThemedText>
      <ThemedInput
        placeholder="List ID"
        style={{ marginTop: 16 }}
        name="listId"
        control={control}
        error={errors.listId}
        rules={{
          required: { value: true, message: "List ID cannot be empty." },
        }}
      />
      <ThemedButton
        iconName={"person-add"}
        text="Join"
        style={{ alignSelf: "stretch", marginTop: 16 }}
        onPress={handleSubmit(onSubmit)}
      />
    </ThemedView>
  );
};

export default JoinList;

// Extends the panel background below the visible area to cover the overscroll reveal
const BACKGROUND_BLEED_HEIGHT = 500;

const styles = StyleSheet.create({
  container: {
    paddingHorizontal: 20,
    paddingTop: 24,
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
  },
  backgroundBleed: {
    position: "absolute",
    bottom: -BACKGROUND_BLEED_HEIGHT,
    left: 0,
    right: 0,
    height: BACKGROUND_BLEED_HEIGHT,
  },
});
