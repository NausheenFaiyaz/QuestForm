ALTER TABLE "users" ADD COLUMN "google_sub" varchar(255);
ALTER TABLE "users" ADD CONSTRAINT "users_google_sub_unique" UNIQUE("google_sub");
