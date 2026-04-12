"use client";
import { QRCodeSVG } from "qrcode.react";

export default function QRCode({ url, size = 220 }) {
  if (!url) return null;

  return (
    <div className="qr-container">
      <QRCodeSVG
        value={url}
        size={size}
        bgColor="#06060c"
        fgColor="#00f0ff"
        level="M"
        className="qr-image"
      />
      <p className="qr-url">{url}</p>
    </div>
  );
}
