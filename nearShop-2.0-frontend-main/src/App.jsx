import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import ProtectedRoute from './components/ProtectedRoutes/ProtectedRoute';
import HamburgerMenu from './components/Hamburgers/HamburgerMenu';
import Login from './components/LoginSignup/Login';
import SignUp from './components/LoginSignup/SignUp';
import { Roles } from './constants/Roles';
import { HOME_BY_ROLE } from './constants/HomeByRole';
import CustomerHome from './pages/customer/CustomerHome';
//---------------------------------------------------------------------------------------------
import ProfilePage from './components/customer/ProfilePage/ProfilePage';
import MyOrders from './components/customer/MyOrders/MyOrders';
import NearShopSearchPage from './components/customer/NearByShopSearchPage/NearShopSearchPage';
import NotificationsPage from './components/customer/NotificationsPage/NotificationsPage';
import VisitedShops from './components/customer/VisitedShops/VisitedShops';
import MyCart from './components/customer/MyCart/MyCart';
// TEMP: only for testing;

//customer context provider
import { CustomerProvider } from './components/customer/CustomerContext/CustomerContext';
import ShopkeeperDashboard from './components/shopkeeper/ShopkeeperDashboard/ShopkeeperDashboard';
import ShopkeeperOrders from './components/shopkeeper/ShopkeeperOrders/ShopkeeperOrders';
import  ShopkeeperInventory from './components/shopkeeper/ShopkeeperProducts/ShopkeeperInventory';
import ShopkeeperLowStock from './components/shopkeeper/ShopkeeperLowStock/ShopkeeperLowStock';
import ShopkeeperAddProduct from './components/shopkeeper/ShopkeeperAddProduct/ShopkeeperAddProduct';
import ShopkeeperProfile from './components/shopkeeper/ShopkeeperProfile/ShopkeeperProfile';
import ShopRegistration from './components/shopkeeper/ShopRegistration/ShopRegistration';
import GetNewRole from './components/LoginSignup/getNewRole/GetNewRole';
import NearShopNavBar from './components/customer/NearByShopSearchPage/NearShopNavBar/NearShopNavBar';


function App() {
  const userRole = localStorage.getItem('role');
  console.log(userRole);

  return (
    // <Router>
              <CustomerProvider>
      <Routes>

        {/* Protected route */}
        <Route path="/customer/home" element={
          <ProtectedRoute allowedRoles={[Roles.customer]}>
            <NearShopNavBar></NearShopNavBar>
            <NearShopSearchPage></NearShopSearchPage>
          </ProtectedRoute>
        }
        />

          <Route path="/customer/nearby-shops" element={
            <ProtectedRoute allowedRoles={[Roles.customer]}>
              {/* <CustomerProvider> */}
              <CustomerHome></CustomerHome>

            </ProtectedRoute>
          }
          />


        <Route path="/customer/profile" element={
          <ProtectedRoute allowedRoles={[Roles.customer]}>
            <NearShopNavBar></NearShopNavBar>
            <ProfilePage></ProfilePage>
          </ProtectedRoute>
        }
        />
        <Route path="/customer/orders" element={
          <ProtectedRoute allowedRoles={[Roles.customer]}>
            <NearShopNavBar></NearShopNavBar>
            <MyOrders></MyOrders>
          </ProtectedRoute>
        }
        />
        <Route path="/customer/notifications" element={
          <ProtectedRoute allowedRoles={[Roles.customer]}>
            <NearShopNavBar></NearShopNavBar>
            <NotificationsPage></NotificationsPage>
          </ProtectedRoute>
        }
        />

        <Route path="/customer/visited-shops" element={
          <ProtectedRoute allowedRoles={[Roles.customer]}>
            {/* <HamburgerMenu></HamburgerMenu> */}
            <NearShopNavBar></NearShopNavBar>
            <VisitedShops></VisitedShops>
          </ProtectedRoute>
        }
        />
        <Route path="/customer/cart" element={
          <ProtectedRoute allowedRoles={[Roles.customer]}>
            <NearShopNavBar></NearShopNavBar>
            <MyCart></MyCart>
          </ProtectedRoute>
        }
        />
        {/* --------------------------------------------------------- */}




        <Route path="/shopkeeper/dashboard" element={
          <ProtectedRoute allowedRoles={[Roles.shopkeeper]}>
            {/* <HamburgerMenu></HamburgerMenu> */}
             
            <ShopkeeperDashboard></ShopkeeperDashboard>
          </ProtectedRoute>
        }
        />
        <Route path="/shopkeeper/registration" element={
          <ProtectedRoute allowedRoles={[Roles.shopkeeper]}>
            {/* <HamburgerMenu></HamburgerMenu> */}
            <ShopRegistration></ShopRegistration>
          </ProtectedRoute>
        }
        />
        <Route path="/shopkeeper/profile" element={
          <ProtectedRoute allowedRoles={[Roles.shopkeeper]}>
            {/* <HamburgerMenu></HamburgerMenu> */}
            <ShopkeeperProfile></ShopkeeperProfile>
          </ProtectedRoute>
        }
        />
        <Route path="/shopkeeper/orders" element={
          <ProtectedRoute allowedRoles={[Roles.shopkeeper]}>
            {/* <HamburgerMenu></HamburgerMenu> */}
            <ShopkeeperOrders></ShopkeeperOrders>
          </ProtectedRoute>
        }
        />
        <Route path="/shopkeeper/inventory" element={
          <ProtectedRoute allowedRoles={[Roles.shopkeeper]}>
            {/* <HamburgerMenu></HamburgerMenu> */}
            <ShopkeeperInventory></ShopkeeperInventory>
          </ProtectedRoute>
        }
        />
        <Route path="/shopkeeper/add-products" element={
          <ProtectedRoute allowedRoles={[Roles.shopkeeper]}>
            {/* <HamburgerMenu></HamburgerMenu> */}
            <ShopkeeperAddProduct></ShopkeeperAddProduct>
          </ProtectedRoute>
        }
        />
        <Route path="/shopkeeper/stocks" element={
          <ProtectedRoute allowedRoles={[Roles.shopkeeper]}>
            {/* <HamburgerMenu></HamburgerMenu> */}
            <ShopkeeperLowStock></ShopkeeperLowStock>
          </ProtectedRoute>
        }
        />
        

        {/* Public route */}
        <Route path="/" element={<Login />} />
        <Route path="/login" element={<Login />} />
        <Route path="/signup" element={<SignUp />} />
        <Route path="/getNewRole" element={<GetNewRole />} />



      </Routes>
      </CustomerProvider>
    // </Router>
  );
}

export default App;
