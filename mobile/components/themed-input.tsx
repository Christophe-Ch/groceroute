import { useThemeColor } from "@/hooks/ui/use-theme-color";
import { useState } from "react";
import {
  Control,
  Controller,
  FieldError,
  FieldPath,
  FieldValues,
  RegisterOptions,
} from "react-hook-form";
import {
  StyleProp,
  StyleSheet,
  Text,
  TextInput,
  TextInputProps,
  View,
  ViewStyle,
} from "react-native";
import { ThemedText } from "./themed-text";

type InputProps<TFieldValues extends FieldValues> = TextInputProps & {
  control?: Control<TFieldValues>;
  name?: FieldPath<TFieldValues>;
  error?: FieldError;
  rules?: RegisterOptions<TFieldValues, FieldPath<TFieldValues>>;
  containerStyle?: StyleProp<ViewStyle>;
  label?: string;
};

const ThemedInput = <TFieldValues extends FieldValues = FieldValues>({
  control,
  name,
  error,
  rules,
  value,
  onChangeText,
  onFocus,
  onBlur,
  ...props
}: InputProps<TFieldValues>) => {
  const [focused, setFocused] = useState(false);

  const textColor = useThemeColor({}, "inputText");
  const errorColor = useThemeColor({}, "inputBorderError");
  const backgroundColor = useThemeColor({}, "inputBackground");
  const placeholderColor = useThemeColor({}, "inputPlaceholder");
  const borderColor = useThemeColor(
    {},
    error ? "inputBorderError" : focused ? "inputBorderFocused" : "inputBorder",
  );

  const inputStyle = [
    styles.input,
    {
      color: textColor,
      backgroundColor,
      borderColor,
    },
  ];

  const renderInput = (
    value?: string,
    onChangeText?: any,
    onBlur?: any,
    onFocus?: any,
  ) => (
    <TextInput
      {...props}
      accessibilityLabel={props.accessibilityLabel ?? props.placeholder}
      value={value}
      onChangeText={onChangeText}
      onBlur={(e) => {
        setFocused(false);
        onBlur?.(e);
      }}
      onFocus={(e) => {
        setFocused(true);
        onFocus?.(e);
      }}
      placeholderTextColor={placeholderColor}
      style={[inputStyle, props.style]}
    />
  );

  if (control && name) {
    return (
      <View style={[{ gap: 10 }, props.containerStyle]}>
        {props.label && <ThemedText type={"muted"}>{props.label}</ThemedText>}
        <Controller
          control={control}
          name={name}
          rules={rules}
          render={({ field: { onChange, onBlur, value } }) =>
            renderInput(value, onChange, onBlur, onFocus)
          }
        />
        {error && (
          <Text
            style={[styles.errorMessage, { color: errorColor }]}
            accessibilityLiveRegion="polite"
            role="alert"
          >
            {error.message}
          </Text>
        )}
      </View>
    );
  }

  return renderInput(value, onChangeText, onBlur, onFocus);
};

export default ThemedInput;

const styles = StyleSheet.create({
  input: {
    padding: 15,
    borderRadius: 4,
    borderWidth: 1,
  },
  errorMessage: {
    marginBlockStart: 0,
  },
});
