CREATE TABLE "conversations" (
	"id" text PRIMARY KEY NOT NULL,
	"user_id" text NOT NULL,
	"conversation_type" text NOT NULL,
	"title" text NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "demo_users" (
	"id" text PRIMARY KEY NOT NULL,
	"name" text NOT NULL,
	"role" text NOT NULL,
	"is_active" boolean DEFAULT true NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "messages" (
	"id" text PRIMARY KEY NOT NULL,
	"conversation_id" text NOT NULL,
	"role" text NOT NULL,
	"content" text NOT NULL,
	"sources" jsonb,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "student_activity" (
	"id" text PRIMARY KEY NOT NULL,
	"student_id" text NOT NULL,
	"activity_type" text NOT NULL,
	"conversation_id" text,
	"metadata" jsonb,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "teacher_searches" (
	"id" text PRIMARY KEY NOT NULL,
	"teacher_id" text NOT NULL,
	"conversation_id" text NOT NULL,
	"query" text NOT NULL,
	"response" text NOT NULL,
	"sources" jsonb,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
ALTER TABLE "conversations" ADD CONSTRAINT "conversations_user_id_demo_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."demo_users"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "messages" ADD CONSTRAINT "messages_conversation_id_conversations_id_fk" FOREIGN KEY ("conversation_id") REFERENCES "public"."conversations"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "student_activity" ADD CONSTRAINT "student_activity_student_id_demo_users_id_fk" FOREIGN KEY ("student_id") REFERENCES "public"."demo_users"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "student_activity" ADD CONSTRAINT "student_activity_conversation_id_conversations_id_fk" FOREIGN KEY ("conversation_id") REFERENCES "public"."conversations"("id") ON DELETE set null ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "teacher_searches" ADD CONSTRAINT "teacher_searches_teacher_id_demo_users_id_fk" FOREIGN KEY ("teacher_id") REFERENCES "public"."demo_users"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "teacher_searches" ADD CONSTRAINT "teacher_searches_conversation_id_conversations_id_fk" FOREIGN KEY ("conversation_id") REFERENCES "public"."conversations"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
CREATE INDEX "pg_conversations_user_id_idx" ON "conversations" USING btree ("user_id");--> statement-breakpoint
CREATE INDEX "pg_conversations_created_at_idx" ON "conversations" USING btree ("created_at");--> statement-breakpoint
CREATE INDEX "pg_users_role_idx" ON "demo_users" USING btree ("role");--> statement-breakpoint
CREATE INDEX "pg_messages_conversation_id_idx" ON "messages" USING btree ("conversation_id");--> statement-breakpoint
CREATE INDEX "pg_messages_created_at_idx" ON "messages" USING btree ("created_at");--> statement-breakpoint
CREATE INDEX "pg_student_activity_student_id_idx" ON "student_activity" USING btree ("student_id");--> statement-breakpoint
CREATE INDEX "pg_student_activity_created_at_idx" ON "student_activity" USING btree ("created_at");--> statement-breakpoint
CREATE INDEX "pg_teacher_searches_teacher_id_idx" ON "teacher_searches" USING btree ("teacher_id");--> statement-breakpoint
CREATE INDEX "pg_teacher_searches_created_at_idx" ON "teacher_searches" USING btree ("created_at");