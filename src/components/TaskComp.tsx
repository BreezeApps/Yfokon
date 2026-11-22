import { type Task } from "@/lib/types/Task";
import { Checkbox } from "./ui/checkbox";
import { getDate, getRelativeTime } from "@/lib/i18n";
import { t } from "i18next";
import { DatabaseService } from "@/lib/db/dbClass";

export function TaskComp({
  dbService,
  setReloadList,
  task,
  contextMenuTask,
  setShowTaskInfo,
  setTooltipPos,
  setDescription,
  setName,
  setDuedate,
}: {
  dbService: DatabaseService;
  setReloadList: (reload: boolean) => void;
  task: Task;
  contextMenuTask: (e: React.MouseEvent, id: number) => void;
  setShowTaskInfo: (show: boolean) => void;
  setTooltipPos: (pos: { x: number; y: number }) => void;
  setDescription: (description: string) => void;
  setName: (name: string) => void;
  setDuedate: (description: string) => void;
}) {

  async function checkedDoneTask(task: Task, checked: boolean) {
    if (checked) {
      await dbService.updateTask({
        id: task.id,
        names: task.names === null ? "" : task.names,
        descriptions: task.descriptions === null ? "" : task.descriptions,
        due_date: task.due_date === null ? new Date() : task.due_date,
        collection_id: 0,
        task_order: 0,
        status: "done",
      });
    } else {
      await dbService.updateTask({
        id: task.id,
        names: task.names === null ? "" : task.names,
        descriptions: task.descriptions === null ? "" : task.descriptions,
        due_date: task.due_date === null ? new Date() : task.due_date,
        collection_id: 0,
        task_order: 0,
        status: "pending",
      });
    }
    setReloadList(true);
  }

  return (
    <div
      key={task.id}
      id={"seven-step"}
      className={`${
        task.status === "done"
          ? "bg-gray-200 dark:bg-blue-950 text-slate-500 dark:text-blue-400"
          : "bg-gray-300 dark:bg-blue-950 text-slate-800 dark:text-white"
      } flex w-full h-6 items-center rounded-md transition-all hover:bg-slate-300 dark:hover:bg-blue-600 dark:focus:bg-blue-400 focus:bg-slate-100 dark:active:bg-blue-400 active:bg-slate-100`}
      onContextMenu={(e) => {
        contextMenuTask(e, task.id);
      }}
      style={{ userSelect: "none", cursor: "pointer" }}
      onMouseMove={(e) => {
        setTooltipPos({ x: e.clientX, y: e.clientY });
        setName(task.names || "");
        setDescription(task.descriptions === null ? "" : task.descriptions);
        const dateText =
          task.due_date !== null
            ? `${getRelativeTime(task.due_date)} (${getDate(task.due_date)})`
            : t("NoDue");
        setDuedate(dateText);
        setShowTaskInfo(true);
      }}
      onMouseOut={() => {
        setShowTaskInfo(false);
      }}
    >
      <Checkbox
        checked={task.status === "done"}
        onCheckedChange={async (e) => {
          await checkedDoneTask(task, e === "indeterminate" ? false : e);
        }}
      />
      <span
        className="pl-2 truncate"
        style={{ userSelect: "none", cursor: "pointer" }}
      >
        {task.names}
      </span>
    </div>
  );
}
