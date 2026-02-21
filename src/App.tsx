import "./App.css";
import { ConfigPage } from "./components/ConfigPage";
import React, { useEffect, useState } from "react";
import { ListContainer } from "./components/ListContainer";
import { ModalForm } from "./components/Modal/ModalForm";
import { DatabaseService } from "./lib/db/dbClass";
import ErrorBoundary from "./components/ErrorBondary";
import * as path from "@tauri-apps/api/path";
import { Tabs } from "./components/Tab";
import {
  isPermissionGranted,
  requestPermission,
} from "@tauri-apps/plugin-notification";
import { useContextMenu, ItemParams } from "react-contexify";

import { confirm, message, save } from "@tauri-apps/plugin-dialog";

import "react-contexify/dist/ReactContexify.css";
import { t } from "i18next";
import { pdf } from "@react-pdf/renderer";
import { CollectionPDF } from "./components/pdf/Collection";
import { writeFile } from "@tauri-apps/plugin-fs";
import { BoardPDF } from "./components/pdf/Board";
import ContextMenu from "./components/contextMenu";
import { OnBoarding } from "./components/OnBoarding";
import { changeLanguage } from "./lib/i18n";
import { getConfig } from "./lib/db/dbManager";

/**
 * The `App` function in this TypeScript React component manages the state and functionality for task
 * management, including handling board, collection, and task operations, displaying menus,
 * and managing modals and context menus.
 * @param e - The `App` component you provided is quite extensive and includes various functionalities
 * related to managing boards, collections, and tasks. The parameters passed to the `App` component are
 * as follows:
 * @param {number} boardId - The `boardId` parameter is used to identify a specific board within the
 * application. It is a number that represents the unique identifier of a board. This identifier is
 * used to perform operations related to that specific board, such as updating its information,
 * deleting it, or displaying its content.
 */
