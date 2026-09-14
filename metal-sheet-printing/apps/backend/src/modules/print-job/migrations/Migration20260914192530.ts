import { Migration } from "@medusajs/framework/mikro-orm/migrations";

export class Migration20260914192530 extends Migration {

  override async up(): Promise<void> {
    this.addSql(`create table if not exists "custom_print_job" ("id" text not null, "order_id" text null, "line_item_id" text null, "original_image_url" text not null, "processed_image_url" text null, "dimensions" text not null, "finish_type" text check ("finish_type" in ('matte', 'gloss', 'brushed', 'satin')) not null, "dpi_status" text check ("dpi_status" in ('pending', 'passed', 'failed')) not null default 'pending', "dpi_value" integer null, "status" text check ("status" in ('pending_processing', 'processing', 'ready', 'failed', 'cancelled')) not null default 'pending_processing', "failure_reason" text null, "metadata" jsonb null, "created_at" timestamptz not null default now(), "updated_at" timestamptz not null default now(), "deleted_at" timestamptz null, constraint "custom_print_job_pkey" primary key ("id"));`);
    this.addSql(`CREATE INDEX IF NOT EXISTS "IDX_custom_print_job_deleted_at" ON "custom_print_job" ("deleted_at") WHERE deleted_at IS NULL;`);
  }

  override async down(): Promise<void> {
    this.addSql(`drop table if exists "custom_print_job" cascade;`);
  }

}
