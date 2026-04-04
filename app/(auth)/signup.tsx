import ThemedButton from "@/components/themed-button";
import ThemedInput from "@/components/themed-input";
import { ThemedText } from "@/components/themed-text";
import { ThemedView } from "@/components/themed-view";
import { useAuth } from "@/hooks/auth/use-auth";
import { isAxiosError } from "axios";
import { Link, router } from "expo-router";
import { useForm } from "react-hook-form";
import { KeyboardAvoidingView, StyleSheet, View } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { toast } from "sonner-native";

interface SignupForm {
  email: string;
  password: string;
  passwordConfirmation: string;
}

const Signup = () => {
  const insets = useSafeAreaInsets();

  const { signup } = useAuth();

  const {
    control,
    handleSubmit,
    getValues,
    formState: { errors },
  } = useForm<SignupForm>();

  const onSubmit = async ({ email, password }: SignupForm) => {
    try {
      await signup(email, password);
      router.navigate("/(auth)/login");
      toast.success("Your account has been created! You can now log in.");
    } catch (e) {
      if (isAxiosError(e)) {
        toast.error(e.response?.data.message);
      } else {
        toast.error("An error has occurred, please try again later.");
      }
    }
  };
  return (
    <ThemedView style={styles.container}>
      <View style={{ gap: 16 }}>
        <View>
          <ThemedText type="title">App title</ThemedText>
          <ThemedText type="subtitle">Create an account to continue</ThemedText>
        </View>

        <ThemedInput
          control={control}
          name="email"
          placeholder="Email"
          keyboardType="email-address"
          autoCapitalize={"none"}
          error={errors.email}
          rules={{
            required: { value: true, message: "Email is required." },
            pattern: {
              value: /^[^\s@]+@[^\s@]+\.[^\s@]+$/,
              message: "Please enter a valid email address.",
            },
          }}
        />
        <ThemedInput
          control={control}
          name="password"
          placeholder="Password"
          secureTextEntry
          error={errors.password}
          rules={{
            required: { value: true, message: "Password is required." },
          }}
        />
        <ThemedInput
          control={control}
          name="passwordConfirmation"
          placeholder="Password confirmation"
          secureTextEntry
          error={errors.passwordConfirmation}
          rules={{
            required: {
              value: true,
              message: "Password confirmation is required.",
            },
            validate: (value) =>
              value === getValues("password") || "Passwords must match",
          }}
        />
      </View>

      <KeyboardAvoidingView
        behavior="padding"
        keyboardVerticalOffset={insets.top + 16}
        style={{ gap: 16 }}
      >
        <Link href="/(auth)/login">
          <ThemedText style={{ textAlign: "center" }} type={"muted"}>
            I already have an account
          </ThemedText>
        </Link>
        <ThemedButton
          text="Create account"
          onPress={handleSubmit(onSubmit)}
          iconName={"rocket-outline"}
          iconPosition={"right"}
          style={{ alignSelf: "stretch" }}
        />
      </KeyboardAvoidingView>
    </ThemedView>
  );
};

export default Signup;

const styles = StyleSheet.create({
  container: {
    padding: 20,
    flex: 1,
    justifyContent: "space-between",
    gap: 16,
  },
  title: {
    fontSize: 46,
    textAlign: "center",
    fontWeight: "bold",
  },
  subtitle: {
    fontSize: 20,
    color: "#777",
    textAlign: "center",
  },
});
