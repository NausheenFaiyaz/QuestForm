"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { FormEvent, useState } from "react";
import { Lock, Mail, User, Eye, EyeOff } from "lucide-react";
import { GoogleAuthButton } from "~/components/site/google-auth-button";
import { useGoogleSignin, useSignup } from "~/hooks/api/auth";

function authInputClassName() {
  return "h-14 w-full rounded-[1rem] border-[3px] border-black bg-white px-4 pl-12 text-base font-semibold text-[#16110d] outline-none shadow-[3px_3px_0_#000] placeholder:text-[#8a7b66]";
}

export default function SignupPage() {
  const router = useRouter();
  const { createUserWithEmailAndPasswordAsync, error, isPending } = useSignup();
  const { signInWithGoogleAsync, error: googleError, isPending: isGooglePending } = useGoogleSignin();
  const [fullName, setFullName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [localError, setLocalError] = useState<string | null>(null);

  const onSubmit = async (event: FormEvent) => {
    event.preventDefault();
    setLocalError(null);

    if (password !== confirmPassword) {
      setLocalError("Passwords do not match.");
      return;
    }

    await createUserWithEmailAndPasswordAsync({ fullName, email, password });
    router.push("/dashboard");
  };

  return (
    <main className="relative min-h-[calc(100vh-160px)] overflow-hidden bg-[linear-gradient(180deg,#67b9ff_0%,#8bd3ff_28%,#fff4dc_28%,#fff4dc_100%)] px-4 py-10">
      <div className="mx-auto max-w-6xl">
        <div className="flex justify-center">
          <div className="w-full max-w-[430px] -rotate-2 rounded-[2.25rem] border-4 border-black bg-[#fffdf7] p-5 shadow-[8px_8px_0_#000]">
            <div className="rounded-[1.6rem] border-2 border-dashed border-[#e5d9c5] bg-[radial-gradient(circle_at_top,_rgba(255,208,64,0.18),_transparent_35%),linear-gradient(180deg,#fffefb_0%,#fff9ef_100%)] p-5">
              <div className="mb-5 flex justify-center">
                <div className="rounded-[1.2rem] border-[3px] border-black bg-[#7b3ff0] px-6 py-3 font-pixel text-3xl uppercase text-white shadow-[4px_4px_0_#000]">
                  Sign Up
                </div>
              </div>

              <form className="space-y-4" onSubmit={onSubmit}>
                <div className="relative">
                  <User className="pointer-events-none absolute left-4 top-4 h-6 w-6 text-[#7b3ff0]" />
                  <input
                    suppressHydrationWarning
                    placeholder="Enter your full name"
                    value={fullName}
                    onChange={(e) => setFullName(e.target.value)}
                    required
                    className={authInputClassName()}
                  />
                </div>

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
                    placeholder="Create a strong password"
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

                <div className="relative">
                  <Lock className="pointer-events-none absolute left-4 top-4 h-6 w-6 text-[#7b3ff0]" />
                  <input
                    suppressHydrationWarning
                    type={showConfirmPassword ? "text" : "password"}
                    placeholder="Confirm your password"
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    required
                    minLength={8}
                    className={`${authInputClassName()} pr-12`}
                  />
                  <button
                    suppressHydrationWarning
                    type="button"
                    onClick={() => setShowConfirmPassword((prev) => !prev)}
                    className="absolute right-4 top-4 text-[#6d5b44]"
                  >
                    {showConfirmPassword ? <EyeOff className="h-5 w-5" /> : <Eye className="h-5 w-5" />}
                  </button>
                </div>

                {localError ? <p className="text-sm font-semibold text-[#b42318]">{localError}</p> : null}
                {error ? <p className="text-sm font-semibold text-[#b42318]">{error.message}</p> : null}
                {googleError ? <p className="text-sm font-semibold text-[#b42318]">{googleError.message}</p> : null}

                <button
                  suppressHydrationWarning
                  type="submit"
                  disabled={isPending}
                  className="w-full rounded-[1.2rem] border-[3px] border-black bg-[#ffbf1f] px-5 py-4 font-pixel text-3xl uppercase text-[#16110d] shadow-[5px_5px_0_#000] disabled:cursor-not-allowed disabled:opacity-60"
                >
                  {isPending ? "Creating..." : "Create Account"}
                </button>

                <div className="relative py-2 text-center text-sm font-semibold text-[#6d5b44]">
                  <span className="bg-[#fffdf7] px-3">or sign up with</span>
                </div>

                  <GoogleAuthButton
                    onCredential={async (credential) => {
                      await signInWithGoogleAsync({ idToken: credential });
                      router.push("/dashboard");
                    }}
                  />

                {isGooglePending ? <p className="text-center text-sm font-semibold text-[#6d5b44]">Signing in with Google...</p> : null}

                <p className="text-center text-xs font-semibold text-[#6d5b44]">
                  By signing up, you agree to our{" "}
                  <Link href="/pricing" className="text-[#6f42ec] underline">
                    Terms of Service
                  </Link>{" "}
                  and{" "}
                  <Link href="/profile" className="text-[#6f42ec] underline">
                    Privacy Policy
                  </Link>
                  .
                </p>

                <p className="text-center text-sm font-semibold text-[#6d5b44]">
                  Already have an account?{" "}
                  <Link href="/signin" className="font-black text-[#241257] underline">
                    Log in
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
