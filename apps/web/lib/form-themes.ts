import spidermanThemeImage from "~/app/assets/comic-theme/comic-spiderman-theme.jpg";
// import bubbleThemeImage from "~/app/assets/comic-theme/comic-bubble-theme.jpg";
import townThemeImage from "~/app/assets/comic-theme/comic-town-theme.jpg";
import greenThemeImage from "~/app/assets/comic-theme/green-cloud-theme.jpg";

export const FORM_THEME_OPTIONS = [
  {
    key: "comic_spiderman",
    label: "Comic Spiderman",
    backgroundImage: spidermanThemeImage.src,
  },
  {
    key: "comic_town",
    label: "Comic Town",
    backgroundImage: townThemeImage.src,
  },
  {
    key: "comic_green",
    label: "Comic Green Cloud",
    backgroundImage: greenThemeImage.src,
  },
] as const;

export const DEFAULT_FORM_THEME_KEY = FORM_THEME_OPTIONS[0].key;

export function getThemeByKey(themeKey?: string | null) {
  return FORM_THEME_OPTIONS.find((theme) => theme.key === themeKey) ?? FORM_THEME_OPTIONS[0];
}
