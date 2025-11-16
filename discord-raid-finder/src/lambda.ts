import {
  APIGatewayProxyEvent,
  APIGatewayProxyResult,
  Context,
} from "aws-lambda";
import { initializeBot } from "./index";

let botInstance: any = null;

export const handler = async (
  event: APIGatewayProxyEvent,
  context: Context
): Promise<APIGatewayProxyResult> => {
  try {
    if (!botInstance) {
      botInstance = await initializeBot();
    }

    return {
      statusCode: 200,
      body: JSON.stringify({ message: "Bot is running" }),
    };
  } catch (error) {
    console.error("Error:", error);
    return {
      statusCode: 500,
      body: JSON.stringify({ error: "Internal server error" }),
    };
  }
};
