import type { MetadataRoute } from "next";

export default function manifest(): MetadataRoute.Manifest {
  return {
    name: "Ávilla | Calçados Femininos",
    short_name: "Ávilla",
    description: "Catálogo Ávilla — moda, qualidade e conforto.",
    start_url: "/",
    display: "standalone",
    background_color: "#FF0000",
    theme_color: "#FF0000",
    orientation: "portrait",
    lang: "pt-BR",
    icons: [
      {
        src: "/icons/pwa-192.png",
        sizes: "192x192",
        type: "image/png",
        purpose: "any",
      },
      {
        src: "/icons/pwa-512.png",
        sizes: "512x512",
        type: "image/png",
        purpose: "any",
      },
      {
        src: "/icons/pwa-512-maskable.png",
        sizes: "512x512",
        type: "image/png",
        purpose: "maskable",
      },
    ],
  };
}
