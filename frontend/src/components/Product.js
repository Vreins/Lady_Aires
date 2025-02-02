import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import Rating from './Rating';
import { useDispatch, useSelector } from 'react-redux';
import { addToCart } from '../actions/cartActions';
import { addToSavedItem, removeFromSaved } from '../actions/savedActions';

import '@fortawesome/fontawesome-free/css/all.min.css';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faCartPlus, faHeart as solidHeart } from '@fortawesome/free-solid-svg-icons';
import { faHeart as regularHeart } from '@fortawesome/free-regular-svg-icons';

export default function Product(props) {
  const { product } = props;
  const dispatch = useDispatch();
  const [cartHovered, setCartHovered] = useState(false);
  const [wishlistHovered, setWishlistHovered] = useState(false);

  const handleAddToCart = (productId, qty = 1) => {
    dispatch(addToCart(productId, qty));
  };

  const savedItems = useSelector((state) => state.saved.savedItems);
  const isSaved = savedItems.some((item) => item.product === product._id);

  const handleSave = () => {
    if (isSaved) {
      dispatch(removeFromSaved(product._id));
    } else {
      dispatch(addToSavedItem(product._id, 1));
    }
  };

  const sampleNames = ['sample name', 'samle name'];
  if (sampleNames.some(name => product.name.toLowerCase().includes(name))) {
    return null;
  }

  return (
    <div key={product._id} className="card">
      {/* Wishlist Button (Upper Right Corner) */}
      <div 
        className="heart-icon"
        onMouseEnter={() => setWishlistHovered(true)}
        onMouseLeave={() => setWishlistHovered(false)}
        onClick={handleSave}
      >
        <FontAwesomeIcon 
          icon={isSaved ? solidHeart : regularHeart} 
          color={isSaved ? "red" : "black"}
        />
        {wishlistHovered && <span className="tooltip"> {isSaved ? "Remove from Wishlist" : "Add to Wishlist"} </span>}
      </div>

      <Link to={`/product/${product._id}`}>
        <img className="medium" src={product.images[0]} alt={product.name} />
      </Link>
      
      <div className="card-body">
        <Link to={`/product/${product._id}`}>
          <h2>{product.name}</h2>
        </Link>
        <Rating rating={product.rating} numReviews={product.numReviews} />
        <div className="row">
          <div className="price">
            <span className="cancelled-number">₦{product.price}</span>
            <span> </span>
            <span>₦{product.price}</span>
          </div>
          <div>
            <Link to={`/seller/${product.seller._id}`}>
              {product.seller.seller.name}
            </Link>
          </div>
        </div>

        {/* Add to Cart Button with Hover Effect */}
        <div 
          className="icon-container"
          onMouseEnter={() => setCartHovered(true)}
          onMouseLeave={() => setCartHovered(false)}
          onClick={() => handleAddToCart(product._id)}
        >
          <FontAwesomeIcon icon={faCartPlus} />
          {cartHovered && <span className="tooltip">Add to Cart</span>}
        </div>
      </div>
    </div>
  );
}
