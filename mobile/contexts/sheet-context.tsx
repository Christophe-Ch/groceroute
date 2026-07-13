import CustomSheet from "@/components/custom-sheet";
import { createContext, ReactNode, useContext, useRef, useState } from "react";

export interface SheetRef {
  open: () => void;
  close: (callback?: () => void) => void;
}

interface SheetContextType {
  openSheet: (component: ReactNode) => void;
  closeSheet: () => void;
}

const SheetContext = createContext<SheetContextType | null>(null);

export const SheetProvider = ({ children }: { children: ReactNode }) => {
  const [content, setContent] = useState<ReactNode | null>(null);
  const [visible, setVisible] = useState(false);
  const sheetRef = useRef<SheetRef>(null);

  const openSheet = (component: ReactNode) => {
    setContent(component);
    setVisible(true);
  };

  const closeSheet = () => {
    if (sheetRef.current) {
      sheetRef.current.close(handleAnimationComplete);
    } else {
      handleAnimationComplete();
    }
  };

  const handleAnimationComplete = () => {
    setVisible(false);
    setContent(null);
  };

  return (
    <SheetContext value={{ openSheet, closeSheet }}>
      {children}
      {content && (
        <CustomSheet ref={sheetRef} visible={visible} onClose={closeSheet}>
          {content}
        </CustomSheet>
      )}
    </SheetContext>
  );
};

export const useSheet = () => {
  const context = useContext(SheetContext);
  if (!context) throw new Error("useSheet must be used within a SheetProvider");
  return context;
};
