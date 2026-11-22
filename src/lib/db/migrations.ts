import Database from "@tauri-apps/plugin-sql";
import { Migration } from "../types/Migrations";
import { setupOptions } from "./setupOptions";

/* The `Migrations` class manages database migrations and versioning, including running
migrations and updating database options. */
export class Migrations {
  private db: Database;

  constructor(db: Database) {
    this.db = db;
  }

  /* ==================== MIGRATIONS ===================== */
  migrations: Migration[] = [
    {
      from: "0",
      to: "0.1.0",
      migrate: async () => {
        await this.execAll([
          `CREATE TABLE IF NOT EXISTS options (
            id INTEGER PRIMARY KEY,
            key TEXT UNIQUE NOT NULL,
            value TEXT NOT NULL
          );`,
          `CREATE TABLE IF NOT EXISTS boards (
            id INTEGER PRIMARY KEY,
            name TEXT NOT NULL
          );`,
          `CREATE TABLE IF NOT EXISTS collections (
            id INTEGER PRIMARY KEY,
            board_id INTEGER,
            names TEXT NOT NULL,
            color TEXT,
            FOREIGN KEY (board_id) REFERENCES boards(id)
              ON UPDATE CASCADE ON DELETE CASCADE
          );`,
          `CREATE TABLE IF NOT EXISTS tasks (
            id INTEGER PRIMARY KEY,
            collection_id INTEGER,
            task_order INTEGER NOT NULL,
            names TEXT,
            descriptions TEXT,
            due_date TEXT,
            status TEXT,
            FOREIGN KEY (collection_id) REFERENCES collections(id)
              ON UPDATE CASCADE ON DELETE CASCADE
          );`,
        ]);
      },
    },
    {
      from: "0.1.0",
      to: "0.8.0",
      migrate: async (db) => {
        const columns: { name: string }[] = await db.select(
          "PRAGMA table_info(boards);"
        );

        const hasColor = columns.some((col) => col.name === "color");
        if (!hasColor) {
          await db.execute("ALTER TABLE boards ADD COLUMN color TEXT;");
        }
      },
    },
    {
      from: "0.8.0",
      to: "0.9.5",
      migrate: async (db) => {
        const columnsBoard: { name: string }[] = await db.select(
          "PRAGMA table_info(boards);"
        );
        const columnsCollections: { name: string }[] = await db.select(
          "PRAGMA table_info(collections);"
        );
        const columnsTasks: { name: string }[] = await db.select(
          "PRAGMA table_info(tasks);"
        );

        const hasIsDirtyBoards = columnsBoard.some((col) => col.name === "is_dirty");
        if (!hasIsDirtyBoards) {
          await db.execute("ALTER TABLE boards ADD COLUMN is_dirty BOOL NOT NULL DEFAULT FALSE;");
        }
        const hasIsDirtyCollections = columnsCollections.some((col) => col.name === "is_dirty");
        if (!hasIsDirtyCollections) {
          await db.execute("ALTER TABLE collections ADD COLUMN is_dirty BOOL NOT NULL DEFAULT FALSE;");
        }
        const hasIsDirtyTasks = columnsTasks.some((col) => col.name === "is_dirty");
        if (!hasIsDirtyTasks) {
          await db.execute("ALTER TABLE tasks ADD COLUMN is_dirty BOOL NOT NULL DEFAULT FALSE;");
        }

        await db.execute("CREATE TABLE IF NOT EXISTS id_mappings (local_id INTEGER NOT NULL, remote_id TEXT NOT NULL, entity_type TEXT NOT NULL, PRIMARY KEY (local_id, entity_type));")
      },
    },
  ];

  /* ==================== MIGRATION RUNNER ===================== */
  async runMigrations() {
    let currentVersion = await this.getCurrentDbVersion();
    let migrated = false;

    while (true) {
      const migration = this.migrations.find((m) => m.from === currentVersion);
      if (!migration) break;

      console.log(`Migration de ${migration.from} vers ${migration.to}`);
      await migration.migrate(this.db);
      await this.setDbVersion(migration.to);
      currentVersion = migration.to;
      migrated = true;
    }

    if (migrated) {
      console.log("Toutes les migrations ont été appliquées avec succès !");
    } else {
      console.log("Base de données déjà à jour.");
    }

    await setupOptions(this.db);
  }

  /* ==================== OPTIONS UTILS ===================== */
  async getCurrentDbVersion(): Promise<string> {
    try {
      const result = await this.getOptionByKey("version");
      return result || "0";
    } catch {
      return "0";
    }
  }

  async setDbVersion(version: string) {
    await this.updateOption("version", version);
  }

  async updateOption(key: string, newValue: string): Promise<void> {
    await this.db.execute(
      `INSERT OR REPLACE INTO options (id, key, value)
       VALUES ((SELECT id FROM options WHERE key = ?), ?, ?);`,
      [key, key, newValue]
    );
  }

  async getOptionByKey(key: string): Promise<string | null> {
    const result = await this.db.select<{ value: string }[]>(
      "SELECT value FROM options WHERE key = ?;",
      [key]
    );
    return result?.[0]?.value ?? null;
  }

  /* ==================== SQL HELPERS ===================== */
  private async execAll(queries: string[]) {
    for (const query of queries) {
      await this.db.execute(query);
    }
  }
}
