# AI Integration for Streamlining RFQ Creation and Tender Document Summarization

## Objective
The goal of this project is to streamline the RFQ (Request for Quotation) creation process and summarize tender documents efficiently by utilizing AI-based features. The system enables users to upload a Bill of Quantities (BOQ) to generate an RFQ with structured data fields and to summarize tender documents (ranging from 200 to 1000 pages) into concise, actionable insights. Additionally, a Q&A feature allows users to ask questions based on the uploaded documents.

## Features
- **BOQ Upload**: Upload a Bill of Quantities to generate an RFQ with structured data fields:
  - Product Name
  - Product Specification with Description
  - Quantity
  - Unit
- **Tender Document Summarization**: Automatically summarize large tender documents (200–1000 pages) into a 2-page summary for quick review.
- **Q&A Feature**: Users can ask questions based on the uploaded tender document and receive AI-driven answers for clarification.

## Requirements

To run this project, ensure you have the following installed:
- **Node.js** (v16 or later)
- **npm** (v7 or later)

Additionally, install required dependencies:
- Frontend:
  - React.js
  - Axios (for API calls)
  - Recoil (state management)
- Backend (for AI-powered features):
  - Python (for AI integration via APIs)
  - Flask or Express (for serving backend endpoints)

## Functionalities

-1.Create RFQ from BOQ
    -This is implemented in two ways-
    -1.Genrating RFQ from a excel file conatining a list of BOQ
    -2.Generating RFQ in which the user fills all the details.

-2.Summarize Tenders
    -This is done to summasize the long tender uploaded by vendors.

-3.Chatbot based on Tenders Ideas
    -This is trained on the tender data recieved from the vendor and is able to answer any questions smoothly.
