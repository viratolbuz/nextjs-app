import { Suspense } from "react";
import Signup from "@/components/pages/Signup";

function SignupFallback() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-background text-muted-foreground text-sm">
      Loading…
    </div>
  );
}

export default function SignupPage() {
  return (
    <Suspense fallback={<SignupFallback />}>
      <Signup />
    </Suspense>
  );
}
