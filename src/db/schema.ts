import { sql } from "drizzle-orm";
import {
    boolean,
    numeric,
    check,
    customType,
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
export const visibilityEnum = pgEnum("visibility", ["public", "members"]);
export const decisionStateEnum = pgEnum("decision_state", ["active", "superseded", "cancelled"]);
export const fundKindEnum = pgEnum("fund_kind", ["income", "expense"]);
export const pollResultsEnum = pgEnum("poll_results", ["always", "after_vote", "after_close"]);
export const occasionTypeEnum = pgEnum("occasion_type", ["wedding", "birth", "graduation", "achievement", "other"]);

const bytea = customType<{ data: Buffer; driverData: Buffer }>({ dataType: () => "bytea" });

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
        councilRole: text("council_role"), // e.g. "رئيس المجلس"; set = shown on the council page
        councilOrder: integer("council_order"), // 1 = chair, then display order
        councilSince: text("council_since"), // e.g. "١٤٤٠ هـ"
        councilStatement: text("council_statement"), // quote shown for the chair
        bio: text("bio"),
        interests: text("interests").array().default(sql`'{}'::text[]`).notNull(),
        isPublic: integer("is_public").default(1).notNull(), // 1 = shown on public pages
        // Who may see each personal detail; see lib/privacy.ts. Empty = the defaults.
        privacy: jsonb("privacy").$type<Record<string, string>>().default({}).notNull(),

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
        state: decisionStateEnum("state").notNull().default("active"),
        issuedAt: date("issued_at"),
        attachmentFileId: uuid("attachment_file_id").references(() => files.id, { onDelete: "set null" }),
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
    fileId: uuid("file_id").references(() => files.id, { onDelete: "cascade" }),
    visibility: visibilityEnum("visibility").notNull().default("members"),
    isCharter: boolean("is_charter").notNull().default(false),
    uploadedBy: uuid("uploaded_by").references(() => users.id, { onDelete: "set null" }),
    ...timestamps,
});

