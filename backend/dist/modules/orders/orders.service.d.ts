import { Order, User } from '../../db/models';
import { PaginatedResult } from '../../utils/pagination';
import { CreateOrderDTO, OrderListItemDTO, OrderQueryFilters } from './orders.dto';
export declare class OrdersService {
    /**
     * Creates an order with deterministic pessimistic row locking and atomic stock deduction.
     * Lock order: products ordered by `id ASC` to prevent concurrent deadlocks.
     */
    static createOrder(userId: number, input: CreateOrderDTO): Promise<Order>;
    /**
     * Lists orders with filters and SQL-aggregated itemCount/lineCount (no N+1).
     */
    static listOrders(currentUser: User, filters: OrderQueryFilters): Promise<PaginatedResult<OrderListItemDTO>>;
    /**
     * Retrieves single order by ID with authorization check.
     */
    static getOrderById(currentUser: User, orderId: number): Promise<Order>;
    /**
     * Cancels order and restores product stock in a managed transaction.
     * Double-cancel safe (returns 409 on second cancel).
     */
    static cancelOrder(currentUser: User, orderId: number): Promise<Order>;
    /**
     * Admin-only endpoint to transition PENDING -> CONFIRMED.
     */
    static confirmOrder(orderId: number): Promise<Order>;
}
