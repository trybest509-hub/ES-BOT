import React, { useEffect, useState } from "react";
import QRCode from "qrcode";

interface QRCodeDisplayProps {
  value: string;
  size?: number;
  showLogo?: boolean;
}

export const QRCodeDisplay: React.FC<QRCodeDisplayProps> = ({
  value,
  size = 260,
  showLogo = true,
}) => {
  const [dataUrl, setDataUrl] = useState<string>("");
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let isMounted = true;
    if (!value) return;

    QRCode.toDataURL(value, {
      width: size * 2, // high res
      margin: 2,
      color: {
        dark: "#075E54", // Official WhatsApp Dark Green
        light: "#FFFFFF",
      },
      errorCorrectionLevel: "H", // High error correction to allow center logo
    })
      .then((url) => {
        if (isMounted) {
          setDataUrl(url);
          setError(null);
        }
      })
      .catch((err) => {
        console.error("QR Code Generation Error:", err);
        if (isMounted) setError("Erè nan jenere kòd QR la");
      });

    return () => {
      isMounted = false;
    };
  }, [value, size]);

  return (
    <div
      id="real-qr-code-wrapper"
      className="relative flex items-center justify-center p-3 bg-white rounded-2xl shadow-lg border-2 border-[#128C7E]/20"
      style={{ width: size, height: size }}
    >
      {dataUrl ? (
        <div className="relative w-full h-full flex items-center justify-center">
          <img
            src={dataUrl}
            alt="WhatsApp Real Scannable QR Code"
            className="w-full h-full object-contain rounded-xl"
          />

          {showLogo && (
            <div className="absolute inset-0 m-auto w-12 h-12 rounded-xl bg-white p-1 shadow-md border border-emerald-200 flex items-center justify-center">
              <div className="w-full h-full bg-[#25D366] rounded-lg flex items-center justify-center text-white font-black text-xs tracking-tight shadow-inner">
                ES
              </div>
            </div>
          )}
        </div>
      ) : error ? (
        <div className="text-rose-500 text-xs text-center p-4">{error}</div>
      ) : (
        <div className="w-full h-full flex items-center justify-center">
          <div className="w-8 h-8 border-3 border-[#075E54] border-t-transparent rounded-full animate-spin" />
        </div>
      )}
    </div>
  );
};
