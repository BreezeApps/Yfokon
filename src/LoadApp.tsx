import { useEffect, useState } from "react";
import App from "./App";
import { DatabaseService } from "./lib/db/dbClass";
import ErrorBoundary from "./components/ErrorBondary";
import { useLoadingScreen } from "./Hooks/useLoadingScreen";
import "./lib/i18n";
import { t } from "i18next";
import { getCurrentWindow } from "@tauri-apps/api/window";
import { exit } from "@tauri-apps/plugin-process";
import { load } from "@tauri-apps/plugin-store";

/**
 * The `LoadApp` function in TypeScript React initializes a database service, manages the current board
 * state, and handles window close events.
 * @returns The `LoadApp` function returns either `null` if `dbService` is falsy, or it returns the
 * `App` component wrapped in an `ErrorBoundary` component with the props `dbService`, `reloadDb`,
 * `currentBoard`, and `setCurrentBoard`.
 */
export function LoadApp() {
  const [dbService, setDbService] = useState<DatabaseService | null>(null);
  const [currentBoard, setCurrentBoard] = useState<number>(1);
  const { showLoading, hideLoading } = useLoadingScreen();

  async function initDatabase() {
    showLoading(t("loading_db"));

    if (dbService !== null) {
      await dbService.close();
    }

    /* await checkForAppUpdates(true) */

    const service = await DatabaseService.create();
    setDbService(service);
    const config = await load("config.json")
    setCurrentBoard(parseInt(await config.get("lastOpenBoard") ?? "1"))

    hideLoading();
  }

  getCurrentWindow().onCloseRequested(async (event) => {
    event.preventDefault();
    const config = await load("config.json")
    await config.set("lastOpenBoard", currentBoard.toString())
    await config.save()
    await config.close()
    await dbService?.close()
    exit()
  });

  useEffect(() => {
    initDatabase();
  }, []);

  if (!dbService) {
    return null;
  }

  return (
    <ErrorBoundary>
      <App dbService={dbService} reloadDb={initDatabase} currentBoard={currentBoard} setCurrentBoard={setCurrentBoard} />
    </ErrorBoundary>
  );
}
