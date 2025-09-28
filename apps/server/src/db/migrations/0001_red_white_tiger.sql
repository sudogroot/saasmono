CREATE TYPE "public"."attendance_status" AS ENUM('PRESENT', 'ABSENT', 'LATE', 'EXCUSED', 'SICK');--> statement-breakpoint
CREATE TYPE "public"."session_status" AS ENUM('SCHEDULED', 'IN_PROGRESS', 'COMPLETED', 'CANCELLED', 'RESCHEDULED');--> statement-breakpoint
CREATE TABLE "attendance" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"status" "attendance_status" NOT NULL,
	"note" text,
	"student_id" text NOT NULL,
	"session_instance_id" uuid NOT NULL,
	"org_id" text NOT NULL,
	"marked_at" timestamp DEFAULT now() NOT NULL,
	"arrived_at" timestamp,
	"created_by_user_id" text,
	"updated_by_user_id" text,
	"deleted_by_user_id" text,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL,
	"deleted_at" timestamp
);
--> statement-breakpoint
CREATE TABLE "room" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"name" text NOT NULL,
	"code" text NOT NULL,
	"description" text,
	"capacity" text,
	"location" text,
	"org_id" text NOT NULL,
	"created_by_user_id" text,
	"updated_by_user_id" text,
	"deleted_by_user_id" text,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL,
	"deleted_at" timestamp
);
--> statement-breakpoint
CREATE TABLE "session_instance" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"title" text NOT NULL,
	"start_datetime" timestamp NOT NULL,
	"end_datetime" timestamp NOT NULL,
	"status" "session_status" DEFAULT 'SCHEDULED' NOT NULL,
	"classroom_id" uuid,
	"classroom_group_id" uuid,
	"teacher_id" text NOT NULL,
	"education_subject_id" uuid NOT NULL,
	"room_id" uuid NOT NULL,
	"org_id" text NOT NULL,
	"actual_start_datetime" timestamp,
	"actual_end_datetime" timestamp,
	"notes" text,
	"additional_data" json,
	"created_by_user_id" text,
	"updated_by_user_id" text,
	"deleted_by_user_id" text,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL,
	"deleted_at" timestamp
);
--> statement-breakpoint
CREATE TABLE "session_note" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"title" text NOT NULL,
	"content" text NOT NULL,
	"is_private" boolean DEFAULT false NOT NULL,
	"session_instance_id" uuid NOT NULL,
	"org_id" text NOT NULL,
	"created_by_user_id" text NOT NULL,
	"updated_by_user_id" text,
	"deleted_by_user_id" text,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL,
	"deleted_at" timestamp
);
--> statement-breakpoint
CREATE TABLE "session_note_attachment" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"file_name" text NOT NULL,
	"file_url" text NOT NULL,
	"file_size" text,
	"mime_type" text,
	"description" text,
	"session_note_id" uuid NOT NULL,
	"org_id" text NOT NULL,
	"created_by_user_id" text NOT NULL,
	"updated_by_user_id" text,
	"deleted_by_user_id" text,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL,
	"deleted_at" timestamp
);
--> statement-breakpoint
ALTER TABLE "attendance" ADD CONSTRAINT "attendance_student_id_user_id_fk" FOREIGN KEY ("student_id") REFERENCES "public"."user"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "attendance" ADD CONSTRAINT "attendance_session_instance_id_session_instance_id_fk" FOREIGN KEY ("session_instance_id") REFERENCES "public"."session_instance"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "attendance" ADD CONSTRAINT "attendance_org_id_organization_id_fk" FOREIGN KEY ("org_id") REFERENCES "public"."organization"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "attendance" ADD CONSTRAINT "attendance_created_by_user_id_user_id_fk" FOREIGN KEY ("created_by_user_id") REFERENCES "public"."user"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "attendance" ADD CONSTRAINT "attendance_updated_by_user_id_user_id_fk" FOREIGN KEY ("updated_by_user_id") REFERENCES "public"."user"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "attendance" ADD CONSTRAINT "attendance_deleted_by_user_id_user_id_fk" FOREIGN KEY ("deleted_by_user_id") REFERENCES "public"."user"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "room" ADD CONSTRAINT "room_org_id_organization_id_fk" FOREIGN KEY ("org_id") REFERENCES "public"."organization"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "room" ADD CONSTRAINT "room_created_by_user_id_user_id_fk" FOREIGN KEY ("created_by_user_id") REFERENCES "public"."user"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "room" ADD CONSTRAINT "room_updated_by_user_id_user_id_fk" FOREIGN KEY ("updated_by_user_id") REFERENCES "public"."user"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "room" ADD CONSTRAINT "room_deleted_by_user_id_user_id_fk" FOREIGN KEY ("deleted_by_user_id") REFERENCES "public"."user"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "session_instance" ADD CONSTRAINT "session_instance_classroom_id_classroom_id_fk" FOREIGN KEY ("classroom_id") REFERENCES "public"."classroom"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "session_instance" ADD CONSTRAINT "session_instance_classroom_group_id_classroom_group_id_fk" FOREIGN KEY ("classroom_group_id") REFERENCES "public"."classroom_group"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "session_instance" ADD CONSTRAINT "session_instance_teacher_id_user_id_fk" FOREIGN KEY ("teacher_id") REFERENCES "public"."user"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "session_instance" ADD CONSTRAINT "session_instance_education_subject_id_education_subject_id_fk" FOREIGN KEY ("education_subject_id") REFERENCES "public"."education_subject"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "session_instance" ADD CONSTRAINT "session_instance_room_id_room_id_fk" FOREIGN KEY ("room_id") REFERENCES "public"."room"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "session_instance" ADD CONSTRAINT "session_instance_org_id_organization_id_fk" FOREIGN KEY ("org_id") REFERENCES "public"."organization"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "session_instance" ADD CONSTRAINT "session_instance_created_by_user_id_user_id_fk" FOREIGN KEY ("created_by_user_id") REFERENCES "public"."user"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "session_instance" ADD CONSTRAINT "session_instance_updated_by_user_id_user_id_fk" FOREIGN KEY ("updated_by_user_id") REFERENCES "public"."user"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "session_instance" ADD CONSTRAINT "session_instance_deleted_by_user_id_user_id_fk" FOREIGN KEY ("deleted_by_user_id") REFERENCES "public"."user"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "session_note" ADD CONSTRAINT "session_note_session_instance_id_session_instance_id_fk" FOREIGN KEY ("session_instance_id") REFERENCES "public"."session_instance"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "session_note" ADD CONSTRAINT "session_note_org_id_organization_id_fk" FOREIGN KEY ("org_id") REFERENCES "public"."organization"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "session_note" ADD CONSTRAINT "session_note_created_by_user_id_user_id_fk" FOREIGN KEY ("created_by_user_id") REFERENCES "public"."user"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "session_note" ADD CONSTRAINT "session_note_updated_by_user_id_user_id_fk" FOREIGN KEY ("updated_by_user_id") REFERENCES "public"."user"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "session_note" ADD CONSTRAINT "session_note_deleted_by_user_id_user_id_fk" FOREIGN KEY ("deleted_by_user_id") REFERENCES "public"."user"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "session_note_attachment" ADD CONSTRAINT "session_note_attachment_session_note_id_session_note_id_fk" FOREIGN KEY ("session_note_id") REFERENCES "public"."session_note"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "session_note_attachment" ADD CONSTRAINT "session_note_attachment_org_id_organization_id_fk" FOREIGN KEY ("org_id") REFERENCES "public"."organization"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "session_note_attachment" ADD CONSTRAINT "session_note_attachment_created_by_user_id_user_id_fk" FOREIGN KEY ("created_by_user_id") REFERENCES "public"."user"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "session_note_attachment" ADD CONSTRAINT "session_note_attachment_updated_by_user_id_user_id_fk" FOREIGN KEY ("updated_by_user_id") REFERENCES "public"."user"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "session_note_attachment" ADD CONSTRAINT "session_note_attachment_deleted_by_user_id_user_id_fk" FOREIGN KEY ("deleted_by_user_id") REFERENCES "public"."user"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
CREATE INDEX "attendance_student_session_idx" ON "attendance" USING btree ("student_id","session_instance_id");--> statement-breakpoint
CREATE INDEX "attendance_session_status_idx" ON "attendance" USING btree ("session_instance_id","status");--> statement-breakpoint
CREATE INDEX "attendance_student_marked_at_idx" ON "attendance" USING btree ("student_id","marked_at");--> statement-breakpoint
CREATE INDEX "attendance_org_marked_at_idx" ON "attendance" USING btree ("org_id","marked_at");--> statement-breakpoint
CREATE INDEX "session_instance_classroom_or_group_idx" ON "session_instance" USING btree ("classroom_id","classroom_group_id");--> statement-breakpoint
CREATE INDEX "session_instance_start_datetime_status_idx" ON "session_instance" USING btree ("start_datetime","status");--> statement-breakpoint
CREATE INDEX "session_instance_teacher_datetime_idx" ON "session_instance" USING btree ("teacher_id","start_datetime");--> statement-breakpoint
CREATE INDEX "session_instance_org_datetime_idx" ON "session_instance" USING btree ("org_id","start_datetime");--> statement-breakpoint
CREATE INDEX "session_instance_classroom_datetime_idx" ON "session_instance" USING btree ("classroom_id","start_datetime");--> statement-breakpoint
CREATE INDEX "session_instance_subject_datetime_idx" ON "session_instance" USING btree ("education_subject_id","start_datetime");