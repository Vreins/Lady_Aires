import React, { useEffect, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { Link, useParams } from 'react-router-dom';
import { createReview, detailsProduct } from '../actions/productActions';
import { listOrderMine } from '../actions/orderActions';
import LoadingBox from '../components/LoadingBox';
import MessageBox from '../components/MessageBox';
import Rating from '../components/Rating';
import { addToCart } from '../actions/cartActions';
import { PRODUCT_REVIEW_CREATE_RESET } from '../constants/productConstants';
import { addToSavedItem } from '../actions/savedActions';

export default function ProductScreen(props) {
  const dispatch = useDispatch();
  const params = useParams();
  const productId = params.id;
  const [hasPurchasedAndDelivered, setHasPurchasedAndDelivered] = useState(false);

   

  const [qty, setQty] = useState(1);
  const [currentImageIndex, setCurrentImageIndex] = useState(0); // for controlling the image slideshow
  const productDetails = useSelector((state) => state.productDetails);
  const { loading, error, product } = productDetails;
  useEffect(() => {
    if (!product || product._id !== productId) {
      dispatch(detailsProduct(productId));
    }
  }, [dispatch, product, productId]);
 
  const userSignin = useSelector((state) => state.userSignin);
  const { userInfo } = userSignin;

  const orderMineList = useSelector((state) => state.orderMineList);
  const { loading: loadingOrders, orders } = orderMineList;

  const productReviewCreate = useSelector((state) => state.productReviewCreate);
  const {
    loading: loadingReviewCreate,
    error: errorReviewCreate,
    success: successReviewCreate,
  } = productReviewCreate;

  const [rating, setRating] = useState(0);
  const [comment, setComment] = useState('');

  // Handle increment
  const incrementQty = () => {
    if (qty < product.countInStock) {
      setQty(qty + 1);
    }
  };

  // Handle decrement
  const decrementQty = () => {
    if (qty > 1) {
      setQty(qty - 1);
    }
  };

  // Handle the next image in the slideshow
  const nextImage = () => {
    if (currentImageIndex < product.images.length - 1) {
      setCurrentImageIndex(currentImageIndex + 1);
    }
  };

  // Handle the previous image in the slideshow
  const prevImage = () => {
    if (currentImageIndex > 0) {
      setCurrentImageIndex(currentImageIndex - 1);
    }
  };

  useEffect(() => {
    if (successReviewCreate) {
      window.alert('Review Submitted Successfully');
      setRating('');
      setComment('');
      dispatch({ type: PRODUCT_REVIEW_CREATE_RESET });
    }
    // if (errorReviewCreate) {
    //   window.alert(errorReviewCreate); // Show error from backend (e.g., not delivered)
    // }
    dispatch(detailsProduct(productId));
    if (userInfo) {
      dispatch(listOrderMine());
    }

  }, [dispatch, userInfo, productId, successReviewCreate, errorReviewCreate]);

  useEffect(() => {
    if (orders && orders.length > 0) {
      const purchased = orders.some(
        (order) =>
          order.isDelivered &&
          order.orderItems.some((item) => item.product.toString() === productId)
      );
      setHasPurchasedAndDelivered(purchased);
    }
  }, [orders, productId]);


  const addToCartHandler = () => {
    dispatch(addToCart(productId, qty));
  };


  const addToSavedItemHandler = () => {
    dispatch(addToSavedItem(productId, 1));
  };

  const submitHandler = (e) => {
    e.preventDefault();
    if (!userInfo) {
      alert('You must be signed in to review this product.');
      return;
    }
    if (comment && rating) {
      dispatch(
        createReview(productId, { rating, comment, name: userInfo.name })
      );
    } else {
      alert('Please enter comment and rating');
    }
  };
  

  return (
    <div>
      {loading || loadingOrders ? (
        <LoadingBox />
      ) : error ? (
        <MessageBox variant="danger">{error}</MessageBox>
      ) : (
        <div>
          <Link to="/">Back to results</Link>
          <div className="row top">
            <div className="col-2">
              {/* Image Slideshow */}
              <div className="slideshow-container">
  {product?.images?.length > 0 ? (
    <>
      <img
        className="large"
        src={product.images[currentImageIndex]}
        alt={product.name}
      />
      <div className="slideshow-buttons">
        <button onClick={prevImage} disabled={currentImageIndex === 0}>
          &lt; Prev
        </button>
        <button
          onClick={nextImage}
          disabled={currentImageIndex === product.images.length - 1}
        >
          Next &gt;
        </button>
      </div>
    </>
  ) : (
    <MessageBox>No Images Available</MessageBox>
  )}
</div>
            </div>
            <div className="col-1">
              <ul>
                <li>
                  <h1>{product.name}</h1>
                </li>
                <li>
                  <Rating rating={product.rating} numReviews={product.numReviews} />
                </li>
                <li>Price: ₦{product.price}</li>
                <li>Description: <p>{product.description}</p></li>
              </ul>
            </div>
            <div className="col-1">
              <div className="card card-body">
                <ul>
                <li>
                    Seller{' '}
                    <h2>
                    <Link to={`/seller/${product.seller._id}`}>
                    {product.seller.seller.name}
                    {/* name */}
                    </Link>
                    </h2>
                    <Rating
                      rating={product.seller.seller.rating}
                      numReviews={product.seller.seller.numReviews}
                    ></Rating>
                  </li>

                  <li>
                    <div className="row">
                      <div>Price</div>
                      <div className="price">₦{product.price}</div>
                    </div>
                  </li>
                  <li>
                    <div className="row">
                      <div>Status</div>
                      <div>
                        {product.countInStock > 0 ? (
                          <span className="success">In Stock</span>
                        ) : (
                          <span className="danger">Unavailable</span>
                        )}
                      </div>
                    </div>
                  </li>
                  {product.countInStock > 0 && (
                    <>
                      <li>
                        <div className="row">
                          <div>Qty</div>
                          <div className="quantity-control">
                            <button
                              className="decrement-button"
                              onClick={decrementQty}
                              disabled={qty <= 1} // Disable "-" button if qty is 1
                            >
                              -
                            </button>

                            <span className="quantity">{qty}</span>

                            <button
                              className="increment-button"
                              onClick={incrementQty}
                              disabled={qty >= product.countInStock} // Disable "+" button if qty reaches max stock
                            >
                              +
                            </button>
                          </div>
                        </div>
                      </li>
                      <li>
                        <button onClick={addToCartHandler} className="primary block">
                          Add to Cart
                        </button>
                        <button onClick={addToSavedItemHandler} className="primary block">
                          Save Item For later
                        </button>
                      </li>
                    </>
                  )}
                </ul>
              </div>
            </div>
          </div>
          <div>
            <h2 id="reviews">Reviews</h2>
            {product.reviews.length === 0 && (
              <MessageBox>There is no review</MessageBox>
            )}
            <ul>
              {product.reviews.map((review) => (
                <li key={review._id}>
                  <strong>{review.name}</strong>
                  <Rating rating={review.rating} caption=" "></Rating>
                  <p>{review.createdAt.substring(0, 10)}</p>
                  <p>{review.comment}</p>
                </li>
              ))}
<li>
                {userInfo ? (
                  hasPurchasedAndDelivered ? (
                    <form className="form" onSubmit={submitHandler}>
                      <div>
                        <h2>Write a customer review</h2>
                      </div>
                      <div>
                        <label htmlFor="rating">Rating</label>
                        <select
                          id="rating"
                          value={rating}
                          onChange={(e) => setRating(e.target.value)}
                        >
                          <option value="">Select...</option>
                          <option value="1">1- Poor</option>
                          <option value="2">2- Fair</option>
                          <option value="3">3- Good</option>
                          <option value="4">4- Very good</option>
                          <option value="5">5- Excellent</option>
                        </select>
                      </div>
                      <div>
                        <label htmlFor="comment">Comment</label>
                        <textarea
                          id="comment"
                          value={comment}
                          onChange={(e) => setComment(e.target.value)}
                        ></textarea>
                      </div>
                      <div>
                        <label />
                        <button className="primary" type="submit">
                          Submit
                        </button>
                      </div>
                      {loadingReviewCreate && <LoadingBox></LoadingBox>}
                      {errorReviewCreate && (
                        <MessageBox variant="danger">{errorReviewCreate}</MessageBox>
                      )}
                    </form>
                  ) : (
                    <MessageBox>
                      You can only review this product after purchasing and receiving it.
                    </MessageBox>
                  )
                ) : (
                  // <MessageBox>
                  //   Please <Link to="/signin">Sign In</Link> to write a review.
                  // </MessageBox>
                  <div></div>
                )}
              </li>
            </ul>
          </div>
        </div>
      )}
    </div>
  );
}
