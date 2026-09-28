CREATE TABLE "kanga" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"slug" text NOT NULL,
	"saying_sw" text NOT NULL,
	"translation_en" text NOT NULL,
	"meaning" text,
	"context" text,
	"era" text,
	"region" text,
	"image_url" text NOT NULL,
	"image_alt" text NOT NULL,
	"image_credit" text NOT NULL,
	"image_licence" text NOT NULL,
	"image_source_url" text,
	"dominant_colours" text[] NOT NULL,
	"colour_families" text[] NOT NULL,
	"published" boolean DEFAULT true NOT NULL,
	"search" "tsvector" GENERATED ALWAYS AS (setweight(to_tsvector('simple', saying_sw), 'A') || setweight(to_tsvector('english', translation_en), 'B') || setweight(to_tsvector('english', coalesce(meaning, '')), 'C')) STORED,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL,
	CONSTRAINT "kanga_slug_unique" UNIQUE("slug"),
	CONSTRAINT "kanga_colour_families_check" CHECK (cardinality(colour_families) > 0 AND colour_families <@ ARRAY['red', 'orange', 'yellow', 'green', 'blue', 'indigo', 'purple', 'pink', 'brown', 'black', 'white']::text[]),
	CONSTRAINT "kanga_dominant_colours_check" CHECK (array_to_string("kanga"."dominant_colours", ',') ~ '^#[0-9a-f]{6}(,#[0-9a-f]{6})*$')
);
--> statement-breakpoint
CREATE TABLE "kanga_tag" (
	"kanga_id" uuid NOT NULL,
	"tag_id" uuid NOT NULL,
	CONSTRAINT "kanga_tag_kanga_id_tag_id_pk" PRIMARY KEY("kanga_id","tag_id")
);
--> statement-breakpoint
CREATE TABLE "tag" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"kind" text NOT NULL,
	"name" text NOT NULL,
	"slug" text NOT NULL,
	CONSTRAINT "tag_slug_unique" UNIQUE("slug"),
	CONSTRAINT "tag_kind_name_unique" UNIQUE("kind","name"),
	CONSTRAINT "tag_kind_check" CHECK (kind IN ('motif', 'theme'))
);
--> statement-breakpoint
ALTER TABLE "kanga_tag" ADD CONSTRAINT "kanga_tag_kanga_id_kanga_id_fk" FOREIGN KEY ("kanga_id") REFERENCES "public"."kanga"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "kanga_tag" ADD CONSTRAINT "kanga_tag_tag_id_tag_id_fk" FOREIGN KEY ("tag_id") REFERENCES "public"."tag"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
CREATE INDEX "kanga_search_idx" ON "kanga" USING gin ("search");--> statement-breakpoint
CREATE INDEX "kanga_colour_families_idx" ON "kanga" USING gin ("colour_families");--> statement-breakpoint
CREATE INDEX "kanga_archive_order_idx" ON "kanga" USING btree ("saying_sw","slug");--> statement-breakpoint
CREATE INDEX "kanga_tag_tag_id_idx" ON "kanga_tag" USING btree ("tag_id");