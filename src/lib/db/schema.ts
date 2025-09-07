import {pgTable, uuid, timestamp, text, integer, foreignKey, unique} from "drizzle-orm/pg-core"

export const users = pgTable("users", {
    id: uuid("id").primaryKey().defaultRandom().notNull(),
    createdAt: timestamp("createdAt").defaultNow(),
    updatedAt: timestamp("updatedAt")
        .defaultNow()
        .notNull()
        .$onUpdate(()=>new Date()),
    name: text("name").notNull().unique(),
});

export const feeds = pgTable("feeds", {
    id: uuid("id").primaryKey().defaultRandom().notNull(),
    createdAt: timestamp("createdAt").defaultNow(),
    updatedAt: timestamp("updatedAt")
        .defaultNow()
        .notNull()
        .$onUpdate(()=>new Date()),
    name: text("name").notNull(),
    url: text("url").notNull().unique(),
    user_id: uuid("user_id")
}, (table) => [
    foreignKey({
        name: "user_id_fk",
        columns: [table.user_id],
        foreignColumns: [users.id],
    })
        .onDelete('cascade')
]);

export const feed_follows = pgTable("feed_follows", {
    id: uuid("id").primaryKey().defaultRandom().notNull(),
    createdAt: timestamp("createdAt").defaultNow(),
    updatedAt: timestamp("updatedAt")
        .defaultNow()
        .notNull()
        .$onUpdate(()=>new Date()),
    feed_id: uuid("feed_id"),
    user_id: uuid("user_id")
}, (table) => [
    foreignKey({
        name: "user_id_fk",
        columns: [table.user_id],
        foreignColumns: [users.id],
    }).onDelete('cascade'),
    foreignKey({
        name: "feed_id_fk",
        columns: [table.feed_id],
        foreignColumns: [feeds.id],
    }).onDelete('cascade'),
    unique("feed_user_id").on(table.feed_id, table.user_id)
]);