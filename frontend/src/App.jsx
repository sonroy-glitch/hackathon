import React from 'react'
import {Route,Routes} from "react-router-dom"
import Rfq from "./screens/Rfq"
import Home from "./screens/Home"
import TenderUpload from "./screens/TenderUpload"
import TenderView from "./screens/TenderView"
import Dashboard from "./screens/Dashboard"
import DisplayRfq from "./screens/DisplayRfq"
import RfqGeneratorEx from "./screens/RfqGeneratorEx"
import DisplayTenders from "./screens/DisplayTenders"
import VendorDisp from "./screens/VendorDisp"
import About from "./screens/About"
const App = () => {
  return (
    <div>
<Routes>
  <Route path="/" element={<Home/>}/>
  <Route path="/rfqGenerator" element={<Rfq/>}/>
  <Route path="/seller/tenderUpload" element={<TenderUpload/>}/>
  <Route path="/buyer/tenderView" element={<TenderView/>}/>
  <Route path="/dashboard" element={<Dashboard/>}/>
  <Route path="/displayRfq" element={<DisplayRfq/>}/>
  <Route path="/rfqGeneratorEx" element={<RfqGeneratorEx/>}/>
  <Route path="/displayTenders" element={<DisplayTenders/>}/>
  <Route path="/seller/vendorDisp" element={<VendorDisp/>}/>
  <Route path="/updateAbout" element={<About/>}/>
</Routes>
    </div>
  )
}

export default App