import React, { useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { deleteOrder, listOrders } from '../actions/orderActions';
import LoadingBox from '../components/LoadingBox';
import MessageBox from '../components/MessageBox';
import { useNavigate } from 'react-router-dom';
import { ORDER_DELETE_RESET } from '../constants/orderConstants';
import { useLocation } from 'react-router-dom';
import { Link } from 'react-router-dom';
export default function OrderListScreen(props) {
const Navigate=useNavigate()
const { pathname } = useLocation();
const sellerMode = pathname.indexOf('/seller') >= 0;

const orderList = useSelector((state) => state.orderList);
  const orderDelete = useSelector((state) => state.orderDelete);
  const {
    loading: loadingDelete,
    error: errorDelete,
    success: successDelete,
  } = orderDelete;

  const userSignin = useSelector((state) => state.userSignin);
  const { userInfo } = userSignin;

  const { loading, error, orders } = orderList;
  const dispatch = useDispatch();
  useEffect(() => {
    dispatch({ type: ORDER_DELETE_RESET });
     dispatch(listOrders({ seller: sellerMode ? userInfo._id: '' }));
  }, [dispatch, sellerMode, successDelete, userInfo._id]);
  
  const deleteHandler = (order) => {
    if (window.confirm('Are you sure to delete?')) {
        dispatch(deleteOrder(order._id));
      }
  };
  return (
    <div>
      <h1>Orders</h1>
      {loadingDelete && <LoadingBox></LoadingBox>}
      {errorDelete && <MessageBox variant="danger">{errorDelete}</MessageBox>}

      {loading ? (
        <LoadingBox></LoadingBox>
      ) : error ? (
        <MessageBox variant="danger">{error}</MessageBox>
      ) : (
        <table className="table">
          <thead>
            <tr>
              <th>ID</th>
              <th>USER</th>
              <th>PRODUCTS</th>
              <th>SELLERS</th>
              <th>DATE</th>
              <th>TOTAL</th>
              <th>PAID</th>
              <th>DELIVERED</th>
              <th>ACTIONS</th>
            </tr>
          </thead>
          <tbody>
  {orders.map((order) => (
    <tr key={order._id}>
      <td>{order._id}</td>
      <td>{order.user ? order.user.name : order.shippingAddress.fullName}</td>
      <td>{order.orderItems.map((item) => (
                  <ul key={item.product}>
                  <div className="min-30">
                          <Link to={`/product/${item.product}`}>{item.name}</Link>
                        </div>
                        </ul>))}</td>
                        <td>
  {order.orderItems.map((item) => (
    <ul key={item.product?._id || item.product}>
      <div className="min-30">
        {item.product?.seller?.seller?.name ? (
          <Link to={`/seller/${item.product.seller._id}`}>{item.product.seller.seller.name}</Link>
        ) : (
          'Unknown Seller'
        )}
      </div>
    </ul>
  ))}
</td>
      <td>{order.createdAt.substring(0, 10)}</td>
      <td>{order.totalPrice.toFixed(2)}</td>
      <td>{order.isPaid ? order.paidAt.substring(0, 10) : 'No'}</td>
      <td>
        {order.isDelivered
          ? order.deliveredAt.substring(0, 10)
          : 'No'}
      </td>
      <td>
        <button
          type="button"
          className="small"
          onClick={() => {
            Navigate(`/order/${order._id}`);
          }}
        >
          Details
        </button>
        {userInfo.isAdmin && (
          <button
            type="button"
            className="small"
            onClick={() => deleteHandler(order)}
          >
            Delete
          </button>
        )}
      </td>
    </tr>
  ))}
</tbody>
        </table>
      )}
    </div>
  );
}