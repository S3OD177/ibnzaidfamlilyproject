CREATE TABLE "tree_changes" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"action" text NOT NULL,
	"member_id" uuid,
	"member_name" text,
	"summary" text NOT NULL,
	"before" jsonb,
	"after" jsonb,
	"actor_id" uuid,
	"actor_name" text,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
ALTER TABLE "tree_changes" ADD CONSTRAINT "tree_changes_actor_id_users_id_fk" FOREIGN KEY ("actor_id") REFERENCES "public"."users"("id") ON DELETE set null ON UPDATE no action;--> statement-breakpoint
CREATE INDEX "tree_changes_created_idx" ON "tree_changes" USING btree ("created_at");--> statement-breakpoint
CREATE INDEX "tree_changes_member_idx" ON "tree_changes" USING btree ("member_id","created_at");