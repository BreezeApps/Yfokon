import { chooseDbFolder, getDbPath, setConfig } from "@/lib/db/dbManager";
import { t } from "i18next";
import { Dispatch, SetStateAction, useEffect, useState } from "react";
import { Button } from "./ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "./ui/select";
import {
  changeLanguage,
  getCurrentLanguage,
  getLanguages,
} from "@/lib/i18n";
import { CheckCircle2 } from "lucide-react";

export function FirstStartScreen({ show }: { show: Dispatch<SetStateAction<boolean>> }) {
  const [dbPath, setDbPath] = useState<string>("");
  const [language, setLanguage] = useState<string>("");
  const [theme, setTheme] = useState<string>("");
  const languages = getLanguages();

  useEffect(() => {
    async function getInfo() {
      setDbPath(await getDbPath());
    }
    getInfo();
  }, []);

  async function changeTheme(theme: string) {
    setTheme(theme);
    if (theme === "system") {
      localStorage.removeItem("theme");
    } else {
      localStorage.theme = theme ?? "system";
    }
    document.documentElement.classList.toggle(
      "dark",
      localStorage.theme === "dark" ||
        (!("theme" in localStorage) &&
          window.matchMedia("(prefers-color-scheme: dark)").matches),
    );
  }

  async function saveTheme(theme: string) {
    if (theme === "system") {
      await setConfig("theme", "system");
    } else {
      await setConfig("theme", theme ?? "system");
    }
  }

  function saveParams() {
    changeLanguage(language);
    saveTheme(theme);
    show(false)
  }

  return (
    <div className="fixed inset-0 flex items-center justify-center bg-linear-to-br from-slate-50 to-slate-100 dark:from-slate-950 dark:to-slate-900 z-50 p-6">
      <div className="w-full max-w-2xl space-y-8 animate-fade-in">
        {/* Header */}
        <div className="text-center space-y-2 mb-12">
          <h1 className="text-5xl font-bold bg-linear-to-r from-blue-600 to-blue-800 dark:from-blue-400 dark:to-blue-600 bg-clip-text text-transparent">
            {t("Welcome")}
          </h1>
          <p className="text-slate-600 dark:text-slate-400 text-lg">
            {t("SetupTheApplication")}
          </p>
        </div>

        {/* Settings Cards */}
        <div className="space-y-6">
          {/* Language Selection */}
          <div className="bg-white dark:bg-slate-800 rounded-lg shadow-md p-6 border border-slate-200 dark:border-slate-700 hover:shadow-lg transition-shadow duration-300">
            <div className="flex items-center gap-3 mb-4">
              <h2 className="text-xl font-semibold text-slate-900 dark:text-slate-100">
                {t("ChooseLanguage")}
              </h2>
            </div>
            <Select
              onValueChange={(value) => {
                changeLanguage(value);
                setLanguage(value);
              }}
              defaultValue={getCurrentLanguage()}
            >
              <SelectTrigger className="w-full">
                <SelectValue
                  placeholder={"Languages"}
                  defaultValue={getCurrentLanguage()}
                />
              </SelectTrigger>
              <SelectContent>
                {languages.map((lang) => (
                  <SelectItem key={lang.key} value={lang.value}>
                    {lang.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {/* Theme Selection */}
          <div className="bg-white dark:bg-slate-800 rounded-lg shadow-md p-6 border border-slate-200 dark:border-slate-700 hover:shadow-lg transition-shadow duration-300">
            <div className="flex items-center gap-3 mb-4">
              <h2 className="text-xl font-semibold text-slate-900 dark:text-slate-100">
                {t("ChooseTheme")}
              </h2>
            </div>
            <Select
              onValueChange={(value) => {
                changeTheme(value);
              }}
              defaultValue={localStorage.theme}
            >
              <SelectTrigger className="w-full">
                <SelectValue placeholder={"Theme"} />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="light">{t("light_theme")}</SelectItem>
                <SelectItem value="dark">{t("dark_theme")}</SelectItem>
                <SelectItem value="system">{t("system_theme")}</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {/* Database Path Selection */}
          <div className="bg-white dark:bg-slate-800 rounded-lg shadow-md p-6 border border-slate-200 dark:border-slate-700 hover:shadow-lg transition-shadow duration-300">
            <div className="flex items-center gap-3 mb-4">
              <h2 className="text-xl font-semibold text-slate-900 dark:text-slate-100">
                {t("DefaultPathWelcome")}
              </h2>
            </div>
            <div className="bg-slate-50 dark:bg-slate-700/50 rounded p-3 mb-4 border border-slate-200 dark:border-slate-600">
              <p className="text-sm text-slate-600 dark:text-slate-400 truncate">
                {dbPath || "No path selected"}
              </p>
            </div>
            <Button
              variant="outline"
              className="w-full"
              onClick={async () => setDbPath((await chooseDbFolder()) || dbPath)}
            >
              {t("ChooseOtherPath")}
            </Button>
          </div>
        </div>

        {/* Action Button */}
        <div className="pt-6">
          <Button
            className="w-full bg-linear-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 text-white font-semibold py-3 rounded-lg shadow-md hover:shadow-lg transition-all duration-300 flex items-center justify-center gap-2"
            onClick={async () => {
              saveParams();
            }}
          >
            <CheckCircle2 className="w-5 h-5" />
            {t("LetsGo")}
          </Button>
        </div>
      </div>

      <style>{`
        @keyframes fadeIn {
          from {
            opacity: 0;
            transform: translateY(10px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }
        .animate-fade-in {
          animation: fadeIn 0.5s ease-out;
        }
      `}</style>
    </div>
  );
}
