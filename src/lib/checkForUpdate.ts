/* import { ask, message } from "@tauri-apps/plugin-dialog";
import { openUrl } from "@tauri-apps/plugin-opener" */

/**
 * The function `checkForAppUpdates` checks for available updates for an application and prompts the
 * user to update if one is available.
 */
/* export async function checkForAppUpdates(onUserClick: boolean) {
  try {
    const update = null;
    if (!update) {
      console.log("No update available");
    } else if (update) {
      console.log("Update available!", update.version, update.body);
      const yes = await ask(
        `Update to ${update.version} is available!\n\nRelease notes: ${update.body}`,
        {
          title: "Update Available",
          kind: "info",
          okLabel: "Update",
          cancelLabel: "Cancel",
        }
      );
      if (yes) {
        await openUrl("https://github.com/BreezeApps/Yfokon/releases/latest")
      }
    } else if (onUserClick) {
      await message("You are on the latest version. Stay awesome!", {
        title: "No Update Available",
        kind: "info",
        okLabel: "OK",
      });
    }
  } catch (error) {}
} */
