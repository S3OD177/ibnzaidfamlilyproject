CREATE TYPE "public"."fund_kind" AS ENUM('income', 'expense');--> statement-breakpoint
CREATE TABLE "fund_entries" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"kind" "fund_kind" NOT NULL,
	"amount" numeric(12, 2) NOT NULL,
	"entry_date" date NOT NULL,
	"category" text NOT NULL,
	"description" text,
	"party" text,
	"party_hidden" boolean DEFAULT false NOT NULL,
	"receipt_file_id" uuid,
	"created_by" uuid,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL,
	CONSTRAINT "fund_entries_amount_check" CHECK ("fund_entries"."amount" > 0)
);
--> statement-breakpoint
ALTER TABLE "fund_entries" ADD CONSTRAINT "fund_entries_receipt_file_id_files_id_fk" FOREIGN KEY ("receipt_file_id") REFERENCES "public"."files"("id") ON DELETE set null ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "fund_entries" ADD CONSTRAINT "fund_entries_created_by_users_id_fk" FOREIGN KEY ("created_by") REFERENCES "public"."users"("id") ON DELETE set null ON UPDATE no action;--> statement-breakpoint
CREATE INDEX "fund_entries_date_idx" ON "fund_entries" USING btree ("entry_date");