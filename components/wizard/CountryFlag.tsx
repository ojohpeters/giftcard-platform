"use client";

import { useState } from "react";

/**
 * Renders a country's flag image, falling back to a neutral flag emoji when
 * there's no URL or the image fails to load.
 */
export default function CountryFlag({ url }: { url?: string }) {
  const [failed, setFailed] = useState(false);
  if (url && !failed) {
    return (
      // eslint-disable-next-line @next/next/no-img-element
      <img
        src={url}
        alt=""
        loading="lazy"
        onError={() => setFailed(true)}
        className="w-full h-full object-cover"
      />
    );
  }
  return (
    <span className="text-2xl" aria-hidden="true">
      🏳️
    </span>
  );
}
