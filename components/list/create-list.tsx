import { useGroceryListStore } from "@/store/grocery-list.store";
import { useForm } from "react-hook-form";
import { KeyboardAvoidingView, StyleSheet, View } from "react-native";
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
    <ThemedView style={styles.container}>
      <KeyboardAvoidingView
        style={styles.formContainer}
        behavior="padding"
        keyboardVerticalOffset={insets.top + 16}
      >
        <View>
          <ThemedText type="title">Create a list</ThemedText>
          <ThemedInput
            placeholder="List name"
            style={{ marginTop: 20 }}
            name="listName"
            control={control}
            error={errors.listName}
            rules={{
              required: { value: true, message: "List name cannot be empty." },
            }}
          />
        </View>
        <ThemedButton
          iconName={"add"}
          text="Create"
          style={{ alignSelf: "stretch" }}
          onPress={handleSubmit(onSubmit)}
        />
      </KeyboardAvoidingView>
    </ThemedView>
  );
};

export default CreateList;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    paddingHorizontal: 20,
    paddingVertical: 30,
  },
  formContainer: {
    flex: 1,
    justifyContent: "space-between",
  },
});
