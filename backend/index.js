"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const cors_1 = __importDefault(require("cors"));
const axios_1 = __importDefault(require("axios"));
const multer_1 = __importDefault(require("multer"));
const uuid_1 = require("uuid");
const pdf_parse_1 = __importDefault(require("pdf-parse"));
const zod_1 = require("zod");
const bcryptjs_1 = __importDefault(require("bcryptjs"));
const jsonwebtoken_1 = __importDefault(require("jsonwebtoken"));
const client_1 = require("@prisma/client");
const prisma = new client_1.PrismaClient();
const generative_ai_1 = require("@google/generative-ai");
const genAI = new generative_ai_1.GoogleGenerativeAI(process.env.AI_URL);
const jwtSecret = process.env.jwt_Secret;
const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });
const app = (0, express_1.default)();
const httpServer = app.listen(3000);
const storage = multer_1.default.memoryStorage();
const upload = (0, multer_1.default)({ storage });
app.use((0, cors_1.default)());
app.use(express_1.default.json());
//you get the bill of quantittes from the user in json format and feeds the data into the api
//requires vendor name , buyers name , company name and contact info
app.post("/rfqGenerator", (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const body = req.body.rfqData;
    const rfqToken = (0, uuid_1.v4)();
    const question = `Create an RFQ for Vendor: ${body.vendor}, Buyer: ${body.buyer.name} (Company: ${body.buyer.company}, Contact: ${body.buyer.contact}, Email: ${body.buyer.email}), Delivery Address: ${body.deliveryAddress}, Delivery Deadline: ${body.deliveryDeadline}, Quotation Deadline: ${body.quotationDeadline}, Payment Terms: ${body.paymentTerms}, RFQ ID: ${rfqToken}. Include the following Bill of Quantities (BoQ) with serial numbers, where each item is on a new line in the format: "1. Product Name: [name] - Description: [description] - Quantity: [quantity]": ${JSON.stringify(body.boq)}.`;
    const result = yield model.generateContent([question]);
    var answer = result.response.text();
    return res.status(200).json({
        answer,
    });
}));
app.post("/summarize", (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const url = req.body.url;
    if (!url) {
        return res.status(400).send("No URL provided");
    }
    try {
        const response = yield axios_1.default.get(url, { responseType: "arraybuffer" });
        // console.log(stringData);
        if (response.headers["content-type"] !== "application/pdf") {
            return res.status(400).send("The file is not a valid PDF.");
        }
        const pdfData = yield (0, pdf_parse_1.default)(response.data);
        const extractedText = pdfData.text;
        const query = `Summarise the given tender document into not more than 2 pages. The doument is ${extractedText}`;
        const result = yield model.generateContent([query]);
        var summary = result.response.text();
        res.json({ summary });
    }
    catch (error) {
        console.error("Error processing the PDF:", error.message);
        res.status(500).send("Error processing the PDF");
    }
}));
//ai chatbot
app.post("/qaaFeature", (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const { question, url } = req.body;
    try {
        const response = yield axios_1.default.get(url, { responseType: "arraybuffer" });
        // console.log(stringData);
        if (response.headers["content-type"] !== "application/pdf") {
            return res.status(400).send("The file is not a valid PDF.");
        }
        const pdfData = yield (0, pdf_parse_1.default)(response.data);
        const extractedText = pdfData.text;
        const query = `On basis of this data :${extractedText}. Answer the question ${question}.Answers should sound about like an AI Chatbot`;
        const result = yield model.generateContent([query]);
        var answer = result.response.text();
        res.status(200).json({ answer });
    }
    catch (error) {
        console.log("Error with the data " + error.message);
        res.status(202).send(`Error rendering the data ${error.message}`);
    }
}));
//signin , signup as buyer or seller , 
app.post("/signup", (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const body = req.body;
    const schema = zod_1.z.object({
        name: zod_1.z.string(),
        email: zod_1.z.string().email(),
        password: zod_1.z.string().min(8),
        organisationName: zod_1.z.string(),
        phoneNumber: zod_1.z.string(),
        type: zod_1.z.string()
    });
    var check = schema.safeParse(body);
    // console.log(check)
    if (check.success) {
        if (body.type == "vendor") {
            var user = yield prisma.vendor.findFirst({
                where: { email: body.email }
            });
            if (!user) {
                var hashedPassword = yield bcryptjs_1.default.hash(body.password, 10);
                var populate = yield prisma.vendor.create({
                    data: {
                        name: body.name,
                        email: body.email,
                        about: "",
                        password: hashedPassword,
                        organisationName: body.organisationName,
                        phoneNumber: body.phoneNumber
                    }
                });
                const token = jsonwebtoken_1.default.sign({ id: populate.id, type: body.type }, jwtSecret);
                res.status(200).json({ token: token, type: body.type });
            }
            else {
                res.status(202).send("User already exists.Signin");
            }
        }
        else if (body.type == "buyer") {
            var user1 = yield prisma.buyer.findFirst({
                where: { email: body.email }
            });
            if (!user1) {
                var hashedPassword = yield bcryptjs_1.default.hash(body.password, 10);
                var populate1 = yield prisma.buyer.create({
                    data: {
                        name: body.name,
                        email: body.email,
                        password: hashedPassword,
                        organisationName: body.organisationName,
                        phoneNumber: body.phoneNumber
                    }
                });
                const token = jsonwebtoken_1.default.sign({ id: populate1.id, type: body.type }, jwtSecret);
                res.status(200).json({ token: token, type: body.type });
            }
            else {
                res.status(202).send("User already exists.Signin");
            }
        }
        else {
            res.status(202).send("Somthing is up with the server");
        }
    }
    else {
        res.status(202).send("Zod validation Error");
    }
}));
app.post("/signin", (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const body = req.body;
    const schema = zod_1.z.object({
        email: zod_1.z.string().email(),
        password: zod_1.z.string().min(8),
        type: zod_1.z.string()
    });
    const check = schema.safeParse(body);
    if (check.success) {
        var data;
        if (body.type == "buyer") {
            data = yield prisma.buyer.findFirst({
                where: { email: body.email },
                select: {
                    id: true,
                    name: true,
                    email: true,
                    password: true,
                    organisationName: true,
                    phoneNumber: true,
                    rfq: true,
                    tender: true
                }
            });
        }
        else if (body.type == "vendor") {
            data = yield prisma.vendor.findFirst({
                where: { email: body.email },
                select: {
                    id: true,
                    name: true,
                    email: true,
                    password: true,
                    organisationName: true,
                    phoneNumber: true,
                    rfq: true,
                    tender: true
                }
            });
        }
        if (data) {
            const password = yield bcryptjs_1.default.compare(body.password, data.password);
            if (password) {
                const token = jsonwebtoken_1.default.sign({ id: data.id, type: body.type }, jwtSecret);
                res.status(200).send({ token: token, type: body.type });
            }
            else {
                res.status(202).send("Wrong Password");
            }
        }
        else {
            res.status(202).send("User doesnt exist.Signup");
        }
    }
    else {
        res.status(202).send("Zod Validation Error");
    }
}));
function auth(req, res, next) {
    return __awaiter(this, void 0, void 0, function* () {
        const token = String(req.headers.token);
        const data = jsonwebtoken_1.default.verify(token, jwtSecret);
        if (data.id) {
            next();
        }
        else {
            res.status(202).send("Authentication Error");
        }
    });
}
app.get("/verify", (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const token = String(req.headers.token);
    if (token) {
        const data = jsonwebtoken_1.default.verify(token, jwtSecret);
        // console.log(data)
        if (data.id) {
            if (data.type == "buyer") {
                const user = yield prisma.buyer.findFirst({
                    where: { id: data.id },
                    select: {
                        id: true,
                        name: true,
                        email: true,
                        password: true,
                        organisationName: true,
                        phoneNumber: true,
                        rfq: {
                            select: {
                                rfq: true,
                                vendor: {
                                    select: {
                                        name: true,
                                        email: true,
                                        about: true,
                                        organisationName: true,
                                        phoneNumber: true
                                    }
                                }
                            }
                        },
                        tender: {
                            select: {
                                tender: true,
                                vendor: {
                                    select: {
                                        name: true,
                                        email: true,
                                        about: true,
                                        organisationName: true,
                                        phoneNumber: true
                                    }
                                }
                            }
                        }
                    }
                });
                res.status(200).json({ user });
            }
            else if (data.type == "vendor") {
                const user = yield prisma.vendor.findFirst({
                    where: { id: data.id },
                    select: {
                        id: true,
                        name: true,
                        email: true,
                        about: true,
                        password: true,
                        organisationName: true,
                        phoneNumber: true,
                        rfq: {
                            select: {
                                id: true,
                                rfq: true,
                                buyer: {
                                    select: {
                                        id: true,
                                        name: true,
                                        email: true,
                                        organisationName: true,
                                        phoneNumber: true
                                    }
                                }
                            }
                        },
                        tender: {
                            select: {
                                rfqId: true,
                                tender: true,
                                buyer: {
                                    select: {
                                        name: true,
                                        email: true,
                                        organisationName: true,
                                        phoneNumber: true
                                    }
                                }
                            }
                        }
                    }
                });
                res.status(200).json({ user });
            }
        }
        else {
            res.status(202).send("Authentication Error");
        }
    }
}));
//upload rfq to the db with the vendorId and buyerId populated
app.post("/rfq", auth, (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    // console.log("hi")
    const body = req.body;
    try {
        const data = yield prisma.rfq.create({
            data: {
                rfq: body.rfqData,
                buyerId: body.buyerId,
                vendorId: body.vendorId
            }
        });
        res.status(200).send("Data populated successfully");
    }
    catch (error) {
        res.status(202).json({ error: error.message });
    }
}));
//send a list of all the vendors
app.get("/sendVendors", (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const data = yield prisma.vendor.findMany({
        select: {
            id: true,
            name: true,
            about: true,
            email: true,
            organisationName: true,
            phoneNumber: true
        }
    });
    res.status(200).json({ data });
}));
app.post("/tender", auth, (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const body = req.body;
    try {
        const data = yield prisma.tender.create({
            data: {
                tender: body.tenderLink,
                buyerId: body.buyerId,
                vendorId: body.vendorId,
                rfqId: body.rfqId
            }
        });
        res.status(200).send("Data populated successfully");
    }
    catch (error) {
        res.status(202).json({ error: error.message });
    }
}));
//send rfq data after auth middleware
app.get("/getRfq", auth, (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const { rfqId } = req.body;
    const data = yield prisma.rfq.findFirst({
        where: { id: rfqId }
    });
    if (data) {
        res.status(200).json({ data });
    }
}));
//update the about of the vendor
app.post("/about", auth, (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    var { about } = req.body;
    var token = String(req.headers.token);
    var data = jsonwebtoken_1.default.verify(token, jwtSecret);
    if (data) {
        try {
            const load = yield prisma.vendor.update({
                where: { id: data.id },
                data: { about }
            });
            res.status(200).send("About Updated Successfully");
        }
        catch (error) {
            res.status(202).json({ error: error.message });
        }
    }
    else {
        res.status(202).send('Vendor not found');
    }
}));
