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
import ShopkeeperInventory from './components/shopkeeper/ShopkeeperProducts/ShopkeeperInventory';
import ShopkeeperLowStock from './components/shopkeeper/ShopkeeperLowStock/ShopkeeperLowStock';
import ShopkeeperAddProduct from './components/shopkeeper/ShopkeeperAddProduct/ShopkeeperAddProduct';
import ShopkeeperProfile from './components/shopkeeper/ShopkeeperProfile/ShopkeeperProfile';
import ShopRegistration from './components/shopkeeper/ShopRegistration/ShopRegistration';
import GetNewRole from './components/LoginSignup/getNewRole/GetNewRole';
import NearShopNavBar from './components/customer/NearByShopSearchPage/NearShopNavBar/NearShopNavBar';
import MyCustomers from './components/shopkeeper/ShopkeeperCustomers/MyCustomers';
import DownloadApp from './components/DownloadApp/DownloadApp';
import ShopkeeperTopNav from './components/shopkeeper/ShopkeeperTopNav/ShopkeeperTopNav';


function App() {
  const userRole = localStorage.getItem('role');
  console.log(userRole);

  return (
    // <Router>
    <CustomerProvider>
      <Routes>

        {/* Protected route */}

        <Route
          path="/customer"
          element={
            <ProtectedRoute allowedRoles={[Roles.customer]}>
              <NearShopNavBar />
            </ProtectedRoute>
          }
        >
          <Route path="home" element={<NearShopSearchPage />} />
          <Route path="nearby-shops" element={<CustomerHome />} />
          <Route path="profile" element={<ProfilePage />} />
          <Route path="orders" element={<MyOrders />} />
          <Route path="notifications" element={<NotificationsPage />} />
          <Route path="visited-shops" element={<VisitedShops />} />
          <Route path="cart" element={<MyCart />} />
        </Route>
        {/* --------------------------------------------------------- */}



        <Route
          path="/shopkeeper"
          element={
            <ProtectedRoute allowedRoles={[Roles.shopkeeper]}>
              <ShopkeeperTopNav />
            </ProtectedRoute>
          }
        >
          <Route index element={<ShopkeeperDashboard />} />
          <Route path="dashboard" element={<ShopkeeperDashboard />} />
          <Route path="registration" element={<ShopRegistration />} />
          <Route path="profile" element={<ShopkeeperProfile />} />
          <Route path="orders" element={<ShopkeeperOrders />} />
          <Route path="inventory" element={<ShopkeeperInventory />} />
          <Route path="add-products" element={<ShopkeeperAddProduct />} />
          <Route path="stocks" element={<ShopkeeperLowStock />} />
          <Route path="mycustomers" element={<MyCustomers />} />
        </Route>


        {/* Public route */}
        <Route path="/" element={<Login />} />
        <Route path="/login" element={<Login />} />
        <Route path="/signup" element={<SignUp />} />
        <Route path="/getNewRole" element={<GetNewRole />} />



      </Routes>
      <DownloadApp></DownloadApp>
    </CustomerProvider>
    // </Router>
  );
}

export default App;
