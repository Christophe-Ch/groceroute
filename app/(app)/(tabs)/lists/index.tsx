import CreateList from "@/components/list/create-list";
import ListCard from "@/components/list/list-card";
import { ThemedIcon } from "@/components/themed-icon";
import ThemedButton from "@/components/themed-button";
import { ThemedText } from "@/components/themed-text";
import { ThemedView } from "@/components/themed-view";
import { useThemeColor } from "@/hooks/ui/use-theme-color";
import { useGroceryListStore } from "@/store/grocery-list.store";
import { useState } from "react";
import { Modal, StyleSheet, View } from "react-native";
import { ScrollView } from "react-native-gesture-handler";

const Index = () => {
  const { lists, hydrated } = useGroceryListStore();
  const [showCreateListModal, setShowCreateListModal] = useState(false);
  const iconColor = useThemeColor({}, "icon");

  if (!hydrated) {
    return (
      <ThemedView
        style={{ flex: 1, justifyContent: "center", alignItems: "center" }}
      >
        <ThemedText>Loading...</ThemedText>
      </ThemedView>
    );
  }

  const isEmpty = Object.values(lists).length === 0;

  return (
    <ThemedView style={{ flex: 1, paddingBlock: 20 }}>
      <ThemedText type="title" style={{ padding: 20 }}>
        My lists
      </ThemedText>
      {isEmpty ? (
        <View style={styles.emptyState}>
          <ThemedIcon name="cart-outline" size={64} color={iconColor} />
          <ThemedText type="title" style={styles.emptyTitle}>
            No lists yet
          </ThemedText>
          <ThemedText type="muted" style={styles.emptySubtext}>
            Tap + to create your first grocery list
          </ThemedText>
        </View>
      ) : (
        <ScrollView style={{ flex: 1, paddingHorizontal: 20 }}>
          {Object.values(lists).map((list) => (
            <ListCard key={list.id} list={list} />
          ))}
        </ScrollView>
      )}

      <ThemedButton
        iconName={"add"}
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

const styles = StyleSheet.create({
  emptyState: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    paddingHorizontal: 40,
    gap: 12,
  },
  emptyTitle: {
    marginTop: 8,
  },
  emptySubtext: {
    textAlign: "center",
    lineHeight: 22,
  },
});
