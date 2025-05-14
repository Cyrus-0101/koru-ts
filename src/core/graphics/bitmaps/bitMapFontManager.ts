import { BitmapFont } from "./bitMapFont";

/**
 * BitmapFontManager - Central registry for managing bitmap text component types
 *
 * Features:
 * - Font registration system
 * - Runtime component instantiation
 * - Type-safe component creation
 * - Error handling for missing components
 *
 * Usage:
 * ```typescript
   // Add a font
   BitmapFontManager.addFont("default", "assets/fonts/text.txt");
   
   // Load font
   BitmapFontManager.load();
 * ```
 */
export class BitmapFontManager {
  /**
   * Registry of all available fonts
   * @key Font type identifier
   * @value BitMapFont instance for the font type
   */
  private static _fonts: { [name: string]: BitmapFont } = {};

  public static addFont(name: string, fontFileName: string): void {
    BitmapFontManager._fonts[name] = new BitmapFont(name, fontFileName);
  }

  public static getFont(name: string): BitmapFont {
    if (BitmapFontManager._fonts[name] === undefined) {
      throw new Error("ERROR: A font named " + name + " does not exist.");
    }

    return BitmapFontManager._fonts[name];
  }

  public static load(): void {
    let keys = Object.keys(BitmapFontManager._fonts);

    for (let key of keys) {
      BitmapFontManager._fonts[key].load();
    }
  }

  public static updateReady(): boolean {
    let keys = Object.keys(BitmapFontManager._fonts);

    for (let key of keys) {
      if (!BitmapFontManager._fonts[key].isLoaded) {
        console.info("INFO: Font " + key + " is still loading...");

        return false;
      }
    }

    console.info("LOG: All fonts are loaded");
    return true;
  }
}
