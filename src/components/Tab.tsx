import { useEffect, useState } from "react";
import { ModalForm } from "./Modal/ModalForm";
import { DatabaseService } from "../lib/db/dbClass";
import { Board } from "@/lib/types/Board";
import { getTextColor } from "@/lib/utils";
import { Tooltip, TooltipContent, TooltipTrigger } from "./ui/tooltip";
import { t } from "i18next";

type props = {
  dbService: DatabaseService;
  currentBoard: number;
  setCurrentBoard: (id: number) => void;
  handleCreateBoard: (
    _type: "board" | "collection" | "task",
    name: string,
    _description?: string,
    _date?: Date,
    color?: string,
    _collection_id?: string,
    _id?: number,
  ) => void;
  reloadList?: boolean;
  setReloadList: (reload: boolean) => void;
  contextMenu: (e: React.MouseEvent, boardId: number) => void;
  setShowConfig: (show: boolean) => void;
};

/**
 * The Tabs component renders a list of boards with options for context menu, board
 * selection, and configuration settings.
 */
export function Tabs({
  dbService,
  currentBoard,
  setCurrentBoard,
  setReloadList,
  handleCreateBoard,
  contextMenu,
  setShowConfig,
  reloadList,
}: props) {
  const [allBoards, setAllBoards] = useState<Board[]>([
    { id: 0, name: "test", color: "0" },
  ]);

  const handleCreateCollection = async (
    _type: "board" | "collection" | "task",
    name: string,
    _description?: string,
    _date?: Date,
    color?: string,
    _collection_id?: string,
    _id?: number,
  ) => {
    await dbService.createCollection({
      board_id: currentBoard,
      names: name,
      color: color === undefined ? null : color,
      id: 0,
    });
    setReloadList(true);
  };

  useEffect(() => {
    async function fetchBoards() {
      setAllBoards(await dbService.getAllBoards());
    }
    fetchBoards();
  }, [reloadList]);
  return (
    <>
      <div className="flex items-center justify-between w-full">
        <div className="flex items-center flex-1 overflow-hidden">
          <div className="flex flex-1 overflow-x-auto">
            {Array.isArray(allBoards) &&
              allBoards.map((board) => (
                <button
                  key={board.id}
                  onContextMenu={(e) => contextMenu(e, board.id)}
                  onClick={() => {
                    setCurrentBoard(board.id);
                    setReloadList(true);
                  }}
                  style={{
                    height: "34px",
                    minWidth: window.innerWidth < 768 ? "60px" : "80px",
                    maxWidth: "100%",
                    flex: "1 1 auto",
                    textAlign: "center",
                    lineHeight: "22px",
                    padding: "0 6px",
                    margin: "1px 0 0 0",
                    border: "1px solid gray",
                    borderBottom:
                      currentBoard === board.id
                        ? "0px solid var(--color-gray-800)"
                        : "1px solid var(--color-gray-950)",
                    borderTopLeftRadius: "6px",
                    borderTopRightRadius: "6px",
                    cursor: "pointer",
                    background:
                      board.color === null
                        ? "var(--color-gray-900)"
                        : board.color,
                    color: getTextColor(
                      board?.color !== null ? board.color : "#101828",
                    ),
                    whiteSpace: "nowrap",
                    overflow: "hidden",
                    textOverflow: "ellipsis",
                    fontSize: window.innerWidth < 768 ? "0.75rem" : "1rem",
                  }}
                >
                  {board.name}
                  {currentBoard === board.id ? (
                    <ModalForm
                      id="three-step"
                      type="collection"
                      onCreate={handleCreateCollection}
                      classname="pl-6 pt-3"
                    />
                  ) : (
                    ""
                  )}
                </button>
              ))}
            <ModalForm
              id="two-step"
              type="board"
              onCreate={handleCreateBoard}
            />
          </div>
        </div>
      </div>

      <Tooltip>
        <TooltipTrigger
          className="flex h-7 w-7 cursor-pointer flex-row-reverse justify-self-end"
          onClick={() => {
            setShowConfig(true);
          }}
        >
          <img className={`dark:invert`} src={"/icons/config.svg"} />
        </TooltipTrigger>
        <TooltipContent>
          <p>{t("app_config")}</p>
        </TooltipContent>
      </Tooltip>
    </>
  );
}
