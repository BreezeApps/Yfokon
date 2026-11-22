/**
 * The type `Task` defines the structure of a task object with specific properties and their types.
 * @property {number} id - The `id` property in the `Task` type represents the unique identifier of a
 * task. Each task will have a different `id` value to distinguish it from other tasks in the system.
 * @property {number} collection_id - The `collection_id` property in the `Task` type represents the
 * identifier of the collection to which the task belongs. It is a number type field.
 * @property {number} task_order - The `task_order` property in the `Task` type represents the order in
 * which the task should be completed within a collection. It is a number that specifies the position
 * of the task in relation to other tasks in the same collection.
 * @property {string | null} names - The `names` property in the `Task` type represents the name or
 * title of the task. It is a string type that can be `null` if no name is provided for the task.
 * @property {string | null} descriptions - The `descriptions` property in the `Task` type represents a
 * string that describes the task. It can be `null` if no description is provided for the task.
 * @property {"pending" | "done"} status - The `status` property in the `Task` type represents the
 * status of a task and can have one of two possible values: "pending" or "done".
 * @property {Date | null} due_date - The `due_date` property in the `Task` type represents the
 * deadline or due date for a task. It is of type `Date | null`, which means it can either be a valid
 * date object or `null` if no due date is set for the task.
 */
type Task = {
  id: number;
  collection_id: number;
  task_order: number;
  names: string | null;
  descriptions: string | null;
  status: "pending" | "done";
  due_date: Date | null;
};

interface SyncTaskItem {
  id: number;
  remote_id?: string;
  collectionId: string;
  task_order: number;
  name: string;
  descriptions?: string | null;
  due_date?: string | null;
  status?: string | null;
  updatedAt: string;
}

export type { Task, SyncTaskItem }