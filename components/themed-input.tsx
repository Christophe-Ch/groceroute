import { useThemeColor } from "@/hooks/ui/use-theme-color";
import React, { useState } from "react";
import {
  Control,
  Controller,
  FieldError,
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

type InputProps = TextInputProps & {
  control?: Control<any, any, any>;
  name?: string;
  error?: FieldError;
  rules?: RegisterOptions;
  containerStyle?: StyleProp<ViewStyle>;
  label?: string;
};

const ThemedInput = ({ control, name, error, rules, ...props }: InputProps) => {
  const [focused, setFocused] = useState(false);

  const textColor = useThemeColor({}, "inputText");
  const backgroundColor = useThemeColor({}, "inputBackground");
  const placeholderColor = useThemeColor({}, "inputPlaceholder");
  const borderColor = useThemeColor(
    {},
    error ? "inputBorderError" : focused ? "inputBorderFocused" : "inputBorder"
  );

  const inputStyle = [
    styles.input,
    {
      color: textColor,
      backgroundColor,
      borderColor,
    },
  ];

  const renderInput = (value?: string, onChange?: any, onBlur?: any) => (
    <TextInput
      {...props}
      value={value}
      onChangeText={onChange}
      onBlur={(e) => {
        setFocused(false);
        onBlur?.(e);
      }}
      onFocus={() => setFocused(true)}
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
            renderInput(value, onChange, onBlur)
          }
        />
        {error && <Text style={styles.errorMessage}>{error.message}</Text>}
      </View>
    );
  }

  return renderInput();
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
    color: "red",
  },
});
