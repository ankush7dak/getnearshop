import React from "react";
import HamburgerMenu from "../../components/Hamburgers/HamburgerMenu";

//----------------------------------------------------------------------------------

import NavBar from "../../components/customer/Navbar/NavBar";
import ProductCardContainer from "../../components/customer/CustomerProductCardContainer/ProductCardContainer";
import CategoryScroller from "../../components/customer/CategoryScroller/CategoryScroller";
import { useCustomer } from "../../components/customer/CustomerContext/CustomerContext";

const CustomerHome = () => {
  const {shopDetails} = useCustomer();
  return (
    <>
      {/* {shopDetails && <div className="selected-shop-name">{shopDetails.name}</div>} */}
      {/* <HamburgerMenu /> */}
      {<NavBar data = {shopDetails}/>}
      <CategoryScroller data = {shopDetails}></CategoryScroller>
      <ProductCardContainer data = {shopDetails}></ProductCardContainer>
    </>
  );
};

export default CustomerHome;
