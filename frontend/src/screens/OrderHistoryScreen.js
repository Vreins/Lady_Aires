import React, { useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { listOrderMine } from '../actions/orderActions';
import LoadingBox from '../components/LoadingBox';
import MessageBox from '../components/MessageBox';
import { useNavigate } from 'react-router-dom';
import { Link } from 'react-router-dom';
export default function OrderHistoryScreen(props) {
  const orderMineList = useSelector((state) => state.orderMineList);
  const { loading, error, orders } = orderMineList;
  const dispatch = useDispatch();
  const Navigate= useNavigate()

  console.log(orders)
  useEffect(() => {
    dispatch(listOrderMine());
  }, [dispatch]);
  return (
    <div>
      <h1>Order History</h1>
      {loading ? (
        <LoadingBox></LoadingBox>
      ) : error ? (
        <MessageBox variant="danger">{error}</MessageBox>
      ) : (
        <table className="table">
          <thead>
            <tr>
              <th>ORDER_ID</th>
              <th>Products</th>
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
                <td>
  {order.orderItems.map((item) => (
    <ul key={item.product?._id || item.product?.id || item.product?.slug || item.name}>
      <div className="min-30">
        <Link to={`/product/${item.product?._id || item.product?.id || item.product?.slug}`}>
          {item.name}
        </Link>
      </div>
    </ul>
  ))}
</td>
                        <td>
  {order.orderItems.map((item) => (
    <ul key={item.product?.seller?._id || item.product?.seller?.seller?.id || item.name}>
      <div className="min-30">
        {item.product?.seller?.seller?.name ? (
          <Link to={`/seller/${item.product.seller._id}`}>
            {item.product.seller.seller.name}
          </Link>
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
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      )}
    </div>
  );
}