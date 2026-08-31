import { useEffect, useRef } from "react";
import { AppState, AppStateStatus } from "react-native";

export const useAppState = (
  onStateChange: (state: AppStateStatus) => void | Promise<void>,
) => {
  const savedCallback = useRef(onStateChange);
  const appStateRef = useRef<AppStateStatus>(AppState.currentState);

  useEffect(() => {
    savedCallback.current = onStateChange;
  }, [onStateChange]);

  useEffect(() => {
    const handleAppStateChange = async (nextState: AppStateStatus) => {
      try {
        await savedCallback.current(nextState);
      } catch (err) {
        console.error(err);
      }

      appStateRef.current = nextState;
    };

    const subscription = AppState.addEventListener(
      "change",
      handleAppStateChange,
    );

    return () => subscription.remove();
  }, []);
};
