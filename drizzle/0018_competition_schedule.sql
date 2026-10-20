ALTER TABLE "ramadan_competitions" ADD COLUMN "question_count" integer DEFAULT 15 NOT NULL;--> statement-breakpoint
ALTER TABLE "ramadan_competitions" ADD COLUMN "interval_hours" integer DEFAULT 48 NOT NULL;--> statement-breakpoint
ALTER TABLE "ramadan_competitions" ADD COLUMN "duration_hours" integer DEFAULT 24 NOT NULL;