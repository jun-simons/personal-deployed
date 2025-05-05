import type { Metadata } from "next";
import "./globals.css";

// export const metadata: Metadata = {
//   title: "Jun Simons",
//   description: "Jun's Personal Website",
//   icons: {
//     icon: '/owl.png',            // your main PNG
//     apple: '/owl.png',           // optional Apple icon
//   },
// };

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (

    <html lang="en">
      <body className="bg-background h-full  text-foreground">
        {/* <Navbar /> */}
        <main>{children}</main>
      </body>
    </html>
    // <html lang="en">
    //   <body
    //     className={`${geistSans.variable} ${geistMono.variable} antialiased`}
    //   >
    //     {children}
    //   </body>
    // </html>
  );
}
