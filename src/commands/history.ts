import fs from "fs";
import path from "path";
import os from "os";
import chalk from "chalk";

interface HistoryOptions {
  endpoint?: string;
  limit: string;
}

export async function history(options: HistoryOptions) {
  try {
    // Read config file
    const configPath = path.join(os.homedir(), ".hooktunnel", "config.json");
    if (!fs.existsSync(configPath)) {
      console.error(
        chalk.red("Not authenticated. Please run 'tsuu login' first."),
      );
      process.exit(1);
    }

    const config = JSON.parse(fs.readFileSync(configPath, "utf8"));

    // TODO: Fetch actual webhook history from API
    // For now, show demo webhooks
    console.log(chalk.blue("📜 Recent Webhooks\n"));

    const webhooks = [
      {
        id: "wh_1234567890",
        endpoint: "stripe-payments",
        method: "POST",
        path: "/webhook/stripe",
        status: 200,
        timestamp: new Date(Date.now() - 5 * 60000).toISOString(),
        source: "Stripe API",
      },
      {
        id: "wh_1234567891",
        endpoint: "github-webhooks",
        method: "POST",
        path: "/webhook/github",
        status: 200,
        timestamp: new Date(Date.now() - 15 * 60000).toISOString(),
        source: "GitHub",
      },
      {
        id: "wh_1234567892",
        endpoint: "stripe-payments",
        method: "POST",
        path: "/webhook/stripe",
        status: 400,
        timestamp: new Date(Date.now() - 30 * 60000).toISOString(),
        source: "Stripe API",
      },
    ];

    // Filter by endpoint if specified
    const filteredWebhooks = options.endpoint
      ? webhooks.filter((w) => w.endpoint === options.endpoint)
      : webhooks;

    // Limit results
    const limitedWebhooks = filteredWebhooks.slice(0, parseInt(options.limit));

    if (limitedWebhooks.length === 0) {
      console.log(chalk.gray("No webhooks found."));
      return;
    }

    limitedWebhooks.forEach((webhook, index) => {
      const statusColor =
        webhook.status >= 200 && webhook.status < 300 ? chalk.green : chalk.red;
      const timeAgo = getTimeAgo(new Date(webhook.timestamp));

      console.log(
        `${index + 1}. ${statusColor(webhook.status)} ${chalk.bold(webhook.method)} ${webhook.path}`,
      );
      console.log(`   ID: ${webhook.id}`);
      console.log(`   Endpoint: ${webhook.endpoint}`);
      console.log(`   Source: ${webhook.source}`);
      console.log(`   Time: ${timeAgo}`);
      console.log("");
    });

    console.log(
      chalk.gray(
        `Showing ${limitedWebhooks.length} of ${filteredWebhooks.length} webhooks`,
      ),
    );
  } catch (error) {
    console.error(chalk.red("Error fetching webhook history:"), error);
    process.exit(1);
  }
}

function getTimeAgo(date: Date): string {
  const seconds = Math.floor((Date.now() - date.getTime()) / 1000);

  if (seconds < 60) return `${seconds}s ago`;
  if (seconds < 3600) return `${Math.floor(seconds / 60)}m ago`;
  if (seconds < 86400) return `${Math.floor(seconds / 3600)}h ago`;
  return `${Math.floor(seconds / 86400)}d ago`;
}
