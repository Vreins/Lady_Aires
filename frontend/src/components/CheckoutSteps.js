import React from 'react';
import { Link } from 'react-router-dom';
import { useDispatch } from 'react-redux';
import { signout } from '../actions/userActions';

export default function CheckoutSteps(props) {

const dispatch = useDispatch();
const signoutHandler = () => {
    dispatch(signout());
  };
  return (
    <div className="row checkout-steps">
      <div className={props.step1 ? 'active' : ''}>
      <Link to="#signout" onClick={signoutHandler}>Sign in</Link>

    </div>
      <div className={props.step2 ? 'active' : ''}><Link to="/shipping">Shipping</Link>
      </div>
      <div className={props.step3 ? 'active' : ''}><Link to="/payment">Payment</Link></div>
      <div className={props.step4 ? 'active' : ''}><Link to="/placeorder">Place Order</Link></div>
    </div>
  );
}