// Uploaded file contents, served at /files/<id>. Kept in Postgres until a storage
// bucket is available; only lib/files.ts reads or writes this table.
export const files = pgTable("files", {
    id: uuid("id").primaryKey().defaultRandom(),
    name: text("name").notNull(),
    mimeType: text("mime_type").notNull(),
    sizeBytes: integer("size_bytes").notNull(),
    data: bytea("data").notNull(),
    visibility: visibilityEnum("visibility").notNull().default("members"),
    uploadedBy: uuid("uploaded_by").references(() => users.id, { onDelete: "set null" }),
    createdAt: timestamps.createdAt,
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
        // Email when news, happy news or a poll is published (see lib/notify.ts).
        notifyEmail: boolean("notify_email").notNull().default(true),
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

// Family happy news (weddings, new babies, graduations...). Members submit them for
// review ("pending"); staff posts and approved ones are "approved". Family-only unless
// staff make one public.
export const occasions = pgTable(
    "occasions",
    {
        id: uuid("id").primaryKey().defaultRandom(),
        type: occasionTypeEnum("type").notNull(),
        title: text("title").notNull(),
        message: text("message"),
        occasionDate: date("occasion_date"),
        memberId: uuid("member_id").references(() => members.id, { onDelete: "set null" }),
        photoUrl: text("photo_url"),
        visibility: visibilityEnum("visibility").notNull().default("members"),
        status: requestStatusEnum("status").notNull().default("pending"),
        submittedBy: uuid("submitted_by").references(() => users.id, { onDelete: "set null" }),
        submitterName: text("submitter_name").notNull(),
        reviewedAt: timestamp("reviewed_at", { withTimezone: true }),
        ...timestamps,
    },
    (t) => [index("occasions_status_idx").on(t.status, t.occasionDate)],
);

// "مبارك" from a member under a happy news post, with an optional short message.
export const occasionCongrats = pgTable(
    "occasion_congrats",
    {
        id: uuid("id").primaryKey().defaultRandom(),
        occasionId: uuid("occasion_id")
            .notNull()
            .references(() => occasions.id, { onDelete: "cascade" }),
        // Who congratulated: an account id, or a demo/env user id kept as text.
        authorKey: text("author_key").notNull(),
        authorName: text("author_name").notNull(),
        message: text("message"),
        createdAt: timestamps.createdAt,
    },
    (t) => [uniqueIndex("occasion_congrats_author_key").on(t.occasionId, t.authorKey)],
);

// Photo albums for events and occasions. Photos are files (lib/files.ts) that share
// the album's visibility.
export const albums = pgTable(
    "albums",
    {
        id: uuid("id").primaryKey().defaultRandom(),
        title: text("title").notNull(),
        description: text("description"),
        eventDate: date("event_date"),
        coverFileId: uuid("cover_file_id").references(() => files.id, { onDelete: "set null" }),
        visibility: visibilityEnum("visibility").notNull().default("members"),
        createdBy: uuid("created_by").references(() => users.id, { onDelete: "set null" }),
        ...timestamps,
    },
    (t) => [index("albums_event_date_idx").on(t.eventDate)],
);

export const albumPhotos = pgTable(
    "album_photos",
    {
        id: uuid("id").primaryKey().defaultRandom(),
        albumId: uuid("album_id")
            .notNull()
            .references(() => albums.id, { onDelete: "cascade" }),
        fileId: uuid("file_id")
            .notNull()
            .references(() => files.id, { onDelete: "cascade" }),
        caption: text("caption"),
        createdAt: timestamps.createdAt,
    },
    (t) => [index("album_photos_album_idx").on(t.albumId, t.createdAt)],
);

// Polls for council and family decisions. Each signed-in person has one ballot per
// poll (one or several options) and may change it until the poll closes.
export const polls = pgTable("polls", {
    id: uuid("id").primaryKey().defaultRandom(),
    question: text("question").notNull(),
    description: text("description"),
    multiple: boolean("multiple").notNull().default(false),
    anonymous: boolean("anonymous").notNull().default(true),
    results: pollResultsEnum("results").notNull().default("after_vote"),
    closesAt: timestamp("closes_at", { withTimezone: true }),
    closedAt: timestamp("closed_at", { withTimezone: true }),
    createdBy: uuid("created_by").references(() => users.id, { onDelete: "set null" }),
    ...timestamps,
});

export const pollOptions = pgTable(
    "poll_options",
    {
        id: uuid("id").primaryKey().defaultRandom(),
        pollId: uuid("poll_id")
            .notNull()
            .references(() => polls.id, { onDelete: "cascade" }),
        label: text("label").notNull(),
        sortOrder: integer("sort_order").notNull().default(0),
    },
    (t) => [index("poll_options_poll_idx").on(t.pollId, t.sortOrder)],
);

export const pollVotes = pgTable(
    "poll_votes",
    {
        id: uuid("id").primaryKey().defaultRandom(),
        pollId: uuid("poll_id")
            .notNull()
            .references(() => polls.id, { onDelete: "cascade" }),
        optionId: uuid("option_id")
            .notNull()
            .references(() => pollOptions.id, { onDelete: "cascade" }),
        // Account id, or a demo/env user id kept as text.
        voterKey: text("voter_key").notNull(),
        voterName: text("voter_name").notNull(),
        createdAt: timestamps.createdAt,
    },
    (t) => [uniqueIndex("poll_votes_voter_option_key").on(t.pollId, t.voterKey, t.optionId), index("poll_votes_poll_idx").on(t.pollId)],
);

// Family fund ledger: records only (no payments). Members see it once an admin turns
// it on (settings key "fund"); "party" is the payer or beneficiary, hidden from members
// when partyHidden is set.
export const fundEntries = pgTable(
    "fund_entries",
    {
        id: uuid("id").primaryKey().defaultRandom(),
        kind: fundKindEnum("kind").notNull(),
        amount: numeric("amount", { precision: 12, scale: 2 }).notNull(),
        entryDate: date("entry_date").notNull(),
        category: text("category").notNull(),
        description: text("description"),
        party: text("party"),
        partyHidden: boolean("party_hidden").notNull().default(false),
        receiptFileId: uuid("receipt_file_id").references(() => files.id, { onDelete: "set null" }),
        createdBy: uuid("created_by").references(() => users.id, { onDelete: "set null" }),
        ...timestamps,
    },
    (t) => [index("fund_entries_date_idx").on(t.entryDate), check("fund_entries_amount_check", sql`${t.amount} > 0`)],
);

// A member asking to change their own tree record; staff approve or reject it.
// "changes" holds only the fields that differ, as { column: newValue }.
export const memberChangeRequests = pgTable(
    "member_change_requests",
    {
        id: uuid("id").primaryKey().defaultRandom(),
        memberId: uuid("member_id")
            .notNull()
            .references(() => members.id, { onDelete: "cascade" }),
        requestedBy: uuid("requested_by").references(() => users.id, { onDelete: "set null" }),
        requesterName: text("requester_name").notNull(),
        changes: jsonb("changes").$type<Record<string, unknown>>().notNull(),
        note: text("note"),
        status: requestStatusEnum("status").notNull().default("pending"),
        reviewNote: text("review_note"),
        reviewedBy: uuid("reviewed_by").references(() => users.id, { onDelete: "set null" }),
        reviewedAt: timestamp("reviewed_at", { withTimezone: true }),
        ...timestamps,
    },
    (t) => [
        index("member_change_requests_status_idx").on(t.status, t.createdAt),
        index("member_change_requests_member_idx").on(t.memberId, t.createdAt),
    ],
);

export const settings = pgTable("settings", {
    key: text("key").primaryKey(),
    value: jsonb("value").notNull(),
    updatedAt: timestamps.updatedAt,
});
