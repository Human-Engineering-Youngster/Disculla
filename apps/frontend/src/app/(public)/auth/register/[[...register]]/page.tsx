import { SignUp } from "@clerk/nextjs";
import { Metadata } from "next";

export const metadata: Metadata = {
  title: "新規登録",
};

export default function RegisterPage() {
  return (
    <div className="flex min-h-screen items-center justify-center">
      <SignUp
        routing="path"
        path="/auth/register"
        signInUrl="/auth/login"
        forceRedirectUrl="/groups"
      />
    </div>
  );
}
