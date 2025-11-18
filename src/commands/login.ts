import fs from "fs";
import path from "path";
import os from "os";
import chalk from "chalk";
import promptSync from "prompt-sync";

const API_URL = process.env.API_URL || "https://hooktunnel.dev/api";

export async function login() {
  const prompt = promptSync();

  console.log(chalk.blue("🔐 hooktunnel Login"));
  console.log("Enter your API key to authenticate\n");
  console.log(
    chalk.gray(
      "Generate an API key at: https://hooktunnel.dev/dashboard/api-keys\n",
    ),
  );

  const apiKey = prompt.hide("API Key: ");

  if (!apiKey || !apiKey.startsWith("whl_")) {
    console.error(
      chalk.red("❌ Invalid API key format (should start with 'whl_')"),
    );
    process.exit(1);
  }

  try {
    const response = await fetch(`${API_URL}/auth/verify`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${apiKey}`,
      },
    });

    if (!response.ok) {
      throw new Error("Invalid API key");
    }

    const data: any = await response.json();

    if (!data) {
      throw new Error("Invalid API key");
    }

    // Store API key securely
    const configDir = path.join(os.homedir(), ".hooktunnel");
    if (!fs.existsSync(configDir)) {
      fs.mkdirSync(configDir, { recursive: true });
    }

    const configPath = path.join(configDir, "config.json");
    const config = {
      apiKey, // Store the actual key (it's already secret-like)
      user: {
        id: data.user.id,
        email: data.user.email,
      },
      authenticatedAt: new Date().toISOString(),
    };

    // Set restrictive permissions (Unix only)
    fs.writeFileSync(configPath, JSON.stringify(config, null, 2), {
      mode: 0o600,
    });

    console.log(chalk.green("✅ Successfully authenticated!"));
    console.log(chalk.gray(`Welcome, ${data.user.email}!`));
  } catch (error) {
    console.error(
      chalk.red("❌ Authentication failed:"),
      (error as Error).message,
    );
    console.log(chalk.yellow("\nTroubleshooting:"));
    console.log("1. Make sure you copied the full API key");
    console.log(
      "2. Generate a new key at https://hooktunnel.dev/dashboard/api-keys",
    );
    console.log("3. Check that the key hasn't been revoked");
    process.exit(1);
  }
}
