import "./globals.css";

export const metadata = {
  title: "Chiro App - Lecturas MQTT",
  description: "Consulta de datos guardados desde Mosquitto en MongoDB Atlas",
};

export default function RootLayout({ children }) {
  return (
    <html lang="es">
      <body>{children}</body>
    </html>
  );
}
