import { useAuth } from "@/components/AuthContext";
import { SyncBoardItem } from "@/lib/types/Board";
import { SyncCollectionItem } from "@/lib/types/Collection";
import { SyncTaskItem } from "@/lib/types/Task";

export function useSync() {
  const { token, isLocalMode, dbService } = useAuth();

  const synchronize = async () => {
    if (isLocalMode || !token || !dbService) return;

    try {
      const dirtyBoards = await dbService?.getBoardsByIsDirty();

      if (dirtyBoards && dirtyBoards.length > 0) {
        let boardsSync: SyncBoardItem[] = [];
        for (const board of dirtyBoards) {
          const mapping = await dbService?.getMappingByLocalId(
            board.id,
            "board",
          );
          boardsSync.push({
            id: board.id,
            name: board.name,
            color: board.color,
            ...(mapping && { remote_id: mapping.remote_id })
          });
        }

        const pushResponse = await fetch(
          "http://127.0.0.1:3100/board/sync/push",
          {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
              Authorization: `Bearer ${token}`,
            },
            body: JSON.stringify({ items: boardsSync }),
          },
        );

        if (pushResponse.ok) {
          const {
            syncedIds,
          }: { syncedIds: { id: number; remote_id: string }[] } =
            await pushResponse.json();
          syncedIds.forEach(async (ids) => {
            await dbService?.updateBoardDirty(ids.id);
            await dbService?.createMapping({
              local_id: ids.id,
              remote_id: ids.remote_id,
              entity_type: "board",
            });
          });
        }
      }

      const dirtyCollections = await dbService.getCollectionsByIsDirty();
      if (dirtyCollections && dirtyCollections.length > 0) {
        let collectionsSync: SyncCollectionItem[] = [];

        for (const col of dirtyCollections) {
          const mapping = await dbService.getMappingByLocalId(col.id, "collection");
          const boardMapping = await dbService.getMappingByLocalId(col.board_id, "board");

          collectionsSync.push({
            id: col.id,
            names: col.names,
            board_id: boardMapping?.remote_id || "",
            ...(mapping && { remote_id: mapping.remote_id }),
          });
        }

        const response = await fetch("http://127.0.0.1:3100/collection/sync/push", {
          method: "POST",
          headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` },
          body: JSON.stringify({ items: collectionsSync }),
        });

        if (response.ok) {
          const { syncedIds }: { syncedIds: { id: number; remote_id: string }[] } = await response.json();
          for (const ids of syncedIds) {
            await dbService.updateCollectionDirty(ids.id); // À créer dans ton dbService
            await dbService.createMapping({ local_id: ids.id, remote_id: ids.remote_id, entity_type: "collection" });
          }
        }
      }

      const dirtyTasks = await dbService.getTasksByIsDirty(); // À vérifier/créer dans ton dbService
      if (dirtyTasks && dirtyTasks.length > 0) {
        let tasksSync: SyncTaskItem[] = [];

        for (const task of dirtyTasks) {
          const mapping = await dbService.getMappingByLocalId(task.id, "task");
          const colMapping = await dbService.getMappingByLocalId(task.collection_id, "collection");

          tasksSync.push({
            id: task.id,
            name: task.name,
            collection_id: task.collection_id,
            task_order: task.task_order,
            descriptions: task.descriptions,
            due_date: task.due_date,
            status: task.status,
            remote_collection_id: colMapping?.remote_id, // Indispensable pour lier la tâche à la bonne collection sur le cloud
            ...(mapping && { remote_id: mapping.remote_id })
          });
        }

        const response = await fetch("http://127.0.0.1:3100/task/sync/push", {
          method: "POST",
          headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` },
          body: JSON.stringify({ items: tasksSync }),
        });

        if (response.ok) {
          const { syncedIds }: { syncedIds: { id: number; remote_id: string }[] } = await response.json();
          for (const ids of syncedIds) {
            await dbService.updateTaskDirty(ids.id); // À créer dans ton dbService
            await dbService.createMapping({ local_id: ids.id, remote_id: ids.remote_id, entity_type: "task" });
          }
        }
      }

      const lastSyncedAt =
        localStorage.getItem("last_synced_at") || "1970-01-01T00:00:00.000Z";

      const pullResponse = await fetch(
        `http://127.0.0.1:3100/board/sync/pull?since=${lastSyncedAt}`,
        {
          headers: { Authorization: `Bearer ${token}` },
        },
      );

      if (pullResponse.ok) {
        const {
          changes,
          serverTime,
        }: {
          changes: { id: string; name: string; color: string | null }[];
          serverTime: string;
        } = await pullResponse.json();

        if (changes.length > 0) {
          await dbService?.upsertLocalBoards(changes)
        }
        localStorage.setItem("last_synced_at", serverTime);
      }

      console.log("Synchronisation terminée avec succès.");
    } catch (error) {
      console.error("Échec de la boucle de synchronisation :", error);
    }
  };

  return { synchronize };
}
