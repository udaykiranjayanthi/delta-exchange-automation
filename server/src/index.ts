import WebSocket from "ws";
import axios from "axios";
import dotenv from "dotenv";
import { createSignature, createSignatureForWebsocket } from "./utils";

dotenv.config();

const apiKey = process.env.API_KEY || "";
const apiSecret = process.env.API_SECRET || "";

// Initialize UI

function makeRequest({
  method,
  requestPath,
  body,
  queryParams,
  onSuccess,
  onError,
}: {
  method: string;
  requestPath: string;
  body: any;
  queryParams: string;
  onSuccess: (response: any) => void;
  onError: (error: any) => void;
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
      onSuccess(response.data);
    })
    .catch((error) => {
      onError(error.response.data);
    });
}

// Get positions
makeRequest({
  method: "GET",
  requestPath: "/v2/positions",
  body: "",
  queryParams: "",
  onSuccess: (response) => {
    console.log(response);
  },
  onError: (error) => {
    console.log(error);
  },
});

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
  // processWebSocketMessage(parsedMessage);

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
