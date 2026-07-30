import React from "react";

/**
 * Official Enamad trust seal (نماد اعتماد الکترونیکی).
 *
 * Enamad's rules — DO NOT change these or the logo won't display:
 *  - keep referrerPolicy="origin" on BOTH the link and the image
 *  - keep the `code` attribute on the <img>
 *  - do NOT add rel="noopener noreferrer" (Enamad needs the referrer sent;
 *    that rel would stop the logo from appearing)
 *
 * Note: the seal can take up to 24h to render the first time after upload.
 */
export default function EnamadSeal({ className = "" }: { className?: string }) {
  // Spread as `any` so the non-standard `code` attribute passes through to the DOM
  // (React renders unknown lowercase attributes) without a TS error.
  const imgProps = {
    referrerPolicy: "origin",
    src: "https://trustseal.enamad.ir/logo.aspx?id=757204&Code=uQe3BZW6c7XFlLgx0GCAdllRcQlDdeM9",
    alt: "نماد اعتماد الکترونیکی",
    style: { cursor: "pointer" },
    code: "uQe3BZW6c7XFlLgx0GCAdllRcQlDdeM9",
  } as any;

  return (
    // eslint-disable-next-line react/jsx-no-target-blank -- Enamad requires no rel attribute
    <a
      referrerPolicy="origin"
      target="_blank"
      href="https://trustseal.enamad.ir/?id=757204&Code=uQe3BZW6c7XFlLgx0GCAdllRcQlDdeM9"
      className={className}
    >
      {/* eslint-disable-next-line @next/next/no-img-element -- external seal, must be a plain <img> */}
      <img {...imgProps} />
    </a>
  );
}
