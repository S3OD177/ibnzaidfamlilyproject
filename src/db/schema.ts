import { sql } from "drizzle-orm";
import {
    check,
    date,
    index,
    integer,
    jsonb,
    pgEnum,
    pgTable,
    text,
    timestamp,
    uniqueIndex,
    uuid,
} from "drizzle-orm/pg-core";

// ---------- Enums ----------

export const genderEnum = pgEnum("gender", ["male", "female"]);
export const lifeStatusEnum = pgEnum("life_status", ["alive", "deceased", "unknown"]);
export const calendarEnum = pgEnum("calendar_type", ["hijri", "gregorian"]);
export const maritalStatusEnum = pgEnum("marital_status", ["single", "married", "divorced", "widowed"]);
export const publishStatusEnum = pgEnum("publish_status", ["draft", "published", "archived"]);
export const userRoleEnum = pgEnum("user_role", ["admin", "editor", "member"]);
export const userStatusEnum = pgEnum("user_status", ["active", "disabled"]);
export const requestStatusEnum = pgEnum("request_status", ["pending", "approved", "rejected"]);
export const timelineTypeEnum = pgEnum("timeline_type", ["birth", "death", "marriage", "achievement", "milestone"]);

const timestamps = {
    createdAt: timestamp("created_at", { withTimezone: true }).defaultNow().notNull(),
    updatedAt: timestamp("updated_at", { withTimezone: true })
        .defaultNow()
        .notNull()
        .$onUpdate(() => new Date()),
};

// ---------- Family ----------

export type SocialLinks = { twitter?: string; linkedin?: string; instagram?: string; website?: string };

// Dates are split into parts because most records only know the Hijri year.
export const members = pgTable(
    "members",
    {
        id: uuid("id").primaryKey().defaultRandom(),
        serialNumber: text("serial_number"),
        fullName: text("full_name").notNull(),
        nickname: text("nickname"),
        gender: genderEnum("gender").notNull(),
        status: lifeStatusEnum("status").notNull().default("alive"),
        photoUrl: text("photo_url"),

        birthYear: integer("birth_year"),
        birthMonth: integer("birth_month"),
        birthDay: integer("birth_day"),
        birthCalendar: calendarEnum("birth_calendar").default("hijri"),
        deathYear: integer("death_year"),
        deathMonth: integer("death_month"),
        deathDay: integer("death_day"),
        deathCalendar: calendarEnum("death_calendar").default("hijri"),

        mobile: text("mobile"),
        email: text("email"),
        location: text("location"),
        country: text("country"),
        maritalStatus: maritalStatusEnum("marital_status"),

        occupation: text("occupation"),
        company: text("company"),
        education: text("education"),
        university: text("university"),
        socialLinks: jsonb("social_links").$type<SocialLinks>().default({}).notNull(),

        branch: text("branch"),
        generationLabel: text("generation_label"), // e.g. "الجيل الثالث"
        siblingOrder: integer("sibling_order"),
        councilRole: text("council_role"), // e.g. "رئيس المجلس"
        bio: text("bio"),
        interests: text("interests").array().default(sql`'{}'::text[]`).notNull(),
        isPublic: integer("is_public").default(1).notNull(), // 1 = shown on public pages

        ...timestamps,
    },
    (t) => [
        uniqueIndex("members_serial_number_key").on(t.serialNumber),
        index("members_full_name_idx").on(t.fullName),
        check("members_birth_month_check", sql`${t.birthMonth} between 1 and 12`),
        check("members_death_month_check", sql`${t.deathMonth} between 1 and 12`),
    ],
);

// Parent -> child links; these are the edges of the family tree.
export const relationships = pgTable(
    "relationships",
    {
        id: uuid("id").primaryKey().defaultRandom(),
        parentId: uuid("parent_id")
            .notNull()
            .references(() => members.id, { onDelete: "cascade" }),
        childId: uuid("child_id")
            .notNull()
            .references(() => members.id, { onDelete: "cascade" }),
        createdAt: timestamps.createdAt,
    },
    (t) => [
        uniqueIndex("relationships_parent_child_key").on(t.parentId, t.childId),
        index("relationships_child_idx").on(t.childId),
        check("relationships_no_self_check", sql`${t.parentId} <> ${t.childId}`),
    ],
);

// A spouse may be another member or only a name (married in from outside the family).
export const marriages = pgTable(
    "marriages",
    {
        id: uuid("id").primaryKey().defaultRandom(),
        memberId: uuid("member_id")
            .notNull()
            .references(() => members.id, { onDelete: "cascade" }),
        spouseId: uuid("spouse_id").references(() => members.id, { onDelete: "set null" }),
        spouseName: text("spouse_name"),
        marriageYear: integer("marriage_year"),
        ...timestamps,
    },
    (t) => [
        index("marriages_member_idx").on(t.memberId),
        check("marriages_spouse_check", sql`${t.spouseId} is not null or ${t.spouseName} is not null`),
    ],
);

