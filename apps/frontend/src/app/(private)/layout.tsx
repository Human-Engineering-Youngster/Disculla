export default function PrivateLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <>
      {/* TODO: Import and define PrivateHeader or replace with appropriate header component */}
      <main className="min-h-screen">{children}</main>
    </>
  );
}

PrivateLayout.displayName = "PrivateLayout";
