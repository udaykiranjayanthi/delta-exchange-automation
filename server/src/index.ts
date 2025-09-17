import WebSocket from "ws";
import axios from "axios";
import dotenv from "dotenv";
import { canSell, createSignature, createSignatureForWebsocket } from "./utils";
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

let positions: Record<string, Position> = {};
let orders: Record<number, Order> = {};
let prices: Record<string, any> = {};
let upperLimit: number | null = null;
let lowerLimit: number | null = null;

// Track position symbols for ticker subscriptions
let positionSymbols: string[] = [];

io.on("connection", (socket) => {
  console.log("Client connected", socket.id);

  socket.emit("positions", Object.values(positions));
  socket.emit("orders", Object.values(orders));
  socket.emit("prices", Object.values(prices));
  socket.emit("upperLimit", upperLimit);
  socket.emit("lowerLimit", lowerLimit);

  socket.on("upperLimit", (data: number) => {
    upperLimit = data;
    io.emit("upperLimit", upperLimit);
  });

  socket.on("lowerLimit", (data: number) => {
    lowerLimit = data;
    io.emit("lowerLimit", lowerLimit);
  });

  socket.on("disconnect", () => {
    console.log("Client disconnected", socket.id);
  });
});

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
  body = "",
  queryParams = "",
  onSuccess,
  onError,
}: {
  method: string;
  requestPath: string;
  body?: any;
  queryParams?: string;
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
        body: JSON.stringify(body),
      }),
      timestamp: timestamp,
    },
    data: body,
  })
    .then((response) => {
      onSuccess(response.data);
    })
    .catch((error) => {
      onError(error.response.data);
    });
}

const closeAllPositions = () => {
  const user_id = Object.values(positions)[0]?.user_id;
  if (!user_id) return;

  console.log("Closing all positions for user", user_id);
  makeRequest({
    method: "POST",
    requestPath: "/v2/positions/close_all",
    body: {
      close_all_portfolio: true,
      close_all_isolated: true,
      user_id,
    },
    onSuccess: (response) => {
      console.log("Positions closed ✅", response);
    },
    onError: (error) => {
      console.log("Failed to close positions", error);
    },
  });
};

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
  console.log("Received from server: ", parsedMessage.type);

  if (
    parsedMessage.type === "success" &&
    parsedMessage.message === "Authenticated"
  ) {
    console.log("Authenticated ✅");
    console.log("Subscribing to channels...");

    // Subscribe to channels
    ws.send(
      JSON.stringify({
        type: "subscribe",
        payload: {
          channels: [
            {
              name: "positions",
              symbols: ["all"],
            },
            {
              name: "orders",
              symbols: ["all"],
            },
            // Initially we don't subscribe to any tickers
            // Will subscribe based on positions
          ],
        },
      })
    );
  }

  if (parsedMessage.type === "positions") {
    const oldPositionSymbols = [...positionSymbols];
    positionSymbols = [];

    if (parsedMessage.action === "snapshot") {
      parsedMessage.result.forEach((position: Position) => {
        positions[position.product_symbol] = position;
      });
    } else {
      const position = parsedMessage;
      positions[position.product_symbol] = position;
    }

    // Update position symbols list with unique symbols
    positionSymbols = Array.from(
      new Set(
        Object.values(positions).map((pos) => `MARK:${pos.product_symbol}`)
      )
    );

    // Emit updated positions to all clients
    io.emit("positions", Object.values(positions));
    console.log("Received position update ✅");

    // Check if position symbols have changed
    if (
      JSON.stringify(oldPositionSymbols.sort()) !==
      JSON.stringify(positionSymbols.sort())
    ) {
      console.log("Position symbols changed, updating ticker subscriptions");
      // Unsubscribe from old tickers
      if (oldPositionSymbols.length > 0) {
        ws.send(
          JSON.stringify({
            type: "unsubscribe",
            payload: {
              channels: [
                {
                  name: "mark_price",
                  symbols: oldPositionSymbols,
                },
              ],
            },
          })
        );
      }

      // Subscribe to new tickers
      if (positionSymbols.length > 0) {
        ws.send(
          JSON.stringify({
            type: "subscribe",
            payload: {
              channels: [
                {
                  name: "mark_price",
                  symbols: positionSymbols,
                },
              ],
            },
          })
        );
      }
    }
  }

  if (parsedMessage.type === "orders") {
    if (parsedMessage.action === "snapshot") {
      parsedMessage.result.forEach((order: Order) => {
        orders[order.id] = order;
      });
    } else if (parsedMessage.action === "delete") {
      const order = parsedMessage;
      if (orders[order.id]) {
        orders[order.id] = {
          ...orders[order.id],
          ...order,
        };
      }
    } else {
      const order = parsedMessage;
      orders[order.id] = order;
    }

    // Emit updated orders to all clients
    io.emit("orders", Object.values(orders));
    console.log("Received order update ✅");
  }

  if (parsedMessage.type === "mark_price") {
    // Only store tickers for symbols we have positions in
    if (positionSymbols.includes(parsedMessage.symbol)) {
      prices[parsedMessage.symbol] = parsedMessage;

      // Emit updated prices to all clients
      io.emit("prices", prices);
      console.log(`Received ticker update for ${parsedMessage.symbol} ✅`);
    }

    if (upperLimit && lowerLimit) {
      const canSellResult = canSell({
        positions: Object.values(positions),
        prices,
        upperLimit,
        lowerLimit,
      });
      if (canSellResult) {
        console.log("Attempting to close all positions");
        closeAllPositions();
      }
      console.log("canSell", canSellResult);
    }
  }
});

ws.on("close", () => {
  console.log("Disconnected from server ❌");
});

// Socket connection for UI
