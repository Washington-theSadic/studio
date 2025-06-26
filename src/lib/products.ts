export type Product = {
  id: string;
  name: string;
  description: string;
  longDescription: string;
  price: number;
  images: string[];
  category: 'iPhone' | 'Android' | 'Minoxidil' | 'Acessórios';
  featured?: boolean;
};

export const products: Product[] = [
  {
    id: '1',
    name: 'iPhone 15 Pro',
    description: 'O mais recente e poderoso iPhone.',
    longDescription: 'O iPhone 15 Pro é forjado em titânio aeroespacial e vem com o revolucionário chip A17 Pro, um botão de Ação configurável e o sistema de câmera Pro mais poderoso em um iPhone. A tela Super Retina XDR de 6,1 polegadas com ProMotion aumenta as taxas de atualização para 120Hz quando você precisa de desempenho gráfico excepcional.',
    price: 9299.00,
    images: [
      'https://placehold.co/600x600',
      'https://placehold.co/600x600',
      'https://placehold.co/600x600',
    ],
    category: 'iPhone',
    featured: true,
  },
  {
    id: '2',
    name: 'Samsung Galaxy S24 Ultra',
    description: 'Experimente o novo padrão de smartphones.',
    longDescription: 'O Galaxy S24 Ultra chegou para revolucionar o que um smartphone pode fazer. Com o Galaxy AI, você pode editar suas fotos sem esforço, obter uma tradução em tempo real em uma chamada e muito mais. A S Pen integrada permite escrever, tocar e navegar com precisão. A câmera de 200MP captura detalhes impressionantes.',
    price: 8999.00,
    images: [
      'https://placehold.co/600x600',
      'https://placehold.co/600x600',
      'https://placehold.co/600x600',
    ],
    category: 'Android',
    featured: true,
  },
  {
    id: '3',
    name: 'Minoxidil Kirkland 5%',
    description: 'Solução para crescimento capilar.',
    longDescription: 'O Minoxidil Kirkland 5% é uma loção capilar para problemas de queda de cabelo relacionados à calvície. Ajuda a revitalizar a raiz do cabelo, normalizar o ciclo do folículo, prolongando a fase de crescimento. Ele também tem a função de estimular a vascularização do couro cabeludo permitindo oxigenação da área.',
    price: 120.00,
    images: [
      'https://placehold.co/600x600',
      'https://placehold.co/600x600',
    ],
    category: 'Minoxidil',
    featured: true,
  },
  {
    id: '4',
    name: 'Carregador Sem Fio 3 em 1',
    description: 'Carregue todos os seus dispositivos de uma vez.',
    longDescription: 'Este carregador sem fio 3 em 1 permite que você carregue seu smartphone, smartwatch e fones de ouvido sem fio simultaneamente. Com um design elegante e compacto, é perfeito para sua mesa de cabeceira ou escritório. Suporta carregamento rápido para dispositivos compatíveis.',
    price: 249.90,
    images: [
      'https://placehold.co/600x600',
    ],
    category: 'Acessórios',
    featured: true,
  },
  {
    id: '5',
    name: 'iPhone 14',
    description: 'Potência e elegância em suas mãos.',
    longDescription: 'O iPhone 14 possui o impressionante chip A15 Bionic, uma câmera grande-angular aprimorada para fotos incríveis em pouca luz e o Modo Cinema, que agora grava em 4K Dolby Vision. Sua tela Super Retina XDR é mais brilhante e nítida.',
    price: 5999.00,
    images: [
      'https://placehold.co/600x600',
    ],
    category: 'iPhone',
  },
  {
    id: '6',
    name: 'Google Pixel 8',
    description: 'O poder do Google AI no seu bolso.',
    longDescription: 'O Pixel 8 é o smartphone mais útil do Google. Com a Câmera Pixel avançada, você pode tirar fotos e vídeos incríveis. E com o chip Google Tensor G3, ele é rápido, inteligente e seguro. A tela Actua de 6,2 polegadas é super nítida e brilhante.',
    price: 6500.00,
    images: [
      'https://placehold.co/600x600',
    ],
    category: 'Android',
  },
  {
    id: '7',
    name: 'Capa de Silicone para iPhone',
    description: 'Proteção com estilo e toque suave.',
    longDescription: 'A capa de silicone com MagSafe foi criada pela Apple especialmente para o iPhone. O exterior em silicone, com toque sedoso e suave, é gostoso de segurar. E, na parte interna, uma camada de microfibra ajuda a proteger o aparelho.',
    price: 199.00,
    images: [
      'https://placehold.co/600x600',
    ],
    category: 'Acessórios',
  },
];
