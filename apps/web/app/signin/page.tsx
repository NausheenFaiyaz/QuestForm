"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { FormEvent, useState } from "react";
import { Eye, EyeOff, Lock, Mail } from "lucide-react";
import { GoogleAuthButton } from "~/components/site/google-auth-button";
import { useGoogleSignin, useSignin } from "~/hooks/api/auth";

function authInputClassName() {
  return "h-14 w-full rounded-[1rem] border-[3px] border-black bg-white px-4 pl-12 text-base font-semibold text-[#16110d] outline-none shadow-[3px_3px_0_#000] placeholder:text-[#8a7b66]";
}

export default function SigninPage() {
  const router = useRouter();
  const { signInWithEmailAndPasswordAsync, error, isPending } = useSignin();
  const { signInWithGoogleAsync, error: googleError, isPending: isGooglePending } = useGoogleSignin();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);

  const onSubmit = async (event: FormEvent) => {
    event.preventDefault();
    await signInWithEmailAndPasswordAsync({ email, password });
    router.push("/dashboard");
  };

  return (
    <main className="relative min-h-[calc(100vh-160px)] overflow-hidden bg-[linear-gradient(180deg,#67b9ff_0%,#8bd3ff_28%,#fff4dc_28%,#fff4dc_100%)] px-4 py-10">
      <div className="mx-auto max-w-6xl">
        <div className="flex justify-center">
          <div className="w-full max-w-[430px] rotate-[1deg] rounded-[2.25rem] border-[4px] border-black bg-[#fffdf7] p-5 shadow-[8px_8px_0_#000]">
            <div className="rounded-[1.6rem] border-[2px] border-dashed border-[#e5d9c5] bg-[radial-gradient(circle_at_top,_rgba(111,66,236,0.14),_transparent_35%),linear-gradient(180deg,#fffefb_0%,#fff9ef_100%)] p-5">
              <div className="mb-5 flex justify-center">
                <div className="rounded-[1.2rem] border-[3px] border-black bg-[#7b3ff0] px-6 py-3 font-pixel text-3xl uppercase text-white shadow-[4px_4px_0_#000]">
                  Sign In
                </div>
              </div>

              <form className="space-y-4" onSubmit={onSubmit}>
                <div className="relative">
                  <Mail className="pointer-events-none absolute left-4 top-4 h-6 w-6 text-[#00a7b8]" />
                  <input
                    suppressHydrationWarning
                    type="email"
                    placeholder="Enter your email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    required
                    className={authInputClassName()}
                  />
                </div>

                <div className="relative">
                  <Lock className="pointer-events-none absolute left-4 top-4 h-6 w-6 text-[#f1a700]" />
                  <input
                    suppressHydrationWarning
                    type={showPassword ? "text" : "password"}
                    placeholder="Enter your password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    required
                    minLength={8}
                    className={`${authInputClassName()} pr-12`}
                  />
                  <button
                    suppressHydrationWarning
                    type="button"
                    onClick={() => setShowPassword((prev) => !prev)}
                    className="absolute right-4 top-4 text-[#6d5b44]"
                  >
                    {showPassword ? <EyeOff className="h-5 w-5" /> : <Eye className="h-5 w-5" />}
                  </button>
                </div>

                {error ? <p className="text-sm font-semibold text-[#b42318]">{error.message}</p> : null}
                {googleError ? <p className="text-sm font-semibold text-[#b42318]">{googleError.message}</p> : null}

                <button
                  suppressHydrationWarning
                  type="submit"
                  disabled={isPending}
                  className="w-full rounded-[1.2rem] border-[3px] border-black bg-[#ffbf1f] px-5 py-4 font-pixel text-3xl uppercase text-[#16110d] shadow-[5px_5px_0_#000] disabled:cursor-not-allowed disabled:opacity-60"
                >
                  {isPending ? "Logging in..." : "Enter Quest"}
                </button>

                <div className="relative py-2 text-center text-sm font-semibold text-[#6d5b44]">
                  <span className="bg-[#fffdf7] px-3">or sign in with</span>
                </div>

                  <GoogleAuthButton
                    onCredential={async (credential) => {
                      await signInWithGoogleAsync({ idToken: credential });
                      router.push("/dashboard");
                    }}
                  />

                {isGooglePending ? <p className="text-center text-sm font-semibold text-[#6d5b44]">Signing in with Google...</p> : null}

                <p className="text-center text-sm font-semibold text-[#6d5b44]">
                  Don&apos;t have an account?{" "}
                  <Link href="/signup" className="font-black text-[#241257] underline">
                    Create one
                  </Link>
                </p>
              </form>
            </div>
          </div>
        </div>
      </div>
    </main>
  );
}
