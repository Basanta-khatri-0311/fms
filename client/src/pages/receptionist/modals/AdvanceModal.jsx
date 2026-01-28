// import React, { useState } from 'react';
// import API from '../../../api/axiosConfig';

// const AdvanceModal = ({ onClose, refreshData }) => {
//   const [formData, setFormData] = useState({
//     transactionDate: new Date().toISOString().split('T')[0],
//     partyName: '',
//     email: '',
//     address: '',
//     pan: '',
//     contactNumber: '',
//     amount: '',
//     expectedBillIssueDate: '',
//     paymentMode: 'CASH',
//     purposeOfAdvance: '',
//     receiptFile: null,
//   });

//   const [items, setItems] = useState([
//     { sn: 1, hsCode: '', particulars: '', quantity: '', unit: '', rate: '', amount: '' }
//   ]);

//   const [isSubmitting, setIsSubmitting] = useState(false);

//   const handleInputChange = (e) => {
//     const { name, value, type, files } = e.target;
//     setFormData(prev => ({
//       ...prev,
//       [name]: type === 'file' ? files[0] : value
//     }));
//   };

//   const handleItemChange = (index, field, value) => {
//     const newItems = [...items];
//     newItems[index][field] = value;
    
//     // Calculate amount for this item
//     if (field === 'quantity' || field === 'rate') {
//       const qty = parseFloat(newItems[index].quantity) || 0;
//       const rate = parseFloat(newItems[index].rate) || 0;
//       newItems[index].amount = (qty * rate).toFixed(2);
//     }
    
//     setItems(newItems);
//   };

//   const addItem = () => {
//     setItems([...items, { 
//       sn: items.length + 1, 
//       hsCode: '', 
//       particulars: '', 
//       quantity: '', 
//       unit: '', 
//       rate: '', 
//       amount: '' 
//     }]);
//   };

//   const removeItem = (index) => {
//     if (items.length > 1) {
//       setItems(items.filter((_, i) => i !== index));
//     }
//   };

//   // Calculate totals
//   const subTotal = items.reduce((sum, item) => sum + (parseFloat(item.amount) || 0), 0);
//   const advanceAmount = parseFloat(formData.amount) || 0;
//   const balance = advanceAmount - subTotal;

//   const handleSubmit = async (e) => {
//     e.preventDefault();
//     setIsSubmitting(true);

//     try {
//       const storedUser = localStorage.getItem('user');
//       if (!storedUser) {
//         alert("Session expired. Please login again.");
//         setIsSubmitting(false);
//         return;
//       }
      
//       const user = JSON.parse(storedUser);

//       // Create FormData for file upload
//       const formDataToSend = new FormData();
      
//       // Add all form fields
//       Object.keys(formData).forEach(key => {
//         if (formData[key] !== null) {
//           formDataToSend.append(key, formData[key]);
//         }
//       });

//       // Add items as JSON
//       formDataToSend.append('items', JSON.stringify(items));
//       formDataToSend.append('subTotal', subTotal.toFixed(2));
//       formDataToSend.append('balance', balance.toFixed(2));
//       formDataToSend.append('status', 'PENDING');
//       formDataToSend.append('createdBy', user.id || user._id);

//       await API.post('/advances', formDataToSend, {
//         headers: {
//           'Content-Type': 'multipart/form-data'
//         }
//       }); 
      
//       alert("✓ Advance payment submitted successfully!");
//       if (refreshData) refreshData();
//       onClose();
//     } catch (err) {
//       console.error("Submission Error:", err.response?.data || err.message);
//       alert(`Error: ${err.response?.data?.error || "Check console for details"}`);
//     } finally {
//       setIsSubmitting(false);
//     }
//   };

//   return (
//     <div className="fixed inset-0 bg-black/40 backdrop-blur-md flex items-center justify-center z-50 p-4 overflow-y-auto">
//       <div className="bg-white w-full max-w-6xl rounded-2xl shadow-2xl border border-slate-200 my-8">
        
