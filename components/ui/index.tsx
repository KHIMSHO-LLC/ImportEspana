import { Fonts, Radius, Space } from "@/constants/Colors";
import { useTheme } from "@/context/ThemeContext";
import { BlurView } from "expo-blur";
import { LinearGradient } from "expo-linear-gradient";
import React, { useState } from "react";
import {
  Pressable,
  PressableProps,
  StyleProp,
  StyleSheet,
  Text,
  TextInput,
  TextInputProps,
  TextProps,
  TextStyle,
  View,
  ViewProps,
  ViewStyle,
} from "react-native";

// =============================================================================
// GlassCard — matches web .glass-card / .card
// =============================================================================
export function GlassCard({
  children,
  style,
  flat,
  padded = true,
  ...rest
}: ViewProps & { flat?: boolean; padded?: boolean }) {
  const { theme, mode } = useTheme();

  const tint = mode === "dark" ? "dark" : "light";
  const radius = flat ? Radius.lg : Radius.xl;

  // Note: we deliberately do NOT set `overflow: 'hidden'` on the outer card
  // so that absolutely-positioned children (e.g. autocomplete dropdowns)
  // can extend below the card boundary. Only the blur backdrop is clipped.
  return (
    <View
      style={[
        {
          borderRadius: radius,
          borderWidth: 1,
          borderColor: theme.glassBorder,
          backgroundColor: theme.glassBg,
          shadowColor: "#000",
          shadowOffset: { width: 0, height: 8 },
          shadowOpacity: mode === "dark" ? 0.45 : 0.08,
          shadowRadius: 24,
          elevation: 6,
        },
        style,
      ]}
      {...rest}
    >
      {/* Clipped backdrop — keeps blur + highlight inside rounded corners */}
      <View
        pointerEvents="none"
        style={[
          StyleSheet.absoluteFillObject,
          { borderRadius: radius, overflow: "hidden" },
        ]}
      >
        <BlurView
          intensity={mode === "dark" ? 28 : 22}
          tint={tint}
          style={StyleSheet.absoluteFill}
        />
        <LinearGradient
          colors={[theme.glassHighlight, "transparent"]}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 1 }}
          style={StyleSheet.absoluteFill}
        />
      </View>
      <View style={padded ? { padding: Space.md + 4 } : undefined}>
        {children}
      </View>
    </View>
  );
}

// =============================================================================
// HeroCard — matches web .card-hero (brand gradient with radial highlights)
// =============================================================================
export function HeroCard({
  children,
  style,
}: {
  children: React.ReactNode;
  style?: StyleProp<ViewStyle>;
}) {
  const { theme } = useTheme();
  return (
    <View
      style={[
        {
          borderRadius: Radius.xl,
          overflow: "hidden",
          shadowColor: theme.brandBlue,
          shadowOffset: { width: 0, height: 12 },
          shadowOpacity: 0.32,
          shadowRadius: 28,
          elevation: 10,
        },
        style,
      ]}
    >
      <LinearGradient
        colors={theme.heroGradient}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
        style={{ padding: Space.lg + 4 }}
      >
        <View
          pointerEvents="none"
          style={[
            StyleSheet.absoluteFill,
            {
              backgroundColor: "transparent",
            },
          ]}
        />
        {children}
      </LinearGradient>
    </View>
  );
}

// =============================================================================
// Label — matches web .label-caps + leading icon
// =============================================================================
export function Label({
  children,
  icon,
  trailing,
  style,
}: {
  children: React.ReactNode;
  icon?: React.ReactNode;
  trailing?: React.ReactNode;
  style?: StyleProp<TextStyle>;
}) {
  const { theme } = useTheme();
  return (
    <View
      style={{
        flexDirection: "row",
        alignItems: "center",
        gap: 8,
        marginBottom: Space.sm + 2,
      }}
    >
      {icon}
      <Text
        style={[
          {
            color: theme.textPrimary,
            fontFamily: Fonts.sansSemibold,
            fontSize: 14,
            letterSpacing: 0.2,
            flex: 1,
          },
          style,
        ]}
      >
        {children}
      </Text>
      {trailing}
    </View>
  );
}

export function Caption({ children, style }: TextProps) {
  const { theme } = useTheme();
  return (
    <Text
      style={[
        {
          color: theme.textTertiary,
          fontFamily: Fonts.sansSemibold,
          fontSize: 11,
          letterSpacing: 1.2,
          textTransform: "uppercase",
        },
        style,
      ]}
    >
      {children}
    </Text>
  );
}

// =============================================================================
// Input — matches web .input-field
// =============================================================================
export interface InputProps extends TextInputProps {
  error?: boolean;
}

