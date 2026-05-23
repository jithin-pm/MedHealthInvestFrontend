import { commonApi } from "./CommonApi";
import { BASE_URL } from "./baseUrl";

// User Registration
export const registerUserApi = async (data) => {
    return await commonApi("POST", "/api/auth/register", data, "");
};

// User Login
export const loginUserApi = async (data) => {
    return await commonApi("POST", "/api/auth/login", data, "");
};

// Save Enquiry
export const saveEnquiryApi = async (data) => {
    return await commonApi("POST", "/api/enquiry", data, "");
};

// Get Chat Messages
export const getChatMessagesApi = async (userId) => {
    return await commonApi("GET", `/api/chat/messages/${userId}`, "", "");
};

// Upload Chat File
export const uploadChatFileApi = async (reqBody, reqHeader) => {
    return await commonApi("POST", "/api/chat/upload", reqBody, reqHeader);
};

// Delete Chat Message
export const deleteChatMessageApi = async (messageId) => {
    return await commonApi("DELETE", `/api/chat/messages/${messageId}`, "", "");
};

// Get Unread Message Count
export const getUnreadCountApi = async (userId) => {
    return await commonApi("GET", `/api/chat/unread-count/${userId}`, "", "");
};

// Get All Projects
export const getAllProjectsApi = async (userId) => {
    const url = userId ? `/api/project/all?userId=${userId}` : "/api/project/all";
    return await commonApi("GET", url, "", "");
};

// Create Razorpay Payment Order
export const createPaymentOrderApi = async (data) => {
    return await commonApi("POST", "/api/payment/create-order", data, "");
};

// Verify Razorpay Payment
export const verifyPaymentApi = async (data) => {
    return await commonApi("POST", "/api/payment/verify", data, "");
};

// Get User Investment History
export const getUserInvestmentsApi = async (userId) => {
    return await commonApi("GET", `/api/payment/user-investments/${userId}`, "", "");
};

// Verify Bank Account
export const verifyBankApi = async (data) => {
    return await commonApi("POST", "/api/bank/verify-bank", data, "");
};
// Verify Identity (PAN)
export const verifyPanApi = async (data) => {
    return await commonApi("POST", "/api/pan/verify-pan", data, "");
};

// Extend Session
export const extendSessionApi = async () => {
    return await commonApi("POST", "/api/auth/extend-session", {}, "");
};

// Get Verification Status (PAN + Bank)
export const getVerificationStatusApi = async (userId) => {
    return await commonApi("GET", `/api/auth/verification-status/${userId}`, "", "");
};

