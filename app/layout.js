import "./globals.css";

export const metadata = {
  title: "Sharjah BJJ Academy",
  description: "Manage BJJ students, attendance, progress, and financials",
  manifest: "/manifest.json",
  icons: {
    icon: "/favicon.png",
    apple: "/icons/apple-touch-icon.png",
  },
  appleWebApp: {
    capable: true,
    statusBarStyle: "black-translucent",
    title: "Sharjah BJJ Academy",
  },
};

export const viewport = {
  themeColor: "#111827",
  width: "device-width",
  initialScale: 1,
  maximumScale: 1,
};

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <head>
        <link rel="apple-touch-icon" href="/icons/apple-touch-icon.png" />
        <meta name="mobile-web-app-capable" content="yes" />
        <script
          dangerouslySetInnerHTML={{
            __html: `(function(){if('serviceWorker' in navigator){navigator.serviceWorker.getRegistrations().then(function(rs){rs.forEach(function(r){r.unregister();});});}if(typeof caches!=='undefined'){caches.keys().then(function(ks){ks.forEach(function(k){caches.delete(k);});});}})();`,
          }}
        />
      </head>
      <body>{children}</body>
    </html>
  );
}
