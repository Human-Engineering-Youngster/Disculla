import { SignIn } from "@clerk/nextjs";
import { Metadata } from "next";

export const metadata: Metadata = {
  title: "ログイン",
};

export default function LoginPage() {
  return (
    <SignIn
      routing="path"
      path="/auth/login"
      signUpUrl="/auth/register"
      forceRedirectUrl="/groups"
    />
  );
}
