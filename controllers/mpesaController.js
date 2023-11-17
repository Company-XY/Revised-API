import axios from "axios";
import asyncHandler from "express-async-handler";
import User from "../models/User.js";

export const createToken = asyncHandler(async (req, res, next) => {
  //const secret = "Wiym5053EiTCyMdl";
  const secret = "SD8CGogHh5IIClv7";
  //const consumer = "AfcrjyYGuCZ3HOA6UJUZ0foFIwKWbn8d";
  const consumer = "oMFwShZVPZ3CggbO6Anw4u2GIdIZI9G6";
  const auth = Buffer.from(`${consumer}:${secret}`).toString("base64");
  try {
    const { data } = await axios.get(
      "https://sandbox.safaricom.co.ke/oauth/v1/generate?grant_type=client_credentials",
      {
        headers: {
          authorization: `Basic ${auth}`,
        },
      }
    );
    req.token = data.access_token;
    next();
  } catch (err) {
    console.log(err);
    res.status(400).json(err);
  }
});

// STK Push Controller DEPOSITS
export const stkPush = asyncHandler(async (req, res) => {
  const { userId } = req.params;

  if (!userId) {
    return res.status(401).json({ message: "User ID not provided" });
  }

  const shortCode = 174379;
  const phone = req.body.phone.substring(1);
  const amount = req.body.amount;
  const passkey =
    "bfb279f9aa9bdbcf158e97dd71a467cd2e0c893059b10f78e6b72ada1ed2c919";
  const url = "https://sandbox.safaricom.co.ke/mpesa/stkpush/v1/processrequest";

  const date = new Date();
  const timestamp =
    date.getFullYear() +
    ("0" + (date.getMonth() + 1)).slice(-2) +
    ("0" + date.getDate()).slice(-2) +
    ("0" + date.getHours()).slice(-2) +
    ("0" + date.getMinutes()).slice(-2) +
    ("0" + date.getSeconds()).slice(-2);
  const password = new Buffer.from(shortCode + passkey + timestamp).toString(
    "base64"
  );
  const data = {
    BusinessShortCode: shortCode,
    Password: password,
    Timestamp: timestamp,
    TransactionType: "CustomerPayBillOnline",
    Amount: amount,
    PartyA: `254${phone}`,
    PartyB: shortCode,
    PhoneNumber: `254${phone}`,
    CallBackURL: "https://mydomain.com/callback",
    AccountReference: "Mpesa Test",
    TransactionDesc: "Testing stk push",
  };

  try {
    const response = await axios.post(url, data, {
      headers: {
        Authorization: `Bearer ${req.token}`,
      },
    });

    const { ResponseCode, ResponseDescription, CheckoutRequestID } =
      response.data;

    if (ResponseCode === "0") {
      res.status(200).json({
        message: "STK push successful",
        transactionID: CheckoutRequestID,
      });
    } else {
      res.status(400).json({
        message: "STK push failed",
        responseCode: ResponseCode,
        responseDescription: ResponseDescription,
      });
    }
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Error processing STK push request" });
  }
});

///=============================================================================================

export const checkTransactionStatus = async (req, res) => {
  const {
    ResultCode,
    ResultDesc,
    CheckoutRequestID,
    TransactionAmount,
    TransactionID,
    PhoneNumber,
  } = req.body;

  if (ResultCode === "0") {
    const transactionStatus = ResultDesc;
    const transactionID = TransactionID;
    const userID = PhoneNumber;

    const user = await User.findOne({ phone: userID });

    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    if (transactionStatus === "Transaction successful") {
      const amount = parseFloat(TransactionAmount);

      const newBalance = user.currentBalance + amount;
      user.currentBalance = newBalance;
      await user.save();

      console.log("User current balance updated:", newBalance);

      return res.status(200).json({
        message: "Transaction successful and user balance updated",
        transactionID,
      });
    } else {
      return res.status(400).json({
        message: "Transaction failed or incomplete",
        transactionStatus,
      });
    }
  } else {
    return res.status(401).json({ message: "Unauthorized request" });
  }
};

//WITHDRAW=======================================================================================

export const b2cWithdraw = asyncHandler(async (req, res) => {
  const { userId } = req.params;
  const { phone } = req.body;

  if (!userId) {
    return res.status(401).json({ message: "User ID not provided" });
  }

  const initiatorName = process.env.MPESA_INITIATOR_NAME;
  const securityCredential = process.env.MPESA_SECURITY_CREDENTIAL;
  const commandID = "AssistAfricaPayment";
  const amount = req.body.amount;
  const receiverParty = { phone };
  const remarks = "Withdrawal request";
  const timeoutURL = "https://mydomain.com/timeout";
  const resultURL = "https://mydomain.com/result";

  const url = "https://sandbox.safaricom.co.ke/mpesa/b2c/v1/paymentrequest";

  const data = {
    InitiatorName: initiatorName,
    SecurityCredential: securityCredential,
    CommandID: commandID,
    Amount: amount,
    PartyA: "BusinessShortCode",
    PartyB: receiverParty,
    Remarks: remarks,
    QueueTimeOutURL: timeoutURL,
    ResultURL: resultURL,
    Occasion: "Withdrawal",
  };

  try {
    const response = await axios.post(url, data, {
      headers: {
        Authorization: `Bearer ${req.token}`,
      },
    });

    if (response.data.ResponseCode === "0") {
      const user = await User.findById(userId);

      if (!user) {
        return res.status(404).json({ message: "User not found" });
      }

      const newBalance = user.accountBalance - parseFloat(amount);
      user.accountBalance = newBalance;
      await user.save();

      res.status(200).json({
        message: "B2C withdrawal request successful and user balance updated",
      });
    } else {
      res.status(400).json({
        message: "B2C withdrawal request failed",
        response: response.data,
      });
    }
  } catch (error) {
    console.error(error);
    res
      .status(500)
      .json({ message: "Error processing B2C withdrawal request" });
  }
});
