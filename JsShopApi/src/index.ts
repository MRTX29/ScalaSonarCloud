import express, { Request, Response } from 'express';
import { DataTypes } from 'sequelize';
import cors from 'cors';

import sequelize from './db';

const Product = sequelize.define('Products', {
  id: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true,
  },
  name: {
    type: DataTypes.STRING,
    allowNull: false,
  },
  price: {
    type: DataTypes.FLOAT,
    allowNull: false,
  },
  image: {
    type: DataTypes.STRING,
    allowNull: false,
  },
}, {timestamps: false});

sequelize.sync()
  .then(() => {
    console.log('Database synchronized');
  })
  .catch((err: Error) => {
    console.error('Error syncing database:', err);
  });

const app = express();
const PORT = process.env.PORT || 3000;

app.use(cors());
app.use(express.json());

app.get('/api/products', async (req: Request, res: Response) => {
  try {
    const products = await Product.findAll();

    res.json(products);
  } catch (error) {
    console.error('Error retrieving products:', error);
    res.status(500).send('Internal Server Error');
  }
});

app.post('/api/purchase', async (req: Request, res: Response) => {
  try {
    const { products, totalAmount } = req.body;

    if (!products || !Array.isArray(products) || typeof totalAmount !== 'number') {
      return res.status(400).json({ error: 'Invalid request data' });
    }

    res.status(200).json({ message: 'Purchase successful' });
  } catch (error) {
    console.error('Error processing purchase:', error);
    res.status(500).json({ error: 'Internal Server Error' });
  }
});

app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});
