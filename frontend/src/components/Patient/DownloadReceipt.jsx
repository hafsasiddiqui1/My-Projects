import React, { useState, useEffect } from "react";
import { useParams } from "react-router-dom";
import { api } from "../../utils/api";

export default function DownloadReceipt() {
  const { id } = useParams();
  const [receipt, setReceipt] = useState(null);
  const [billing, setBilling] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchReceiptData = async () => {
      try {
        setLoading(true);
        // Assuming the backend provides an endpoint to get a single receipt by billing_id
        const receiptData = await api.get(`/receipts?billing_id=${id}`);
        if (receiptData && receiptData.length > 0) {
            setReceipt(receiptData[0]);
            // Also fetch the associated billing details
            const billingData = await api.get(`/billings?billing_id=${id}`);
             if (billingData && billingData.length > 0) {
                setBilling(billingData[0]);
             } else {
                setError("Billing details not found for this receipt.");
             }
        } else {
          setError("Receipt not found.");
        }
      } catch (err) {
        setError("Failed to fetch receipt data.");
      } finally {
        setLoading(false);
      }
    };

    fetchReceiptData();
  }, [id]);
  
  const handlePrint = () => {
    window.print();
  };

  if (loading) {
    return <div>Loading receipt...</div>;
  }

  if (error) {
    return <div className="text-red-500">{error}</div>;
  }
  
  if (!receipt || !billing) {
    return <div>Receipt or billing details not found.</div>;
  }


  return (
    <div className="container mx-auto p-4">
        <div className="bg-white p-6 rounded shadow-lg max-w-lg mx-auto" id="receipt">
            <h2 className="text-2xl font-bold mb-4 text-center">Receipt</h2>
            <div className="border-b pb-4 mb-4">
                <p><strong>Receipt Number:</strong> {receipt.receipt_number}</p>
                <p><strong>Payment Date:</strong> {new Date(receipt.payment_date).toLocaleString()}</p>
            </div>
            <div className="mb-4">
                <h3 className="font-semibold">Billing Details</h3>
                <p><strong>Description:</strong> {billing.services_description}</p>
                <p><strong>Amount:</strong> ${billing.amount.toFixed(2)}</p>
                <p><strong>Payment Method:</strong> {receipt.payment_method}</p>
                <p><strong>Status:</strong> <span className="font-bold text-green-600">Paid</span></p>
            </div>
            <div className="text-center mt-6">
                <p>Thank you for your payment!</p>
            </div>
        </div>
         <div className="text-center mt-6">
            <button 
              onClick={handlePrint} 
              className="px-6 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
            >
              Print Receipt
            </button>
        </div>
    </div>
  );
}