function App({
  dbService,
  reloadDb,
  currentBoard,
  setCurrentBoard,
}: {
  dbService: DatabaseService;
  reloadDb: () => Promise<void>;
  currentBoard: number;
  setCurrentBoard: (id: number) => void;
}) {
  const [showConfig, setShowConfig] = useState<boolean>(false);
  const [runBoarding, setRunBoarding] = useState<boolean>(false);
  const [reloadList, setReloadList] = useState<boolean>(false);
  const [firstReload, setFirstReload] = useState<boolean>(true);
  const [showModal, setShowModal] = useState<boolean>(false);
  const [infoType, setInfoType] = useState<
    "board" | "collection" | "task" | null
  >(null);
  const [editInfo, setEditInfo] = useState<
    | {
        id: number;
        name: string;
        description?: string;
        status?: string;
        date?: Date;
        color?: string;
        collection_id?: string;
      }
    | undefined
  >(undefined);
  const [allBoards, setAllBoards] = useState<
    { id: number; name: string; color: string | null }[]
  >([{ id: 0, name: "test", color: null }]);
  const [showTaskInfo, setShowTaskInfo] = useState<boolean>(false);
  const [description, setDescription] = useState<string>("");
  const [dueDate, setDueDate] = useState<string>("");
  const { show } = useContextMenu();

  async function reloadDatabase() {
    await reloadDb();
    setReloadList(true);
  }

  const handleCreateBoard = async (
    _type: "board" | "collection" | "task",
    name: string,
    _description?: string,
    _date?: Date,
    color?: string | null,
    _collection_id?: string,
    _id?: number
  ) => {
    await dbService?.createBoard({
      id: 0,
      name: name,
      color: color === undefined ? null : color,
    });
    const allBoards = await dbService.getAllBoards();
    setCurrentBoard(allBoards[allBoards.length - 1].id);
    setReloadList(true);
  };

  const handleModify = async (
    type: "board" | "collection" | "task",
    name: string,
    description?: string | undefined,
    date?: Date | undefined,
    color?: string | null,
    _collection_id?: string | undefined,
    id?: number | undefined
  ) => {
    if (type === "board") {
      await dbService?.updateBoard({
        id: id === undefined ? 0 : id,
        name: name,
        color: color === undefined ? "0" : color,
      });
      window.location.reload();
    } else if (type === "collection") {
      await dbService?.updateCollection({
        id: id === undefined ? 0 : id,
        board_id: 0,
        names: name,
        color: color === undefined ? null : color,
      });
    } else if (type === "task") {
      await dbService
        ?.getTaskById(id === undefined ? 0 : id)
        .then(async (task) => {
          await dbService.updateTask({
            id: id === undefined ? 0 : id,
            names: name,
            descriptions: description === undefined ? null : description,
            due_date: date === undefined ? null : date,
            status: task?.status === undefined ? "pending" : task?.status,
            collection_id: 0,
            task_order: 0,
          });
        });
    }
    setReloadList(true);
  };

  function displayBoardMenu(e: React.MouseEvent, boardId: number) {
    show({
      id: "board-menu",
      props: { boardId },
      event: e,
    });
  }

  async function handleBoardItemClick({ id, props }: ItemParams<any, any>) {
    const boardId = props.boardId;
    if (id === "edit") {
      const board = allBoards.find((board) => board.id === boardId);
      setInfoType("board");
      setEditInfo({
        id: boardId,
        name: board?.name === undefined ? "" : board.name,
        color: board?.color === null ? "" : board?.color,
      });
      setShowModal(true);
      // return (
      //   <ModalForm type="board" onCreate={handleModifyBoard} previousData={board} open={showModal} setOpen={setShowModal} />
      // )
      // setEditBoardInfo({ id: boardId, name: board?.name === undefined ? "" : board.name });
      // setShowModal(true);
    } else if (id === "delete") {
      const nbOfBoards = allBoards.length;
      if (nbOfBoards <= 1) {
        message(t("Cant_Delete_Tab"));
        return;
      }
      const deleteConfirm = await confirm(
        t("Are_Sure", {
          type: t("tab"),
          title: allBoards.find((board) => board.id === boardId)?.name,
        })
      );
      if (deleteConfirm) {
        await dbService?.removeBoard(boardId);
        window.location.reload();
      }
    } else if (id === "print") {
      const board = await dbService?.getBoardById(boardId);
      const collections = await dbService?.getCollectionsByBoard(boardId);
      const tasks = await dbService?.getAllTasks();
      const filePath = await save({
        filters: [{ name: "PDF", extensions: ["pdf"] }],
        defaultPath:
          (await path.downloadDir()) +
          "/" +
          `${t("PdfTab")}_${board?.name}.pdf`,
      });
      if (!filePath) return false;
      const pdfDoc = (
        <BoardPDF
          boardName={board?.name === undefined ? "" : board.name}
          collections={collections}
          tasks={tasks ?? []}
        />
      );
      const blob = await pdf(pdfDoc).toBlob();
      const arrayBuffer = await blob.arrayBuffer();
      const uint8Array = new Uint8Array(arrayBuffer);

      await writeFile(filePath, uint8Array);
      return true;
    }
  }

  function displayCollectionMenu(e: React.MouseEvent, collection_id: number) {
    show({
      id: "collection-menu",
      props: { collection_id },
      event: e,
    });
  }

  async function handleCollectionItemClick({
    id,
    props,
  }: ItemParams<any, any>) {
    const collection_id = props.collection_id;
    if (id === "edit") {
      const collection = await dbService?.getCollectionById(collection_id);
      setInfoType("collection");
      setEditInfo({
        id: collection_id,
        name: collection?.names === undefined ? "" : collection.names,
        color:
          collection?.color === undefined ? "" : collection.color?.toString(),
      });
      setShowModal(true);
    } else if (id === "delete") {
      const deleteConfirm = await confirm(
        t("Are_Sure", {
          type: t("list"),
          title: await dbService
            ?.getCollectionById(collection_id)
            .then((collection) => collection?.names),
        })
      );
      if (deleteConfirm) {
        await dbService?.removeCollection(collection_id);
        setReloadList(true);
      }
    } else if (id === "print") {
      const collection = await dbService?.getCollectionById(collection_id);
      const tasks = await dbService?.getTasksByCollection(collection_id);
      const filePath = await save({
        filters: [{ name: "PDF", extensions: ["pdf"] }],
        defaultPath:
          (await path.downloadDir()) +
          "/" +
          `${t("PdfList")}_${collection?.names}.pdf`,
      });
      if (!filePath) return false;
      const pdfDoc = (
        <CollectionPDF
          collectionName={
            collection?.names === undefined ? "" : collection.names
          }
          tasks={tasks}
        />
      );
      const blob = await pdf(pdfDoc).toBlob();
      const arrayBuffer = await blob.arrayBuffer();
      const uint8Array = new Uint8Array(arrayBuffer);

      await writeFile(filePath, uint8Array);
      return true;
    }
  }

  function displayTaskMenu(e: React.MouseEvent, task_id: number) {
    show({
      id: "task-menu",
      props: { task_id },
      event: e,
    });
  }

  async function handleTaskItemClick({ id, props }: ItemParams<any, any>) {
    const task_id = props.task_id;
    if (id === "edit") {
      const task = await dbService?.getTaskById(task_id);
      setInfoType("task");
      setEditInfo({
        id: task_id,
        name:
          task?.names === null
            ? ""
            : task?.names === undefined
            ? ""
            : task?.names,
        description:
          task?.descriptions === null
            ? ""
            : task?.descriptions === undefined
            ? ""
            : task?.descriptions,
        status:
          task?.status === null
            ? ""
            : task?.status === undefined
            ? ""
            : task?.status,
        date:
          task?.due_date === null
            ? new Date()
            : task?.due_date === undefined
            ? new Date()
            : task?.due_date,
        collection_id:
          task?.collection_id === undefined
            ? "0"
            : task?.collection_id.toString(),
      });
      setShowModal(true);
    } else if (id === "delete") {
      const deleteConfirm = await confirm(
        t("Are_Sure", {
          type: t("task"),
          title: await dbService
            ?.getTaskById(task_id)
            .then((task) => task?.names),
        })
      );
      if (deleteConfirm) {
        await dbService?.removeTask(task_id);
        setReloadList(true);
      }
    }
  }

  useEffect(() => {
    async function handleNotificationPermission() {
      let permissionGranted = await isPermissionGranted();
      if (!permissionGranted) {
        const permission = await requestPermission();
        permissionGranted = permission === "granted";
      }
      if (permissionGranted) {
        await dbService?.updateOption("notification", "true");
      }
    }
    async function initBoard() {
      setCurrentBoard(
        parseInt((await dbService.getOptionByKey("lastOpenBoard")) ?? "1")
      );
    }
    initBoard();
    handleNotificationPermission();
  }, []);

  useEffect(() => {
    const initOptions = async () => {
      const theme = await getConfig("theme");
      const lang = await getConfig("lang");
      if (theme === "system") {
        localStorage.removeItem("theme");
      } else {
        localStorage.theme = theme ?? "system";
      }
      document.documentElement.classList.toggle(
        "dark",
        localStorage.theme === "dark" ||
          (!("theme" in localStorage) &&
            window.matchMedia("(prefers-color-scheme: dark)").matches)
      );
      changeLanguage(typeof lang === "string" ? lang ?? "en-US" : "en-US");
      setReloadList(false)
    };
    const initBoards = async () => {
      setAllBoards((await dbService?.getAllBoards()) ?? []);
      setReloadList(false)
    };
    initBoards();
    initOptions();
  }, [reloadList]);

  // const handleCreateTask = async (name: string, description: string) => {
  //   const newTaskId = await dbService.createTask(1, name, description); // Remplace 1 par l'ID de la collection
  //   console.log("Tâche créée avec ID:", newTaskId);
  // };

  // localStorage.theme = "light";
  // localStorage.theme = "dark";

  if (firstReload === true) {
    setTimeout(async () => {
      setReloadList(true);
      setFirstReload(false);
      setRunBoarding(
        (await dbService?.getOptionByKey("firstStart")) === "true"
          ? true
          : false
      );
    }, 500);
  }

  return (
    <div className="w-full h-full bg-gray-100 dark:bg-gray-900 top-0 absolute">
      <OnBoarding
        dbService={dbService}
        run={runBoarding}
        setRun={setRunBoarding}
      />
      <ErrorBoundary>
        <ConfigPage
          reloadDb={reloadDatabase}
          dbService={dbService}
          show={showConfig}
          setShow={setShowConfig}
        />
        {/* <CalendarPage
          show={showCalendar}
          setShow={setShowCalendar}
          events={events}
        /> */}
      </ErrorBoundary>
      <div
        id="one-step"
        className="fixed left-0 top-0 flex w-full justify-between pt-4 text-center bg-gray-100 dark:bg-gray-800 text-gray-900 dark:text-white"
      >
        <Tabs
          dbService={dbService}
          currentBoard={currentBoard}
          reloadList={reloadList}
          setReloadList={setReloadList}
          setCurrentBoard={setCurrentBoard}
          handleCreateBoard={handleCreateBoard}
          contextMenu={displayBoardMenu}
          setShowConfig={setShowConfig}
        />
      </div>
      <ModalForm
        type={infoType === null ? "task" : infoType}
        onCreate={handleModify}
        previousData={editInfo}
        open={showModal}
        setOpen={setShowModal}
      />
      <div
        /* style={{ height: "calc(100vh - 51px)" }} */
        className="mt-15 w-full dark:bg-gray-900 text-gray-900 dark:text-white"
      >
        <ListContainer
          dbService={dbService}
          boardId={currentBoard}
          reloadList={reloadList}
          setReloadList={setReloadList}
          contextMenuCollection={displayCollectionMenu}
          contextMenuTask={displayTaskMenu}
          setDescription={setDescription}
          setDuedate={setDueDate}
          setShowTaskInfo={setShowTaskInfo}
        />
      </div>
      <div
        className={`p-3 sm:p-4 rounded-2xl fixed bottom-4 right-4 sm:top-0 sm:bottom-auto sm:right-0 sm:rounded-none max-w-[calc(100%-2rem)] sm:max-w-sm bg-[#cecece] dark:bg-gray-600 ${
          showTaskInfo === true ? "" : "hidden"
        } text-sm sm:text-base`}
      >
        <p>
          <strong>{t("Description")} :</strong> <br></br>
          {description}
          {/* {task.descriptions === "" ? t("NoDescription") : task.descriptions} */}
        </p>
        <p>
          <strong>{t("Duedate")} :</strong>
          <br></br>
          <span className="">{dueDate}</span>
        </p>
      </div>
      <ContextMenu
        handleBoardItemClick={handleBoardItemClick}
        handleCollectionItemClick={handleCollectionItemClick}
        handleTaskItemClick={handleTaskItemClick}
      />
      {/* <img
        src="/CC_BY-NC-SA.png"
        alt="Creative Commons BY-NC-SA"
        className="absolute bottom-0 right-0 z-50"
        width="100"
      /> */}
    </div>
  );
}

export default App;
