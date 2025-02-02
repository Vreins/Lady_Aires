import React, { useEffect, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import {  deliverOrder, detailsOrder, payOrder } from '../actions/orderActions';
import LoadingBox from '../components/LoadingBox';
import MessageBox from '../components/MessageBox';
import { Link, useNavigate, useParams } from 'react-router-dom';
import { PaystackButton } from 'react-paystack';
import {
  ORDER_DELIVER_RESET,
  ORDER_PAY_RESET,
} from '../constants/orderConstants';

export default function OrderScreen(props) {
  const params = useParams();
  const orderId = params.id;
  const orderDetails = useSelector((state) => state.orderDetails);
  const { order, loading, error } = orderDetails;
  
  const dispatch = useDispatch();
  console.log(order)
  const orderPay = useSelector((state) => state.orderPay);
  const {
    loading: loadingPay,
    error: errorPay,
    success: successPay,
  } = orderPay;

  const orderDeliver = useSelector((state) => state.orderDeliver);
  const {
    loading: loadingDeliver,
    error: errorDeliver,
    success: successDeliver,
  } = orderDeliver;
  const userSignin = useSelector((state) => state.userSignin);
  const { userInfo } = userSignin;
  const Navigate = useNavigate();

  // Check if user is signed in, if not redirect to sign in
  useEffect(() => {
    if (!userInfo) {
      Navigate(`/signin?redirect=/order/${orderId}`);
    }
  }, [Navigate, userInfo, orderId]);

  // If user is signed in, set their email and name (make sure they exist)
  const [email, setEmail] = useState(userInfo ? userInfo.email : '');
  const [name, setName] = useState(userInfo ? userInfo.name : '');
  const [phone, setPhone] = useState('');

  const publicKey = 'pk_live_8e0f593dc0b4672ae75169fa27158f6700477cff';
  const amount = order ? (order.totalPrice * 100).toFixed(0) : 0; 

  console.log(amount)
  // console.log(email)
  useEffect(() => {
    if (
      !order ||
      successPay ||
      successDeliver ||
      (order && order._id !== orderId)
    ) {
      dispatch({ type: ORDER_PAY_RESET });
      dispatch({ type: ORDER_DELIVER_RESET });
      dispatch(detailsOrder(orderId));
    }
  }, [dispatch, orderId, successPay, successDeliver,order,]);

  const successPaymentHandler = (paymentResult) => {
    dispatch(payOrder(order, paymentResult));

    order.isPaid = true;
    order.paidAt = new Date().toISOString(); // Example: Set the current timestamp
  };

  const deliverHandler = () => {
    dispatch(deliverOrder(order._id));
  };

  const componentProps = {
    email,
    amount,
    metadata: {
      name,
      phone,
    },
    publicKey,
    text: 'Click to make Payment',
    onSuccess: () => successPaymentHandler(),  // Corrected here
    onClose: () => alert('Wait! You need this oil, don\'t go!!!!'),
  };

  return loading ? (
    <LoadingBox />
  ) : error ? (
    <MessageBox variant="danger">{error}</MessageBox>
  ) : (
    <div>
      <h1>Order {order._id}</h1>
      <div className="row top">
        <div className="col-2">
          <ul>
            <li>
              <div className="card card-body">
                <h2>Shipping</h2>
                <p>
                  <strong>Name:</strong> {order.shippingAddress.fullName} <br />
                  <strong>Address: </strong> {order.shippingAddress.address},{' '}
                  {order.shippingAddress.city},{' '}
                  {order.shippingAddress.postalCode},{' '}
                  {order.shippingAddress.country}
                </p>
                {order.isDelivered ? (
  <>
    <MessageBox variant="success">
      Delivered at {order.deliveredAt}
    </MessageBox>
    {/* Show Stock Updates if Available */}
    {orderDeliver.success && orderDeliver.payload.stockUpdates && (
      <ul className="stock-update-list">
        {orderDeliver.payload.stockUpdates.map((update, index) => (
          <li key={index}>
            <MessageBox variant="info">{update}</MessageBox>
          </li>
        ))}
      </ul>
    )}
  </>
) : (
  <MessageBox variant="danger">Not Delivered</MessageBox>
)}
              </div>
            </li>
            <li>
              <div className="card card-body">
                <h2>Payment</h2>
                <p>
                  <strong>Method:</strong> {order.paymentMethod}
                </p>
                {order.isPaid ? (
                  <MessageBox variant="success">
                    Paid at {order.paidAt}
                  </MessageBox>
                ) : (
                  <MessageBox variant="danger">Not Paid</MessageBox>
                )}
              </div>
            </li>
            <li>
              <div className="card card-body">
                <h2>Order Items</h2>
                <ul>
                  {order.orderItems.map((item) => (
                    <li key={item.product}>
                      <div className="row">
                        <div>
                          <img
                            src={item.image}
                            alt={item.name}
                            className="small"
                          />
                        </div>
                        <div className="min-30">
                          <Link to={`/product/${item.product}`}>{item.name}</Link>
                        </div>
                        <div>
                          {item.qty} x ₦{item.price} = ₦{item.qty * item.price}
                        </div>
                      </div>
                    </li>
                  ))}
                </ul>
              </div>
            </li>
          </ul>
        </div>
        <div className="col-1">
          <div className="card card-body">
            <ul>
              <li>
                <h2>Order Summary</h2>
              </li>
              <li>
                <div className="row">
                  <div>Items</div>
                  <div>₦{order.itemsPrice.toFixed(2)}</div>
                </div>
              </li>
              <li>
                <div className="row">
                  <div>Shipping</div>
                  <div>₦{order.shippingPrice.toFixed(2)}</div>
                </div>
              </li>
              <li>
                <div className="row">
                  <div>Tax</div>
                  <div>₦{order.taxPrice.toFixed(2)}</div>
                </div>
              </li>
              <li>
                <div className="row">
                  <div>
                    <strong> Order Total</strong>
                  </div>
                  <div>
                    <strong>₦{order.totalPrice.toFixed(2)}</strong>
                  </div>
                </div>
              </li>
              <div className="checkout-form">
                <form>
                  <input
                    type="hidden"
                    id="name"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                  />
                  <input
                    type="hidden"
                    id="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                  />
                  <input
                    type="hidden"
                    id="phone"
                    onChange={(e) => setPhone(e.target.value)}
                  />
                </form>
                <div>
                  {!order.isPaid ? (
                    <li>
                      <>
                        {errorPay && <MessageBox variant="danger">{errorPay}</MessageBox>}
                        {loadingPay && <LoadingBox />}

                        <PaystackButton className="primary block" {...componentProps} />
                      </>
                    </li>
                  ):(
                    <MessageBox variant="success">Payment successful!</MessageBox>
                  )}
                </div>
              </div>
              {userInfo.isAdmin && order.isPaid && !order.isDelivered && (
                <li>
                  {loadingDeliver && <LoadingBox></LoadingBox>}
                  {errorDeliver && (
                    <MessageBox variant="danger">{errorDeliver}</MessageBox>
                  )}
                  <button
                    type="button"
                    className="primary block"
                    onClick={deliverHandler}
                  >
                    Deliver Order
                  </button>
                </li>
              )}
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
}

// This is where I can use the deliver order for pay on delivery