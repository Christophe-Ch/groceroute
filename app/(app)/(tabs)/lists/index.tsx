import CreateList from "@/components/list/create-list";
import ListCard from "@/components/list/list-card";
import ThemedButton from "@/components/themed-button";
import { ThemedText } from "@/components/themed-text";
import { ThemedView } from "@/components/themed-view";
import { useGroceryListStore } from "@/store/grocery-list.store";
import { useState } from "react";
import { Modal } from "react-native";
import { ScrollView } from "react-native-gesture-handler";

const Index = () => {
  const { lists, hydrated } = useGroceryListStore();
  const [showCreateListModal, setShowCreateListModal] = useState(false);

  if (!hydrated) {
    return (
      <ThemedView
        style={{ flex: 1, justifyContent: "center", alignItems: "center" }}
      >
        <ThemedText>Loading...</ThemedText>
      </ThemedView>
    );
  }

  return (
    <ThemedView style={{ flex: 1, paddingBlock: 20 }}>
      <ThemedText type="title" style={{ padding: 20 }}>
        My lists
      </ThemedText>
      <ScrollView style={{ flex: 1, paddingHorizontal: 20 }}>
        {Object.values(lists).map((list) => (
          <ListCard key={list.id} list={list} />
        ))}
      </ScrollView>

      <ThemedButton
        iconName={"create-outline"}
        style={{
          position: "absolute",
          bottom: 20,
          right: 20,
          borderRadius: 50,
        }}
        onPress={() => setShowCreateListModal(true)}
      />

      <Modal
        visible={showCreateListModal}
        presentationStyle={"pageSheet"}
        animationType="slide"
        onRequestClose={() => setShowCreateListModal(false)}
      >
        <CreateList onCreate={() => setShowCreateListModal(false)} />
      </Modal>
    </ThemedView>
  );
};

export default Index;
