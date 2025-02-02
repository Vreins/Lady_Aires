import bcrypt from 'bcryptjs';
const data = {
  users: [
    {
      name: 'Basir',
      email: 'admin@example.com',
      password: bcrypt.hashSync('Vreins1993.', 8),
      isAdmin: true,
      verified:true,
      isSeller: true,
      seller: {
        name: 'Puma',
        logo: '/images/logo1.png',
        description: 'best seller',
        rating: 4.5,
        numReviews: 120,
      },
    },
    {
      name: 'John',
      email: 'user@example.com',
      password: bcrypt.hashSync('1234', 8),
      isAdmin: false,
      verified:true
    },
  ],
  products: [
    {
      name: 'Nike Slim Shirt',
      category: 'Shirts',
      images: ['/images/p1.jpg', '/images/p1-2.jpg', '/images/p1-3.jpg'], // multiple images
      price: 120,
      countInStock: 10,
      brand: 'Nike',
      rating: 4.5,
      numReviews: 10,
      description: 'high quality product',
    },
    {
      name: 'Adidas Fit Shirt',
      category: 'Shirts',
      images: ['/images/p2.jpg', '/images/p2-2.jpg'], // multiple images
      price: 100,
      countInStock: 10,
      brand: 'Adidas',
      rating: 4.0,
      numReviews: 10,
      description: 'high quality product',
    },
    {
      name: 'Lacoste Free Shirt',
      category: 'Shirts',
      images: ['/images/p3.jpg', '/images/p3-2.jpg'], // multiple images
      price: 220,
      countInStock: 10,
      brand: 'Lacoste',
      rating: 4.8,
      numReviews: 17,
      description: 'high quality product',
    },
    {
      name: 'Nike Slim Pant',
      category: 'Pants',
      images: ['/images/p4.jpg', '/images/p4-2.jpg'], // multiple images
      price: 78,
      countInStock: 10,
      brand: 'Nike',
      rating: 4.5,
      numReviews: 14,
      description: 'high quality product',
    },
    {
      name: 'Puma Slim Pant',
      category: 'Pants',
      images: ['/images/p5.jpg', '/images/p5-2.jpg'], // multiple images
      price: 65,
      countInStock: 10,
      brand: 'Puma',
      rating: 4.5,
      numReviews: 10,
      description: 'high quality product',
    },
    {
      name: 'Adidas Fit Pant',
      category: 'Pants',
      images: ['/images/p6.jpg', '/images/p6-2.jpg'], // multiple images
      price: 139,
      countInStock: 10,
      brand: 'Adidas',
      rating: 4.5,
      numReviews: 15,
      description: 'high quality product',
    },
  ],
};
  export default data;