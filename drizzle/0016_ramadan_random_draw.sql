ALTER TABLE "ramadan_answers" ADD COLUMN "rules_approved" boolean DEFAULT false NOT NULL;--> statement-breakpoint
ALTER TABLE "ramadan_rounds" ADD COLUMN "winner_name" text;--> statement-breakpoint
ALTER TABLE "ramadan_rounds" ADD COLUMN "winner_user_id" uuid;--> statement-breakpoint
ALTER TABLE "ramadan_rounds" ADD COLUMN "drawn_at" timestamp with time zone;--> statement-breakpoint
ALTER TABLE "ramadan_rounds" ADD COLUMN "drawn_by" text;--> statement-breakpoint
ALTER TABLE "ramadan_rounds" ADD COLUMN "draw_pool" jsonb;--> statement-breakpoint
ALTER TABLE "ramadan_rounds" ADD CONSTRAINT "ramadan_rounds_winner_user_id_users_id_fk" FOREIGN KEY ("winner_user_id") REFERENCES "public"."users"("id") ON DELETE set null ON UPDATE no action;