this is experimental do not change
// import { pgTable, text, timestamp, uuid, integer, boolean } from "drizzle-orm/pg-core";
// import { relations } from "drizzle-orm";
// import { user, organization } from "./auth";
// import { classroom, classroomTeacherAssignment, classroomGroup } from "./classroom";

// // Flexible lesson types (theoretical, practical, exercises, remedial, etc.)
// export const lessonType = pgTable("lesson_type", {
// id: uuid("id").primaryKey().defaultRandom(),
// name: text("name").notNull(), // "theoretical", "practical", "exercises", "remedial", "group_work"
// code: text("code").notNull().unique(), // "THEO", "PRAC", "EXER", "REME", "GROUP"
// description: text("description"), // Detailed description of lesson type
// color: text("color"), // For UI representation
// isActive: boolean("is_active").default(true).notNull(),

// orgId: text("org_id")
// .notNull()
// .references(() => organization.id, { onDelete: "cascade" }),

// // Audit fields
// createdByUserId: text("created_by_user_id").references(() => user.id),
// updatedByUserId: text("updated_by_user_id").references(() => user.id),

// createdAt: timestamp("created_at").defaultNow().notNull(),
// updatedAt: timestamp("updated_at")
// .defaultNow()
// .$onUpdate(() => new Date())
// .notNull(),
// });

// // Main lesson sessions - combines teacher assignment, lesson type, and optional group
// export const lessonSession = pgTable("lesson_session", {
// id: uuid("id").primaryKey().defaultRandom(),
// title: text("title"), // Optional custom title for the session
// description: text("description"), // Session objectives, materials needed, etc.

// // Core relationships
// classroomTeacherAssignmentId: uuid("classroom_teacher_assignment_id")
// .notNull()
// .references(() => classroomTeacherAssignment.id, { onDelete: "cascade" }),
// lessonTypeId: uuid("lesson_type_id")
// .notNull()
// .references(() => lessonType.id, { onDelete: "restrict" }), // Don't allow deletion of used types

// // Optional: if null, lesson is for the whole class
// classroomGroupId: uuid("classroom_group_id")
// .references(() => classroomGroup.id, { onDelete: "cascade" }),

// // Session metadata
// duration: integer("duration"), // Duration in minutes (for planning)
// maxStudents: integer("max_students"), // Override capacity if needed

// // Session status
// status: text("status").default("planned").notNull(), // planned, active, completed, cancelled
// notes: text("notes"), // Post-session notes, observations

// orgId: text("org_id")
// .notNull()
// .references(() => organization.id, { onDelete: "cascade" }),

// // Audit fields
// createdByUserId: text("created_by_user_id").references(() => user.id),
// updatedByUserId: text("updated_by_user_id").references(() => user.id),
// deletedByUserId: text("deleted_by_user_id").references(() => user.id),

// createdAt: timestamp("created_at").defaultNow().notNull(),
// updatedAt: timestamp("updated_at")
// .defaultNow()
// .$onUpdate(() => new Date())
// .notNull(),
// deletedAt: timestamp("deleted_at"),
// });

// // Relations
// export const lessonTypeRelations = relations(lessonType, ({ many, one }) => ({
// lessonSessions: many(lessonSession),
// organization: one(organization, {
// fields: [lessonType.orgId],
// references: [organization.id],
// }),
// createdBy: one(user, {
// fields: [lessonType.createdByUserId],
// references: [user.id],
// relationName: "lessonTypeCreatedBy"
// }),
// }));

// export const lessonSessionRelations = relations(lessonSession, ({ one }) => ({
// classroomTeacherAssignment: one(classroomTeacherAssignment, {
// fields: [lessonSession.classroomTeacherAssignmentId],
// references: [classroomTeacherAssignment.id],
// }),
// lessonType: one(lessonType, {
// fields: [lessonSession.lessonTypeId],
// references: [lessonType.id],
// }),
// classroomGroup: one(classroomGroup, {
// fields: [lessonSession.classroomGroupId],
// references: [classroomGroup.id],
// }),
// organization: one(organization, {
// fields: [lessonSession.orgId],
// references: [organization.id],
// }),
// createdBy: one(user, {
// fields: [lessonSession.createdByUserId],
// references: [user.id],
// relationName: "lessonSessionCreatedBy"
// }),
// }));
