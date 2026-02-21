import * as Dialog from "@radix-ui/react-dialog";
import { useEffect, useState } from "react";
import { useTranslation } from "react-i18next";
import { CustomProvider, DatePicker } from "rsuite";

import "rsuite/dist/rsuite-no-reset.min.css";
import { Button } from "../ui/button";
import { Input } from "../ui/input";
import { Label } from "../ui/label";
import { Textarea } from "../ui/textarea";
import { Tooltip, TooltipContent, TooltipTrigger } from "../ui/tooltip";

type ModalFormProps = {
  type: "task" | "collection" | "board";
  collectionId?: string;
  onCreate: (
    type: "board" | "collection" | "task",
    name: string,
    description?: string,
    date?: Date,
    color?: string,
    collection_id?: string,
    id?: number
  ) => void;
  previousData?: {
    id: number;
    name: string;
    description?: string;
    status?: string;
    date?: Date;
    color?: string;
    collection_id?: string;
  };
  open?: boolean;
  setOpen?: (open: boolean) => void;
  id?: string;
  classname?: string;
};

/* The above code is a React component for a modal form. It is used to create or modify
items such as tasks, lists, or tabs within a collection. */
export function ModalForm({
  type,
  collectionId,
  onCreate,
  previousData,
  open,
  setOpen,
  id,
  classname,
}: ModalFormProps) {
  const { t } = useTranslation();
  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [date, setDate] = useState(new Date());
  const [color, setColor] = useState<string | undefined>(undefined);
  const [firstReload, setFirstReload] = useState<boolean>(true);

  if (firstReload === true) {
    setFirstReload(false);
    if (previousData) {
      setName(previousData.name);
      setDescription(
        previousData.description === undefined ? "" : previousData.description
      );
      setDate(
        previousData.date === undefined
          ? new Date()
          : new Date(previousData.date)
      );
      setColor(previousData.color);
    }
  }

  useEffect(() => {
    if (previousData) {
      setName(previousData.name);
      setDescription(
        previousData.description === undefined ? "" : previousData.description
      );
      setDate(
        previousData.date === undefined
          ? new Date()
          : new Date(previousData.date)
      );
      setColor(previousData.color);
    }
  }, [previousData]);

  const handleSubmit = () => {
    if (!name) return;
    onCreate(
      type,
      name,
      description,
      date,
      color,
      collectionId,
      previousData?.id
    );
    setName("");
    setDescription("");
    setDate(new Date());
    setColor(undefined);
  };

  const finalClassname = `${
    type === "board"
      ? "bg-[#F0F0F0] dark:bg-gray-800"
      : type !== "task"
      ? "bg-gray-200 hover:bg-gray-400 text-gray-800 px-1 rounded float-left inline"
      : previousData !== undefined
      ? "inline-block ml-auto place-items-center rounded-md border border-transparent text-center text-sm transition-all text-slate-600 hover:bg-slate-200 focus:bg-slate-200 active:bg-slate-200 disabled:pointer-events-none disabled:opacity-50 disabled:shadow-none"
      : "bg-gray-200 hover:bg-gray-400 text-gray-800 py-0.5 px-1 rounded float-left inline"
  }`;

  return (
    <Dialog.Root open={open} onOpenChange={setOpen}>
      {open === undefined ? (
        <Dialog.Trigger id={id !== undefined ? id : ""} className={classname}>
          <Tooltip>
            <TooltipTrigger
              className={finalClassname}
              style={
                type === "board"
                  ? {
                      display: "inline-block",
                      float: "left",
                      height: "34px",
                      textAlign: "center",
                      lineHeight: "22px",
                      padding: "0 8px 0 8px",
                      margin: "1px 0px 0px 0px",
                      border: "1px solid gray",
                      borderBottom: "1px solid gray",
                      borderTopLeftRadius: "6px",
                      borderTopRightRadius: "6px",
                      cursor: "pointer",
                    }
                  : undefined
              }
            >
              <img
                className={`${type === "board" ? "dark:invert" : ""} ${
                  type === "task" ? "h-5" : type === "collection" ? "h-4" : "h-6"
                }`}
                src={
                  previousData !== undefined
                    ? "/icons/modify.svg"
                    : type === "task"
                    ? "/icons/ajouter-tache.svg"
                    : type === "collection"
                    ? "/icons/ajouter-liste.svg"
                    : "/icons/ajouter.svg"
                }
              />
            </TooltipTrigger>
            <TooltipContent>
              <p>
                {t(
                  type === "board"
                    ? "Add_a_Tab"
                    : type === "collection"
                    ? "Add_a_List"
                    : type === "task"
                    ? "Add_a_Task"
                    : "Error"
                )}
              </p>
            </TooltipContent>
          </Tooltip>
          {/*t(
            type === "task"
              ? "Add_a_Task"
              : type === "collection"
              ? "Add_a_List"
              : "Add_a_Tab"
          )*/}
        </Dialog.Trigger>
      ) : (
        ""
      )}
      <Dialog.Portal>
        <Dialog.Overlay className={`fixed inset-0 bg-black/50`} />
        <Dialog.Content
          aria-describedby={undefined}
          className="fixed top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 bg-white dark:bg-gray-800 p-6 rounded-lg shadow-lg"
        >
          <Dialog.Title className="text-lg font-bold">
            {t(
              previousData !== undefined
                ? type === "task"
                  ? "Modify_a_Task"
                  : type === "collection"
                  ? "Modify_a_List"
                  : "Modify_a_Tab"
                : type === "task"
                ? "Add_a_Task"
                : type === "collection"
                ? "Add_a_List"
                : "Add_a_Tab"
            )}
          </Dialog.Title>

          <div className="mt-4">
            <Label>{t("Name")}</Label>
            <Input
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
            />
          </div>
          {type === "task" && (
            <div className="mt-4">
              <Label>{t("Description")}</Label>
              <Textarea
                value={description}
                onChange={(e) => setDescription(e.target.value)}
              />
            </div>
          )}
          {type === "task" && (
            <div className="mt-4">
              <Label>{t("Date")}</Label>
              {/* <input
                type="datetime-local"
                className="w-full border p-2 rounded"
                value={date}
                onChange={(e) => setDate(e.target.value)}
              /> */}
              <CustomProvider
                theme={
                  localStorage.getItem("theme") as "light" | "dark" | undefined
                }
              >
                <DatePicker
                  oneTap
                  style={{ width: "100%" }}
                  format="dd/MM/yyyy HH:mm"
                  placement="topStart"
                  value={date}
                  onChange={(e) => setDate(e === null ? new Date() : e)}
                />
              </CustomProvider>
            </div>
          )}

          {type === "collection" ||
            (type === "board" && (
              <div className="mt-4">
                <Label>{t("Color")}</Label>
                <Input
                  type="color"
                  value={color ? color : "#000000"}
                  onChange={(e) => setColor(e.target.value)}
                />
              </div>
            ))}
          {type === "collection" && (
            <div className="mt-4">
              <Label>{t("Color")}</Label>
              <Input
                type="color"
                value={color ? color : "#000000"}
                onChange={(e) => setColor(e.target.value)}
              />
            </div>
          )}

          <div className="mt-4 flex justify-end space-x-2">
            <Dialog.Close>
              <Button variant={"secondary"}>{t("Cancel")}</Button>
            </Dialog.Close>
            <Dialog.Close>
              <Button onClick={handleSubmit}>
                {t(
                  previousData !== undefined
                    ? type === "task"
                      ? "Modify_the_Task"
                      : type === "collection"
                      ? "Modify_the_List"
                      : "Modify_the_Tab"
                    : type === "task"
                    ? "Add_a_Task"
                    : type === "collection"
                    ? "Add_a_List"
                    : "Add_a_Tab"
                )}
              </Button>
            </Dialog.Close>
          </div>
        </Dialog.Content>
      </Dialog.Portal>
    </Dialog.Root>
  );
}
