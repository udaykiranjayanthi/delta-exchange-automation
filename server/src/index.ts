import WebSocket from "ws";
import axios from "axios";
import dotenv from "dotenv";
import { createSignature, createSignatureForWebsocket } from "./utils";
import express, { Application, Request, Response } from "express";
import http from "http";
import { Server as SocketIOServer } from "socket.io";
import { Order, Position, Trade } from "./types";
import cors from "cors";

dotenv.config();

const app: Application = express();
app.use(express.json());
app.use(cors({ origin: "http://localhost:3000" }));

const server = http.createServer(app);
const io = new SocketIOServer(server, {
  cors: {
    origin: "http://localhost:3000",
    methods: ["GET", "POST"],
    allowedHeaders: ["Content-Type"],
    credentials: true,
  },
});

app.get("/", (req: Request, res: Response) => {
  res.send("Socket.IO Server is running 🚀");
});

// Function to process WebSocket messages
let positions: Record<string, Position> = {};
// let orders: Record<number, Order> = {};
// let trades: Trade[] = [];

io.on("connection", (socket) => {
  console.log("Client connected", socket.id);

  socket.emit("positions", Object.values(positions));
  // socket.emit("orders", Object.values(orders));
  // socket.emit("trades", trades);
});

function processWebSocketMessage(message: any) {
  if (!message) return;

  // Process positions
  if (message.type === "positions" && message.action !== "snapshot") {
    const position = message;
    positions[position.product_symbol] = position;

    // Emit updated positions to all clients
    io.emit("positions", Object.values(positions));
  }

  // // Process orders
  // if (message.type === "orders") {
  //   const order = message;
  //   if (order.action === "create" || order.action === "update") {
  //     orders[order.id] = order;
  //   } else if (order.action === "delete") {
  //     if (orders[order.id]) {
  //       orders[order.id] = { ...orders[order.id], ...order };
  //     }
  //   }

  //   // Emit updated orders to all clients
  //   io.emit("orders", Object.values(orders));
  // }

  // // Process trades
  // if (message.type === "v2/user_trades") {
  //   const trade = message;
  //   trades.unshift(trade); // Add to beginning of array

  //   // Keep only the latest 100 trades
  //   if (trades.length > 100) {
  //     trades.pop();
  //   }

  //   // Emit updated trades to all clients
  //   io.emit("trades", trades);
  // }
}

const PORT = process.env.PORT || 8000;
server.listen(PORT, () => {
  console.log(`Server running at http://localhost:${PORT}`);
});

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
              name: "positions",
              symbols: ["all"],
            },
            // {
            //   name: "orders",
            //   symbols: ["all"],
            // },
            // {
            //   name: "v2/user_trades",
            //   symbols: ["all"],
            // },
          ],
        },
      })
    );
  }

  if (parsedMessage.type === "positions") {
    if (parsedMessage.action === "snapshot") {
      positions = parsedMessage.result;
    }
    console.log("Received position update ✅");
  }

  // if (parsedMessage.type === "v2/user_trades") {
  //   console.log("Received trade update ✅");
  // }

  // if (parsedMessage.type === "subscriptions") {
  //   console.log("Subscribed to channels ✅");
  // }

  // if (parsedMessage.type === "orders") {
  //   console.log("Received order update ✅");
  // }
});

ws.on("close", () => {
  console.log("Disconnected from server ❌");
});

// Socket connection for UI
