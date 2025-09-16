import express from "express";
import http from "http";
import { Server as SocketIOServer } from "socket.io";
import path from "path";
import fs from "fs";

// Types for the WebSocket messages
interface Order {
  id: number;
  product_symbol: string;
  side: string;
  size: number;
  state: string;
  order_type: string;
  average_fill_price: string | null;
  created_at: string;
  updated_at: string;
  [key: string]: any;
}

interface Position {
  product_symbol: string;
  size: number;
  entry_price: string;
  liquidation_price: string | null;
  [key: string]: any;
}

interface Trade {
  id: number;
  product_symbol: string;
  side: string;
  size: number;
  price: string;
  created_at: string;
  [key: string]: any;
}

// Data storage
const orders: Record<number, Order> = {};
const positions: Record<string, Position> = {};
const trades: Trade[] = [];

// Create Express app
const app = express();
const server = http.createServer(app);
const io = new SocketIOServer(server);

// Set up EJS as the view engine
app.set("view engine", "ejs");
app.set("views", path.join(__dirname, "../views"));

// Serve static files
app.use(express.static(path.join(__dirname, "../public")));

// Create directories if they don't exist
const publicDir = path.join(__dirname, "../public");
const viewsDir = path.join(__dirname, "../views");

if (!fs.existsSync(publicDir)) {
  fs.mkdirSync(publicDir);
}

if (!fs.existsSync(viewsDir)) {
  fs.mkdirSync(viewsDir);
}

// Set up routes
app.get("/", (req, res) => {
  res.render("dashboard");
});

// Start server
const PORT = process.env.PORT || 3001;
server.listen(PORT, () => {
  console.log(`UI server running at http://localhost:${PORT}`);
});

// Function to process WebSocket messages
export function processWebSocketMessage(message: any) {
  if (!message) return;

  // Process orders
  if (message.type === "orders") {
    const order = message;
    if (order.action === "create" || order.action === "update") {
      orders[order.id] = order;
    } else if (order.action === "delete") {
      if (orders[order.id]) {
        orders[order.id] = { ...orders[order.id], ...order };
      }
    }

    // Emit updated orders to all clients
    io.emit("orders", Object.values(orders));
  }

  // Process positions
  if (message.type === "positions") {
    const position = message;
    positions[position.product_symbol] = position;

    // Emit updated positions to all clients
    io.emit("positions", Object.values(positions));
  }

  // Process trades
  if (message.type === "v2/user_trades") {
    const trade = message;
    trades.unshift(trade); // Add to beginning of array

    // Keep only the latest 100 trades
    if (trades.length > 100) {
      trades.pop();
    }

    // Emit updated trades to all clients
    io.emit("trades", trades);
  }
}

// Export function to initialize the UI
export function initializeUI() {
  return {
    processWebSocketMessage,
    port: PORT,
  };
}
