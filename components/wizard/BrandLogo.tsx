"use client";

import { useState } from "react";
import { Package } from "lucide-react";

/**
 * Renders a brand logo, falling back to a package icon when there's no image
 * or it fails to load.
 */
export default function BrandLogo({
  url,
  name,
  size = 56,
}: {
  url?: string;
  name: string;
  size?: number;
}) {
  const [failed, setFailed] = useState(false);
  if (url && !failed) {
    return (
      // eslint-disable-next-line @next/next/no-img-element
      <img
        src={url}
        alt={name}
        loading="lazy"
        onError={() => setFailed(true)}
        style={{ width: size, height: size }}
        className="rounded-xl object-cover bg-white"
      />
    );
  }
  return (
    <div
      style={{ width: size, height: size }}
      className="bg-white dark:bg-neutral-800 rounded-xl flex items-center justify-center shadow-sm"
    >
      <Package className="text-gray-400 dark:text-neutral-500" size={Math.round(size * 0.42)} aria-hidden="true" />
    </div>
  );
}
