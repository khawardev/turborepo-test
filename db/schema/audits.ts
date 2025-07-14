import { relations } from 'drizzle-orm';
import { text, timestamp,  jsonb } from 'drizzle-orm/pg-core';
import { user } from './users';
import { audit_schema } from './schema-define';

export const audit = audit_schema.table('audit', {
    id: text('id').primaryKey().$defaultFn(() => crypto.randomUUID()),
    userId: text('userId').notNull().references(() => user.id, { onDelete: 'cascade' }),
    url: text('url').notNull(),
    status: text('status', { enum: ['pending', 'completed', 'failed'] }).notNull().default('pending'),
    results: jsonb('results'),
    crawledContent: text('crawledContent'),
    auditGenratedContent: text('auditGenratedContent'),
    createdAt: timestamp('createdAt').notNull().defaultNow(),
    updatedAt: timestamp('updatedAt').notNull().defaultNow(),
});

export const auditRelations = relations(audit, ({ one }) => ({
    user: one(user, {
        fields: [audit.userId],
        references: [user.id],
    }),
}));