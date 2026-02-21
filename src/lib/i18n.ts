import i18n from "i18next";
import { initReactI18next } from "react-i18next";
import LanguageDetector from "i18next-browser-languagedetector";

import enTranslation from "./locales/en-US.json";
import frTranslation from "./locales/fr-FR.json";
import deTranslation from "./locales/de.json";
import esTranslation from "./locales/es.json";
import { setConfig } from "./db/dbManager";

/* This block of code is initializing the i18n (internationalization) library for localization. Here's a breakdown of what it's doing: */
i18n
  .use(LanguageDetector)
  .use(initReactI18next)
  .init({
    resources: {
      "en-US": { translation: enTranslation },
      "fr-FR": { translation: frTranslation },
      de: { translation: deTranslation },
      es: { translation: esTranslation },
    },
    supportedLngs: ["fr-FR", "en-US", "de", "es"],
    load: "all",
    fallbackLng: "en-US",
    saveMissing: true,
    detection: {
      order: ["localStorage", "navigator", "htmlTag"],
      caches: ["localStorage"],
    },
    interpolation: { escapeValue: false },
  });

export function getCurrentLanguage() {
  return i18n.language;
}

/**
 * The function `getDate` takes a `Date` object, formats it according to specified options, and returns
 * the formatted date as a string.
 * @param {Date} date - The `getDate` function takes a `Date` object as a parameter and returns a
 * formatted date string based on the specified options. The function first creates a new `Date` object
 * from the input date, then defines formatting options for the date including year, month, day,
 * weekday, hour, and
 * @returns The `getDate` function takes a `Date` object as a parameter, formats it according to the
 * specified options (including year, month, day, weekday, hour, and minute), and returns the formatted
 * date as a string.
 */
export function getDate(date: Date) {
  date = new Date(date);
  const options: Intl.DateTimeFormatOptions = {
    year: "numeric",
    month: "long",
    day: "numeric",
    weekday: "long",
    hour: "2-digit",
    minute: "2-digit",
  };

  const formatteur = new Intl.DateTimeFormat(i18n.language, options);
  return formatteur.format(date);
}

/**
 * The function `getRelativeTime` calculates the relative time difference between the current date and
 * a target date in seconds, minutes, hours, or days and formats it using Intl.RelativeTimeFormat.
 * @param {Date} targetDate - The `getRelativeTime` function you provided calculates the relative time
 * difference between the `targetDate` and the current date. It uses the `Intl.RelativeTimeFormat` to
 * format the relative time in a human-readable way.
 * @returns The `getRelativeTime` function returns a string representing the relative time difference
 * between the `targetDate` parameter and the current date/time. The function calculates the time
 * difference in seconds, minutes, hours, and days, and then formats the result using the
 * `Intl.RelativeTimeFormat` API based on the magnitude of the time difference. The function returns a
 * formatted string indicating the relative time in terms of
 */
export function getRelativeTime(targetDate: Date) {
  const now = new Date();
  targetDate = new Date(targetDate);
  const diffMs = targetDate.getTime() - now.getTime();

  const seconds = Math.round(diffMs / 1000);
  const minutes = Math.round(diffMs / (1000 * 60));
  const hours = Math.round(diffMs / (1000 * 60 * 60));
  const days = Math.round(diffMs / (1000 * 60 * 60 * 24));

  const rtf = new Intl.RelativeTimeFormat(i18n.language, { numeric: "auto" });

  if (Math.abs(seconds) < 60) {
    return rtf.format(Math.round(seconds), "second");
  } else if (Math.abs(minutes) < 60) {
    return rtf.format(minutes, "minute");
  } else if (Math.abs(hours) < 24) {
    return rtf.format(hours, "hour");
  } else {
    return rtf.format(days, "day");
  }
}

/**
 * The function `getLanguages` retrieves a list of languages with their display names using the
 * Intl.DisplayNames API.
 * @returns An array of language objects is being returned. Each language object contains a key, value,
 * and label property. The key is the index plus one, the value is the language code, and the label is
 * the display name of the language obtained using the Intl.DisplayNames API. If the display name is
 * not available, the language code is used as the label.
 */
export function getLanguages() {
  const languages = Object.keys(i18n.options.resources || {});
  const displayNames = new Intl.DisplayNames([i18n.language], {
    type: "language",
  });

  return languages.map((lang, index) => ({
    key: index + 1,
    value: lang,
    label: displayNames.of(lang) || lang,
  }));
}

/**
 * The function `changeLanguage` takes a language string as input and uses it to change the language in
 * an internationalization library.
 * @param {string} language - The `language` parameter in the `changeLanguage` function is a string
 * that represents the language code or identifier for the desired language to switch to. For example,
 * "en" for English, "es" for Spanish, "fr" for French, etc.
 */
export async function changeLanguage(language: string) {
  i18n.changeLanguage(language);
}

export async function setLanguageFromString(language: string) {
  await setConfig("lang", language)
}

export default i18n;
