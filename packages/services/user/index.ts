import { createHmac, randomBytes, timingSafeEqual } from "node:crypto";
import * as JWT from "jsonwebtoken";
import { db, eq } from "@repo/database";
import { usersTable } from "@repo/database/models/user";
import { env } from "../env";
import {
  createUserWithEmailAndPasswordInput,
  type CreateUserWithEmailAndPasswordType,
  generateUserTokenPayload,
  type GenerateUserTokenPayloadType,
  signInUserWithEmailAndPasswordInput,
  type SignInUserWithEmailAndPasswordInputType,
  type UpdateUserProfileInputType,
  updateUserProfileInput,
} from "./model";

export class UserService {
  private async getUserByEmail(email: string) {
    const [user] = await db.select().from(usersTable).where(eq(usersTable.email, email)).limit(1);
    return user ?? null;
  }

  private async generateHash(salt: string, password: string) {
    return createHmac("sha256", salt).update(password).digest("hex");
  }

  async generateUserToken(payload: GenerateUserTokenPayloadType) {
    const { id } = await generateUserTokenPayload.parseAsync(payload);
    const token = JWT.sign({ id }, env.JWT_SECRET, {
      expiresIn: env.JWT_EXPIRES_IN as JWT.SignOptions["expiresIn"],
    });
    return { token };
  }

  async verifyUserToken(token: string) {
    const decoded = JWT.verify(token, env.JWT_SECRET);
    const parsed = generateUserTokenPayload.safeParse(decoded);
    return parsed.success ? parsed.data : null;
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

    const { token } = await this.generateUserToken({ id: insertedUser.id });
    return { id: insertedUser.id, token };
  }

  async signInUserWithEmailAndPassword(payload: SignInUserWithEmailAndPasswordInputType) {
    const { email, password } = await signInUserWithEmailAndPasswordInput.parseAsync(payload);
    const existingUser = await this.getUserByEmail(email);

    if (!existingUser) throw new Error("invalid email or password");
    if (!existingUser.password || !existingUser.salt) throw new Error("invalid authentication method");

    const hash = await this.generateHash(existingUser.salt, password);
    const isValid = timingSafeEqual(Buffer.from(hash), Buffer.from(existingUser.password));

    if (!isValid) throw new Error("invalid email or password");

    const { token } = await this.generateUserToken({ id: existingUser.id });
    return { id: existingUser.id, token };
  }

  async updateUserProfile(userId: string, payload: UpdateUserProfileInputType) {
    const parsed = await updateUserProfileInput.parseAsync(payload);
    const [updated] = await db
      .update(usersTable)
      .set({
        fullName: parsed.fullName,
        profileImageUrl: parsed.profileImageUrl ?? null,
      })
      .where(eq(usersTable.id, userId))
      .returning();

    if (!updated) throw new Error("user not found");
    return updated;
  }
}

export default UserService;
