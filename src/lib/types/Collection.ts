/**
 * The type `Collection` represents an object with properties `id`, `board_id`, `names`, and `color`.
 * @property {number} id - The `id` property in the `Collection` type represents a unique identifier
 * for each collection.
 * @property {number} board_id - The `board_id` property in the `Collection` type represents the unique
 * identifier of the board to which the collection belongs.
 * @property {string} names - The `names` property in the `Collection` type represents a string value.
 * @property {string | null} color - The `color` property in the `Collection` type represents the color
 * associated with the collection. It can be a string value representing a color (e.g., "red", "blue",
 * "green") or `null` if no color is specified for the collection.
 */
type Collection = {
    id: number;
    board_id: number;
    names: string;
    color: string | null 
}

type SyncCollectionItem = Collection & {
  remote_id?: string;
}

export type { Collection, SyncCollectionItem };