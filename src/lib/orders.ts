
export type Order = {
  id: string;
  customer: {
    name: string;
    email: string;
  };
  date: string;
  status: 'Pendente' | 'Processando' | 'Enviado' | 'Entregue' | 'Cancelado';
  total: number;
  items: {
    productId: string;
    productName: string;
    quantity: number;
    price: number;
  }[];
  shippingAddress: string;
  paymentMethod: string;
};

export const orders: Order[] = [
  {
    id: 'ORD001',
    customer: { name: 'Olivia Martin', email: 'olivia.martin@email.com' },
    date: '2023-11-23',
    status: 'Entregue',
    total: 1999.00,
    items: [{ productId: '1', productName: 'Apple iPhone 15 Pro', quantity: 1, price: 1999.00 }],
    shippingAddress: 'Rua das Flores, 123, São Paulo, SP - 01000-000',
    paymentMethod: 'Cartão de Crédito',
  },
  {
    id: 'ORD002',
    customer: { name: 'Jackson Lee', email: 'jackson.lee@email.com' },
    date: '2023-11-22',
    status: 'Enviado',
    total: 39.00,
    items: [{ productId: '7', productName: 'Capa de Silicone para Apple iPhone', quantity: 1, price: 39.00 }],
    shippingAddress: 'Avenida Principal, 456, Rio de Janeiro, RJ - 20000-000',
    paymentMethod: 'Pix',
  },
  {
    id: 'ORD003',
    customer: { name: 'Isabella Nguyen', email: 'isabella.nguyen@email.com' },
    date: '2023-11-21',
    status: 'Processando',
    total: 299.00,
    items: [{ productId: '4', productName: 'Carregador Sem Fio 3 em 1', quantity: 1, price: 299.00 }],
    shippingAddress: 'Praça da Sé, 789, São Paulo, SP - 01001-000',
    paymentMethod: 'Boleto Bancário',
  },
  {
    id: 'ORD004',
    customer: { name: 'William Kim', email: 'will@email.com' },
    date: '2023-11-20',
    status: 'Entregue',
    total: 99.00,
    items: [{ productId: '7', productName: 'Capa de Silicone para Apple iPhone', quantity: 1, price: 99.00 }],
    shippingAddress: 'Rua do Comércio, 101, Belo Horizonte, MG - 30110-000',
    paymentMethod: 'Cartão de Crédito',
  },
  {
    id: 'ORD005',
    customer: { name: 'Sofia Davis', email: 'sofia.davis@email.com' },
    date: '2023-11-19',
    status: 'Pendente',
    total: 39.00,
    items: [{ productId: '7', productName: 'Capa de Silicone para Apple iPhone', quantity: 1, price: 39.00 }],
    shippingAddress: 'Travessa dos Artistas, 212, Salvador, BA - 40020-000',
    paymentMethod: 'Pix',
  },
   {
    id: 'ORD006',
    customer: { name: 'Liam Garcia', email: 'liam@email.com' },
    date: '2023-11-18',
    status: 'Cancelado',
    total: 8999.00,
    items: [{ productId: '2', productName: 'Samsung Galaxy S24 Ultra', quantity: 1, price: 8999.00 }],
    shippingAddress: 'Avenida das Nações, 303, Brasília, DF - 70300-000',
    paymentMethod: 'Cartão de Crédito',
  },
  {
    id: 'ORD007',
    customer: { name: 'Emma Martinez', email: 'emma@email.com' },
    date: '2023-11-17',
    status: 'Entregue',
    total: 120.00,
    items: [{ productId: '3', productName: 'Minoxidil Kirkland 5%', quantity: 1, price: 120.00 }],
    shippingAddress: 'Rua da Praia, 404, Porto Alegre, RS - 90010-000',
    paymentMethod: 'Boleto Bancário',
  },
];
