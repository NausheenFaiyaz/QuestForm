import { createHmac, randomBytes, timingSafeEqual } from "node:crypto";
import * as JWT from "jsonwebtoken";
import { OAuth2Client } from "google-auth-library";
import { and, db, eq, gt, isNull } from "@repo/database";
import { userRefreshSessionsTable, usersTable } from "@repo/database/models/user";
import { env } from "../env";
import {
  createUserWithEmailAndPasswordInput,
  type CreateUserWithEmailAndPasswordType,
  generateUserTokenPayload,
  type GenerateUserTokenPayloadType,
  signInWithGoogleInput,
  type SignInWithGoogleInputType,
  signInUserWithEmailAndPasswordInput,
  type SignInUserWithEmailAndPasswordInputType,
  type UpdateUserProfileInputType,
  updateUserProfileInput,
} from "./model";

export class UserService {
  private googleClient = new OAuth2Client(env.GOOGLE_CLIENT_ID);
  private accessTokenTtl = env.ACCESS_TOKEN_EXPIRES_IN || env.JWT_EXPIRES_IN;
  private refreshTokenTtl = env.REFRESH_TOKEN_EXPIRES_IN;

  private parseDurationToMs(duration: string) {
    const match = /^(\d+)(ms|s|m|h|d)$/i.exec(duration.trim());
    if (!match || !match[1] || !match[2]) throw new Error(`invalid duration format: ${duration}`);

    const value = Number(match[1]);
    const unit = match[2].toLowerCase();
    const factor =
      unit === "ms"
        ? 1
        : unit === "s"
          ? 1000
          : unit === "m"
            ? 60 * 1000
            : unit === "h"
              ? 60 * 60 * 1000
              : 24 * 60 * 60 * 1000;

    return value * factor;
  }

  private getRefreshExpiryDate() {
    return new Date(Date.now() + this.parseDurationToMs(this.refreshTokenTtl));
  }

  private hashToken(value: string) {
    return createHmac("sha256", env.JWT_SECRET).update(value).digest("hex");
  }

  private async getUserByEmail(email: string) {
    const [user] = await db.select().from(usersTable).where(eq(usersTable.email, email)).limit(1);
    return user ?? null;
  }

  private async getUserByGoogleSub(googleSub: string) {
    const [user] = await db.select().from(usersTable).where(eq(usersTable.googleSub, googleSub)).limit(1);
    return user ?? null;
  }

  private async generateHash(salt: string, password: string) {
    return createHmac("sha256", salt).update(password).digest("hex");
  }

  async generateUserToken(payload: GenerateUserTokenPayloadType) {
    const { id } = await generateUserTokenPayload.parseAsync(payload);
    const token = JWT.sign({ id }, env.JWT_SECRET, {
      expiresIn: this.accessTokenTtl as JWT.SignOptions["expiresIn"],
    });
    return { token };
  }

  async verifyUserToken(token: string) {
    try {
      const decoded = JWT.verify(token, env.JWT_SECRET);
      const parsed = generateUserTokenPayload.safeParse(decoded);
      return parsed.success ? parsed.data : null;
    } catch {
      return null;
    }
  }

  async createSessionForUser(
    userId: string,
    metadata?: {
      ipHash?: string | null;
      userAgent?: string | null;
    },
  ) {
    const refreshToken = randomBytes(48).toString("hex");
    const tokenHash = this.hashToken(refreshToken);
    const expiresAt = this.getRefreshExpiryDate();

    await db.insert(userRefreshSessionsTable).values({
      userId,
      tokenHash,
      expiresAt,
      ipHash: metadata?.ipHash ?? null,
      userAgent: metadata?.userAgent ?? null,
    });

    const { token: accessToken } = await this.generateUserToken({ id: userId });

    return { accessToken, refreshToken };
  }

  async rotateRefreshSession(
    refreshToken: string,
    metadata?: {
      ipHash?: string | null;
      userAgent?: string | null;
    },
  ) {
    const tokenHash = this.hashToken(refreshToken);
    const [existingSession] = await db
      .select()
      .from(userRefreshSessionsTable)
      .where(
        and(
          eq(userRefreshSessionsTable.tokenHash, tokenHash),
          isNull(userRefreshSessionsTable.revokedAt),
          gt(userRefreshSessionsTable.expiresAt, new Date()),
        ),
      )
      .limit(1);

    if (!existingSession) return null;

    await db
      .update(userRefreshSessionsTable)
      .set({ revokedAt: new Date() })
      .where(eq(userRefreshSessionsTable.id, existingSession.id));

    const next = await this.createSessionForUser(existingSession.userId, metadata);

    return {
      userId: existingSession.userId,
      ...next,
    };
  }

