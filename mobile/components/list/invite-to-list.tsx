import { StyleSheet, View } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { ThemedText } from "../themed-text";
import { ThemedView } from "../themed-view";
import QRCode from "react-native-qrcode-svg";
import { GroceryList } from "@/models/grocery";

type QrCodeProps = {
  list: GroceryList;
};

const InviteToList = ({ list: { id, name } }: QrCodeProps) => {
  const insets = useSafeAreaInsets();
  const value = `groceroute://join-list/${id}:${name}`;

  return (
    <ThemedView
      style={[styles.container, { paddingBottom: insets.bottom + 16 }]}
    >
      <ThemedView style={styles.backgroundBleed} />
      <ThemedText type="title" accessibilityRole="header">
        Invite people
      </ThemedText>
      <View style={styles.qrWrapper}>
        <View style={styles.qrCode}>
          <QRCode value={value} size={200} />
        </View>
      </View>
    </ThemedView>
  );
};

export default InviteToList;

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
  qrWrapper: {
    marginTop: 24,
    alignItems: "center",
  },
  qrCode: {
    padding: 12,
    borderRadius: 12,
    backgroundColor: "white",
  },
});
