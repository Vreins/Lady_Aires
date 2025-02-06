import React, { useEffect, useState } from 'react';
import CartScreen from './screens/CartScreen';
import HomeScreen from './screens/HomeScreen';
import ProductScreen from './screens/ProductScreen';
import RegisterScreen from './screens/RegisterScreen';
import AdminRoute from './components/AdminRoute';
import PrivateRoute from './components/PrivateRoute';
import VerifyScreen from './screens/VerifyScreen';
import PlaceOrderScreen from './screens/PlaceOrderScreen';
import OrderScreen from './screens/OrderScreen'
import OrderHistoryScreen from './screens/OrderHistoryScreen';
import ProfileScreen from './screens/ProfileScreen'
import ProductListScreen from './screens/ProductListScreen';
// import FridgeScreen from './screens/FridgeScreen';
import PaymentMethodScreen from './screens/PaymentMethodScreen';
import { useDispatch, useSelector } from 'react-redux';
import { Link, Route, Routes } from 'react-router-dom';
import { signout } from './actions/userActions';
import ShippingAddressScreen from './screens/ShippingAddressScreen';
import ProductEditScreen from './screens/ProductEditScreen';
import SigninScreen from './screens/SigninScreen';
import OrderListScreen from './screens/OrderListScreen';
import UserListScreen from './screens/UserListScreen';
import UserEditScreen from './screens/UserEditScreen';
import SellerRoute from './components/SellerRoute';
import SellerScreen from './screens/SellerScreen';
import SearchBox from './components/SearchBox';
import SearchScreen from './screens/SearchScreen';
import { listProductCategories } from './actions/productActions';
import LoadingBox from './components/LoadingBox';
import DashboardScreen from './screens/DashboardScreen';
import MessageBox from './components/MessageBox';
import { useLocation } from 'react-router-dom'; // Import useLocation


