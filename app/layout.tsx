import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Cadena Audio | Transcrição de Áudio",
  description: "Ferramenta interna da Cadena Imóveis para transformar áudios em texto.",
  applicationName: "Cadena Audio",
};

export default function Layout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="pt-BR">
      <body>{children}</body>
    </html>
  );
}