//         {/* Header */}
//         <div className="relative px-8 py-6 bg-gradient-to-r from-orange-600 to-red-600 border-b border-orange-700/20">
//           <div className="absolute inset-0 opacity-10 bg-[url('data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNDAiIGhlaWdodD0iNDAiIHhtbG5zPSJodHRwOi8vd3d3LnczLm9yZy8yMDAwL3N2ZyI+PGRlZnM+PHBhdHRlcm4gaWQ9ImdyaWQiIHdpZHRoPSI0MCIgaGVpZ2h0PSI0MCIgcGF0dGVyblVuaXRzPSJ1c2VyU3BhY2VPblVzZSI+PHBhdGggZD0iTSAwIDEwIEwgNDAgMTAgTSAxMCAwIEwgMTAgNDAgTSAwIDIwIEwgNDAgMjAgTSAyMCAwIEwgMjAgNDAgTSAwIDMwIEwgNDAgMzAgTSAzMCAwIEwgMzAgNDAiIGZpbGw9Im5vbmUiIHN0cm9rZT0id2hpdGUiIHN0cm9rZS1vcGFjaXR5PSIwLjUiIHN0cm9rZS13aWR0aD0iMSIvPjwvcGF0dGVybj48L2RlZnM+PHJlY3Qgd2lkdGg9IjEwMCUiIGhlaWdodD0iMTAwJSIgZmlsbD0idXJsKCNncmlkKSIvPjwvc3ZnPg==')]" />
          
//           <div className="relative flex justify-between items-center">
//             <div>
//               <h3 className="text-2xl font-black text-white flex items-center gap-3">
//                 <span className="text-3xl">📅</span>
//                 Advance Payment Entry
//               </h3>
//               <p className="text-orange-100 text-sm mt-1">I. Advance Income</p>
//             </div>
            
//             <button 
//               onClick={onClose}
//               className="w-10 h-10 rounded-xl bg-white/10 backdrop-blur-sm border border-white/20 
//                 hover:bg-white/20 transition-all duration-300 flex items-center justify-center
//                 text-white hover:rotate-90 active:scale-90"
//             >
//               <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
//                 <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
//               </svg>
//             </button>
//           </div>
//         </div>

//         {/* Form Content */}
//         <form onSubmit={handleSubmit} className="p-6">
//           {/* Party Details Section */}
//           <div className="mb-6">
//             <h4 className="text-sm font-black uppercase tracking-wider text-slate-700 mb-4 flex items-center gap-2">
//               <div className="w-1 h-6 bg-gradient-to-b from-orange-500 to-red-500 rounded-full" />
//               Party Information
//             </h4>

//             <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
//               <div>
//                 <label className="block text-xs font-bold text-slate-600 mb-1.5">Party Name *</label>
//                 <input 
//                   type="text" 
//                   name="partyName" 
//                   required
//                   className="w-full px-3 py-2 bg-slate-50 border-2 border-slate-200 rounded-lg 
//                     focus:border-orange-500 focus:bg-white outline-none transition-all text-sm" 
//                   onChange={handleInputChange}
//                   value={formData.partyName}
//                 />
//               </div>

//               <div>
//                 <label className="block text-xs font-bold text-slate-600 mb-1.5">Email Address</label>
//                 <input 
//                   type="email" 
//                   name="email" 
//                   className="w-full px-3 py-2 bg-slate-50 border-2 border-slate-200 rounded-lg 
//                     focus:border-orange-500 focus:bg-white outline-none transition-all text-sm" 
//                   onChange={handleInputChange}
//                   value={formData.email}
//                 />
//               </div>

//               <div>
//                 <label className="block text-xs font-bold text-slate-600 mb-1.5">PAN Number</label>
//                 <input 
//                   type="text" 
//                   name="pan" 
//                   className="w-full px-3 py-2 bg-slate-50 border-2 border-slate-200 rounded-lg 
//                     focus:border-orange-500 focus:bg-white outline-none transition-all text-sm" 
//                   onChange={handleInputChange}
//                   value={formData.pan}
//                 />
//               </div>

//               <div>
//                 <label className="block text-xs font-bold text-slate-600 mb-1.5">Contact Number</label>
//                 <input 
//                   type="text" 
//                   name="contactNumber" 
//                   className="w-full px-3 py-2 bg-slate-50 border-2 border-slate-200 rounded-lg 
//                     focus:border-orange-500 focus:bg-white outline-none transition-all text-sm" 
//                   onChange={handleInputChange}
//                   value={formData.contactNumber}
//                 />
//               </div>

//               <div>
//                 <label className="block text-xs font-bold text-slate-600 mb-1.5">Address</label>
//                 <input 
//                   type="text" 
//                   name="address" 
//                   className="w-full px-3 py-2 bg-slate-50 border-2 border-slate-200 rounded-lg 
//                     focus:border-orange-500 focus:bg-white outline-none transition-all text-sm" 
//                   onChange={handleInputChange}
//                   value={formData.address}
//                 />
//               </div>

//               <div>
//                 <label className="block text-xs font-bold text-slate-600 mb-1.5">Advance Amount (Rs.) *</label>
//                 <input 
//                   type="number" 
//                   step="0.01"
//                   name="amount" 
//                   required
//                   className="w-full px-3 py-2 bg-orange-50 border-2 border-orange-300 rounded-lg 
//                     focus:border-orange-500 focus:bg-white outline-none transition-all text-sm font-bold" 
//                   onChange={handleInputChange}
//                   value={formData.amount}
//                 />
//               </div>
//             </div>