export default function App() {

const location = useLocation(); // Get current location

  // Define routes where the SearchBox should be visible
  const showSearchBox = 
    location.pathname === '/' || 
    location.pathname.startsWith('/search')
    //  || location.pathname.startsWith('/product');
  
    const showSidebar = 
    location.pathname === '/' || 
    location.pathname.startsWith('/search')
    //  || location.pathname.startsWith('/product');

  const saved=useSelector((state)=> state.saved)
  const {savedItems} = saved;
  const cart = useSelector((state) => state.cart);
  const [sidebarIsOpen, setSidebarIsOpen] = useState(false);
  const { cartItems } = cart;
  const userSignin = useSelector((state) => state.userSignin);
  const { userInfo } = userSignin;
  const dispatch = useDispatch();
  const signoutHandler = () => {
    dispatch(signout());
  };
  const productCategoryList = useSelector((state) => state.productCategoryList);
  const {
    loading: loadingCategories,
    error: errorCategories,
    categories,
  } = productCategoryList;
  useEffect(() => {
    dispatch(listProductCategories());
  }, [dispatch]);
  return (
      <div className="grid-container">
        <header className="row">
          <div>
          {showSidebar && (
          <button
              type="button"
              className="open-sidebar"
              onClick={() => setSidebarIsOpen(true)}
            >
              <i className="fa fa-bars"></i>
            </button>
          )}
          <Link className="brand" to="/">
              amazona
              </Link>
          </div>

          <div>{showSearchBox && <SearchBox />}</div>

          <div>
          <Link to="/cart">
              Cart/Saved
            {(cartItems.length > 0 || savedItems.length > 0) && (
              <span className="badge">
                {cartItems.length > 0 ? cartItems.length : savedItems.length}
              </span>
            )}
            </Link>
            {/* <Link to="/signin">Sign In</Link> */}
            {userInfo ? (
              <div className="dropdown">
                <Link to="#">
                  {userInfo.name} <i className="fa fa-caret-down"></i>{' '}
                </Link>
                <ul className="dropdown-content">
                <li>
                    <Link to="/profile">Update Profile</Link>
                  </li>

                <li>
                    <Link to="/orderhistory">Order History</Link>
                  </li>
                  <li>
                    <Link to="#signout" onClick={signoutHandler}>
                      Sign Out
                    </Link>
                  </li>
                </ul>
              </div>
            ) : (
              <Link to="/signin">Sign In</Link>
            )}
         {userInfo && userInfo.isSeller && (
              <div className="dropdown">
                <Link to="#admin">
                  Seller <i className="fa fa-caret-down"></i>
                </Link>
                <ul className="dropdown-content">
                  <li>
                    <Link to="/productlist/seller">Products</Link>
                  </li>
                  <li>
                    <Link to="/orderlist/seller">Orders</Link>
                  </li>
                </ul>
              </div>
            )}
        {userInfo && userInfo.isAdmin && (
              <div className="dropdown">
                <Link to="#admin">
                  Admin <i className="fa fa-caret-down"></i>
                </Link>
                <ul className="dropdown-content">
                  <li>
                    <Link to="/dashboard">Dashboard</Link>
                  </li>
                  <li>
                    <Link to="/productlist">Products</Link>
                  </li>
                  <li>
                    <Link to="/orderlist">Orders</Link>
                  </li>
                  <li>
                    <Link to="/userlist">Users</Link>
                  </li>
                </ul>
              </div>
            )}
          </div>
          </header>
          {showSidebar && (
            <aside className={sidebarIsOpen ? 'open' : ''}>
          <ul className="categories">
            <li>
              <strong>Categories</strong>
              <button
                onClick={() => setSidebarIsOpen(false)}
                className="close-sidebar"
                type="button"
              >
                <i className="fa fa-close"></i>
              </button>
            </li>
            {loadingCategories ? (
              <LoadingBox></LoadingBox>
            ) : errorCategories ? (
              <MessageBox variant="danger">{errorCategories}</MessageBox>
            ) : (
              categories.map((c) => (
                <li key={c}>
                  <Link
                    to={`/search/category/${c}`}
                    onClick={() => setSidebarIsOpen(false)}
                  >
                    {c}
                  </Link>
                </li>
              ))
            )}
          </ul>
        </aside>
          )}
        <main>
          <Routes>
          <Route path="/seller/:id" element={<SellerScreen/>}></Route>
          <Route path="/cart/:id?" element={<CartScreen/>}></Route>
            <Route path="/product/:id" element={<ProductScreen/>} exact></Route>  
            <Route path="/signin" element={<SigninScreen/>}></Route> 
            <Route path="/register" element={<RegisterScreen/>}></Route>
            <Route path="/shipping" element={<ShippingAddressScreen/>}></Route>
            <Route path="/payment" element={<PaymentMethodScreen/>}></Route>
            <Route path="/placeorder" element={<PlaceOrderScreen/>}></Route>
            <Route path="/order/:id" element={<OrderScreen/>}></Route>
            <Route path="/orderhistory" element={<OrderHistoryScreen/>}></Route>
            <Route
            path="/product/:id/edit"
            element={<ProductEditScreen/>}
            exact
          ></Route>

            <Route
            path="/productlist"
            element= {<AdminRoute>
            <ProductListScreen/>
          </AdminRoute>}
            exact/>

          <Route
            path="/userlist"
            element= {<AdminRoute>
            <UserListScreen/>
          </AdminRoute>}
          exact/>

          


          <Route
            path="/orderlist"
            element= {<AdminRoute>
            <OrderListScreen/>
          </AdminRoute>}
          exact/>

          <Route
            path="/user/:id/edit"
            element= {<AdminRoute>
            <UserEditScreen/>
          </AdminRoute>}
          />

          <Route
            path="/dashboard"
            element= {<AdminRoute>
            <DashboardScreen/>
          </AdminRoute>}
            exact/>
          <Route
             path="/productlist/seller"
            element= {<SellerRoute>
            <ProductListScreen/>
            </SellerRoute>}
          />

          <Route
             path="/orderlist/seller"
            element= {<SellerRoute>
            <OrderListScreen/>
            </SellerRoute>}
          />

          <Route path="/search/name" element={<SearchScreen />} exact></Route>
            <Route
              path="/search/name/:name"
              element={<SearchScreen />}
              exact
            ></Route>
            <Route
              path="/search/category/:category"
              element={<SearchScreen />}
              exact
            ></Route>
            <Route
              path="/search/category/:category/name/:name"
              element={<SearchScreen />}
              exact
            ></Route>
            <Route
              path="/search/category/:category/name/:name/min/:min/max/:max/rating/:rating/order/:order"
              element={<SearchScreen />}
              exact
            ></Route>

            <Route
              path="/profile"
              element={
                <PrivateRoute>
                  <ProfileScreen />
                </PrivateRoute>
              }
            />
            <Route path="/users/:id/verify/:token" element={<VerifyScreen/>}></Route>
            <Route path="/" element={<HomeScreen/>} exact></Route>
            
          </Routes>
        </main>
        <footer className="row center">All right reserved</footer>
      </div>
  )
}

// export default App;