import NavBar from "@/components/NavBar";

export default async function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <div>
      <NavBar />
      <main className="flex flex-col items-center mt-3">{children}</main>
    </div>
  );
}
