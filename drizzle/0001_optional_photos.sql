ALTER TABLE "kanga" ALTER COLUMN "image_url" DROP NOT NULL;--> statement-breakpoint
ALTER TABLE "kanga" ALTER COLUMN "image_alt" DROP NOT NULL;--> statement-breakpoint
ALTER TABLE "kanga" ALTER COLUMN "image_credit" DROP NOT NULL;--> statement-breakpoint
ALTER TABLE "kanga" ALTER COLUMN "image_licence" DROP NOT NULL;--> statement-breakpoint
ALTER TABLE "kanga" ADD CONSTRAINT "kanga_image_complete_check" CHECK ("kanga"."image_url" IS NULL OR ("kanga"."image_alt" IS NOT NULL AND "kanga"."image_credit" IS NOT NULL AND "kanga"."image_licence" IS NOT NULL));