//             <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-4">
//               <div>
//                 <label className="block text-xs font-bold text-slate-600 mb-1.5">Transaction Date *</label>
//                 <input 
//                   type="date" 
//                   name="transactionDate" 
//                   required
//                   className="w-full px-3 py-2 bg-slate-50 border-2 border-slate-200 rounded-lg 
//                     focus:border-orange-500 focus:bg-white outline-none transition-all text-sm" 
//                   onChange={handleInputChange}
//                   value={formData.transactionDate}
//                 />
//               </div>

//               <div>
//                 <label className="block text-xs font-bold text-slate-600 mb-1.5">Expected Bill Issue Date</label>
//                 <input 
//                   type="date" 
//                   name="expectedBillIssueDate" 
//                   className="w-full px-3 py-2 bg-slate-50 border-2 border-slate-200 rounded-lg 
//                     focus:border-orange-500 focus:bg-white outline-none transition-all text-sm" 
//                   onChange={handleInputChange}
//                   value={formData.expectedBillIssueDate}
//                 />
//               </div>

//               <div>
//                 <label className="block text-xs font-bold text-slate-600 mb-1.5">Payment Mode</label>
//                 <select 
//                   name="paymentMode" 
//                   className="w-full px-3 py-2 bg-slate-50 border-2 border-slate-200 rounded-lg 
//                     focus:border-orange-500 focus:bg-white outline-none transition-all text-sm font-semibold"
//                   onChange={handleInputChange} 
//                   value={formData.paymentMode}
//                 >
//                   <option value="CASH">Cash</option>
//                   <option value="BANK">Bank / Cheque</option>
//                   <option value="CARD">Credit / Debit Card</option>
//                 </select>
//               </div>
//             </div>
//           </div>

//           {/* Items Table */}
//           <div className="mb-6">
//             <div className="flex items-center justify-between mb-3">
//               <h4 className="text-sm font-black uppercase tracking-wider text-slate-700 flex items-center gap-2">
//                 <div className="w-1 h-6 bg-gradient-to-b from-blue-500 to-violet-500 rounded-full" />
//                 Item Details
//               </h4>
//               <button
//                 type="button"
//                 onClick={addItem}
//                 className="px-4 py-1.5 bg-blue-600 text-white text-xs font-bold rounded-lg hover:bg-blue-700 transition-all"
//               >
//                 + Add Item
//               </button>
//             </div>

