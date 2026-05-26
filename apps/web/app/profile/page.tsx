"use client";

/* eslint-disable @next/next/no-img-element */
import Image from "next/image";
import { ChangeEvent, FormEvent, useMemo, useState } from "react";
import {
  CalendarDays,
  ExternalLink,
  Github,
  Linkedin,
  LinkIcon,
  Pencil,
  Twitter,
  Upload,
} from "lucide-react";
import { useMe, useUpdateMe } from "~/hooks/api/auth";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "~/components/ui/dialog";
import cityBackdrop from "../assets/comic assets/profilecover.png";
import boomPoster from "../assets/comic assets/Boom_Poster.png";

type SocialLinkFormRow = {
  id: string;
  label: string;
  url: string;
};

export default function ProfilePage() {
  const me = useMe();
  const { updateMeAsync, isPending, error } = useUpdateMe();
  const [isEditing, setIsEditing] = useState(false);
  const [isLinksOpen, setIsLinksOpen] = useState(false);
  const [formError, setFormError] = useState("");
  const [fullName, setFullName] = useState("");
  const [username, setUsername] = useState("");
  const [profileImageUrl, setProfileImageUrl] = useState("");
  const [bio, setBio] = useState("");
  const [websiteUrl, setWebsiteUrl] = useState("");
  const [socialLinkRows, setSocialLinkRows] = useState<SocialLinkFormRow[]>([]);

  const user = me.data;
  const displayUsername = user?.username || user?.email.split("@")[0] || "";
  const avatarUrl = useMemo(
    () => (isEditing ? profileImageUrl : user?.profileImageUrl) || "",
    [isEditing, profileImageUrl, user?.profileImageUrl],
  );
  const visibleSocialLinks = Object.entries(user?.socialLinks ?? {}).filter(([, value]) => value);
  const avatarInitial = (user?.fullName || user?.email || "U").trim().charAt(0).toUpperCase();
  const joinedLabel = user?.createdAt
    ? new Intl.DateTimeFormat("en-US", { month: "short", year: "numeric" }).format(
        new Date(user.createdAt),
      )
    : null;
  const primarySocialLink = visibleSocialLinks[0];
  const otherSocialLinkCount = Math.max(visibleSocialLinks.length - 1, 0);

  const startEditing = () => {
    if (!user) return;

    setFormError("");
    setFullName(user.fullName);
    setUsername(displayUsername);
    setProfileImageUrl(user.profileImageUrl ?? "");
    setBio(user.bio ?? "");
    setWebsiteUrl(user.websiteUrl ?? "");
    setSocialLinkRows(
      Object.entries(user.socialLinks ?? {}).map(([label, url], index) => ({
        id: `${label}-${index}`,
        label,
        url,
      })),
    );
    setIsEditing(true);
  };

  const updateSocialLinkRow = (id: string, field: "label" | "url", value: string) => {
    setSocialLinkRows((current) =>
      current.map((row) => (row.id === id ? { ...row, [field]: value } : row)),
    );
  };

  const addSocialLinkRow = () => {
    setSocialLinkRows((current) => [...current, { id: crypto.randomUUID(), label: "", url: "" }]);
  };

  const removeSocialLinkRow = (id: string) => {
    setSocialLinkRows((current) => current.filter((row) => row.id !== id));
  };

  const onPhotoChange = (event: ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    if (!file.type.startsWith("image/")) {
      setFormError("Please upload an image file.");
      return;
    }

    if (file.size > 5 * 1024 * 1024) {
      setFormError("Profile photo must be smaller than 5 MB.");
      return;
    }

    const reader = new FileReader();
    reader.onload = () => {
      setProfileImageUrl(String(reader.result));
      setFormError("");
    };
    reader.readAsDataURL(file);
  };

  const onSubmit = async (event: FormEvent) => {
    event.preventDefault();

    const cleanedSocialLinks = Object.fromEntries(
      socialLinkRows
        .map((row) => [row.label.trim(), row.url.trim()])
        .filter(([label, value]) => label && value),
    );

    await updateMeAsync({
      fullName: fullName.trim(),
      username: username.trim(),
      profileImageUrl: profileImageUrl || undefined,
      bio: bio.trim() || undefined,
      websiteUrl: websiteUrl.trim() || undefined,
      socialLinks: cleanedSocialLinks,
    });
    setIsEditing(false);
  };

  if (me.isLoading) {
    return (
      <main className="comic-dashboard-shell min-h-screen px-4 py-10">
        <div className="mx-auto max-w-6xl">Loading profile...</div>
      </main>
    );
  }
  if (!user || me.error) {
    return (
      <main className="comic-dashboard-shell min-h-screen px-4 py-10">
        <div className="mx-auto max-w-6xl">
          <div className="comic-paper-panel p-6">
          <p className="text-red-700">Please sign in to view your profile.</p>
          <div className="mt-4">
            <a href="/signin" className="comic-button px-5 py-3 text-lg">
              Go to Sign in
            </a>
          </div>
        </div>
        </div>
      </main>
    );
  }

  return (
    <main className="comic-dashboard-shell min-h-screen px-4 py-8">
      <section className="mx-auto max-w-6xl">
        <div className="relative h-64 overflow-hidden rounded-[2rem] border-[4px] border-black bg-[#ffd84e] shadow-[7px_7px_0_#000]">
          <Image
            src={cityBackdrop}
            alt=""
            fill
            priority
            className="object-cover"
            sizes="(min-width: 1150px) 1150px, 100vw"
          />
          <div className="absolute inset-0 bg-[linear-gradient(90deg,rgba(36,18,87,0.75),rgba(36,18,87,0.15))]" />
          <Image
            src={boomPoster}
            alt=""
            className="absolute bottom-4 right-4 hidden w-28 rotate-[8deg] md:block"
          />
        </div>

        <div className="relative z-10 -mt-20 px-1 sm:px-6">
          <div className="flex items-end justify-between gap-4 mt-5">
            <div className="flex h-36 w-36 items-center justify-center overflow-hidden rounded-full border-[5px] border-black bg-[#fff8ee] shadow-[0_8px_0_#000]">
              {avatarUrl ? (
                <img src={avatarUrl} alt="profile" className="h-full w-full object-cover" />
              ) : (
                <span className="font-pixel text-6xl text-[#241257]">{avatarInitial}</span>
              )}
            </div>
            <button
              type="button"
              className="comic-button flex items-center gap-2 px-5 py-3 text-lg"
              onClick={startEditing}
            >
              <Pencil className="size-5" aria-hidden="true" />
              Edit profile
            </button>
          </div>

          <div className="comic-paper-panel mt-7 space-y-4 p-6">
            <div>
              <h1 className="font-pixel text-2xl uppercase text-[#16110d] sm:text-3xl">
                {user.fullName}
              </h1>
              {displayUsername ? (
                <p className="text-lg font-semibold text-[#6d5b44]">@{displayUsername}</p>
              ) : null}
            </div>

            {user.bio ? (
              <p className="max-w-3xl text-lg leading-7 text-[#4f4030]">{user.bio}</p>
            ) : null}

            <div className="space-y-3 text-[#4f4030]">
              {joinedLabel ? (
                <p className="flex items-center gap-3">
                  <CalendarDays className="size-5 text-[#6f42ec]" aria-hidden="true" />
                  <span>Joined {joinedLabel}</span>
                </p>
              ) : null}

              {user.websiteUrl ? (
                <a
                  className="flex items-center gap-3 font-semibold text-[#16110d]"
                  href={user.websiteUrl}
                >
                  <LinkIcon className="size-5 text-[#6f42ec]" aria-hidden="true" />
                  <span>{formatLinkLabel(user.websiteUrl)}</span>
                  <ExternalLink className="size-4 text-[#6f42ec]" aria-hidden="true" />
                </a>
              ) : null}

              {primarySocialLink ? (
                <button
                  type="button"
                  className="flex items-center gap-3 text-left font-semibold text-[#16110d] transition hover:text-[#6f42ec]"
                  onClick={() => setIsLinksOpen(true)}
                >
                  <SocialIcon label={primarySocialLink[0]} />
                  <span>
                    {formatLinkLabel(primarySocialLink[1])}
                    {otherSocialLinkCount > 0 ? ` and ${otherSocialLinkCount} other links` : ""}
                  </span>
                </button>
              ) : null}
            </div>
          </div>
        </div>

        <Dialog open={isEditing} onOpenChange={setIsEditing}>
          <DialogContent
            className="max-h-[92vh] w-[min(94vw,1040px)] max-w-none overflow-y-auto rounded-[2rem] border-[4px] border-black bg-[#fffaf0] p-0 shadow-[8px_8px_0_#000] sm:max-w-none"
            showCloseButton={!isPending}
          >
            <DialogHeader className="border-b-[3px] border-black px-6 py-5">
              <DialogTitle className="font-pixel text-2xl uppercase text-[#16110d]">
                Profile
              </DialogTitle>
            </DialogHeader>
            <form className="space-y-7" onSubmit={onSubmit}>
              <div className="flex flex-col gap-5 px-6 py-6 md:grid md:grid-cols-[220px_1fr]">
                <div className="flex flex-col items-center gap-3">
                  <div className="relative flex h-40 w-40 items-center justify-center overflow-hidden rounded-full border-[4px] border-black bg-[#fff4d1]">
                    {avatarUrl ? (
                      <img
                        src={avatarUrl}
                        alt="profile preview"
                        className="h-full w-full object-cover"
                      />
                    ) : (
                      <span className="font-pixel text-6xl text-[#241257]">{avatarInitial}</span>
                    )}
                    <label className="absolute inset-x-0 bottom-0 flex cursor-pointer items-center justify-center gap-1 bg-[#241257]/85 py-2 text-sm font-bold text-white">
                      <Upload className="size-4" aria-hidden="true" />
                      Edit photo
                      <input
                        className="sr-only"
                        type="file"
                        accept="image/*"
                        onChange={onPhotoChange}
                      />
                    </label>
                  </div>
                  <p className="max-w-44 text-center text-sm font-semibold text-[#6d5b44]">
                    Recommended ratio 1:1 and file size less than 5 MB.
                  </p>
                </div>

                <div className="space-y-5">
                  <ProfileField label="Name">
                    <input
                      className={profileInputClassName()}
                      value={fullName}
                      onChange={(event) => setFullName(event.target.value)}
                      required
                    />
                  </ProfileField>
                  <ProfileField label="Username" required>
                    <input
                      className={profileInputClassName()}
                      value={username}
                      onChange={(event) => setUsername(event.target.value)}
                      required
                    />
                  </ProfileField>
                  <ProfileField label="Website">
                    <input
                      className={profileInputClassName()}
                      type="url"
                      value={websiteUrl}
                      onChange={(event) => setWebsiteUrl(event.target.value)}
                      placeholder="https://example.com"
                    />
                  </ProfileField>
                </div>
              </div>

              <div className="space-y-7 px-6">
                <ProfileField label="Bio">
                  <textarea
                    className="min-h-32 w-full rounded-[1rem] border-[3px] border-black bg-white px-4 py-3 text-[#16110d] outline-none shadow-[3px_3px_0_#000] placeholder:text-[#86735c]"
                    value={bio}
                    onChange={(event) => setBio(event.target.value)}
                    maxLength={280}
                  />
                </ProfileField>

                <div className="space-y-3">
                  <div className="flex items-center justify-between gap-3">
                    <h2 className="font-pixel text-2xl uppercase text-[#16110d]">
                      Social media links
                    </h2>
                    <button
                      type="button"
                      className="comic-button comic-button--light px-4 py-3 text-lg"
                      onClick={addSocialLinkRow}
                    >
                      Add link
                    </button>
                  </div>

                  {socialLinkRows.length > 0 ? (
                    <div className="space-y-3">
                      {socialLinkRows.map((row) => (
                        <div key={row.id} className="grid gap-3 md:grid-cols-[180px_1fr_auto]">
                          <input
                            className={profileInputClassName()}
                            value={row.label}
                            onChange={(event) =>
                              updateSocialLinkRow(row.id, "label", event.target.value)
                            }
                            placeholder="Label"
                          />
                          <input
                            className={profileInputClassName()}
                            type="url"
                            value={row.url}
                            onChange={(event) =>
                              updateSocialLinkRow(row.id, "url", event.target.value)
                            }
                            placeholder="https://..."
                          />
                          <button
                            type="button"
                            className="comic-button comic-button--light px-4 py-3 text-lg"
                            onClick={() => removeSocialLinkRow(row.id)}
                          >
                            Remove
                          </button>
                        </div>
                      ))}
                    </div>
                  ) : null}
                </div>

                {formError ? <p className="text-sm text-red-700">{formError}</p> : null}
                {error ? <p className="text-sm text-red-700">{error.message}</p> : null}
              </div>

              <div className="flex justify-end gap-3 border-t-[3px] border-black px-6 py-5">
                <button
                  type="button"
                  className="comic-button comic-button--light px-5 py-3 text-lg disabled:opacity-60"
                  onClick={() => setIsEditing(false)}
                  disabled={isPending}
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="comic-button px-5 py-3 text-lg disabled:opacity-60"
                  disabled={isPending}
                >
                  {isPending ? "Saving..." : "Save changes"}
                </button>
              </div>
            </form>
          </DialogContent>
        </Dialog>

        <Dialog open={isLinksOpen} onOpenChange={setIsLinksOpen}>
          <DialogContent className="min-h-[520px] w-[min(92vw,650px)] max-w-none rounded-[2rem] border-[4px] border-black bg-[#fffaf0] px-10 py-12 shadow-[8px_8px_0_#000] sm:max-w-none">
            <DialogHeader className="text-center">
              <DialogTitle className="font-pixel text-3xl uppercase text-[#16110d]">
                Links
              </DialogTitle>
            </DialogHeader>

            <div className="mt-4 space-y-7">
              {visibleSocialLinks.map(([label, value]) => (
                <a
                  key={`${label}-${value}`}
                  href={value}
                  className="grid grid-cols-[42px_1fr] gap-4 text-[#16110d]"
                >
                  <div className="pt-1">
                    <SocialIcon label={label} className="size-9 text-[#6f42ec]" />
                  </div>
                  <div>
                    <p className="text-sm font-black uppercase tracking-[0.18em] text-[#6d5b44]">
                      {label}
                    </p>
                    <p className="mt-2 break-all text-xl font-bold">{formatLinkLabel(value)}</p>
                  </div>
                </a>
              ))}
            </div>
          </DialogContent>
        </Dialog>
      </section>
    </main>
  );
}