export function Input({ error, style, ...rest }: InputProps) {
  const { theme } = useTheme();
  const [focused, setFocused] = useState(false);

  return (
    <TextInput
      placeholderTextColor={theme.textTertiary}
      {...rest}
      onFocus={(e) => {
        setFocused(true);
        rest.onFocus?.(e);
      }}
      onBlur={(e) => {
        setFocused(false);
        rest.onBlur?.(e);
      }}
      style={[
        {
          backgroundColor: focused ? theme.inputBgFocus : theme.inputBg,
          borderWidth: focused || error ? 2 : 1,
          borderColor: error
            ? theme.brandRed
            : focused
              ? theme.inputBorderFocus
              : theme.inputBorder,
          borderRadius: Radius.md,
          paddingHorizontal: 14,
          paddingVertical: 13,
          fontSize: 16,
          fontFamily: Fonts.sansMedium,
          color: theme.textPrimary,
        },
        style,
      ]}
    />
  );
}

// =============================================================================
// Pill / Pill group — matches web .pill-group / .pill-option
// =============================================================================
export function PillGroup({
  children,
  style,
}: {
  children: React.ReactNode;
  style?: StyleProp<ViewStyle>;
}) {
  const { theme } = useTheme();
  return (
    <View
      style={[
        {
          flexDirection: "row",
          backgroundColor: theme.pillBg,
          padding: 4,
          borderRadius: Radius.md,
          borderWidth: 1,
          borderColor: theme.glassBorder,
          gap: 2,
        },
        style,
      ]}
    >
      {children}
    </View>
  );
}

export function Pill({
  active,
  onPress,
  children,
  style,
}: {
  active?: boolean;
  onPress?: () => void;
  children: React.ReactNode;
  style?: StyleProp<ViewStyle>;
}) {
  const { theme } = useTheme();
  return (
    <Pressable
      onPress={onPress}
      style={({ pressed }) => [
        {
          flex: 1,
          paddingVertical: 10,
          paddingHorizontal: 14,
          borderRadius: Radius.md - 3,
          alignItems: "center",
          justifyContent: "center",
          backgroundColor: active ? theme.pillActiveBg : "transparent",
          borderWidth: 1,
          borderColor: active ? theme.pillActiveBorder : "transparent",
          opacity: pressed ? 0.85 : 1,
        },
        style,
      ]}
    >
      <Text
        style={{
          color: active ? theme.brandBlueLight : theme.textSecondary,
          fontFamily: Fonts.sansSemibold,
          fontSize: 14,
        }}
        numberOfLines={1}
      >
        {children}
      </Text>
    </Pressable>
  );
}

// =============================================================================
// Chip — matches web .chip (single selectable token)
// =============================================================================
export function Chip({
  active,
  onPress,
  children,
  leading,
  style,
  size = "md",
}: {
  active?: boolean;
  onPress?: () => void;
  children: React.ReactNode;
  leading?: string; // emoji / icon — rendered in its own <Text> with no custom font so iOS picks up flag emoji
  style?: StyleProp<ViewStyle>;
  size?: "sm" | "md";
}) {
  const { theme } = useTheme();
  return (
    <Pressable
      onPress={onPress}
      style={({ pressed }) => [
        {
          paddingVertical: size === "sm" ? 7 : 9,
          paddingHorizontal: size === "sm" ? 10 : 13,
          borderRadius: Radius.sm,
          borderWidth: 1,
          borderColor: active ? theme.pillActiveBorder : theme.glassBorder,
          backgroundColor: active ? theme.pillActiveBg : theme.glassBg,
          opacity: pressed ? 0.85 : 1,
          minHeight: size === "sm" ? 32 : 36,
          flexDirection: "row",
          alignItems: "center",
          justifyContent: "center",
          gap: 6,
        },
        style,
      ]}
    >
      {leading ? (
        <Text
          // No fontFamily → iOS uses system font which renders flag emoji correctly
          style={{ fontSize: size === "sm" ? 13 : 14 }}
          allowFontScaling={false}
        >
          {leading}
        </Text>
      ) : null}
      <Text
        style={{
          color: active ? theme.brandBlueLight : theme.textSecondary,
          fontFamily: active ? Fonts.sansSemibold : Fonts.sansMedium,
          fontSize: size === "sm" ? 12 : 13,
          flexShrink: 1,
        }}
        numberOfLines={1}
      >
        {children}
      </Text>
    </Pressable>
  );
}

