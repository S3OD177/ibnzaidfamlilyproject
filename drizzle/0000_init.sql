CREATE TYPE "public"."calendar_type" AS ENUM('hijri', 'gregorian');--> statement-breakpoint
CREATE TYPE "public"."gender" AS ENUM('male', 'female');--> statement-breakpoint
CREATE TYPE "public"."life_status" AS ENUM('alive', 'deceased', 'unknown');--> statement-breakpoint
CREATE TYPE "public"."marital_status" AS ENUM('single', 'married', 'divorced', 'widowed');--> statement-breakpoint
CREATE TYPE "public"."publish_status" AS ENUM('draft', 'published', 'archived');--> statement-breakpoint
CREATE TYPE "public"."request_status" AS ENUM('pending', 'approved', 'rejected');--> statement-breakpoint
CREATE TYPE "public"."timeline_type" AS ENUM('birth', 'death', 'marriage', 'achievement', 'milestone');--> statement-breakpoint
CREATE TYPE "public"."user_role" AS ENUM('admin', 'editor', 'member');--> statement-breakpoint
CREATE TYPE "public"."user_status" AS ENUM('active', 'disabled');--> statement-breakpoint
CREATE TABLE "decisions" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"reference_number" text,
	"title" text NOT NULL,
	"body" text,
	"decision_type" text NOT NULL,
	"hijri_year" integer,
	"keywords" text[] DEFAULT '{}'::text[] NOT NULL,
	"status" "publish_status" DEFAULT 'published' NOT NULL,
	"issued_at" date,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "documents" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"title" text NOT NULL,
	"category" text,
	"file_url" text NOT NULL,
	"file_name" text,
	"mime_type" text,
	"size_bytes" integer,
	"uploaded_by" uuid,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "events" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"title" text NOT NULL,
	"description" text,
	"event_date" date NOT NULL,
	"category" text DEFAULT 'event' NOT NULL,
	"color" text,
	"location" text,
	"member_id" uuid,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "marriages" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"member_id" uuid NOT NULL,
	"spouse_id" uuid,
	"spouse_name" text,
	"marriage_year" integer,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL,
	CONSTRAINT "marriages_spouse_check" CHECK ("marriages"."spouse_id" is not null or "marriages"."spouse_name" is not null)
);
--> statement-breakpoint
CREATE TABLE "members" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"serial_number" text,
	"full_name" text NOT NULL,
	"nickname" text,
	"gender" "gender" NOT NULL,
	"status" "life_status" DEFAULT 'alive' NOT NULL,
	"photo_url" text,
	"birth_year" integer,
	"birth_month" integer,
	"birth_day" integer,
	"birth_calendar" "calendar_type" DEFAULT 'hijri',
	"death_year" integer,
	"death_month" integer,
	"death_day" integer,
	"death_calendar" "calendar_type" DEFAULT 'hijri',
	"mobile" text,
	"email" text,
	"location" text,
	"country" text,
	"marital_status" "marital_status",
	"occupation" text,
	"company" text,
	"education" text,
	"university" text,
	"social_links" jsonb DEFAULT '{}'::jsonb NOT NULL,
	"branch" text,
	"generation_label" text,
	"sibling_order" integer,
	"council_role" text,
	"bio" text,
	"interests" text[] DEFAULT '{}'::text[] NOT NULL,
	"is_public" integer DEFAULT 1 NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL,
	CONSTRAINT "members_birth_month_check" CHECK ("members"."birth_month" between 1 and 12),
	CONSTRAINT "members_death_month_check" CHECK ("members"."death_month" between 1 and 12)
);
--> statement-breakpoint
CREATE TABLE "membership_requests" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"full_name" text NOT NULL,
	"branch" text,
	"mobile" text,
	"email" text,
	"note" text,
	"status" "request_status" DEFAULT 'pending' NOT NULL,
	"reviewed_by" uuid,
	"reviewed_at" timestamp with time zone,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "news" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"slug" text NOT NULL,
	"title" text NOT NULL,
	"excerpt" text,
	"content" text,
	"category" text NOT NULL,
	"cover_url" text,
	"author_name" text,
	"status" "publish_status" DEFAULT 'draft' NOT NULL,
	"published_at" timestamp with time zone,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "relationships" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"parent_id" uuid NOT NULL,
	"child_id" uuid NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	CONSTRAINT "relationships_no_self_check" CHECK ("relationships"."parent_id" <> "relationships"."child_id")
);
--> statement-breakpoint
CREATE TABLE "settings" (
	"key" text PRIMARY KEY NOT NULL,
	"value" jsonb NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "timeline_events" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"year" integer NOT NULL,
	"title" text NOT NULL,
	"description" text,
	"type" timeline_type NOT NULL,
	"image_url" text,
	"member_id" uuid,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "users" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"username" text NOT NULL,
	"email" text,
	"display_name" text,
	"password_hash" text NOT NULL,
	"role" "user_role" DEFAULT 'member' NOT NULL,
	"status" "user_status" DEFAULT 'active' NOT NULL,
	"member_id" uuid,
	"last_login_at" timestamp with time zone,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
ALTER TABLE "documents" ADD CONSTRAINT "documents_uploaded_by_users_id_fk" FOREIGN KEY ("uploaded_by") REFERENCES "public"."users"("id") ON DELETE set null ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "events" ADD CONSTRAINT "events_member_id_members_id_fk" FOREIGN KEY ("member_id") REFERENCES "public"."members"("id") ON DELETE set null ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "marriages" ADD CONSTRAINT "marriages_member_id_members_id_fk" FOREIGN KEY ("member_id") REFERENCES "public"."members"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "marriages" ADD CONSTRAINT "marriages_spouse_id_members_id_fk" FOREIGN KEY ("spouse_id") REFERENCES "public"."members"("id") ON DELETE set null ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "membership_requests" ADD CONSTRAINT "membership_requests_reviewed_by_users_id_fk" FOREIGN KEY ("reviewed_by") REFERENCES "public"."users"("id") ON DELETE set null ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "relationships" ADD CONSTRAINT "relationships_parent_id_members_id_fk" FOREIGN KEY ("parent_id") REFERENCES "public"."members"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "relationships" ADD CONSTRAINT "relationships_child_id_members_id_fk" FOREIGN KEY ("child_id") REFERENCES "public"."members"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "timeline_events" ADD CONSTRAINT "timeline_events_member_id_members_id_fk" FOREIGN KEY ("member_id") REFERENCES "public"."members"("id") ON DELETE set null ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "users" ADD CONSTRAINT "users_member_id_members_id_fk" FOREIGN KEY ("member_id") REFERENCES "public"."members"("id") ON DELETE set null ON UPDATE no action;--> statement-breakpoint
CREATE INDEX "decisions_year_idx" ON "decisions" USING btree ("hijri_year");--> statement-breakpoint
CREATE INDEX "events_date_idx" ON "events" USING btree ("event_date");--> statement-breakpoint
CREATE INDEX "marriages_member_idx" ON "marriages" USING btree ("member_id");--> statement-breakpoint
CREATE UNIQUE INDEX "members_serial_number_key" ON "members" USING btree ("serial_number");--> statement-breakpoint
CREATE INDEX "members_full_name_idx" ON "members" USING btree ("full_name");--> statement-breakpoint
CREATE INDEX "membership_requests_status_idx" ON "membership_requests" USING btree ("status","created_at");--> statement-breakpoint
CREATE UNIQUE INDEX "news_slug_key" ON "news" USING btree ("slug");--> statement-breakpoint
CREATE INDEX "news_status_published_idx" ON "news" USING btree ("status","published_at");--> statement-breakpoint
CREATE UNIQUE INDEX "relationships_parent_child_key" ON "relationships" USING btree ("parent_id","child_id");--> statement-breakpoint
CREATE INDEX "relationships_child_idx" ON "relationships" USING btree ("child_id");--> statement-breakpoint
CREATE INDEX "timeline_events_year_idx" ON "timeline_events" USING btree ("year");--> statement-breakpoint
CREATE UNIQUE INDEX "users_username_key" ON "users" USING btree (lower("username"));--> statement-breakpoint
CREATE UNIQUE INDEX "users_email_key" ON "users" USING btree (lower("email"));