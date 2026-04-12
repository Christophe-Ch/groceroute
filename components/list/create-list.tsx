import { useGroceryListStore } from "@/store/grocery-list.store";
import { useForm } from "react-hook-form";
import { StyleSheet } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import ThemedButton from "../themed-button";
import ThemedInput from "../themed-input";
import { ThemedText } from "../themed-text";
import { ThemedView } from "../themed-view";

type CreateListFormValues = {
  listName: string;
};

type CreateListProps = {
  onCreate: () => void;
};

const CreateList = ({ onCreate }: CreateListProps) => {
  const insets = useSafeAreaInsets();
  const {
    control,
    handleSubmit,
    formState: { errors },
  } = useForm<CreateListFormValues>();
  const { createList } = useGroceryListStore();

  const onSubmit = async (data: CreateListFormValues) => {
    await createList(data.listName);
    onCreate();
  };

  return (
    <ThemedView style={[styles.container, { paddingBottom: insets.bottom + 16 }]}>
      <ThemedView style={styles.backgroundBleed} />
      <ThemedText type="title">Create a list</ThemedText>
      <ThemedInput
        placeholder="List name"
        style={{ marginTop: 16 }}
        name="listName"
        control={control}
        error={errors.listName}
        rules={{
          required: { value: true, message: "List name cannot be empty." },
        }}
      />
      <ThemedButton
        iconName={"add"}
        text="Create"
        style={{ alignSelf: "stretch", marginTop: 16 }}
        onPress={handleSubmit(onSubmit)}
      />
    </ThemedView>
  );
};

export default CreateList;

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
