import Product from '../components/Product';
import React, { useEffect } from 'react';
import LoadingBox from '../components/LoadingBox';
// import SearchBox from '../components/SearchBox';
import MessageBox from '../components/MessageBox';
import { useDispatch, useSelector } from 'react-redux';
import { listProducts } from '../actions/productActions';

export default function HomeScreen() {
  const dispatch = useDispatch();
  const productList = useSelector((state) => state.productList);
  const { loading, error, products } = productList;
  
  useEffect(() => {
    dispatch(listProducts({}));
  }, [dispatch]);
return (
  <div>
    {/* <div className="grid-container">
            <SearchBox />
          </div> */}
     {loading ? (
        <LoadingBox></LoadingBox>
      ) : error ? (
        <MessageBox variant="danger">{error}</MessageBox>
      ) : (
        <div className="row center">
          {/* {products.filter(product => product.category === 'Shirts' && product.brand === 'Nike')
            .slice(0, 5)
            .map((product) => (<Product key={product._id} product={product}></Product>))} */}
          {/* {products.slice(0, 5).map((product) => (
            <Product key={product._id} product={product}></Product>
            ))} */}
            {products.map((product) => (<Product key={product._id} product={product}></Product>))}
        </div>
      )}
    </div>
  );
}