function profileInputClassName() {
  return "h-12 w-full rounded-[1rem] border-[3px] border-black bg-white px-4 text-[#16110d] outline-none shadow-[3px_3px_0_#000] placeholder:text-[#86735c]";
}

function formatLinkLabel(value: string) {
  try {
    const url = new URL(value);
    return `${url.hostname}${url.pathname === "/" ? "" : url.pathname}`.replace(/\/$/, "");
  } catch {
    return value;
  }
}

function SocialIcon({ label, className }: { label: string; className?: string }) {
  const normalizedLabel = label.toLowerCase();

  if (normalizedLabel.includes("github")) {
    return <Github className={className ?? "size-5 text-[#071224]"} aria-hidden="true" />;
  }

  if (normalizedLabel.includes("twitter") || normalizedLabel === "x") {
    return <Twitter className={className ?? "size-5 text-[#071224]"} aria-hidden="true" />;
  }

  if (normalizedLabel.includes("linkedin")) {
    return <Linkedin className={className ?? "size-5 text-[#071224]"} aria-hidden="true" />;
  }

  return <LinkIcon className={className ?? "size-5 text-[#607794]"} aria-hidden="true" />;
}

function ProfileField({
  label,
  required,
  children,
}: {
  label: string;
  required?: boolean;
  children: React.ReactNode;
}) {
  return (
    <label className="block">
      <span className="mb-2 block font-pixel text-xl uppercase text-[#16110d]">
        {label}
        {required ? <span className="text-red-500">*</span> : null}
      </span>
      {children}
    </label>
  );
}
