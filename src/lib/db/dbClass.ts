import Database from "@tauri-apps/plugin-sql";
import * as path from '@tauri-apps/api/path';
import { save, open } from "@tauri-apps/plugin-dialog";
import { copyFile } from '@tauri-apps/plugin-fs';

import { Board } from "../types/Board";
import { Collection } from "../types/Collection";
import { Task } from "../types/Task";
import { setupOptions } from "./setupOptions";
import { getDbPath } from "./dbManager";
import { Migrations } from "./migrations";

/* The DatabaseService class provides methods for interacting with a database, including
creating, updating, and retrieving data related to boards, collections, and tasks. */
export class DatabaseService {
  private db: Database | undefined;

  constructor() {
    // Initialization must be called manually after construction
    // or use DatabaseService.create() static method below
  }

  static async create(): Promise<DatabaseService> {
    const instance = new DatabaseService();
    await instance.init();
    return instance;
  }

  async init() {
    const dbPath = "sqlite:" + await getDbPath();
    this.db = await Database.load(dbPath)
    const migrations = new Migrations(this.db)
    await this.db?.execute("PRAGMA foreign_keys = ON;");
    // await this.db?.execute("PRAGMA locking_mode = EXCLUSIVE")
    await migrations.runMigrations()
    if (await this.getBoardById(1) === null) {
      await this.createDbBase()
    }
  }

  async close() {
    await this.db?.close()
  }

  async createBackup(): Promise<boolean> {
    const date = new Date().toISOString().slice(0, 10).replace(/-/g, "_");
    const filePath = await save({
      defaultPath: (await path.downloadDir()) + "/" + `Yfokon_backup_${date}.yfdb`,
    });
    if (!filePath) return false;
    try {
      await this.db?.execute(`VACUUM INTO '${filePath}';`);
    } catch (error) {
      console.error("Error creating backup:", error);
      return false;
    }
    return true;
  }

  async importBackup(): Promise<boolean> {
    const file = await open({
      multiple: false,
      directory: false,
      filters: [
        {
          name: "Yfokon DataBase",
          extensions: ["yfdb"],
        },
      ],
    });
    if (!file) return false;

    try {
      copyFile(file === null ? "" : file, await path.join(await path.appConfigDir(), "backup.db"));
    } catch (error) {
      console.error("Error importing backup:", error);
      return false;
    }
    try {
      await this.db?.execute(`ATTACH DATABASE '${await path.join(await path.appConfigDir(), "backup.db")}' AS 'backup';`);
      // await this.db?.execute("INSERT OR REPLACE INTO boards SELECT * FROM backup.boards;");
      // await this.db?.execute("INSERT OR REPLACE INTO collections SELECT * FROM backup.collcetions;");
      // await this.db?.execute("INSERT OR REPLACE INTO tasks SELECT * FROM backup.tasks;");
      console.log(await this.db?.execute("SELECT * FROM backup.boards;"));
      await this.db?.execute("DETACH DATABASE backup;");
      // await this.db?.execute("VACUUM;");
    } catch (error) {
      console.error("Error importing backup:", error);
      return false;
    }
    return true
  }

  async createDbBase(): Promise<void> {
    await setupOptions(this.db!)
    await this.createBoard({ id: 0, name: "Premier Onglet", color: "" });
    await this.createBoard({ id: 0, name: "Deuxieme Onglet", color: "" });
    await this.createCollection({ id: 0, board_id: 1, names: "Premiere Liste", color: "" })
    await this.createCollection({ id: 0, board_id: 1, names: "Deuxieme Liste", color: "" })
    await this.createTask({ id: 0, collection_id: 1, names: "Premiere Tache", due_date: new Date(), status: "pending", task_order: 0, descriptions: "Ceci est la premiere tache" })
    await this.createTask({ id: 0, collection_id: 1, names: "Deuxieme Tache", due_date: new Date(), status: "pending", task_order: 0, descriptions: "Ceci est la deuxieme tache" })
  }

  /* ==================== OPTIONS ==================== */
  async createOption(key: string, value: string): Promise<void> {
    await this.db?.execute("INSERT INTO options (key, value) VALUES (?, ?);", [key, value]);
  }

  async updateOption(key: string, newValue: string): Promise<void> {
    await this.db?.execute("UPDATE options SET value = ? WHERE key = ?;", [newValue, key]);
  }

  async removeOption(key: string): Promise<void> {
    await this.db?.execute("DELETE FROM options WHERE key = ?;", [key]);
  }

