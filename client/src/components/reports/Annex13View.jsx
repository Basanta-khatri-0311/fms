import React from 'react';

const Annex13View = ({ data, financialYear }) => (
  <div className="space-y-8">
    <div className="text-center pb-6 border-b border-slate-200">
      <h3 className="text-sm font-black text-slate-400 tracking-widest uppercase mb-1">FINANCIAL REPORT</h3>
      <h4 className="text-3xl font-black text-slate-900 tracking-tight">Annex 13 - VAT Return</h4>
      <p className="text-sm font-medium text-slate-500 mt-2">For Financial Year {financialYear}</p>
    </div>

    <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
      {/* Sales Summary */}
      <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden flex flex-col">
        <div className="bg-slate-50 border-b border-slate-100 p-5">
          <h5 className="text-[10px] font-black text-orange-500 tracking-widest uppercase">Sales VAT (Output)</h5>
        </div>
        <div className="p-8 space-y-6 flex-1">
          <div className="flex justify-between items-center border-b border-slate-100 pb-4">
            <span className="text-sm font-bold text-slate-500 uppercase tracking-widest">Taxable Sales Value</span>
            <span className="font-black text-slate-800 font-mono">{data.sales.amountBeforeVAT.toLocaleString(undefined, { minimumFractionDigits: 2 })}</span>
          </div>
          <div className="flex justify-between items-center pt-2">
            <span className="text-sm font-bold text-slate-900">Total Output VAT</span>
            <span className="text-2xl font-black text-orange-600 font-mono">{data.sales.vatAmount.toLocaleString(undefined, { minimumFractionDigits: 2 })}</span>
          </div>
        </div>
      </div>

      {/* Purchase Summary */}
      <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden flex flex-col">
        <div className="bg-slate-50 border-b border-slate-100 p-5">
          <h5 className="text-[10px] font-black text-indigo-500 tracking-widest uppercase">Purchase VAT (Input)</h5>
        </div>
        <div className="p-8 space-y-6 flex-1">
          <div className="flex justify-between items-center border-b border-slate-100 pb-4">
            <span className="text-sm font-bold text-slate-500 uppercase tracking-widest">Taxable Purchase Value</span>
            <span className="font-black text-slate-800 font-mono">{data.purchases.amountBeforeVAT.toLocaleString(undefined, { minimumFractionDigits: 2 })}</span>
          </div>
          <div className="flex justify-between items-center pt-2">
            <span className="text-sm font-bold text-slate-900">Total Input VAT Available</span>
            <span className="text-2xl font-black text-indigo-600 font-mono">{data.purchases.vatAmount.toLocaleString(undefined, { minimumFractionDigits: 2 })}</span>
          </div>
        </div>
      </div>
    </div>

    {/* Final VAT Calculation */}
    <div className={`rounded-2xl border-2 shadow-xl overflow-hidden ${
      data.summary.netVatDue >= 0 
        ? 'border-slate-800 bg-slate-900 text-white' 
        : 'border-emerald-500 bg-emerald-50 text-emerald-900'
    }`}>
      <div className="p-8 space-y-8">
        
        <div className="space-y-4">
          <div className="flex justify-between items-center text-sm font-bold">
            <span className={data.summary.netVatDue >= 0 ? 'text-slate-400' : 'text-emerald-700'}>Output VAT (From Sales)</span>
            <span className="font-mono">{data.summary.totalVatPayable.toLocaleString(undefined, { minimumFractionDigits: 2 })}</span>
          </div>
          <div className="flex justify-between items-center text-sm font-bold">
            <span className={data.summary.netVatDue >= 0 ? 'text-slate-400' : 'text-emerald-700'}>Less: Input VAT (From Purchases)</span>
            <span className="font-mono">- {data.summary.totalVatClaimable.toLocaleString(undefined, { minimumFractionDigits: 2 })}</span>
          </div>
        </div>
        
        <div className={`pt-6 border-t ${data.summary.netVatDue >= 0 ? 'border-slate-700' : 'border-emerald-200'}`}>
          <div className="flex flex-col sm:flex-row justify-between sm:items-center gap-4">
            <div>
              <div className={`text-[10px] font-black uppercase tracking-widest mb-1 ${data.summary.netVatDue >= 0 ? 'text-rose-400' : 'text-emerald-600'}`}>
                {data.summary.netVatDue >= 0 ? 'Payable (Due)' : 'Receivable (Credit)'}
              </div>
              <div className={`text-xl font-bold ${data.summary.netVatDue >= 0 ? 'text-white' : 'text-emerald-900'}`}>
                {data.summary.netVatDue >= 0 ? 'Net VAT Due To Tax Office' : 'VAT Carried Forward'}
              </div>
            </div>
            <div className={`text-4xl sm:text-5xl font-black font-mono tracking-tight ${data.summary.netVatDue >= 0 ? 'text-rose-400' : 'text-emerald-600'}`}>
              {Math.abs(data.summary.netVatDue).toLocaleString(undefined, { minimumFractionDigits: 2 })}
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
);

export default Annex13View;
