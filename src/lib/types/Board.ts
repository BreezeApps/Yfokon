/**
 * The type `Board` represents a board with an id, name, and optional color property.
 * @property {number} id - The `id` property in the `Board` type represents a unique identifier for a
 * board. It is of type `number`.
 * @property {string} name - The `name` property in the `Board` type represents the name of the board.
 * It is a string type.
 * @property {string | null} color - The `color` property in the `Board` type is a string or null. This
 * means that the `color` can either be a string value representing a color or it can be null if no
 * color is specified for the board.
 */
type Board = {
    id: number,
    name: string,
    color: string | null
}

type SyncBoardItem = Board & {
  remote_id?: string;
}

export type { Board, SyncBoardItem };