  async getOptionByKey(key: string): Promise<string | null> {
    const result: { value: string }[] = (await this.db?.select("SELECT value FROM options WHERE key = ?;", [key])) ?? [];
    return result.length > 0 ? result[0].value : null;
  }

  async getAllOptions(): Promise<{ key: string; value: string }[]> {
    return (await this.db?.select("SELECT * FROM options;")) ?? [];
  }

  /* ==================== BOARDS ==================== */
  async createBoard(board: Board): Promise<void> {
    await this.db?.execute("INSERT INTO boards (name, color) VALUES (?, ?);", [board.name, board.color]);
  }

  async updateBoard(board: Board): Promise<void> {
    await this.db?.execute("UPDATE boards SET name = ?, color = ? WHERE id = ?;", [board.name, board.color, board.id]);
  }

  async removeBoard(id: number): Promise<void> {
    await this.db?.execute("DELETE FROM boards WHERE id = ?;", [id]);
  }

  async getBoardById(id: number): Promise<Board | null> {
    const result: Board[] = (await this.db?.select("SELECT * FROM boards WHERE id = ?;", [id])) ?? [];
    return result.length > 0 ? result[0] : null;
  }

  async getAllBoards(): Promise<Board[]> {
    return (await this.db?.select("SELECT * FROM boards;")) ?? [];
  }

  /* ==================== COLLECTIONS ==================== */
  async createCollection(collection: Collection): Promise<void> {
    await this.db?.execute("INSERT INTO collections (board_id, names, color) VALUES (?, ?, ?);", [collection.board_id, collection.names, collection.color ?? null]);
  }

  async updateCollection(collection: Collection): Promise<void> {
    await this.db?.execute("UPDATE collections SET names = ?, color = ? WHERE id = ?;", [collection.names, collection.color ?? null, collection.id]);
  }

  async removeCollection(id: number): Promise<void> {
    await this.db?.execute("DELETE FROM collections WHERE id = ?;", [id]);
  }

  async getCollectionById(id: number): Promise<Collection | null> {
    const result: Collection[] = (await this.db?.select("SELECT * FROM collections WHERE id = ?;", [id])) ?? [];
    return result.length > 0 ? result[0] : null;
  }

  async getAllCollections(): Promise<Collection[]> {
    return (await this.db?.select("SELECT * FROM collections;")) ?? [];
  }

  async getCollectionsByBoard(boardId: number): Promise<Collection[]> {
    return (await this.db?.select("SELECT * FROM collections WHERE board_id = ?;", [boardId])) ?? [];
  }

  /* ==================== TASKS ==================== */
  async createTask(task: Task): Promise<void> {
    await this.db?.execute(
      "INSERT INTO tasks (collection_id, task_order, names, descriptions, due_date, status) VALUES (?, ?, ?, ?, ?, ?);",
      [task.collection_id, task.task_order, task.names ?? null, task.descriptions ?? null, task.due_date ?? null, "pending"]
    );
  }

  async updateTask(task: Task): Promise<void> {
    await this.db?.execute(
      "UPDATE tasks SET names = ?, descriptions = ?, due_date = ?, status = ? WHERE id = ?;",
      [task.names ?? null, task.descriptions ?? null, task.due_date ?? null, task.status ?? null, task.id]
    );
  }

  async updateTaskOrder(task: Task): Promise<void> {
    await this.db?.execute(
      "UPDATE tasks SET task_order = ?, collection_id = ? WHERE id = ?;",
      [task.task_order, task.collection_id, task.id]
    );
  }

  async removeTask(id: number): Promise<void> {
    await this.db?.execute("DELETE FROM tasks WHERE id = ?;", [id]);
  }

  async getTaskById(id: number): Promise<Task | null> {
    const result: Task[] = (await this.db?.select("SELECT * FROM tasks WHERE id = ?;", [id])) ?? [];
    return result.length > 0 ? result[0] : null;
  }

  async getAllTasks(): Promise<Task[]> {
    return (await this.db?.select("SELECT * FROM tasks ORDER BY task_order;")) ?? [];
  }

  async getTasksByCollection(collectionId: number): Promise<Task[]> {
    return (await this.db?.select("SELECT * FROM tasks WHERE collection_id = ? ORDER BY task_order;", [collectionId])) ?? [];
  }

  async getTasksByBoard(boardId: number): Promise<Task[]> {
    return (await this.db?.select("SELECT * FROM tasks WHERE collection_id IN (SELECT id FROM collections WHERE board_id = ?) ORDER BY task_order;", [boardId])) ?? [];
  }
}