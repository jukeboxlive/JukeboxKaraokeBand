"use client";
import { QRCodeSVG } from "qrcode.react";

export default function QRCode({ url, size = 220 }) {
  if (!url) return null;

  return (
    <div className="qr-container">
      <QRCodeSVG
        value={url}
        size={size}
        bgColor="#f0e2b7"
        fgColor="#1a0f0a"
        level="M"
        className="qr-image"
      />
      <p className="qr-url">{url}</p>
    </div>
  );
}
