import React, { useState } from "react";
import { Image } from "react-native";

const PLACEHOLDER = require("../assets/PostPlaceholder.png");

/**
 * A post image that degrades to a placeholder instead of a blank rectangle.
 *
 * Every image uploaded before the move to Cloudinary points at Firebase
 * Storage, which this project can no longer serve — those URLs answer 402
 * Payment Required, so <Image> silently renders nothing. Rather than leave
 * gaps across the app, anything that fails to load falls back here.
 */
export default function PostImage({ uri, style, resizeMode = "cover", ...rest }) {
  const [failed, setFailed] = useState(false);

  const source = !uri || failed ? PLACEHOLDER : { uri };

  return (
    <Image
      source={source}
      style={style}
      resizeMode={resizeMode}
      onError={() => setFailed(true)}
      {...rest}
    />
  );
}
