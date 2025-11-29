import fs from "fs";
import path from "path";
import os from "os";
import chalk from "chalk";

const API_URL = process.env.API_URL || "https://hooktunnel.dev/api";

export async function list() {
  try {
    // Read config file
    const configPath = path.join(os.homedir(), ".hooktunnel", "config.json");
    if (!fs.existsSync(configPath)) {
      console.error(
        chalk.red("Not authenticated. Please run 'tsuu login' first."),
      );
      process.exit(1);
    }

    const configFile = fs.readFileSync(configPath, "utf8");
    if (configFile.length === 0) {
      console.error(chalk.red("Config file is empty. Login again."));
      process.exit(1);
    }
    const config = JSON?.parse(configFile);
    const { user, apiKey } = config;

    const data = await fetch(`${API_URL}/api/lab/endpoints`, {
      headers: {
        Authorization: `Bearer ${apiKey}`,
      },
    });

    if (!data.ok) {
      console.error(chalk.red("Failed to fetch endpoints."));
      process.exit(1);
    }

    const endpoints: any = await data.json();

    console.log(chalk.blue("📋 Your hooktunnel Endpoints\n"));

    endpoints.forEach((endpoint: any, index: any) => {
      let webhooks = 0;

      if (Array.isArray(endpoint.webhooks)) {
        webhooks = endpoint.webhooks.length;
      }

      const status =
        endpoint.status === "active" ? chalk.green("●") : chalk.gray("○");
      console.log(`${index + 1}. ${status} ${chalk.bold(endpoint.name)}`);
      console.log(`   Slug: ${endpoint.slug}`);
      console.log(`   URL: ${chalk.cyan(endpoint.relayUrl)}`);
      console.log(`   Webhooks today: ${webhooks}`);
      console.log("");
    });

    console.log(
      chalk.gray(
        "Tip: Use 'tsuu connect --endpoint <slug>' to connect to a specific endpoint",
      ),
    );

    process.exit(0);
  } catch (error) {
    console.error(chalk.red("Error fetching endpoints:"), error);
    process.exit(1);
  }
}
