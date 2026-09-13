import { BottomTabBar, BottomTabBarHeightContext, type BottomTabBarProps } from "expo-router/tabs";
import { createContext, type ReactNode, useContext, useEffect, useRef } from "react";
import type { NativeScrollEvent } from "react-native";
import Animated, { type SharedValue, useAnimatedStyle, useSharedValue, withTiming } from "react-native-reanimated";

// 0 = shown, 1 = hidden. Shared by the bar, the FABs and every scrolling screen.
const HiddenContext = createContext<SharedValue<number> | null>(null);

export function TabBarVisibilityProvider({ children }: { children: ReactNode }) {
  const hidden = useSharedValue(0);
  return <HiddenContext.Provider value={hidden}>{children}</HiddenContext.Provider>;
}

const show = (hidden: SharedValue<number>, value: 0 | 1) => {
  if (hidden.value !== value) hidden.value = withTiming(value, { duration: 200 });
};

/**
 * Hides the tab bar while scrolling down and brings it back on the way up, like Facebook.
 * Pass `scrolling = false` while the screen shows a loading, error or not-found state
 * instead of its list: nothing scrolls there, so a hidden bar would never come back.
 */
export function useHideTabBarOnScroll(scrolling = true) {
  const hidden = useContext(HiddenContext);
  const lastY = useRef(0);

  useEffect(() => {
    if (!scrolling && hidden) show(hidden, 0);
  }, [scrolling, hidden]);

  // Only nativeEvent is typed: keyboard-controller's types come from the root's older RN.
  const onScroll = (event: { nativeEvent: NativeScrollEvent }) => {
    if (!hidden) return;
    const { contentOffset, contentSize, layoutMeasurement } = event.nativeEvent;
    const y = contentOffset.y;
    const dy = y - lastY.current;
    // Small moves are finger jitter, not a direction.
    if (Math.abs(dy) < 8) return;
    lastY.current = y;

    const atTop = y <= 0;
    // Overscroll bounce at the bottom would otherwise flash the bar back.
    const atBottom = y + layoutMeasurement.height >= contentSize.height - 1;
    if (atTop) show(hidden, 0);
    else if (!atBottom) show(hidden, dy > 0 ? 1 : 0);
  };

  return { onScroll, scrollEventThrottle: 16 };
}

/** The bar's height, for bottom padding; 0 on screens outside the tabs. */
export function useTabBarHeight() {
  return useContext(BottomTabBarHeightContext) ?? 0;
}

/** Style that slides something down with the bar, so a FAB doesn't float over empty space. */
export function useFollowTabBar() {
  const hidden = useContext(HiddenContext);
  const height = useTabBarHeight();
  return useAnimatedStyle(() => ({ transform: [{ translateY: (hidden?.value ?? 0) * height }] }));
}

const FORMS = /(^|\/)(new|edit|edit-profile)$/;

/** Absolutely positioned so screens run underneath it; they pad by useTabBarHeight(). */
export function HidingTabBar(props: BottomTabBarProps) {
  const hidden = useContext(HiddenContext);
  // The bar itself sits outside BottomTabBarHeightContext, so it measures itself.
  const height = useSharedValue(0);
  const style = useAnimatedStyle(() => ({ transform: [{ translateY: (hidden?.value ?? 0) * height.value }] }));

  // A new screen starts with the bar showing, wherever the last one left it.
  const focused = props.state.routes[props.state.index];
  const nested = focused?.state?.routes?.[focused.state.index ?? 0];
  useEffect(() => {
    if (hidden) show(hidden, 0);
  }, [hidden, focused?.key, nested?.key]);

  // Forms get the whole screen, for the keyboard and the submit button.
  if (nested && FORMS.test(nested.name)) return null;

  return (
    <Animated.View
      style={[{ position: "absolute", left: 0, right: 0, bottom: 0 }, style]}
      onLayout={(e) => (height.value = e.nativeEvent.layout.height)}
    >
      <BottomTabBar {...props} />
    </Animated.View>
  );
}
