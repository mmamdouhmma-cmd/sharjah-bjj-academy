import "./globals.css";

export const metadata = {
  title: "MATS — BJJ Academy Manager",
  description: "Manage BJJ students, attendance, progress, and financials",
};

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  );
}
