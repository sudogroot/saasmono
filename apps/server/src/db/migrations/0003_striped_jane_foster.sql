CREATE TABLE "timetable_images" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"data_hash" text NOT NULL,
	"image_path" text NOT NULL,
	"org_id" text NOT NULL,
	"created_by_user_id" text,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"last_accessed_at" timestamp DEFAULT now() NOT NULL,
	CONSTRAINT "timetable_images_data_hash_unique" UNIQUE("data_hash")
);
--> statement-breakpoint
ALTER TABLE "timetable_images" ADD CONSTRAINT "timetable_images_org_id_organization_id_fk" FOREIGN KEY ("org_id") REFERENCES "public"."organization"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "timetable_images" ADD CONSTRAINT "timetable_images_created_by_user_id_user_id_fk" FOREIGN KEY ("created_by_user_id") REFERENCES "public"."user"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
CREATE INDEX "timetable_images_org_hash_idx" ON "timetable_images" USING btree ("org_id","data_hash");--> statement-breakpoint
CREATE INDEX "timetable_images_last_accessed_idx" ON "timetable_images" USING btree ("last_accessed_at");