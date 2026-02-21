import { open } from "@tauri-apps/plugin-dialog";
import {copyFile, exists, create } from "@tauri-apps/plugin-fs";
import { join, appConfigDir, BaseDirectory } from "@tauri-apps/api/path";
import { load } from "@tauri-apps/plugin-store"
import { DatabaseService } from "./dbClass";



/**
 * The function `getConfig` asynchronously loads a JSON configuration file and retrieves a specific key
 * from it.
 * @param {string} key - The `key` parameter in the `getConfig` function is a string that represents
 * the specific configuration key that you want to retrieve from the `config.json` file.
 * @returns The `getConfig` function is returning the value associated with the specified key from the
 * `config.json` file after loading it asynchronously.
 */
export async function getConfig(key: string) {
  const config = await load("config.json")

  return await config.get(key)
}

/**
 * The function `setConfig` asynchronously loads a JSON configuration file and sets a key-value pair in
 * the configuration.
 * @param {string} key - The `key` parameter is a string that represents the key under which the
 * `value` will be stored in the configuration file.
 * @param {unknown} value - The `value` parameter in the `setConfig` function is of type `unknown`,
 * which means it can be any type. It is the value that you want to set for the specified `key` in the
 * configuration file.
 * @returns the result of setting the key-value pair in the config object.
 */
export async function setConfig(key: string, value: unknown) {
  const config = await load("config.json")

  return await config.set(key, value)
}

/**
 * This function allows the user to choose a folder to store a database, updating the
 * configuration and reloading the database if necessary.
 * @returns The function `chooseDbFolder` returns a `Promise` that resolves to a `string` representing
 * the selected folder path where the database will be stored. If the user cancels the folder selection
 * or an error occurs during the process, it returns `null`.
 */
export async function chooseDbFolder(): Promise<string | null> {
  const prevPath = await getDbPath()
  const folder = await open({
    directory: true,
    multiple: false,
    defaultPath: prevPath,
    title: "Choisissez où stocker votre base de données Yfokon",
  });

  if (!folder) return null;

  return folder as string;
}


/**
 * The function `setDbFolder` updates the database folder path, closes the current database connection,
 * moves the database file to the new path if it doesn't exist, and reloads the database.
 * @param  - 1. `reloadDb`: A function that reloads the database.
 */
export async function setDbFolder({ reloadDb, dbService, newPath }: { reloadDb: () => Promise<void>, dbService: DatabaseService, newPath: string }) {
  const config = await load("config.json")
  const prevPath = await getDbPath()
  await dbService.close()

  await config.set("dbFolder", newPath)
  await config.save()

  if(!(await exists(await join(newPath, "Yfokon.yfdb")))) {
    await copyFile(prevPath, await join(newPath, "Yfokon.yfdb"));
  }

  await reloadDb()
}

/**
 * This function retrieves the database folder path, creates it if it doesn't exist, and
 * returns the path.
 * @returns The `getDbFolder` function returns a Promise that resolves to a string. The function first
 * checks if the `dbFolder` value is null or undefined in the configuration. If it is, it sets the
 * `dbFolder` value to the result of `appConfigDir()`, saves the configuration, and creates a database
 * file named "Yfokon.yfdb" in the app's configuration directory
 */
export async function getDbFolder(): Promise<string> {
  const config = await load("config.json")
  const dbFolder = await config.get("dbFolder");
  if(dbFolder === null || dbFolder === undefined) {
    await config.set("dbFolder", await appConfigDir())
    await config.save()
    try {
      await create("Yfokon.yfdb", { baseDir: BaseDirectory.AppConfig })
    } catch (_) {}
    return (await appConfigDir());
  }
  return dbFolder as string
}

/**
 * The function `getDbPath` returns the path to a database file named "Yfokon.yfdb" within a specified
 * folder.
 * @returns The function `getDbPath` is returning a Promise that resolves to the path of the database
 * file "Yfokon.yfdb" within the folder obtained from the `getDbFolder` function.
 */
export async function getDbPath(): Promise<string> {
  const folder = await getDbFolder();
  return await join(folder, "Yfokon.yfdb");
}
