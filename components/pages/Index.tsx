"use client";

import Image from 'next/image';

const PlaceholderIndex = () => {
  return (
    <div className="flex min-h-screen items-center justify-center" style={{ backgroundColor: "#fcfbf8" }}>
      <Image src="/placeholder.svg" alt="Your app will live here!" width={400} height={300} />
    </div>
  );
};

const Index = PlaceholderIndex;

export default Index;