  async revokeRefreshSession(refreshToken: string) {
    const tokenHash = this.hashToken(refreshToken);
    await db
      .update(userRefreshSessionsTable)
      .set({ revokedAt: new Date() })
      .where(eq(userRefreshSessionsTable.tokenHash, tokenHash));
  }

  async revokeAllUserRefreshSessions(userId: string) {
    await db
      .update(userRefreshSessionsTable)
      .set({ revokedAt: new Date() })
      .where(and(eq(userRefreshSessionsTable.userId, userId), isNull(userRefreshSessionsTable.revokedAt)));
  }

  async getUserById(userId: string) {
    const [user] = await db.select().from(usersTable).where(eq(usersTable.id, userId)).limit(1);
    return user ?? null;
  }

  async createUserWithEmailAndPassword(payload: CreateUserWithEmailAndPasswordType) {
    const { fullName, email, password } = await createUserWithEmailAndPasswordInput.parseAsync(payload);

    const existingUser = await this.getUserByEmail(email);
    if (existingUser) throw new Error(`user with email ${email} already exists`);

    const salt = randomBytes(16).toString("hex");
    const hash = await this.generateHash(salt, password);

    const [insertedUser] = await db
      .insert(usersTable)
      .values({ email, fullName, password: hash, salt })
      .returning({ id: usersTable.id });

    if (!insertedUser?.id) throw new Error("something went wrong while creating a user");

    return { id: insertedUser.id };
  }

  async signInUserWithEmailAndPassword(payload: SignInUserWithEmailAndPasswordInputType) {
    const { email, password } = await signInUserWithEmailAndPasswordInput.parseAsync(payload);
    const existingUser = await this.getUserByEmail(email);

    if (!existingUser) throw new Error("invalid email or password");
    if (!existingUser.password || !existingUser.salt) throw new Error("invalid authentication method");

    const hash = await this.generateHash(existingUser.salt, password);
    const isValid = timingSafeEqual(Buffer.from(hash), Buffer.from(existingUser.password));

    if (!isValid) throw new Error("invalid email or password");

    return { id: existingUser.id };
  }

  async signInWithGoogle(payload: SignInWithGoogleInputType) {
    const { idToken } = await signInWithGoogleInput.parseAsync(payload);
    const ticket = await this.googleClient.verifyIdToken({
      idToken,
      audience: env.GOOGLE_CLIENT_ID,
    });
    const tokenPayload = ticket.getPayload();

    if (!tokenPayload?.sub || !tokenPayload.email) {
      throw new Error("invalid google account payload");
    }

    const email = tokenPayload.email.toLowerCase();
    const fullName = tokenPayload.name?.trim() || email.split("@")[0] || "Google User";
    const profileImageUrl = tokenPayload.picture ?? null;

    let user = await this.getUserByGoogleSub(tokenPayload.sub);

    if (!user) {
      const existingByEmail = await this.getUserByEmail(email);

      if (existingByEmail) {
        const [updated] = await db
          .update(usersTable)
          .set({
            googleSub: tokenPayload.sub,
            emailVerified: true,
            profileImageUrl: existingByEmail.profileImageUrl ?? profileImageUrl,
            fullName: existingByEmail.fullName || fullName,
          })
          .where(eq(usersTable.id, existingByEmail.id))
          .returning();

        user = updated ?? null;
      } else {
        const [created] = await db
          .insert(usersTable)
          .values({
            email,
            fullName,
            googleSub: tokenPayload.sub,
            emailVerified: true,
            profileImageUrl,
          })
          .returning();

        user = created ?? null;
      }
    }

    if (!user?.id) {
      throw new Error("something went wrong while signing in with google");
    }

    return { id: user.id };
  }

  async updateUserProfile(userId: string, payload: UpdateUserProfileInputType) {
    const parsed = await updateUserProfileInput.parseAsync(payload);
    const [updated] = await db
      .update(usersTable)
      .set({
        fullName: parsed.fullName,
        username: parsed.username,
        profileImageUrl: parsed.profileImageUrl ?? null,
        bio: parsed.bio ?? null,
        websiteUrl: parsed.websiteUrl ?? null,
        socialLinks: parsed.socialLinks ?? {},
      })
      .where(eq(usersTable.id, userId))
      .returning();

    if (!updated) throw new Error("user not found");
    return updated;
  }
}

export default UserService;
