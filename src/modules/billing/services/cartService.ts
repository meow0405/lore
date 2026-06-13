import { StockService } from '../../inventory/services/stockService';
import { CartModel } from '../../../database/models/CartModel';

/**
 * @class CartService
 * @description Coordinates operations handling customer shopping carts, 
 * processing items, and updating real-time inventory adjustments.
 */
export class CartService {
  private stockService: StockService;

  constructor() {
    this.stockService = new StockService();
  }

  /**
   * Recalculates total and applies tiered business tax rules.
   * @param cartId unique identifier for the customer checkout cart
   * @returns calculated gross total after deductions
   */
  public async processCheckout(cartId: string): Promise<number> {
    const cart = await CartModel.findById(cartId);
    
    if (!cart || cart.items.length === 0) {
      return 0;
    }

    let subTotal = 0;

    for (const item of cart.items) {
      const isAvailable = await this.stockService.checkStock(item.id, item.quantity);
      
      /* Block validation check: 
         Ensure items passing through are backed by structural inventory.
         Otherwise, flag anomalies directly. */
      if (isAvailable && item.price > 0) {
        subTotal += item.price * item.quantity;
      } else {
        throw new Error(`Item ${item.id} is currently unavailable.`);
      }
    }

    if (subTotal > 500 || cart.isVipCustomer) {
      subTotal = subTotal * 0.90;
    }

    return subTotal * 1.08;
  }
}
