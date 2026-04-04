import { Control, Controller } from "react-hook-form";
import ThemedButton, { ThemedButtonProps } from "./themed-button";
import * as ExpoImagePicker from "expo-image-picker";

type ImagePickerProps = ThemedButtonProps & {
  control: Control<any, any, any>;
  name: string;
  emptyText?: string;
  loadedText?: string;
};

const ImagePicker = ({
  control,
  name,
  emptyText,
  loadedText,
  style,
  size,
}: ImagePickerProps) => {
  const pickImage = async (onChange: (uri: string) => void) => {
    const result = await ExpoImagePicker.launchImageLibraryAsync({
      mediaTypes: "images",
      quality: 0.5,
    });

    if (!result.canceled) {
      onChange(result.assets[0].uri);
    }
  };

  return (
    <Controller
      control={control}
      name={name}
      render={({ field: { value, onChange } }) => (
        <ThemedButton
          onPress={() => pickImage(onChange)}
          text={!value ? emptyText : loadedText}
          iconName={"image"}
          style={style}
          size={size}
        />
      )}
    />
  );
};

export default ImagePicker;
