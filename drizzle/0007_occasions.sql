CREATE TYPE "public"."occasion_type" AS ENUM('wedding', 'birth', 'graduation', 'achievement', 'other');--> statement-breakpoint
CREATE TABLE "occasion_congrats" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"occasion_id" uuid NOT NULL,
	"author_key" text NOT NULL,
	"author_name" text NOT NULL,
	"message" text,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "occasions" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"type" "occasion_type" NOT NULL,
	"title" text NOT NULL,
	"message" text,
	"occasion_date" date,
	"member_id" uuid,
	"photo_url" text,
	"visibility" "visibility" DEFAULT 'members' NOT NULL,
	"status" "request_status" DEFAULT 'pending' NOT NULL,
	"submitted_by" uuid,
	"submitter_name" text NOT NULL,
	"reviewed_at" timestamp with time zone,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
ALTER TABLE "occasion_congrats" ADD CONSTRAINT "occasion_congrats_occasion_id_occasions_id_fk" FOREIGN KEY ("occasion_id") REFERENCES "public"."occasions"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "occasions" ADD CONSTRAINT "occasions_member_id_members_id_fk" FOREIGN KEY ("member_id") REFERENCES "public"."members"("id") ON DELETE set null ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "occasions" ADD CONSTRAINT "occasions_submitted_by_users_id_fk" FOREIGN KEY ("submitted_by") REFERENCES "public"."users"("id") ON DELETE set null ON UPDATE no action;--> statement-breakpoint
CREATE UNIQUE INDEX "occasion_congrats_author_key" ON "occasion_congrats" USING btree ("occasion_id","author_key");--> statement-breakpoint
CREATE INDEX "occasions_status_idx" ON "occasions" USING btree ("status","occasion_date");