// ---------- Content ----------

export const news = pgTable(
    "news",
    {
        id: uuid("id").primaryKey().defaultRandom(),
        slug: text("slug").notNull(),
        title: text("title").notNull(),
        excerpt: text("excerpt"),
        content: text("content"),
        category: text("category").notNull(),
        coverUrl: text("cover_url"),
        authorName: text("author_name"),
        status: publishStatusEnum("status").notNull().default("draft"),
        publishedAt: timestamp("published_at", { withTimezone: true }),
        ...timestamps,
    },
    (t) => [
        uniqueIndex("news_slug_key").on(t.slug),
        index("news_status_published_idx").on(t.status, t.publishedAt),
    ],
);

// Custom calendar entries; birthdays and death anniversaries are derived from members.
export const events = pgTable(
    "events",
    {
        id: uuid("id").primaryKey().defaultRandom(),
        title: text("title").notNull(),
        description: text("description"),
        eventDate: date("event_date").notNull(),
        category: text("category").notNull().default("event"),
        color: text("color"),
        location: text("location"),
        memberId: uuid("member_id").references(() => members.id, { onDelete: "set null" }),
        ...timestamps,
    },
    (t) => [index("events_date_idx").on(t.eventDate)],
);

export const timelineEvents = pgTable(
    "timeline_events",
    {
        id: uuid("id").primaryKey().defaultRandom(),
        year: integer("year").notNull(),
        title: text("title").notNull(),
        description: text("description"),
        type: timelineTypeEnum("type").notNull(),
        imageUrl: text("image_url"),
        memberId: uuid("member_id").references(() => members.id, { onDelete: "set null" }),
        ...timestamps,
    },
    (t) => [index("timeline_events_year_idx").on(t.year)],
);

export const decisions = pgTable(
    "decisions",
    {
        id: uuid("id").primaryKey().defaultRandom(),
        referenceNumber: text("reference_number"),
        title: text("title").notNull(),
        body: text("body"),
        decisionType: text("decision_type").notNull(),
        hijriYear: integer("hijri_year"),
        keywords: text("keywords").array().default(sql`'{}'::text[]`).notNull(),
        status: publishStatusEnum("status").notNull().default("published"),
        issuedAt: date("issued_at"),
        ...timestamps,
    },
    (t) => [index("decisions_year_idx").on(t.hijriYear)],
);

export const documents = pgTable("documents", {
    id: uuid("id").primaryKey().defaultRandom(),
    title: text("title").notNull(),
    category: text("category"),
    fileUrl: text("file_url").notNull(),
    fileName: text("file_name"),
    mimeType: text("mime_type"),
    sizeBytes: integer("size_bytes"),
    uploadedBy: uuid("uploaded_by").references(() => users.id, { onDelete: "set null" }),
    ...timestamps,
});

// ---------- Accounts ----------

export const users = pgTable(
    "users",
    {
        id: uuid("id").primaryKey().defaultRandom(),
        username: text("username").notNull(),
        email: text("email"),
        displayName: text("display_name"),
        passwordHash: text("password_hash").notNull(),
        role: userRoleEnum("role").notNull().default("member"),
        status: userStatusEnum("status").notNull().default("active"),
        memberId: uuid("member_id").references(() => members.id, { onDelete: "set null" }),
        lastLoginAt: timestamp("last_login_at", { withTimezone: true }),
        ...timestamps,
    },
    (t) => [
        uniqueIndex("users_username_key").on(sql`lower(${t.username})`),
        uniqueIndex("users_email_key").on(sql`lower(${t.email})`),
    ],
);

export const membershipRequests = pgTable(
    "membership_requests",
    {
        id: uuid("id").primaryKey().defaultRandom(),
        fullName: text("full_name").notNull(),
        branch: text("branch"),
        mobile: text("mobile"),
        email: text("email"),
        note: text("note"),
        status: requestStatusEnum("status").notNull().default("pending"),
        reviewedBy: uuid("reviewed_by").references(() => users.id, { onDelete: "set null" }),
        reviewedAt: timestamp("reviewed_at", { withTimezone: true }),
        ...timestamps,
    },
    (t) => [index("membership_requests_status_idx").on(t.status, t.createdAt)],
);

export const settings = pgTable("settings", {
    key: text("key").primaryKey(),
    value: jsonb("value").notNull(),
    updatedAt: timestamps.updatedAt,
});
