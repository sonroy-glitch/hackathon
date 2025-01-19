import {atom} from "recoil"
export const vendorData=atom({
    key:'vendorData',
    default:{}
})
export const rfqData=atom({
    key:"rfqData",
    default:0
})
export const tenderLink=atom({
    key:"tenderLink",
    default:""
})
export const rfqHolder=atom({
    key:"rfqHolder",
    default:{}
})