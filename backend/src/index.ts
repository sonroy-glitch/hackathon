import express, { Request, Response,NextFunction } from "express";
import cors from "cors";
import axios from "axios";
import multer from "multer";
import {v4 as uuid} from 'uuid'
import pdfParse from "pdf-parse";
import{z} from "zod"
import bcrypt from "bcryptjs";
import jwt,{JwtPayload} from "jsonwebtoken"
import { PrismaClient } from "@prisma/client";
const prisma = new PrismaClient();
import { GoogleGenerativeAI } from "@google/generative-ai";
import multerStorageCloudinary from "multer-storage-cloudinary";
import { v2 as cloudinary } from "cloudinary";
const genAI = new GoogleGenerativeAI(process.env.AI_URL);
const jwtSecret=process.env.jwt_Secret
const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });
const app = express();
const httpServer = app.listen(3000);
const storage = multer.memoryStorage();
const upload = multer({ storage });

app.use(cors());
app.use(express.json());
//you get the bill of quantittes from the user in json format and feeds the data into the api
//requires vendor name , buyers name , company name and contact info
app.post("/rfqGenerator", async (req: Request, res: Response): Promise<any> => {
  const body = req.body.rfqData;
  const rfqToken=uuid();
  const question = `Create an RFQ for Vendor: ${body.vendor}, Buyer: ${body.buyer.name} (Company: ${body.buyer.company}, Contact: ${body.buyer.contact}, Email: ${body.buyer.email}), Delivery Address: ${body.deliveryAddress}, Delivery Deadline: ${body.deliveryDeadline}, Quotation Deadline: ${body.quotationDeadline}, Payment Terms: ${body.paymentTerms}, RFQ ID: ${rfqToken}. Include the following Bill of Quantities (BoQ) with serial numbers, where each item is on a new line in the format: "1. Product Name: [name] - Description: [description] - Quantity: [quantity]": ${JSON.stringify(body.boq)}.`;

  const result = await model.generateContent([question]);
  var answer = result.response.text();
  return res.status(200).json({
    answer,
  });
});
app.post("/summarize", async (req: Request, res: Response): Promise<any> => {
  const url = req.body.url;
  if (!url) {
    return res.status(400).send("No URL provided");
  }
  try {
    const response = await axios.get(url, { responseType: "arraybuffer" });

    // console.log(stringData);
    if (response.headers["content-type"] !== "application/pdf") {
      return res.status(400).send("The file is not a valid PDF.");
    }

    const pdfData = await pdfParse(response.data);

    const extractedText = pdfData.text;
    const query = `Summarise the given tender document into not more than 2 pages. The doument is ${extractedText}`;
    const result = await model.generateContent([query]);
    var summary = result.response.text();

    res.json({ summary });
  } catch (error: any) {
    console.error("Error processing the PDF:", error.message);
    res.status(500).send("Error processing the PDF");
  }
});
//ai chatbot
app.post("/qaaFeature", async (req: Request, res: Response): Promise<any> => {
    const {question,url}=req.body;
    try {
        const response = await axios.get(url, { responseType: "arraybuffer" });
    
        // console.log(stringData);
        if (response.headers["content-type"] !== "application/pdf") {
          return res.status(400).send("The file is not a valid PDF.");
        }
    
        const pdfData = await pdfParse(response.data);
    
        const extractedText = pdfData.text;
      const query=`On basis of this data :${extractedText}. Answer the question ${question}.Answers should sound about like an AI Chatbot`
      const result = await model.generateContent([query]);
      var answer = result.response.text();
      res.status(200).json({answer});
    } catch (error:any) {
      console.log("Error with the data "+error.message);
      res.status(202).send(`Error rendering the data ${error.message}`)
    }
   
  });
