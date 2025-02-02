import React, { useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { useNavigate, Link } from 'react-router-dom';
import { useParams, useLocation } from 'react-router-dom';
import { addToCart, removeFromCart } from '../actions/cartActions';
import MessageBox from '../components/MessageBox';
import { addToSavedItem, removeFromSaved } from '../actions/savedActions';

export default function CartScreen(props) {
  const params = useParams();
  const productId = params.id;
  const { search } = useLocation();
  const qtyInUrl = new URLSearchParams(search).get('qty');
  const qty = qtyInUrl ? Number(qtyInUrl) : 1;
  const cart = useSelector((state) => state.cart);
  const { cartItems } = cart;
  const saved = useSelector((state) => state.saved);
  const { savedItems } = saved;
  const navigate = useNavigate();
  const dispatch = useDispatch();

  useEffect(() => {
    if (productId) {
      dispatch(addToCart(productId, qty));
      // dispatch(addToSavedItem(productId, 1));
    }
  }, [dispatch, productId, qty]);

  const removeFromCartHandler = (id) => {
    // delete action
    dispatch(removeFromCart(id));
  };

  const removeFromSavedItemsHandler = (id) => {
    dispatch(removeFromSaved(id));
  };

  const checkoutHandler = () => {
    navigate(`/signin?redirect=/shipping`);
  };

  return (
    <div className="row top">
      <div className="col-2">
        <h1>Shopping Cart</h1>
        {cartItems.length === 0 ? (
          <MessageBox>
            Cart is empty. <Link to="/">Go Shopping</Link>
          </MessageBox>
        ) : (
          <ul>
            {cartItems.map((item) => (
              <li key={item.product}>
                <div className="row">
                  <div>
                    {/* Show only the first image from the images array */}
                    <img
                      src={item.images[0]} // Access the first image in the images array
                      alt={item.name}
                      className="small"
                    ></img>
                  </div>
                  <div className="min-30">
                    <Link to={`/product/${item.product}`}>{item.name}</Link>
                  </div>
                  <div className="quantity-control">
                    <button
                      className="decrement-button"
                      onClick={() => {
                        if (item.qty > 1) {
                          dispatch(addToCart(item.product, item.qty - 1));
                        }
                      }}
                    >
                      -
                    </button>

                    <span className="quantity">{item.qty}</span>

                    <button
                      className="increment-button"
                      onClick={() => {
                        if (item.qty < item.countInStock) {
                          dispatch(addToCart(item.product, item.qty + 1));
                        }
                      }}
                      disabled={qty >= item.countInStock}
                    >
                      +
                    </button>
                  </div>
                  <div>₦{item.price}</div>
                  <div>
                    <button
                      type="button"
                      onClick={() => removeFromCartHandler(item.product)}
                    >
                      Delete
                    </button>
                    <button 
                      type="button" 
                      onClick={() => {
                        removeFromCartHandler(item.product);  // Removes item from cart
                        dispatch(addToSavedItem(item.product, 1));  // Adds item to saved items
                      }}
                    >
                      Save for later
                    </button>
                  </div>
                </div>
              </li>
            ))}
          </ul>
        )}
        <div className="row-2">
          <h1>Saved Item</h1>
          {savedItems.length === 0 ? (
          <MessageBox>
            There are no saved Items</MessageBox>
        ) : (
          <ul>
            {savedItems.map((item) => (
                <li key={item.product}>
                <div className="row">
                  <div>
                    <img
                      src={item.images[0]}
                      alt={item.name}
                      className="small"
                    ></img>
                  </div>
                  <div className="min-30">
                    <Link to={`/product/${item.product}`}>{item.name}</Link>
                  </div>
                  <div>${item.price}</div>
                  <div>
                    <button
                      type="button"
                      onClick={() =>  {dispatch(
                        addToCart(item.product, 1)
                      );
                      removeFromSavedItemsHandler(item.product);
                      }}
                    >
                      Add to cart
                    </button>
                    <button 
                      type="button" 
                      onClick={() => {
                        removeFromSavedItemsHandler(item.product);  // Removes item from saved
                      // Adds item to saved items
                      }}
                    >
                      Delete
                    </button>
                  </div>
                </div>
              </li>
            ))}
          </ul>
        )}
    </div>
      </div>
      
      <div className="col-1">
        <div className="card card-body">
          <ul>
            <li>
              <h2>
                Subtotal ({cartItems.reduce((a, c) => a + c.qty, 0)} items) : ₦
                {cartItems.reduce((a, c) => a + c.price * c.qty, 0)}
              </h2>
            </li>
            <li>
              <button
                type="button"
                onClick={checkoutHandler}
                className="primary block"
                disabled={cartItems.length === 0}
              >
                Proceed to Checkout
              </button>
            </li>
          </ul>
        </div>
      </div>
    </div>
  );
}
