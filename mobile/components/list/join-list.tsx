import { useGroceryListStore } from "@/store/grocery-list.store";
import { StyleSheet, View } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { ThemedText } from "../themed-text";
import { ThemedView } from "../themed-view";
import { useSheet } from "@/contexts/sheet-context";
import { CameraView, useCameraPermissions } from "expo-camera";
import { useState } from "react";
import ThemedButton from "../themed-button";
import * as Haptics from "expo-haptics";

const JoinList = () => {
  const insets = useSafeAreaInsets();

  const { joinList } = useGroceryListStore();
  const { closeSheet } = useSheet();
  const [permission, requestPermission] = useCameraPermissions();
  const [scanned, setScanned] = useState(false);
  const [list, setList] = useState<{ id: string; name: string } | null>(null);

  if (!permission) {
    return <View />;
  }

  if (!permission.granted) {
    return (
      <ThemedView
        style={[styles.container, { paddingBottom: insets.bottom + 16 }]}
      >
        <ThemedButton text="Enable camera" onPress={requestPermission} />
      </ThemedView>
    );
  }

  const handleCodeScan = async ({ data }: { data: string }) => {
    if (scanned) return;

    const prefix = "groceroute://join-list/";
    if (data.startsWith(prefix)) {
      const value = data.replace(prefix, "");
      const [id, name] = value.split(":");
      setList({ id, name });
      setScanned(true);
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    }
  };

  const handleSubmit = async () => {
    if (!scanned || !list) return;

    await joinList(list.id);
    closeSheet();
  };

  return (
    <ThemedView
      style={[styles.container, { paddingBottom: insets.bottom + 16 }]}
    >
      <ThemedView style={styles.backgroundBleed} />
      <ThemedText type="title" accessibilityRole="header">
        Join a list
      </ThemedText>
      <ThemedText type="subtitle" accessibilityRole="header">
        Scan the list QR code to join
      </ThemedText>
      <CameraView
        style={styles.camera}
        facing="back"
        // We limit scanning only to QR codes for performance and accuracy
        barcodeScannerSettings={{
          barcodeTypes: ["qr"],
        }}
        onBarcodeScanned={handleCodeScan}
      />
      <ThemedButton
        iconName={"person-add"}
        text={"Join" + (list ? ` ${list.name}` : "")}
        disabled={!scanned}
        style={styles.joinButton}
        onPress={handleSubmit}
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
  camera: {
    marginBlock: 24,
    height: 300,
    width: 300,
    borderRadius: 12,
    overflow: "hidden",
    alignSelf: "center",
  },
  joinButton: {
    width: 300,
    alignSelf: "center",
  },
});
