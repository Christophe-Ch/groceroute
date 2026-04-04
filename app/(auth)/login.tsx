import ThemedButton from "@/components/themed-button";
import ThemedInput from "@/components/themed-input";
import { ThemedText } from "@/components/themed-text";
import { ThemedView } from "@/components/themed-view";
import { useAuth } from "@/hooks/auth/use-auth";
import { Link, router } from "expo-router";
import { useForm } from "react-hook-form";
import { KeyboardAvoidingView, StyleSheet, View } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { toast } from "sonner-native";

interface LoginForm {
  email: string;
  password: string;
}

const Login = () => {
  const insets = useSafeAreaInsets();

  const { login } = useAuth();

  const {
    control,
    handleSubmit,
    formState: { errors },
  } = useForm<LoginForm>();

  const onSubmit = async ({ email, password }: LoginForm) => {
    try {
      await login(email, password);
      router.navigate("/(app)");
      toast.success("Welcome back!");
    } catch {
      toast.error("Please check your credentials.");
    }
  };
  return (
    <ThemedView style={styles.container}>
      <View style={{ gap: 16 }}>
        <View>
          <ThemedText type="title">App title</ThemedText>
          <ThemedText type="subtitle">Login to get started</ThemedText>
        </View>

        <ThemedInput
          control={control}
          name="email"
          placeholder="Email"
          keyboardType="email-address"
          autoCapitalize={"none"}
          error={errors.email}
          rules={{ required: { value: true, message: "Email is required." } }}
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
      </View>

      <KeyboardAvoidingView
        behavior="padding"
        keyboardVerticalOffset={insets.top + 16}
        style={{ gap: 16 }}
      >
        <Link href="/(auth)/signup">
          <ThemedText style={{ textAlign: "center" }} type={"muted"}>
            I don&apos;t have an account
          </ThemedText>
        </Link>
        <ThemedButton
          text="Login"
          onPress={handleSubmit(onSubmit)}
          iconName={"log-in-outline"}
          iconPosition={"right"}
          style={{ alignSelf: "stretch" }}
        />
      </KeyboardAvoidingView>
    </ThemedView>
  );
};

export default Login;

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
