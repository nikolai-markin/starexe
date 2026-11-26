CREATE TABLE `answers` (
	`id` text PRIMARY KEY NOT NULL,
	`room` text NOT NULL,
	`player` text NOT NULL,
	`word` text NOT NULL,
	`score` integer NOT NULL
);
--> statement-breakpoint
CREATE TABLE `rooms` (
	`code` text PRIMARY KEY NOT NULL,
	`host` text NOT NULL,
	`guest` text,
	`ends` integer NOT NULL
);
