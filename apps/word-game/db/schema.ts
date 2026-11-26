import {sqliteTable,text,integer} from 'drizzle-orm/sqlite-core';
export const rooms=sqliteTable('rooms',{code:text('code').primaryKey(),host:text('host').notNull(),guest:text('guest'),source:text('source').notNull().default('водогрязеторфопарафинолечение'),round:integer('round').notNull().default(0),ends:integer('ends').notNull()});
export const answers=sqliteTable('answers',{id:text('id').primaryKey(),room:text('room').notNull(),player:text('player').notNull(),word:text('word').notNull(),score:integer('score').notNull()});
