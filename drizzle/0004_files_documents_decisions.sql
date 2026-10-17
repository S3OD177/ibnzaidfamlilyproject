CREATE TYPE "public"."decision_state" AS ENUM('active', 'superseded', 'cancelled');--> statement-breakpoint
CREATE TYPE "public"."visibility" AS ENUM('public', 'members');--> statement-breakpoint
CREATE TABLE "files" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"name" text NOT NULL,
	"mime_type" text NOT NULL,
	"size_bytes" integer NOT NULL,
	"data" "bytea" NOT NULL,
	"visibility" "visibility" DEFAULT 'members' NOT NULL,
	"uploaded_by" uuid,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
ALTER TABLE "decisions" ADD COLUMN "state" "decision_state" DEFAULT 'active' NOT NULL;--> statement-breakpoint
ALTER TABLE "decisions" ADD COLUMN "attachment_file_id" uuid;--> statement-breakpoint
ALTER TABLE "documents" ADD COLUMN "file_id" uuid;--> statement-breakpoint
ALTER TABLE "documents" ADD COLUMN "visibility" "visibility" DEFAULT 'members' NOT NULL;--> statement-breakpoint
ALTER TABLE "documents" ADD COLUMN "is_charter" boolean DEFAULT false NOT NULL;--> statement-breakpoint
ALTER TABLE "files" ADD CONSTRAINT "files_uploaded_by_users_id_fk" FOREIGN KEY ("uploaded_by") REFERENCES "public"."users"("id") ON DELETE set null ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "decisions" ADD CONSTRAINT "decisions_attachment_file_id_files_id_fk" FOREIGN KEY ("attachment_file_id") REFERENCES "public"."files"("id") ON DELETE set null ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "documents" ADD CONSTRAINT "documents_file_id_files_id_fk" FOREIGN KEY ("file_id") REFERENCES "public"."files"("id") ON DELETE cascade ON UPDATE no action;