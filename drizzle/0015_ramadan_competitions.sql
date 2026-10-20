CREATE TABLE "ramadan_answers" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"round_id" uuid NOT NULL,
	"user_id" uuid NOT NULL,
	"participant_name" text NOT NULL,
	"option_index" integer NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	CONSTRAINT "ramadan_answers_option" CHECK ("ramadan_answers"."option_index" between 0 and 5)
);
--> statement-breakpoint
CREATE TABLE "ramadan_competitions" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"title" text NOT NULL,
	"description" text DEFAULT '' NOT NULL,
	"enabled" boolean DEFAULT false NOT NULL,
	"visible_at" timestamp with time zone NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "ramadan_rounds" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"competition_id" uuid NOT NULL,
	"title" text NOT NULL,
	"question" text NOT NULL,
	"options" jsonb NOT NULL,
	"correct_index" integer NOT NULL,
	"points" integer DEFAULT 1 NOT NULL,
	"opens_at" timestamp with time zone NOT NULL,
	"closes_at" timestamp with time zone NOT NULL,
	"manually_closed" boolean DEFAULT false NOT NULL,
	"results_published" boolean DEFAULT false NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL,
	CONSTRAINT "ramadan_rounds_window" CHECK ("ramadan_rounds"."closes_at" > "ramadan_rounds"."opens_at"),
	CONSTRAINT "ramadan_rounds_points" CHECK ("ramadan_rounds"."points" between 1 and 100),
	CONSTRAINT "ramadan_rounds_options" CHECK (jsonb_array_length("ramadan_rounds"."options") between 2 and 6 and "ramadan_rounds"."correct_index" >= 0 and "ramadan_rounds"."correct_index" < jsonb_array_length("ramadan_rounds"."options"))
);
--> statement-breakpoint
ALTER TABLE "ramadan_answers" ADD CONSTRAINT "ramadan_answers_round_id_ramadan_rounds_id_fk" FOREIGN KEY ("round_id") REFERENCES "public"."ramadan_rounds"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "ramadan_answers" ADD CONSTRAINT "ramadan_answers_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "ramadan_rounds" ADD CONSTRAINT "ramadan_rounds_competition_id_ramadan_competitions_id_fk" FOREIGN KEY ("competition_id") REFERENCES "public"."ramadan_competitions"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
CREATE UNIQUE INDEX "ramadan_answers_round_user_key" ON "ramadan_answers" USING btree ("round_id","user_id");--> statement-breakpoint
CREATE INDEX "ramadan_rounds_competition_idx" ON "ramadan_rounds" USING btree ("competition_id");