import "./globals.css";

export const metadata = { title: "SafeKitchen", description: "Control de acceso por temperatura" };

export default function RootLayout({ children }) {
  return (
    <html lang="es">
      <body>{children}</body>
    </html>
  );
}
