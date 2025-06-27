
'use server';
/**
 * @fileOverview A flow to notify administrators about new orders.
 *
 * - notifyAdminOfNewOrder - A function that handles the new order notification process.
 * - NewOrderNotificationInput - The input type for the notifyAdminOfNew-order function.
 */
import { sendAdminNotification } from '@/lib/notifications';

// Defining the structure for individual cart items
type CartItem = {
  productName: string;
  quantity: number;
  price: number;
};

// Defining the input type for the notification function
export type NewOrderNotificationInput = {
  customerName: string;
  totalPrice: number;
  items: CartItem[];
  shippingAddress: string;
  paymentMethod: string;
};

/**
 * Sends a notification to the admin about a new order.
 * This is a Server Action and does not use Genkit.
 * @param input The order data.
 */
export async function notifyAdminOfNewOrder(input: NewOrderNotificationInput): Promise<void> {
  // Generate a formatted list of items for the notification body
  const itemsList = input.items.map(item => 
    `- ${item.quantity}x ${item.productName} @ ${item.price.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })}`
  ).join('\n');

  const subject = `🎉 Novo Pedido Recebido de ${input.customerName}!`;
  const body = `
Um novo pedido foi realizado na loja.

Detalhes do Pedido:
-------------------
Cliente: ${input.customerName}
Valor Total: ${input.totalPrice.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })}
Forma de Pagamento: ${input.paymentMethod}

Endereço de Entrega:
${input.shippingAddress}

Itens:
${itemsList}

Por favor, acesse o painel de administração para processar o pedido.
  `;

  // Use the notification service to send the actual notification
  await sendAdminNotification(subject, body);
}
