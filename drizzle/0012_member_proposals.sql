CREATE TABLE "member_proposals" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"parent_id" uuid NOT NULL,
	"full_name" text NOT NULL,
	"gender" "gender" NOT NULL,
	"status" "life_status" DEFAULT 'alive' NOT NULL,
	"birth_year" integer,
	"birth_calendar" "calendar_type",
	"death_year" integer,
	"mother_name" text,
	"note" text,
	"request_status" "request_status" DEFAULT 'pending' NOT NULL,
	"requested_by" uuid,
	"requester_name" text NOT NULL,
	"review_note" text,
	"reviewed_by" uuid,
	"reviewed_at" timestamp with time zone,
	"created_member_id" uuid,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
ALTER TABLE "member_proposals" ADD CONSTRAINT "member_proposals_parent_id_members_id_fk" FOREIGN KEY ("parent_id") REFERENCES "public"."members"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "member_proposals" ADD CONSTRAINT "member_proposals_requested_by_users_id_fk" FOREIGN KEY ("requested_by") REFERENCES "public"."users"("id") ON DELETE set null ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "member_proposals" ADD CONSTRAINT "member_proposals_reviewed_by_users_id_fk" FOREIGN KEY ("reviewed_by") REFERENCES "public"."users"("id") ON DELETE set null ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "member_proposals" ADD CONSTRAINT "member_proposals_created_member_id_members_id_fk" FOREIGN KEY ("created_member_id") REFERENCES "public"."members"("id") ON DELETE set null ON UPDATE no action;--> statement-breakpoint
CREATE INDEX "member_proposals_status_idx" ON "member_proposals" USING btree ("request_status","created_at");