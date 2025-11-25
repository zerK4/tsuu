import fs from "fs";
import { Config, UserSettings } from "../types";
import path from "path";
import os from "os";
import chalk from "chalk";

/**
 * Updates the user settings in the config file
 * @param settings - Settings object to be added/updated in user
 */
export async function updateUserSettings(settings: string): Promise<void> {
  try {
    const configDir = path.join(os.homedir(), ".hooktunnel");
    const configPath = path.join(configDir, "config.json");

    const fileContent = fs.readFileSync(configPath, "utf8");
    const config: Config = JSON.parse(fileContent);

    // Check if settings are the same
    const currentSettings = config.user.settings || {};
    const areSettingsSame = JSON.stringify(currentSettings) === settings;

    if (areSettingsSame) {
      return;
    }

    config.user.settings = JSON.parse(settings);

    fs.writeFileSync(configPath, JSON.stringify(config, null, 2), {
      encoding: "utf8",
      mode: 0o600,
    });

    console.log(chalk.green.bold("\n✓ Settings updated successfully!\n"));
  } catch (error) {
    if (error instanceof Error) {
      throw new Error(`Failed to update settings: ${error.message}`);
    }
    throw error;
  }
}
