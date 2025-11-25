import WebSocket from "ws";
import chalk from "chalk";
import ora from "ora";
import fs from "fs";
import path from "path";
import os from "os";
import axios from "axios";
import { showResponse } from "../lib/showResponse";
import { updateUserSettings } from "../lib/updateUserSettings";
import { Config } from "../types";

interface ConnectOptions {
  port?: string;
  endpoint?: string;
  target?: string;
  host?: string;
}

const WS_URL = process.env.WS_URL || "wss://pluto.hooktunnel.dev";

// Statistics tracking
const stats = {
  totalRequests: 0,
  successfulRequests: 0,
  failedRequests: 0,
  startTime: Date.now(),
  avgResponseTime: 0,
  responseTimes: [] as number[],
};

// Enhanced box drawing
function drawBox(content: string[], color = chalk.blue) {
  const maxLen = Math.max(
    ...content.map((s) => s.replace(/\u001b\[\d+m/g, "").length),
  );
  const top = color("╭" + "─".repeat(maxLen + 2) + "╮");
  const bottom = color("╰" + "─".repeat(maxLen + 2) + "╯");
  const lines = content.map((line) => {
    const stripped = line.replace(/\u001b\[\d+m/g, "");
    const padding = " ".repeat(maxLen - stripped.length);
    return color("│ ") + line + padding + color(" │");
  });
  return [top, ...lines, bottom].join("\n");
}

// Status badge
function statusBadge(status: number): string {
  if (status >= 200 && status < 300) {
    return chalk.bgGreen.black.bold(` ${status} `);
  } else if (status >= 300 && status < 400) {
    return chalk.bgBlue.black.bold(` ${status} `);
  } else if (status >= 400 && status < 500) {
    return chalk.bgYellow.black.bold(` ${status} `);
  } else {
    return chalk.bgRed.white.bold(` ${status} `);
  }
}

// Method badge with color
function methodBadge(method: string): string {
  const colors: Record<string, any> = {
    GET: chalk.bgGreen.black,
    POST: chalk.bgBlue.black,
    PUT: chalk.bgYellow.black,
    DELETE: chalk.bgRed.black,
    PATCH: chalk.bgMagenta.black,
  };
  const color = colors[method.toUpperCase()] || chalk.bgGray.black;
  return color.bold(` ${method.toUpperCase().padEnd(6)} `);
}

// Format duration with color
function formatDuration(ms: number): string {
  if (ms < 100) return chalk.green(`${ms}ms`);
  if (ms < 500) return chalk.yellow(`${ms}ms`);
  return chalk.red(`${ms}ms`);
}

// Live stats display
function displayStats() {
  const uptime = Math.floor((Date.now() - stats.startTime) / 1000);
  const successRate =
    stats.totalRequests > 0
      ? ((stats.successfulRequests / stats.totalRequests) * 100).toFixed(1)
      : "0.0";

  console.log(chalk.dim("\n" + "─".repeat(60)));
  console.log(
    chalk.blue("📊 Stats:"),
    chalk.white(`${stats.totalRequests} requests`),
    chalk.dim("│"),
    chalk.green(`${stats.successfulRequests} success`),
    chalk.dim("│"),
    chalk.red(`${stats.failedRequests} failed`),
    chalk.dim("│"),
    chalk.cyan(`${successRate}% success rate`),
    chalk.dim("│"),
    chalk.magenta(`${stats.avgResponseTime.toFixed(0)}ms avg`),
    chalk.dim("│"),
    chalk.yellow(`${uptime}s uptime`),
  );
  console.log(chalk.dim("─".repeat(60)));
}

export async function connect(options: ConnectOptions) {
  const spinner = ora("Connecting to hooktunnel...").start();
  if (options.target) {
    options.target =
      options.target[0] === "/" ? options.target.slice(1) : options.target;
  }

  try {
    // Read config file
    const configPath = path.join(os.homedir(), ".hooktunnel", "config.json");
    if (!fs.existsSync(configPath)) {
      spinner.fail("Authentication required");
      console.log(chalk.yellow("\n💡 Run this command first:"));
      console.log(chalk.cyan("   tsuu login\n"));
      process.exit(1);
    }

    const config: Config = JSON.parse(fs.readFileSync(configPath, "utf8"));
    const { apiKey, user } = config;

    const wsUrl = `${WS_URL}/ws?userId=${user.id || "demo"}&token=${apiKey}${options.endpoint ? `&endpointId=${options.endpoint}` : ""}`;

    const ws = new WebSocket(wsUrl);

    ws.on("open", () => {
      spinner.succeed(chalk.green.bold("✨ Connected to hooktunnel"));
      console.log("");

      // Beautiful connection info box
      const log = options.port
        ? `${options.host ?? "http://localhost"}:${options.port}`
        : `${options.host ?? "http://localhost"}`;

      const boxContent = [
        chalk.bold.white("Connection Details"),
        "",
        `${chalk.blue("📍 Endpoint:")}     ${options.endpoint ? chalk.cyan(options.endpoint) : chalk.yellow("All endpoints")}`,
        options.endpoint
          ? `${chalk.blue("🔗 Relay URL:")}    ${chalk.cyan(`https://hooktunnel.dev/r/${user.id}/${options.endpoint}`)}`
          : "",
        `${chalk.blue("🎯 Forwarding:")}   ${chalk.cyan(log)}${chalk.dim(options.target ? `/${options.target}` : "/{targetUrl}")}`,
        `${chalk.blue("👤 User:")}         ${chalk.white(user.email || user.id)}`,
      ].filter(Boolean);

      console.log(drawBox(boxContent, chalk.blue));
      console.log("");
      console.log(
        chalk.green.bold("✓"),
        chalk.white("Ready to receive webhooks"),
      );
      console.log(chalk.dim("  Press Ctrl+C to stop\n"));

      stats.startTime = Date.now();
    });

    ws.on("message", async (data) => {
      try {
        const message = JSON.parse(data.toString());

        switch (message.type) {
          case "connected":
            console.log(
              chalk.dim("🔌 Session ID:"),
              chalk.cyan(message.connectionId),
            );
            console.log("");
            break;

          case "webhook":
            await forwardWebhook(
              message.data,
              options,
              message.endpoint,
              config,
            );
            break;

          case "userSettings":
            if (message.data) {
              updateUserSettings(JSON.stringify(message.data) as any);
            }
            break;

          case "pong":
            // Keep-alive response
            break;

          default:
            console.log(
              chalk.yellow("⚠️  Unknown message type:"),
              chalk.white(message.type),
            );
        }
      } catch (error) {
        console.error(chalk.red("✗ Message processing error:"), error);
      }
    });

    ws.on("close", (code, reason) => {
      console.log("");
      displayStats();
      console.log("");
      console.log(chalk.red.bold("✗ Disconnected from hooktunnel"));
      if (reason) {
        console.log(chalk.dim(`  Reason: ${reason}`));
      }
      console.log(chalk.dim(`  Code: ${code}\n`));
      process.exit(0);
    });

    ws.on("error", (error) => {
      spinner.fail("Connection failed");
      console.error(chalk.red.bold("\n✗ Error:"), error.message);

      const troubleshooting = [
        chalk.bold.yellow("Troubleshooting"),
        "",
        chalk.white("• Is the hooktunnel server running?"),
        chalk.white("• Check your network connection"),
        chalk.white("• Verify your API key is valid"),
        chalk.white("• Try running:") + chalk.cyan(" tsuu login"),
      ];

      console.log("\n" + drawBox(troubleshooting, chalk.yellow));
      console.log("");
      process.exit(1);
    });

    // Send periodic ping
    const pingInterval = setInterval(() => {
      if (ws.readyState === WebSocket.OPEN) {
        ws.send(JSON.stringify({ type: "ping" }));
      }
    }, 30000);

    // Show stats every 30 seconds if there's activity
    const statsInterval = setInterval(() => {
      if (stats.totalRequests > 0) {
        displayStats();
      }
    }, 30000);

    // Graceful shutdown
    process.on("SIGINT", () => {
      console.log(chalk.yellow("\n\n👋 Shutting down gracefully..."));
      clearInterval(pingInterval);
      clearInterval(statsInterval);
      ws.close();
    });
  } catch (error) {
    spinner.fail("Failed to start");
    console.error(chalk.red.bold("\n✗ Error:"), error);
    process.exit(1);
  }
}

async function forwardWebhook(
  webhook: any,
  options: ConnectOptions,
  endpoint: any,
  config: Config,
) {
  const startTime = Date.now();
  const timestamp = new Date().toLocaleTimeString("en-US", {
    hour12: false,
    hour: "2-digit",
    minute: "2-digit",
    second: "2-digit",
  });
  const host = options.host ? options.host : "http://localhost";
  const baseUrl = `${host}${options.port ? `:${options.port}` : ""}`;
  const path = options.target ? options.target : endpoint.targetUrl;

  // Sanitize URL to remove duplicate slashes
  const targetUrl = `${baseUrl}/${path}`.replace(/([^:]\/)\/+/g, "$1");

  // Enhanced webhook header
  console.log("");
  console.log(
    chalk.bgBlue.white.bold(` 🎣 INCOMING WEBHOOK `),
    chalk.dim(`at ${timestamp}`),
  );
  console.log(chalk.blue("┌" + "─".repeat(58) + "┐"));

  try {
    if (webhook.headers && webhook.headers["content-type"] === undefined) {
      webhook.headers["content-type"] = "application/json";
    }
    const headersToSkip = new Set(["content-length"]);

    const cleanHeaders = Object.fromEntries(
      Object.entries(webhook.headers || {})
        .filter(([k]) => !headersToSkip.has(k.toLowerCase()))
        .map(([k, v]) => [
          k.toLowerCase(),
          typeof v === "string" ? v : String(v),
        ]),
    );

    // Show request details
    console.log(
      chalk.blue("│"),
      methodBadge(webhook.method),
      chalk.cyan(webhook.path || "/webhook"),
    );
    console.log(chalk.blue("│"), chalk.dim("→"), chalk.white(targetUrl));

    const response = await axios({
      url: targetUrl,
      method: webhook.method,
      headers: cleanHeaders,
      data: webhook.body,
      validateStatus: () => true,
    });

    const duration = Date.now() - startTime;

    // Update stats
    stats.totalRequests++;
    stats.responseTimes.push(duration);
    if (stats.responseTimes.length > 100) stats.responseTimes.shift();
    stats.avgResponseTime =
      stats.responseTimes.reduce((a, b) => a + b, 0) /
      stats.responseTimes.length;

    if (response.status >= 200 && response.status < 300) {
      stats.successfulRequests++;
    } else {
      stats.failedRequests++;
    }

    // Show response
    console.log(chalk.blue("│"));
    console.log(
      chalk.blue("│"),
      chalk.dim("←"),
      statusBadge(response.status),
      formatDuration(duration),
      response.statusText ? chalk.dim(`(${response.statusText})`) : "",
    );

    // Show response size if available
    const contentLength = response.headers["content-length"];
    if (contentLength) {
      const sizeKb = (parseInt(contentLength) / 1024).toFixed(2);
      console.log(chalk.blue("│"), chalk.dim(`   Size: ${sizeKb} KB`));
    }

    console.log(chalk.blue("└" + "─".repeat(58) + "┘"));

    if (config.user.settings?.showWebhookResponseInConsole) {
      await showResponse(response);
    }
  } catch (error) {
    const duration = Date.now() - startTime;

    stats.totalRequests++;
    stats.failedRequests++;

    console.log(chalk.blue("│"));
    console.log(
      chalk.blue("│"),
      chalk.red.bold("✗ ERROR"),
      chalk.red((error as Error).message),
    );
    console.log(chalk.blue("│"), formatDuration(duration));
    console.log(chalk.blue("└" + "─".repeat(58) + "┘"));

    console.log("");
    console.log(
      chalk.yellow("💡 Tip:"),
      chalk.white("Is your local server running at"),
      chalk.cyan(targetUrl),
      chalk.white("?"),
    );
  }
}
