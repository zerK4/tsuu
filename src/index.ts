#!/usr/bin/env node
import { Command } from "commander";
import { connect } from "./commands/connect";
import { login } from "./commands/login";
import { list } from "./commands/list";
import chalk from "chalk";
import { config } from "dotenv";

config({
  quiet: true,
});

const program = new Command();

program
  .name("hooktunnel")
  .description("hooktunnel CLI - Forward webhooks to your localhost")
  .version("1.0.0");

program
  .command("login")
  .description("Authenticate with hooktunnel")
  .action(login);

program
  .command("connect")
  .description("Connect to hooktunnel and forward webhooks to localhost")
  .option("-p, --port <port>", "Port to forward webhooks to")
  .option("-e, --endpoint <endpoint>", "Specific endpoint to listen to")
  .option("-t, --target <target>", "Specific target endpoint to forward to")
  .option("-h, --host <host>", "Specific host to forward to")
  .action(connect);

program.command("list").description("List available endpoints").action(list);

program
  .command("help")
  .description("Show detailed help and examples")
  .action(() => {
    console.log(chalk.bold.cyan("\n🔧 hooktunnel CLI\n"));
    console.log(
      chalk.white("⚡ Forward webhooks to your localhost for testing\n"),
    );

    console.log(chalk.bold("USAGE"));
    console.log(chalk.dim("  tsuu <command> [options]\n"));

    console.log(chalk.bold("COMMANDS\n"));

    console.log(chalk.cyan("  login"));
    console.log(chalk.dim("    Authenticate with your hooktunnel account"));
    console.log(chalk.yellow("    Example:"), chalk.white("tsuu login\n"));

    console.log(chalk.cyan("  connect"));
    console.log(
      chalk.dim("    Start forwarding webhooks to your local server"),
    );
    console.log(chalk.white("    Options:"));
    console.log(
      chalk.dim(
        "      -p, --port <port>       Port to forward to (default: 3000)",
      ),
    );
    console.log(
      chalk.dim(
        "      -e, --endpoint <slug>   Listen to specific endpoint only",
      ),
    );
    console.log(
      chalk.dim(
        "      -t, --target <endpoint>  Forward to specific target only overriding the one set in endpoint configuration.",
      ),
    );
    console.log(chalk.yellow("    Examples:"));
    console.log(chalk.white("      tsuu connect"));
    console.log(chalk.white("      tsuu connect --port 8080"));
    console.log(
      chalk.white(
        "      tsuu connect --endpoint stripe-webhooks --port 3000\n",
      ),
    );
    console.log(
      chalk.white(
        "      tsuu connect --endpoint stripe-webhooks --target custom-url-webhook --port 3000\n",
      ),
    );

    console.log(chalk.cyan("  list"));
    console.log(chalk.dim("    Show all your configured endpoints"));
    console.log(chalk.yellow("    Example:"), chalk.white("tsuu list\n"));

    console.log(chalk.cyan("  help"));
    console.log(chalk.dim("    Show this help message\n"));

    console.log(chalk.bold("QUICK START\n"));
    console.log(
      chalk.white("  1. Authenticate:        "),
      chalk.cyan("tsuu login"),
    );
    console.log(
      chalk.white("  2. Start forwarding:    "),
      chalk.cyan("tsuu connect"),
    );
    console.log(
      chalk.white("  3. Send webhooks to:    "),
      chalk.cyan("https://hooktunnel.dev/r/<user-id>/<endpoint>\n"),
    );

    console.log(chalk.bold("WORKFLOW\n"));
    console.log(
      chalk.dim("  • Create endpoints at"),
      chalk.cyan("https://hooktunnel.dev"),
    );
    console.log(
      chalk.dim("  • Use"),
      chalk.white("tsuu connect"),
      chalk.dim("to tunnel webhooks to localhost"),
    );
    console.log(chalk.dim("  • Test your webhook handlers locally"));

    console.log(chalk.bold("MORE INFO"));
    console.log(
      chalk.dim("  Documentation: "),
      chalk.cyan("https://hooktunnel.dev/docs"),
    );
    console.log(
      chalk.dim("  Report issues: "),
      chalk.cyan("https://github.com/hooktunnel/cli/issues\n"),
    );
  });

program.parse();
