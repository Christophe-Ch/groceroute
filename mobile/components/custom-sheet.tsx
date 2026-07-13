import { SheetRef } from "@/contexts/sheet-context";
import {
  forwardRef,
  ReactNode,
  useEffect,
  useImperativeHandle,
  useRef,
} from "react";
import {
  Animated,
  Keyboard,
  Modal,
  Platform,
  Pressable,
  StyleSheet,
  View,
} from "react-native";

type Props = {
  visible: boolean;
  children: ReactNode;
  onClose: () => void;
};

const PANEL_SLIDE_DISTANCE = 400;

const CustomSheet = forwardRef<SheetRef, Props>(
  ({ children, visible, onClose }: Props, ref) => {
    const backdropAnim = useRef(new Animated.Value(0)).current;
    const panelAnim = useRef(new Animated.Value(PANEL_SLIDE_DISTANCE)).current;
    const keyboardOffset = useRef(new Animated.Value(0)).current;
    const combinedTranslate = useRef(
      Animated.add(panelAnim, keyboardOffset),
    ).current;

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

    const open = () => {
      backdropAnim.setValue(0);
      panelAnim.setValue(PANEL_SLIDE_DISTANCE);
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

    const close = (onAnimationComplete?: () => void) => {
      Keyboard.dismiss();
      Animated.parallel(
        [
          Animated.timing(backdropAnim, {
            toValue: 0,
            duration: 200,
            useNativeDriver: true,
          }),
          Animated.timing(panelAnim, {
            toValue: PANEL_SLIDE_DISTANCE,
            duration: 220,
            useNativeDriver: true,
          }),
          Animated.timing(keyboardOffset, {
            toValue: 0,
            duration: 200,
            useNativeDriver: true,
          }),
        ],
        { stopTogether: false },
      ).start(() => {
        if (onAnimationComplete) {
          onAnimationComplete();
        } else {
          onClose();
        }
      });
    };

    useImperativeHandle(ref, () => ({ open, close }));

    return (
      <Modal
        visible={visible}
        transparent={true}
        animationType="none"
        onRequestClose={() => close()}
        onShow={open}
      >
        <View style={styles.container}>
          <Animated.View style={[styles.backdrop, { opacity: backdropAnim }]} />
          <Pressable
            style={StyleSheet.absoluteFill}
            onPress={onClose}
            accessibilityRole="button"
            accessibilityLabel="Close"
          />
          <Animated.View
            style={{ transform: [{ translateY: combinedTranslate }] }}
            accessibilityViewIsModal={true}
          >
            {/* Absorbs taps so pressing inside the panel doesn't trigger the backdrop close */}
            <Pressable onPress={() => {}}>{children}</Pressable>
          </Animated.View>
        </View>
      </Modal>
    );
  },
);

CustomSheet.displayName = "CustomSheet";

export default CustomSheet;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: "flex-end",
  },
  backdrop: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: "rgba(0,0,0,0.4)",
  },
});
