/**
 * NativeWind's own `className` typing (normally pulled in via `/// <reference
 * types="nativewind/types" />`) doesn't apply here: that package is hoisted to
 * the workspace root, so it augments the "react-native" module resolved from
 * THERE (18.x, pinned by legacy apps/mobile) — not this app's own nested
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