// =============================================================================
// Buttons — matches web .btn-primary / .btn-secondary
// =============================================================================
export function PrimaryButton({
  onPress,
  disabled,
  children,
  style,
  loading,
  full,
  icon,
  testID,
}: {
  onPress?: () => void;
  disabled?: boolean;
  children: React.ReactNode;
  style?: StyleProp<ViewStyle>;
  loading?: boolean;
  full?: boolean;
  icon?: React.ReactNode;
  testID?: string;
}) {
  const { theme } = useTheme();
  return (
    <Pressable
      testID={testID}
      onPress={disabled || loading ? undefined : onPress}
      style={({ pressed }) => [
        {
          opacity: disabled ? 0.4 : pressed ? 0.92 : 1,
          transform: pressed ? [{ scale: 0.98 }] : [],
          borderRadius: Radius.md,
          overflow: "hidden",
          shadowColor: theme.brandBlue,
          shadowOffset: { width: 0, height: 6 },
          shadowOpacity: disabled ? 0 : 0.32,
          shadowRadius: 18,
          elevation: 6,
          alignSelf: full ? "stretch" : "center",
        },
        style,
      ]}
    >
      <LinearGradient
        colors={[theme.brandBlue, theme.brandBlueDeep]}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
        style={{
          paddingVertical: 14,
          paddingHorizontal: 24,
          flexDirection: "row",
          alignItems: "center",
          justifyContent: "center",
          gap: 8,
          borderWidth: 1,
          borderColor: "rgba(255,255,255,0.14)",
        }}
      >
        {icon}
        <Text
          style={{
            color: "#fff",
            fontFamily: Fonts.sansBold,
            fontSize: 15,
            letterSpacing: 0.1,
          }}
        >
          {children}
        </Text>
      </LinearGradient>
    </Pressable>
  );
}

export function SecondaryButton({
  onPress,
  children,
  style,
  icon,
  testID,
}: {
  onPress?: () => void;
  children?: React.ReactNode;
  style?: StyleProp<ViewStyle>;
  icon?: React.ReactNode;
  testID?: string;
}) {
  const { theme } = useTheme();
  return (
    <Pressable
      testID={testID}
      onPress={onPress}
      style={({ pressed }) => [
        {
          paddingVertical: 12,
          paddingHorizontal: children ? 22 : 14,
          borderRadius: Radius.md,
          backgroundColor: theme.glassBg,
          borderWidth: 1,
          borderColor: theme.glassBorder,
          flexDirection: "row",
          alignItems: "center",
          justifyContent: "center",
          gap: 8,
          opacity: pressed ? 0.85 : 1,
        },
        style,
      ]}
    >
      {icon}
      {children ? (
        <Text
          style={{
            color: theme.textPrimary,
            fontFamily: Fonts.sansSemibold,
            fontSize: 14,
          }}
        >
          {children}
        </Text>
      ) : null}
    </Pressable>
  );
}

// =============================================================================
// Pressable wrapper with subtle press scale (used for checkboxes etc.)
// =============================================================================
export function Tap({
  children,
  style,
  onPress,
  ...rest
}: PressableProps & { children: React.ReactNode }) {
  return (
    <Pressable
      onPress={onPress}
      {...rest}
      style={(state) => [
        {
          opacity: state.pressed ? 0.92 : 1,
          transform: state.pressed ? [{ scale: 0.99 }] : [],
        },
        typeof style === "function" ? style(state) : style,
      ]}
    >
      {children}
    </Pressable>
  );
}

// =============================================================================
// Divider
// =============================================================================
export function Divider({ style }: { style?: StyleProp<ViewStyle> }) {
  const { theme } = useTheme();
  return (
    <View
      style={[
        {
          height: 1,
          backgroundColor: theme.glassBorder,
          marginVertical: Space.md,
        },
        style,
      ]}
    />
  );
}

// =============================================================================
// Trust badge — pill with soft surface (used for "EV detected", "Pro" etc.)
// =============================================================================
export function Badge({
  children,
  tone = "neutral",
  style,
}: {
  children: React.ReactNode;
  tone?: "neutral" | "success" | "warning" | "info";
  style?: StyleProp<ViewStyle>;
}) {
  const { theme } = useTheme();
  const colorMap = {
    neutral: { bg: theme.glassBg, fg: theme.textSecondary, bd: theme.glassBorder },
    success: { bg: "rgba(52,211,153,0.16)", fg: theme.success, bd: "rgba(52,211,153,0.32)" },
    warning: { bg: "rgba(251,185,36,0.16)", fg: theme.warning, bd: "rgba(251,185,36,0.32)" },
    info: { bg: theme.pillActiveBg, fg: theme.brandBlueLight, bd: theme.pillActiveBorder },
  } as const;
  const c = colorMap[tone];
  return (
    <View
      style={[
        {
          paddingHorizontal: 10,
          paddingVertical: 4,
          borderRadius: Radius.full,
          backgroundColor: c.bg,
          borderWidth: 1,
          borderColor: c.bd,
          alignSelf: "flex-start",
        },
        style,
      ]}
    >
      <Text
        style={{
          color: c.fg,
          fontFamily: Fonts.sansSemibold,
          fontSize: 11,
          letterSpacing: 0.4,
        }}
      >
        {children}
      </Text>
    </View>
  );
}