//signin , signup as buyer or seller , 
app.post("/signup",async(req:Request,res:Response):Promise<any>=>{
  const body:{
   name:string,
   email:string,
   password:string,
   organisationName:string,
   phoneNumber:string,
   type:string
  }=req.body;
  const schema = z.object({
    name:z.string(),
   email:z.string().email(),
   password:z.string().min(8),
   organisationName:z.string(),
   phoneNumber:z.string(),
   type:z.string()
  })
  var check = schema.safeParse(body);
  // console.log(check)
  if(check.success){
    if(body.type=="vendor"){
      var user= await prisma.vendor.findFirst({
        where:{email:body.email}
      })
      if(!user){
        var hashedPassword = await bcrypt.hash(body.password, 10);
        var populate= await prisma.vendor.create({
          data:{
            name:body.name,
            email:body.email,
            about:"",
            password:hashedPassword,
            organisationName:body.organisationName,
            phoneNumber:body.phoneNumber
          }
        })  
        const token = jwt.sign({id:populate.id,type:body.type},jwtSecret)
        res.status(200).json({token:token,type:body.type})
      }else{
        res.status(202).send("User already exists.Signin")
      }
      
    
     }
     else if ( body.type=="buyer"){
      var user1= await prisma.buyer.findFirst({
        where:{email:body.email}
      })
      if(!user1){
        var hashedPassword = await bcrypt.hash(body.password, 10);
        var populate1= await prisma.buyer.create({
          data:{
            name:body.name,
            email:body.email,
            password:hashedPassword,
            organisationName:body.organisationName,
            phoneNumber:body.phoneNumber
          }
        })  
        const token = jwt.sign({id:populate1.id,type:body.type},jwtSecret)
        res.status(200).json({token:token,type:body.type})
      }else{
        res.status(202).send("User already exists.Signin")
      }
     }
    else{
      res.status(202).send("Somthing is up with the server");
    }
  }
  else{
    res.status(202).send("Zod validation Error")
  }
 })
 app.post("/signin",async(req:Request,res:Response):Promise<any>=>{
  const body:{email:string,password:string,type:string}=req.body;
  const schema= z.object({
    email:z.string().email(),
    password:z.string().min(8),
    type:z.string()
  })
  const check = schema.safeParse(body);

  if(check.success){
    var data;
     if(body.type=="buyer"){
       data =await prisma.buyer.findFirst({
        where:{email:body.email},
        select:{
          id:true,
          name:true,
          email:true,
          password:true,
          organisationName:true,
          phoneNumber:true,
          rfq:true,
          tender:true
        }
      })
     }
     else if (body.type=="vendor"){
      data =await prisma.vendor.findFirst({
        where:{email:body.email},
        select:{
          id:true,
          name:true,
          email:true,
          password:true,
          organisationName:true,
          phoneNumber:true,
          rfq:true,
          tender:true
        }
      })
     }
     if(data){
     const password= await bcrypt.compare(body.password,data.password)
      if(password){
        const token = jwt.sign({id:data.id,type:body.type},jwtSecret);
        res.status(200).send({token:token,type:body.type})
     }
     else{
      res.status(202).send("Wrong Password")
     }
     }
     else{
      res.status(202).send("User doesnt exist.Signup")
     }
     
  }
  else{
    res.status(202).send("Zod Validation Error")
  }
 })
 async function auth(req:Request,res:Response,next:NextFunction){
  const token = String(req.headers.token);
  const data= jwt.verify(token,jwtSecret) as JwtPayload;
  if(data.id){
    next();
  }
  else{
     res.status(202).send("Authentication Error")
  }
 }
 app.get("/verify",async(req:Request,res:Response):Promise<any>=>{
  const token = String(req.headers.token);
  if(token){
  const data= jwt.verify(token,jwtSecret) as JwtPayload;
  // console.log(data)
  if(data.id){
    if(data.type=="buyer"){
      const user=await prisma.buyer.findFirst({
        where:{id:data.id},
        select:{
          id:true,
          name:true,
          email:true,
          password:true,
          organisationName:true,
          phoneNumber:true,
          rfq:{
            select:{
             rfq:true,
             vendor:{
              select:{
                name:true,
                email:true,
                about:true,
                organisationName:true,
                phoneNumber:true
              }
             }
            }
          },
          tender:{
            select:{
              tender:true,
            vendor:{
             select:{
               name:true,
               email:true,
               about:true,
               organisationName:true,
               phoneNumber:true
             }
            }
            }
            
          }
        }
      })
      res.status(200).json({user})
    }
    else if(data.type=="vendor"){
      const user=await prisma.vendor.findFirst({
        where:{id:data.id},
        select:{
          id:true,
          name:true,
          email:true,
          about:true,
          password:true,
          organisationName:true,
          phoneNumber:true,
          rfq:{
            select:{
              id:true,
             rfq:true,
             buyer:{
              select:{
                id:true,
                name:true,
                email:true,
                organisationName:true,
                phoneNumber:true
              }
             }
            }
          },
          tender:{
            
            select:{
              rfqId:true,
              tender:true,
              buyer:{
               select:{
                 name:true,
                 email:true,
                 organisationName:true,
                 phoneNumber:true
               }
              }
            }
           
          }
          
          
        }
      })
      res.status(200).json({user})
    }
  }
  else{
     res.status(202).send("Authentication Error")
  }
}
 })
 //upload rfq to the db with the vendorId and buyerId populated
 app.post("/rfq",auth,async(req:Request,res:Response):Promise<any>=>{
  // console.log("hi")
  const body:{
    rfqData:string,
    buyerId:number,
    vendorId:number
  }=req.body;
  try {
    const data=  await prisma.rfq.create({
      data:{
        rfq:body.rfqData,
        buyerId:body.buyerId,
        vendorId:body.vendorId
      }
     
   })
   res.status(200).send("Data populated successfully")
  } catch (error:any) {
    res.status(202).json({error:error.message})
  }
    
 })
 //send a list of all the vendors
 app.get("/sendVendors",async(req:Request,res:Response):Promise<any>=>{
   const data = await prisma.vendor.findMany({
    select:{
      id:true,
      name:true,
      about:true,
  email :true,
  organisationName:true,
  phoneNumber:true
    }
   })
   res.status(200).json({data})
 })
 app.post("/tender",auth,async(req:Request,res:Response):Promise<any>=>{
   const body:{
    tenderLink:string,
    buyerId:number,
    vendorId:number,
    rfqId:number
   }=req.body;
   try {
    const data = await prisma.tender.create({
      data:{
        tender:body.tenderLink,
        buyerId:body.buyerId,
        vendorId:body.vendorId,
        rfqId:body.rfqId
      }
    })
   res.status(200).send("Data populated successfully")

   } catch (error:any) {
    res.status(202).json({error:error.message})
   }
 })
 //send rfq data after auth middleware
 app.get("/getRfq",auth,async(req:Request,res:Response):Promise<any>=>{
   const {rfqId}=req.body;
   const data = await prisma.rfq.findFirst({
    where:{id:rfqId}
   })
   if(data){
    res.status(200).json({data})
   }
 })
 //update the about of the vendor
app.post("/about",auth,async(req:Request,res:Response):Promise<any>=>{
  var {about}=req.body;
  var token= String(req.headers.token);

  var data = jwt.verify(token,jwtSecret)as JwtPayload;
  if(data){
    try {
      const load = await prisma.vendor.update({
        where:{id:data.id},
        data:{about}
       })
       res.status(200).send("About Updated Successfully")
    } catch (error:any) {
      res.status(202).json({error:error.message})
    }
   
   
  }
  else{
    res.status(202).send('Vendor not found')
  }
})