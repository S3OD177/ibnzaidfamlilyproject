CREATE TABLE "member_change_requests" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"member_id" uuid NOT NULL,
	"requested_by" uuid,
	"requester_name" text NOT NULL,
	"changes" jsonb NOT NULL,
	"note" text,
	"status" "request_status" DEFAULT 'pending' NOT NULL,
	"review_note" text,
	"reviewed_by" uuid,
	"reviewed_at" timestamp with time zone,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
ALTER TABLE "member_change_requests" ADD CONSTRAINT "member_change_requests_member_id_members_id_fk" FOREIGN KEY ("member_id") REFERENCES "public"."members"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "member_change_requests" ADD CONSTRAINT "member_change_requests_requested_by_users_id_fk" FOREIGN KEY ("requested_by") REFERENCES "public"."users"("id") ON DELETE set null ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "member_change_requests" ADD CONSTRAINT "member_change_requests_reviewed_by_users_id_fk" FOREIGN KEY ("reviewed_by") REFERENCES "public"."users"("id") ON DELETE set null ON UPDATE no action;--> statement-breakpoint
CREATE INDEX "member_change_requests_status_idx" ON "member_change_requests" USING btree ("status","created_at");--> statement-breakpoint
CREATE INDEX "member_change_requests_member_idx" ON "member_change_requests" USING btree ("member_id","created_at");