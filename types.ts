export type Position = {
    market: string,
    type: "LONG" | "SHORT",
    qty: number,
    margin: number,
    liquidationPrice: number,
    averagePrice: number,
    pnL?: number
}

export type Order = {
    orderId: number,
    market: string,
    type: "LONG" | "SHORT",
    qty: number,
    margin: number,
    orderType: "limit" | "market",
    price: number,
    status: "open" | "filled" | "cancelled"
}

export type User = {
    userId: number,
    username: string,
    password: string,
    collateral: {
        available: number,
        locked: number
    },
    positions: Position[],
    orders: Order[]
}