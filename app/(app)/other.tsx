import { ThemedView } from "@/components/themed-view";
import { ScrollView, View } from "react-native";

const OtherPage = () => {
  return (
    <ThemedView style={{ flex: 1 }}>
      <ScrollView style={{ padding: 20 }} contentContainerStyle={{ gap: 16 }}>
        {Array.from({ length: 5 }).map((_, i) => (
          <View key={i} style={{ height: 100, backgroundColor: "#252525" }} />
        ))}
      </ScrollView>
    </ThemedView>
  );
};

export default OtherPage;
