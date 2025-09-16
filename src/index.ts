import WebSocket from "ws";
import crypto from "crypto";
import axios from "axios";
import dotenv from "dotenv";
import { initializeUI, processWebSocketMessage } from "./renderUI";

dotenv.config();

const apiKey = process.env.API_KEY || "";
const apiSecret = process.env.API_SECRET || "";

// Initialize UI
const ui = initializeUI();

function createSignature({
  method,
  timestamp,
  requestPath,
  queryParams = "",
  body = "",
  secretKey,
}: {
  method: string;
  timestamp: string;
  requestPath: string;
  queryParams: string;
  body: string;
  secretKey: string;
}): string {
  // Build prehash string
  const prehash = method + timestamp + requestPath + queryParams + body;

  // HMAC SHA256 with secretKey
  return crypto.createHmac("sha256", secretKey).update(prehash).digest("hex");
}

function createSignatureForWebsocket({
  method = "GET",
  timestamp,
  secretKey,
}: {
  method: string;
  timestamp: string;
  secretKey: string;
}): string {
  // Build prehash string
  const prehash = method + timestamp + "/live";

  // HMAC SHA256 with secretKey
  return crypto.createHmac("sha256", secretKey).update(prehash).digest("hex");
}

function makeRequest({
  method,
  requestPath,
  body,
  queryParams,
}: {
  method: string;
  requestPath: string;
  body: any;
  queryParams: string;
}): void {
  const timestamp = Date.now().toString().slice(0, 10);

  axios("https://api.india.delta.exchange" + requestPath, {
    method,
    headers: {
      "api-key": apiKey,
      signature: createSignature({
        method,
        timestamp,
        requestPath,
        queryParams,
        secretKey: apiSecret,
        body: "",
      }),
      timestamp: timestamp,
    },
  })
    .then((response) => {
      console.log(response.data);
    })
    .catch((error) => {
      console.error(error.response.data);
    });
}

// Create an axios get request

// makeRequest({
//   method: "GET",
//   requestPath: "/v2/orders/history",
//   body: "",
//   queryParams: "",
// });

// Connect to server
const ws = new WebSocket("wss://socket.india.delta.exchange");

ws.on("open", () => {
  console.log("Connected to server ✅");

  console.log("Authenticating...");
  const timestamp = Date.now().toString().slice(0, 10);

  ws.send(
    JSON.stringify({
      type: "auth",
      payload: {
        "api-key": apiKey,
        signature: createSignatureForWebsocket({
          method: "GET",
          timestamp,
          secretKey: apiSecret,
        }),
        timestamp: timestamp,
      },
    })
  );
});

ws.on("message", (message: string) => {
  const parsedMessage = JSON.parse(message);
  console.log("Received from server: ", parsedMessage);

  // Process message for UI
  processWebSocketMessage(parsedMessage);

  if (
    parsedMessage.type === "success" &&
    parsedMessage.message === "Authenticated"
  ) {
    console.log("Authenticated ✅");

    console.log("Subscribing to channels...");
    ws.send(
      JSON.stringify({
        type: "subscribe",
        payload: {
          channels: [
            {
              name: "orders",
              symbols: ["all"],
            },
            {
              name: "positions",
              symbols: ["all"],
            },
            {
              name: "v2/user_trades",
              symbols: ["all"],
            },
          ],
        },
      })
    );
  }

  if (parsedMessage.type === "subscriptions") {
    console.log("Subscribed to channels ✅");
    console.log(`UI available at http://localhost:${ui.port}`);
  }

  if (parsedMessage.type === "orders") {
    console.log("Received order update ✅");
  }

  if (parsedMessage.type === "positions") {
    console.log("Received position update ✅");
  }

  if (parsedMessage.type === "v2/user_trades") {
    console.log("Received trade update ✅");
  }
});

ws.on("close", () => {
  console.log("Disconnected from server ❌");
});
