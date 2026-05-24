import express from "express";
import { authSchema } from "./schema";
import bcrypt from "bcrypt";
import type { User } from "./types";
import jwt from "jsonwebtoken";

const app = express();
app.use(express.json());

const JWT_SECRET = process.env.JWT_SECRET!;
let USER_ID = 3;

const users: User[] = [{
    userId: 1,
    username: "lohith",
    password: "$2b$10$Q1x8mD3k0tQ6wWw4JxJ8mOlbR4n4nQ5f8z8l6M6P5j3nGfK9YzW5S",
    collateral: {
         available: 2000,
         locked: 1000
    },
     positions: [
        { market: "SOL", type: "LONG", qty: 10, margin: 500, liquidationPrice: 80, averagePrice: 90 },
        { market: "ETH", type: "SHORT", qty: 1, margin: 500, liquidationPrice: 2000, averagePrice: 1900 }
    ],
    orders: [
        { orderId: 1, market: "SOL", type: "LONG", qty: 10, margin: 500, orderType: "limit", price: 90, status: "filled" },
        { orderId: 2, market: "ETH", type: "SHORT", qty: 10, margin: 500, orderType: "limit", price: 1900, status: "filled" },
        { orderId: 3, market: "BTC", type: "LONG", qty: 10, margin: 500, orderType: "limit", price: 1900, status: "cancelled" },
    ]
}, {
    userId: 2,
    username: "niketh",
    password: "$2b$10$8jT7nQvB2zL9sK4xWmF6UOeX7aY3pQ1nM5dC8rH2kL0vN9tS6yP1G",
    collateral: {
         available: 2000,
         locked: 2000
    },
    positions: [
        { market: "SOL", type: "SHORT", qty: 10,  margin: 1000, liquidationPrice: 80, pnL: 200, averagePrice: 90 },
        { market: "ETH", type: "LONG", qty: 1, margin: 1000, liquidationPrice: 2000, pnL: -100, averagePrice: 1900 }
    ],
    orders: [
        { orderId: 10, market: "SOL", type: "SHORT", qty: 10, margin: 500, orderType: "market", price: 90, status: "filled" },
        { orderId: 11, market: "ETH", type: "LONG", qty: 10, margin: 500, orderType: "market", price: 1900, status: "filled" },
        { orderId: 12, market: "ZEC", type: "LONG", qty: 10, margin: 500, orderType: "limit", price: 1900, status: "open" },
    ]
}];

type Bid = {
    availableQty: number,
    openOrders: { userId: number, qty: number, filledQty: number, orderId: number, createdAt: Date }[]
}

type Orderbook = {
    bids: Record<string, Bid>,
    asks: Record<string, Bid>,
    lastTradedPrice: number,
    indexPrice: number
}

type Orderbooks = Record<string, Orderbook>

const orderbooks: Orderbooks = {
     SOL: { bids: {}, asks: {}, lastTradedPrice: 90, indexPrice: 90.01 },
     ETH: { bids: {}, asks: {}, lastTradedPrice: 1900, indexPrice: 1899.9 }
}

const fills = [{
    maker: 1,
    taker: 2,
    market: "SOL",
    qty: 10,
    price: 90,
    long: 1,
    short: 2
}, {
    maker: 1,
    taker: 2,
    market: "ETH",
    qty: 1,
    price: 1900,
    long: 2,
    short: 1
}];

app.post("/signup", async (req, res) => {
    const parsedBody = authSchema.safeParse(req.body);

    if (!parsedBody.success) {
        return res.status(400).json({ message: "Invalid inputs", errors: parsedBody.error.issues });
    }

    const { username, password } = parsedBody.data;

    const existingUser = users.find((u) => u.username === username);

    if (existingUser) {
        return res.status(400).json({ message: "User already exists" });
    }
    
    const hashedPassword = await bcrypt.hash(password, 10);

    const user: User = {
        userId: USER_ID++,
        username,
        password: hashedPassword,
        collateral: {
            available: 0,
            locked: 0
        },
        positions: [],
        orders: []
    }

    users.push(user);

    return res.status(201).json({ message: "Signed up successfully" });
})

app.post("/signin", async (req, res) => {
    const parsedBody = authSchema.safeParse(req.body);

    if (!parsedBody.success) {
        return res.status(400).json({ message: "Invalid inputs", errors: parsedBody.error.issues });
    }

    const { username, password } = parsedBody.data;

    const user = users.find((u) => u.username === username);

    if (!user) {
        return res.status(400).json({ message: "Invalid credentials" });
    }

    const isCorrectPassword = await bcrypt.compare(password, user.password);

    if (!isCorrectPassword) {
        return res.status(401).json({ message: "Invalid credentials" });
    }

    const token = jwt.sign({ userId: user.userId }, JWT_SECRET, { expiresIn: "7d" });

    return res.json({ message: "Signed in successfully", token });

})
app.post("/onramp", (req, res) => {})
app.post("/order", (req, res) => {})
app.delete("/order", (req, res) => {})
app.get("/equity/available", (req, res) => {})
app.get("/positions/open/:marketId", (req, res) => {});
app.get("/positions/closed/:marketId", (req, res) => {});
app.get("/orders/open/:marketId", (req, res) => {})
app.get("/orders/:marketId", (req, res) => {})
app.get("/fills", (req, res) => {});

async function liquidationChecks(asset: string, price: number) {

}


async function onPriceUpdateFromBinance(asset: string, price: number) {
    liquidationChecks(asset, price);   
}
