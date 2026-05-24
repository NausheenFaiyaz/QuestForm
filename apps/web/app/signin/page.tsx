"use client";

import { useRouter } from "next/navigation";
import { FormEvent, useState } from "react";
import { useSignin } from "~/hooks/api/auth";
import { PixelButton, PixelInput, PixelPanel } from "~/components/site/pixel-ui";

export default function SigninPage() {
  const router = useRouter();
  const { signInWithEmailAndPasswordAsync, error, isPending } = useSignin();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  const onSubmit = async (event: FormEvent) => {
    event.preventDefault();
    await signInWithEmailAndPasswordAsync({ email, password });
    router.push("/dashboard");
  };

  return (
    <main className="mx-auto flex min-h-[calc(100vh-160px)] w-full max-w-5xl items-center px-4 py-10">
      <div className="mx-auto w-full max-w-xl">
        <div className="mb-5 pixel-speech p-5">
          <p className="font-pixel text-2xl text-[#0f2c57]">Log in to continue building forms</p>
        </div>

        <PixelPanel>
          <form className="space-y-4" onSubmit={onSubmit}>
            <PixelInput
              type="email"
              placeholder="Email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
            />
            <PixelInput
              type="password"
              placeholder="Password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              minLength={8}
            />
            {error ? <p className="text-sm text-red-600">{error.message}</p> : null}
            <PixelButton type="submit" className="w-full text-2xl" disabled={isPending}>
              {isPending ? "Logging in..." : "Log in"}
            </PixelButton>
          </form>
        </PixelPanel>
      </div>
    </main>
  );
}
