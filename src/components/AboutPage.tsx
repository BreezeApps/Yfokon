import { Button } from "./ui/button";
import { t } from "i18next";
import { getVersion } from "@tauri-apps/api/app"
import { useEffect, useState, useMemo } from "react";
import { Mail, Globe, Code2, User, X, Calendar } from "lucide-react";
import i18n, { getDate } from "../lib/i18n";

type props = {
  show: boolean;
  setShow: (show: boolean) => void;
};

// Contact info constant - avoids recreation on every render
const CONTACT_INFO = {
  email: "marvideomc.pro@gmail.com",
  website: "https://marvideo.fr",
};

export function AboutPage({ show, setShow }: props) {
  const [version, setVersion] = useState<string>("")
  const [buildDateFormatted, setBuildDateFormatted] = useState<string>("")

  useEffect(() => {
    if (!show) return; // Only fetch version when modal is shown

    const getVersionAsync = async () => {
      try {
        const v = await getVersion()
        setVersion(v)
      } catch (error) {
        console.error("Failed to get version:", error)
      }
    }
    getVersionAsync()
  }, [show])

  useEffect(() => {
    if (import.meta.env.VITE_BUILD_DATE) {
      try {
        const date = new Date(import.meta.env.VITE_BUILD_DATE)
        setBuildDateFormatted(getDate(date))
      } catch {
        setBuildDateFormatted("Unknown")
      }
    }
  }, [i18n.language])

  // Memoize icon size to avoid recalculation
  const iconSize = useMemo(() => ({
    sm: 16,
    md: 18,
    lg: 20
  }), [])

  if (!show) return null;

  return (
    <div
      className="z-[49] top-0 h-full w-full fixed bg-black/50 flex items-center justify-center p-3 sm:p-4"
      onClick={() => setShow(false)}
      role="presentation"
    >
      <div
        className="rounded-lg bg-white dark:bg-gray-900 shadow-2xl w-full max-w-sm sm:max-w-md lg:max-w-2xl overflow-hidden max-h-[90vh] flex flex-col"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="bg-gradient-to-r from-purple-600 to-purple-700 dark:from-purple-900 dark:to-purple-950 p-4 sm:p-6 md:p-8 relative flex-shrink-0">
          <button
            onClick={() => setShow(false)}
            className="absolute top-3 right-3 sm:top-4 sm:right-4 p-1.5 sm:p-2 hover:bg-white/20 rounded-full transition-all duration-200 hover:scale-110"
            aria-label="Close modal"
          >
            <X size={18} className="sm:w-5 sm:h-5 text-white" />
          </button>
          <h1 className="text-2xl sm:text-3xl md:text-4xl font-bold text-white pr-8">
            {t("About")}
          </h1>
          <p className="text-purple-100 text-xs sm:text-sm mt-1.5 sm:mt-2">Yfokon</p>
        </div>

        {/* Content - Scrollable */}
        <div className="p-4 sm:p-6 md:p-8 space-y-5 sm:space-y-6 md:space-y-8 overflow-y-auto flex-1">
          {/* Version */}
          <div className="flex items-start sm:items-center gap-3 sm:gap-4 pb-4 sm:pb-5 md:pb-6 border-b border-gray-200 dark:border-gray-700">
            <Code2 size={iconSize.lg} className="text-purple-600 dark:text-purple-400 flex-shrink-0 mt-0.5 sm:mt-0" />
            <div className="min-w-0 flex-1">
              <p className="text-xs sm:text-sm text-gray-600 dark:text-gray-400 font-medium">{t("Version")}</p>
              <p className="text-sm sm:text-base md:text-lg font-semibold text-gray-900 dark:text-white break-all">
                {version || "Loading..."}
              </p>
            </div>
          </div>

          {/* Build Date */}
          <div className="flex items-start sm:items-center gap-3 sm:gap-4 pb-4 sm:pb-5 md:pb-6 border-b border-gray-200 dark:border-gray-700">
            <Calendar size={iconSize.lg} className="text-purple-600 dark:text-purple-400 flex-shrink-0 mt-0.5 sm:mt-0" />
            <div className="min-w-0 flex-1">
              <p className="text-xs sm:text-sm text-gray-600 dark:text-gray-400 font-medium">{t("BuildDate")}</p>
              <p className="text-sm sm:text-base md:text-lg font-semibold text-gray-900 dark:text-white break-all">
                {buildDateFormatted || "Loading..."}
              </p>
            </div>
          </div>

          {/* Creator */}
          <div className="flex items-start sm:items-center gap-3 sm:gap-4 pb-4 sm:pb-5 md:pb-6 border-b border-gray-200 dark:border-gray-700">
            <User size={iconSize.lg} className="text-purple-600 dark:text-purple-400 flex-shrink-0 mt-0.5 sm:mt-0" />
            <div className="min-w-0 flex-1">
              <p className="text-xs sm:text-sm text-gray-600 dark:text-gray-400 font-medium">{t("CreateBy")}</p>
              <p className="text-sm sm:text-base md:text-lg font-semibold text-gray-900 dark:text-white">Marvideo</p>
            </div>
          </div>

          {/* Email Section */}
          <div className="space-y-2.5 sm:space-y-3">
            <h3 className="text-xs sm:text-sm font-semibold text-gray-900 dark:text-white uppercase tracking-wide">
              {t("Email")}
            </h3>
            <a
              href={`mailto:${CONTACT_INFO.email}`}
              className="flex items-center gap-3 sm:gap-4 group hover:bg-gray-50 dark:hover:bg-gray-800/50 p-2.5 sm:p-3 md:p-4 rounded-lg transition-all duration-200 active:bg-gray-100 dark:active:bg-gray-700"
            >
              <Mail size={iconSize.lg} className="text-purple-600 dark:text-purple-400 flex-shrink-0 group-hover:scale-110 transition-transform" />
              <span className="text-purple-600 dark:text-purple-400 group-hover:underline font-medium text-sm sm:text-base break-all">
                {CONTACT_INFO.email}
              </span>
            </a>
          </div>

          {/* Website Section */}
          <div className="space-y-2.5 sm:space-y-3">
            <h3 className="text-xs sm:text-sm font-semibold text-gray-900 dark:text-white uppercase tracking-wide">
              {t("WebSite")}
            </h3>
            <a
              href={CONTACT_INFO.website}
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center gap-3 sm:gap-4 group hover:bg-gray-50 dark:hover:bg-gray-800/50 p-2.5 sm:p-3 md:p-4 rounded-lg transition-all duration-200 active:bg-gray-100 dark:active:bg-gray-700"
            >
              <Globe size={iconSize.lg} className="text-purple-600 dark:text-purple-400 flex-shrink-0 group-hover:scale-110 transition-transform" />
              <span className="text-purple-600 dark:text-purple-400 group-hover:underline font-medium text-sm sm:text-base break-all">
                {CONTACT_INFO.website}
              </span>
            </a>
          </div>
        </div>

        {/* Footer */}
        <div className="bg-gray-50 dark:bg-gray-800/50 px-4 sm:px-6 md:px-8 py-3 sm:py-4 flex justify-end gap-2 flex-shrink-0 border-t border-gray-200 dark:border-gray-700">
          <Button
            onClick={() => setShow(false)}
            className="bg-purple-600 hover:bg-purple-700 active:bg-purple-800 text-white dark:bg-purple-700 dark:hover:bg-purple-800 text-sm sm:text-base transition-all"
          >
            {t("Close")}
          </Button>
        </div>
      </div>
    </div>
  );
}
