"use client";

import Image from "next/image";
import { FormEvent, useMemo, useState } from "react";
import { useMe, useUpdateMe } from "~/hooks/api/auth";
import { PixelButton, PixelInput, PixelPanel } from "~/components/site/pixel-ui";

export default function ProfilePage() {
  const me = useMe();
  const { updateMeAsync, isPending, error } = useUpdateMe();
  const [isEditing, setIsEditing] = useState(false);
  const [fullName, setFullName] = useState("");
  const [profileImageUrl, setProfileImageUrl] = useState("");

  const user = me.data;
  const avatarUrl = useMemo(
    () =>
      (isEditing ? profileImageUrl : user?.profileImageUrl) ||
      "https://api.dicebear.com/9.x/fun-emoji/svg?seed=chaiforms",
    [isEditing, profileImageUrl, user?.profileImageUrl],
  );

  const startEditing = () => {
    if (!user) return;
    setFullName(user.fullName);
    setProfileImageUrl(user.profileImageUrl ?? "");
    setIsEditing(true);
  };

  const onSubmit = async (event: FormEvent) => {
    event.preventDefault();
    await updateMeAsync({
      fullName,
      profileImageUrl: profileImageUrl || undefined,
    });
    setIsEditing(false);
  };

  if (me.isLoading) return <main className="mx-auto max-w-6xl px-4 py-10">Loading profile...</main>;
  if (!user || me.error) {
    return (
      <main className="mx-auto max-w-6xl px-4 py-10">
        <PixelPanel>
          <p className="text-red-700">Please sign in to view your profile.</p>
          <div className="mt-4">
            <PixelButton href="/signin">Go to Sign in</PixelButton>
          </div>
        </PixelPanel>
      </main>
    );
  }

  return (
    <main className="mx-auto max-w-6xl px-4 py-8">
      <div className="grid gap-6 lg:grid-cols-[1fr_330px]">
        <section>
          <div className="h-52 rounded-xl border-2 border-[#b8c5d8] bg-gradient-to-r from-[#274f7f] via-[#8b77c8] to-[#ffd087]" />

          <div className="-mt-16 flex flex-wrap items-end justify-between gap-4 px-4">
            <div className="flex items-end gap-4">
              <div className="relative h-32 w-32 overflow-hidden rounded-full border-4 border-[#ecf3ff] bg-[#d6e7ff]">
                <Image src={avatarUrl} alt="profile" fill sizes="128px" />
              </div>
              <div className="pb-2">
                <h1 className="font-pixel text-5xl text-[#081a42]">{user.fullName}</h1>
                <p className="text-[#4a6487]">@{user.email.split("@")[0]}</p>
              </div>
            </div>
            {!isEditing ? (
              <PixelButton className="text-xl" onClick={startEditing}>
                Edit profile
              </PixelButton>
            ) : null}
          </div>

          <PixelPanel className="mt-6">
            {!isEditing ? (
              <div className="space-y-3 text-[#3f597c]">
                <p>
                  <span className="font-pixel text-xl text-[#1a3358]">Email:</span> {user.email}
                </p>
                <p>
                  <span className="font-pixel text-xl text-[#1a3358]">Joined:</span>{" "}
                  {new Date().toLocaleDateString("en-US", { month: "short", year: "numeric" })}
                </p>
                <p>
                  <span className="font-pixel text-xl text-[#1a3358]">Links:</span>{" "}
                  github.com/{user.email.split("@")[0]}
                </p>
              </div>
            ) : (
              <form className="space-y-4" onSubmit={onSubmit}>
                <div>
                  <label className="mb-1 block text-sm text-[#4b6487]">Full name</label>
                  <PixelInput value={fullName} onChange={(e) => setFullName(e.target.value)} required />
                </div>
                <div>
                  <label className="mb-1 block text-sm text-[#4b6487]">Profile image URL</label>
                  <PixelInput
                    value={profileImageUrl}
                    onChange={(e) => setProfileImageUrl(e.target.value)}
                    placeholder="https://..."
                  />
                </div>
                {error ? <p className="text-sm text-red-700">{error.message}</p> : null}
                <div className="flex gap-2">
                  <PixelButton type="submit" className="text-xl" disabled={isPending}>
                    {isPending ? "Saving..." : "Save changes"}
                  </PixelButton>
                  <PixelButton
                    type="button"
                    className="text-xl"
                    onClick={() => setIsEditing(false)}
                    disabled={isPending}
                  >
                    Cancel
                  </PixelButton>
                </div>
              </form>
            )}
          </PixelPanel>

          <div className="mt-6 grid gap-4 md:grid-cols-2">
            <PixelPanel>
              <h2 className="font-pixel text-3xl text-[#0e2d58]">Projects</h2>
              <p className="mt-2 text-[#4b6688]">You don't have any projects yet.</p>
            </PixelPanel>
            <PixelPanel>
              <h2 className="font-pixel text-3xl text-[#0e2d58]">Posts</h2>
              <p className="mt-2 text-[#4b6688]">No posts yet. Start sharing your form journey.</p>
            </PixelPanel>
          </div>
        </section>

        <aside className="space-y-4">
          <PixelPanel>
            <h3 className="font-pixel text-3xl text-[#0f2d57]">Stats</h3>
            <div className="mt-3 grid grid-cols-2 gap-3 text-[#3f597c]">
              <div>
                <p className="font-pixel text-2xl">20</p>
                <p>Total XP</p>
              </div>
              <div>
                <p className="font-pixel text-2xl">Bronze</p>
                <p>Rank</p>
              </div>
              <div>
                <p className="font-pixel text-2xl">0</p>
                <p>Badges</p>
              </div>
              <div>
                <p className="font-pixel text-2xl">1</p>
                <p>Day streak</p>
              </div>
            </div>
          </PixelPanel>

          <PixelPanel>
            <h3 className="font-pixel text-3xl text-[#0f2d57]">Skills</h3>
            <div className="mt-3 flex flex-wrap gap-2">
              {["HTML", "CSS", "JavaScript", "React", "SQL", "Git & GitHub"].map((skill) => (
                <span key={skill} className="rounded-full bg-[#e4edf9] px-3 py-1 text-sm text-[#3f597c]">
                  {skill}
                </span>
              ))}
            </div>
          </PixelPanel>
        </aside>
      </div>
    </main>
  );
}
