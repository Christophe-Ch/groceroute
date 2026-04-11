import CreateList from "@/components/list/create-list";
import ListCard from "@/components/list/list-card";
import { ThemedIcon } from "@/components/themed-icon";
import ThemedButton from "@/components/themed-button";
import { ThemedText } from "@/components/themed-text";
import { ThemedView } from "@/components/themed-view";
import { useThemeColor } from "@/hooks/ui/use-theme-color";
import { useGroceryListStore } from "@/store/grocery-list.store";
import { useEffect, useRef, useState } from "react";
import {
  Animated,
  Keyboard,
  Modal,
  Platform,
  Pressable,
  StyleSheet,
  View,
} from "react-native";
import { ScrollView } from "react-native-gesture-handler";

const Index = () => {
  const { lists, hydrated } = useGroceryListStore();
  const [showCreateListModal, setShowCreateListModal] = useState(false);
  const iconColor = useThemeColor({}, "icon");

  const backdropAnim = useRef(new Animated.Value(0)).current;
  const panelAnim = useRef(new Animated.Value(400)).current;
  const keyboardOffset = useRef(new Animated.Value(0)).current;
  const combinedTranslate = useRef(Animated.add(panelAnim, keyboardOffset)).current;

  useEffect(() => {
    const showEvent =
      Platform.OS === "ios" ? "keyboardWillShow" : "keyboardDidShow";
    const hideEvent =
      Platform.OS === "ios" ? "keyboardWillHide" : "keyboardDidHide";

    const showSub = Keyboard.addListener(showEvent, (e) => {
      Animated.timing(keyboardOffset, {
        toValue: -e.endCoordinates.height,
        duration: Platform.OS === "ios" ? e.duration : 250,
        useNativeDriver: true,
      }).start();
    });

    const hideSub = Keyboard.addListener(hideEvent, (e) => {
      Animated.timing(keyboardOffset, {
        toValue: 0,
        duration: Platform.OS === "ios" ? e.duration : 250,
        useNativeDriver: true,
      }).start();
    });

    return () => {
      showSub.remove();
      hideSub.remove();
    };
  }, [keyboardOffset]);

  const openModal = () => {
    setShowCreateListModal(true);
    backdropAnim.setValue(0);
    panelAnim.setValue(400);
    keyboardOffset.setValue(0);
    Animated.parallel([
      Animated.timing(backdropAnim, {
        toValue: 1,
        duration: 250,
        useNativeDriver: true,
      }),
      Animated.spring(panelAnim, {
        toValue: 0,
        useNativeDriver: true,
        damping: 20,
        stiffness: 200,
      }),
    ]).start();
  };

  const closeModal = () => {
    Keyboard.dismiss();
    Animated.parallel([
      Animated.timing(backdropAnim, {
        toValue: 0,
        duration: 200,
        useNativeDriver: true,
      }),
      Animated.timing(panelAnim, {
        toValue: 400,
        duration: 220,
        useNativeDriver: true,
      }),
      Animated.timing(keyboardOffset, {
        toValue: 0,
        duration: 200,
        useNativeDriver: true,
      }),
    ], { stopTogether: false }).start(() => setShowCreateListModal(false));
  };

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
        onPress={openModal}
      />

      <Modal
        visible={showCreateListModal}
        transparent={true}
        animationType="none"
        onRequestClose={closeModal}
      >
        <View style={styles.modalContainer}>
          <Animated.View
            style={[styles.backdrop, { opacity: backdropAnim }]}
          />
          <Pressable style={StyleSheet.absoluteFill} onPress={closeModal} />
          <Animated.View style={{ transform: [{ translateY: combinedTranslate }] }}>
            <Pressable onPress={() => {}}>
              <CreateList onCreate={closeModal} />
            </Pressable>
          </Animated.View>
        </View>
      </Modal>
    </ThemedView>
  );
};

export default Index;

const styles = StyleSheet.create({
  modalContainer: {
    flex: 1,
    justifyContent: "flex-end",
  },
  backdrop: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: "rgba(0,0,0,0.4)",
  },
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
