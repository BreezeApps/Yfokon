import Database from "@tauri-apps/plugin-sql";

/**
 * The function `setupOptions` checks and creates default options in a database if they do not already
 * exist.
 */
export async function setupOptions(db: Database) {
  if ((await getOptionByKey("version", db)) === null) {
    try {
      await createOption("version", "", db);
    } catch {
      console.log("Error createOptions version");
    }
  }
  if ((await getOptionByKey("syncActive", db)) === null) {
    try {
      await createOption("syncActive", "false", db);
    } catch {
      console.log("Error createOptions syncActive");
    }
  }
  if ((await getOptionByKey("syncUrl", db)) === null) {
    try {
      await createOption("syncUrl", "", db);
    } catch {
      console.log("Error createOptions syncUrl");
    }
  }
  if ((await getOptionByKey("notifications", db)) === null) {
    try {
      await createOption("notifications", "false", db);
    } catch {
      console.log("Error createOptions notifications");
    }
  }
  if ((await getOptionByKey("firstStart", db)) === null) {
    try {
      await createOption("firstStart", "true", db);
    } catch {
      console.log("Error createOptions firstStart");
    }
  }
}

async function createOption(
  key: string,
  value: string,
  db: Database
): Promise<void> {
  await db.execute("INSERT INTO options (key, value) VALUES (?, ?);", [
    key,
    value,
  ]);
}

async function getOptionByKey(
  key: string,
  db: Database
): Promise<string | null> {
  const result: { value: string }[] = await db.select(
    "SELECT value FROM options WHERE key = ?;",
    [key]
  );
  return result.length > 0 ? result[0].value : null;
}
