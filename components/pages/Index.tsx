"use client";

import Image from "next/image";

// Update this page (the content is just a fallback if you fail to update the page)

// IMPORTANT: Fully REPLACE this with your own code
const PlaceholderIndex = () => {
  return (
    <div className="flex min-h-screen items-center justify-center" style={{ backgroundColor: "#fcfbf8" }}>
      <Image src="/placeholder.svg" alt="Your app will live here!" width={400} height={300} priority />
    </div>
  );
};

const Index = PlaceholderIndex;

export default Index;