//             <div className="overflow-x-auto bg-slate-50 rounded-lg border-2 border-slate-200">
//               <table className="w-full text-sm">
//                 <thead className="bg-slate-100 border-b-2 border-slate-200">
//                   <tr>
//                     <th className="p-2 text-left text-xs font-black uppercase">S.N.</th>
//                     <th className="p-2 text-left text-xs font-black uppercase">H.S. Code</th>
//                     <th className="p-2 text-left text-xs font-black uppercase">Particulars</th>
//                     <th className="p-2 text-left text-xs font-black uppercase">Quantity</th>
//                     <th className="p-2 text-left text-xs font-black uppercase">Unit</th>
//                     <th className="p-2 text-left text-xs font-black uppercase">Rate (Rs.)</th>
//                     <th className="p-2 text-left text-xs font-black uppercase">Amount (Rs.)</th>
//                     <th className="p-2 text-center text-xs font-black uppercase">Action</th>
//                   </tr>
//                 </thead>
//                 <tbody>
//                   {items.map((item, index) => (
//                     <tr key={index} className="border-b border-slate-200">
//                       <td className="p-2 font-bold">{index + 1}</td>
//                       <td className="p-2">
//                         <input 
//                           type="text" 
//                           className="w-full px-2 py-1 border border-slate-300 rounded text-xs"
//                           value={item.hsCode}
//                           onChange={(e) => handleItemChange(index, 'hsCode', e.target.value)}
//                         />
//                       </td>
//                       <td className="p-2">
//                         <input 
//                           type="text" 
//                           className="w-full px-2 py-1 border border-slate-300 rounded text-xs"
//                           value={item.particulars}
//                           onChange={(e) => handleItemChange(index, 'particulars', e.target.value)}
//                         />
//                       </td>
//                       <td className="p-2">
//                         <input 
//                           type="number" 
//                           step="0.01"
//                           className="w-full px-2 py-1 border border-slate-300 rounded text-xs text-right"
//                           value={item.quantity}
//                           onChange={(e) => handleItemChange(index, 'quantity', e.target.value)}
//                         />
//                       </td>
//                       <td className="p-2">
//                         <input 
//                           type="text" 
//                           className="w-full px-2 py-1 border border-slate-300 rounded text-xs"
//                           value={item.unit}
//                           onChange={(e) => handleItemChange(index, 'unit', e.target.value)}
//                         />
//                       </td>
//                       <td className="p-2">
//                         <input 
//                           type="number" 
//                           step="0.01"
//                           className="w-full px-2 py-1 border border-slate-300 rounded text-xs text-right font-semibold"
//                           value={item.rate}
//                           onChange={(e) => handleItemChange(index, 'rate', e.target.value)}
//                         />
//                       </td>
//                       <td className="p-2 text-right font-bold">{item.amount || '0.00'}</td>
//                       <td className="p-2 text-center">
//                         {items.length > 1 && (
//                           <button
//                             type="button"
//                             onClick={() => removeItem(index)}
//                             className="text-red-600 hover:text-red-800 font-bold"
//                           >
//                             ✕
//                           </button>
//                         )}
//                       </td>
//                     </tr>
//                   ))}
//                 </tbody>
//                 <tfoot className="bg-slate-100 border-t-2 border-slate-300">
//                   <tr>
//                     <td colSpan="6" className="p-2 text-right font-black uppercase text-slate-700">Sub Total:</td>
//                     <td className="p-2 text-right font-black text-lg">Rs. {subTotal.toFixed(2)}</td>
//                     <td></td>
//                   </tr>
//                   <tr className="bg-orange-100">
//                     <td colSpan="6" className="p-2 text-right font-black uppercase text-orange-700">Advance Amount:</td>
//                     <td className="p-2 text-right font-black text-lg text-orange-700">Rs. {advanceAmount.toFixed(2)}</td>
//                     <td></td>
//                   </tr>
//                   <tr className="bg-blue-100">
//                     <td colSpan="6" className="p-2 text-right font-black uppercase text-blue-700">Balance:</td>
//                     <td className="p-2 text-right font-black text-lg text-blue-700">Rs. {balance.toFixed(2)}</td>
//                     <td></td>
//                   </tr>
//                 </tfoot>
//               </table>
//             </div>
//           </div>

//           {/* Additional Info */}
//           <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
//             <div>
//               <label className="block text-xs font-bold text-slate-600 mb-1.5">Purpose of Advance</label>
//               <textarea 
//                 name="purposeOfAdvance" 
//                 rows="3"
//                 className="w-full px-3 py-2 bg-slate-50 border-2 border-slate-200 rounded-lg 
//                   focus:border-orange-500 focus:bg-white outline-none transition-all text-sm resize-none" 
//                 onChange={handleInputChange}
//                 value={formData.purposeOfAdvance}
//               />
//             </div>

//             <div>
//               <label className="block text-xs font-bold text-slate-600 mb-1.5">Upload Payment Receipt</label>
//               <input 
//                 type="file" 
//                 name="receiptFile"
//                 accept=".pdf,.jpg,.jpeg,.png"
//                 className="w-full px-3 py-2 bg-slate-50 border-2 border-slate-200 rounded-lg 
//                   focus:border-orange-500 outline-none transition-all text-sm" 
//                 onChange={handleInputChange}
//               />
//               <p className="text-xs text-slate-500 mt-1">PDF, JPG, PNG (Max 5MB)</p>
//             </div>
//           </div>

//           {/* Action Buttons */}
//           <div className="flex justify-end gap-3 pt-4 border-t border-slate-200">
//             <button 
//               type="button" 
//               onClick={onClose} 
//               className="px-6 py-2.5 text-slate-600 font-bold hover:bg-slate-100 rounded-lg 
//                 transition-all duration-300 active:scale-95"
//             >
//               Cancel
//             </button>
//             <button 
//               type="submit"
//               disabled={isSubmitting}
//               className="px-8 py-2.5 bg-gradient-to-r from-orange-600 to-red-600 
//                 text-white font-black rounded-lg shadow-lg shadow-orange-500/30
//                 hover:shadow-xl hover:shadow-orange-500/40 hover:-translate-y-0.5
//                 transition-all duration-300 active:scale-95
//                 disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none"
//             >
//               {isSubmitting ? (
//                 <span className="flex items-center gap-2">
//                   <svg className="animate-spin w-4 h-4" fill="none" viewBox="0 0 24 24">
//                     <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
//                     <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
//                   </svg>
//                   Submitting...
//                 </span>
//               ) : (
//                 'Submit for Approval'
//               )}
//             </button>
//           </div>
//         </form>
//       </div>
//     </div>
//   );
// };

// export default AdvanceModal;