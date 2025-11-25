import { AxiosResponse } from "axios";
import chalk from "chalk";

export const showResponse = async (response: AxiosResponse) => {
  try {
    const contentType = response?.headers?.["content-type"];
    const contentLength = response.headers?.["content-length"];

    // Header section
    console.log("\n" + chalk.cyan.bold("━".repeat(60)));
    console.log(chalk.cyan.bold("📡 RESPONSE"));
    console.log(chalk.cyan.bold("━".repeat(60)));
    console.log(
      chalk.gray(
        `Status: ${chalk.green(response.status)} ${response.statusText}`,
      ),
    );
    console.log(
      chalk.gray(`Content-Type: ${chalk.yellow(contentType || "unknown")}`),
    );
    if (contentLength) {
      console.log(
        chalk.gray(`Content-Length: ${chalk.yellow(contentLength)} bytes`),
      );
    }
    console.log(chalk.cyan("─".repeat(60)));

    let responseData;

    if (contentType?.includes("application/json")) {
      responseData = response.data;
      console.log(chalk.green.bold("\n📦 JSON Response:"));
      console.log(chalk.white(JSON.stringify(responseData, null, 2)));
    } else if (contentType?.startsWith("text/")) {
      responseData = response.data;
      console.log(chalk.blue.bold("\n📝 Text Response:"));
      console.log(chalk.white(responseData));
    } else if (contentType?.includes("image/")) {
      console.log(chalk.magenta.bold("\n🖼️  Image Response"));
      console.log(chalk.gray(`   Size: ${contentLength || "unknown"} bytes`));
      console.log(chalk.gray(`   Type: ${contentType}`));
    } else if (contentType?.includes("application/pdf")) {
      console.log(chalk.red.bold("\n📄 PDF Response"));
      console.log(chalk.gray(`   Size: ${contentLength || "unknown"} bytes`));
    } else {
      responseData = response.data;

      if (typeof responseData === "string") {
        console.log(chalk.blue.bold("\n📝 Response:"));
        console.log(chalk.white(responseData));
      } else if (Buffer.isBuffer(responseData)) {
        console.log(chalk.yellow.bold("\n📦 Binary Response"));
        console.log(chalk.gray(`   Type: ${contentType}`));
        console.log(chalk.gray(`   Size: ${responseData.length} bytes`));
      } else {
        console.log(chalk.green.bold("\n📦 Response:"));
        console.log(chalk.white(JSON.stringify(responseData, null, 2)));
      }
    }

    console.log(chalk.cyan.bold("━".repeat(60) + "\n"));
  } catch (error) {
    console.log("\n" + chalk.red.bold("━".repeat(60)));
    console.log(chalk.red.bold("❌ RESPONSE ERROR"));
    console.log(chalk.red.bold("━".repeat(60)));
    console.error(
      chalk.red(error instanceof Error ? error.message : String(error)),
    );
    console.log(chalk.red.bold("━".repeat(60) + "\n"));
  }
};
