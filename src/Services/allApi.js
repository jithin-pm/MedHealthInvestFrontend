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

// Verify Login OTP
export const verifyLoginOtpApi = async (data) => {
    return await commonApi("POST", "/api/auth/verify-login-otp", data, "");
};

// Forgot Password
export const forgotPasswordApi = async (data) => {
    return await commonApi("POST", "/api/auth/forgot-password", data, "");
};

// Reset Password
export const resetPasswordApi = async (data) => {
    return await commonApi("POST", "/api/auth/reset-password", data, "");
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

// Special Projects Endpoints
export const getUserSpecialProjectsApi = async (userId) => {
    return await commonApi("GET", `/api/special-projects/user/${userId}`, "", "");
};

export const getSpecialProjectByIdApi = async (id) => {
    return await commonApi("GET", `/api/special-projects/${id}`, "", "");
};

export const getUserSpecialInvestmentsApi = async (userId) => {
    return await commonApi("GET", `/api/special-payment/user-investments/${userId}`, "", "");
};

export const getSpecialPayoutScheduleApi = async (investmentId) => {
    return await commonApi("GET", `/api/special-payment/payout-schedule/${investmentId}`, "", "");
};

// Verify Bank Account
export const verifyBankApi = async (data) => {
    return await commonApi("POST", "/api/bank/verify-bank", data, "");
};
// Verify Identity (PAN)
export const verifyPanApi = async (data) => {
    return await commonApi("POST", "/api/pan/verify-pan", data, "");
};
// Verify Aadhaar
export const verifyAadharApi = async (data) => {
    return await commonApi("POST", "/api/aadhar/verify-aadhar", data, "");
};

// Extend Session
export const extendSessionApi = async () => {
    return await commonApi("POST", "/api/auth/extend-session", {}, "");
};

// Get Verification Status (PAN + Bank)
export const getVerificationStatusApi = async (userId) => {
    return await commonApi("GET", `/api/auth/verification-status/${userId}`, "", "");
};


export const getSpecialLedgerHistoryApi = async (investmentId) => { return await commonApi("GET", `/api/special-payment/ledger-history/${investmentId}`, "", ""); };
