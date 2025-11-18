import { AxiosResponse } from "axios";

export const showResponse = async (endpoint: any, response: AxiosResponse) => {
  if (endpoint?.showResponseInConsole) {
    try {
      const contentType = response?.headers?.["content-type"];
      let responseData;

      if (contentType?.includes("application/json")) {
        responseData = response.data;
        console.log("📦 JSON Response:", responseData);
      } else if (contentType?.startsWith("text/")) {
        responseData = response.data;
        console.log("📝 Text Response:", responseData);
      } else if (contentType?.includes("image/")) {
        console.log(
          "🖼️ Image Response - Size:",
          response.headers?.["content-length"],
          "bytes",
        );
      } else if (contentType?.includes("application/pdf")) {
        console.log(
          "📄 PDF Response - Size:",
          response.headers?.["content-length"],
          "bytes",
        );
      } else {
        // For other content types, log the data
        responseData = response.data;
        if (typeof responseData === "string") {
          console.log("📝 Response:", responseData);
        } else if (Buffer.isBuffer(responseData)) {
          console.log(
            "📦 Binary Response - Type:",
            contentType,
            "Size:",
            responseData.length,
            "bytes",
          );
        } else {
          console.log("📦 Response:", responseData);
        }
      }
    } catch (error) {
      console.error("❌ Failed to read response:", error);
    }
  }
};
