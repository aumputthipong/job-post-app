/**
 * NativeWind's own `className` typing (normally pulled in via `/// <reference
 * types="nativewind/types" />`) doesn't apply here: nativewind sits in the
 * workspace root, so it augments the "react-native" resolved from THERE — the
 * 0.72 copy that apps/api's firebase dependency drags in — not this app's own
 * react-native. Declared locally instead, so it resolves "react-native" the
 * same way every .tsx file here does. Content copied from
 * react-native-css-interop@0.2.6's types.d.ts.
 */
import type {
  ScrollViewProps,
  ScrollViewPropsAndroid,
  ScrollViewPropsIOS,
  Touchable,
  VirtualizedListProps,
} from "react-native";

declare module "@react-native/virtualized-lists" {
  export interface VirtualizedListWithoutRenderItemProps<ItemT>
    extends ScrollViewProps {
    ListFooterComponentClassName?: string;
    ListHeaderComponentClassName?: string;
  }
}

declare module "react-native" {
  interface ScrollViewProps
    extends ViewProps,
      ScrollViewPropsIOS,
      ScrollViewPropsAndroid,
      Touchable {
    contentContainerClassName?: string;
    indicatorClassName?: string;
  }
  interface FlatListProps<ItemT> extends VirtualizedListProps<ItemT> {
    columnWrapperClassName?: string;
  }
  interface ImageBackgroundProps extends ImagePropsBase {
    imageClassName?: string;
  }
  interface ImagePropsBase {
    className?: string;
    cssInterop?: boolean;
  }
  interface ViewProps {
    className?: string;
    cssInterop?: boolean;
  }
  interface TextInputProps {
    placeholderClassName?: string;
  }
  interface TextProps {
    className?: string;
    cssInterop?: boolean;
  }
  interface SwitchProps {
    className?: string;
    cssInterop?: boolean;
  }
  interface InputAccessoryViewProps {
    className?: string;
    cssInterop?: boolean;
  }
  interface TouchableWithoutFeedbackProps {
    className?: string;
    cssInterop?: boolean;
  }
  interface StatusBarProps {
    className?: string;
    cssInterop?: boolean;
  }
  interface KeyboardAvoidingViewProps extends ViewProps {
    contentContainerClassName?: string;
  }
  interface ModalBaseProps {
    presentationClassName?: string;
  }
}

// Same reason, for the SafeAreaView the auth and tab screens use: nativewind
// augments the copy it resolves from the workspace root, not the one here.
declare module "react-native-safe-area-context" {
  interface NativeSafeAreaViewProps {
    className?: string;
  }
}
