import React, { useState, useEffect } from "react";
import { api } from "../../utils/api";
import { useAuth } from "../../context/AuthContext";
import { Link } from "react-router-dom";

export default function ViewBilling() {
  const [billings, setBillings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const { user } = useAuth();

  useEffect(() => {
    if (user) {
      fetchBillings();
    }
  }, [user]);

  const fetchBillings = async () => {
    try {
      setLoading(true);
      const data = await api.get("/billings");
      setBillings(data);
    } catch (err) {
      setError("Failed to fetch billing information.");
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return <div>Loading billing history...</div>;
  }

  if (error) {
    return <div className="text-red-500">{error}</div>;
  }

  return (
    <div className="container mx-auto p-4">
      <h2 className="text-2xl font-semibold mb-4">My Billing History</h2>
      <div className="bg-white p-4 rounded shadow">
        {billings.length > 0 ? (
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Date</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Description</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Amount</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Status</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Actions</th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {billings.map((bill) => (
                <tr key={bill.billing_id}>
                  <td className="px-6 py-4 whitespace-nowrap">{new Date(bill.billing_date).toLocaleDateString()}</td>
                  <td className="px-6 py-4">{bill.services_description}</td>
                  <td className="px-6 py-4">${bill.amount.toFixed(2)}</td>
                  <td className="px-6 py-4">
                    <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${
                      bill.payment_status === 'Paid' ? 'bg-green-100 text-green-800' :
                      bill.payment_status === 'Pending' ? 'bg-yellow-100 text-yellow-800' :
                      'bg-red-100 text-red-800'
                    }`}>
                      {bill.payment_status}
                    </span>
                  </td>
                  <td className="px-6 py-4">
                    {bill.payment_status === 'Paid' ? (
                      <Link to={`/patient/receipt/${bill.billing_id}`} className="text-blue-600 hover:underline">View Receipt</Link>
                    ) : (
                      <button className="text-green-600 hover:underline">Pay Now</button>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        ) : (
          <p>You have no billing history.</p>
        )}
      </div>
    </div>
  );
}
