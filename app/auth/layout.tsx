import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "CakeCloud - Login",
  description: "Acesse sua conta CakeCloud",
};

export default function AuthLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return children;
}
