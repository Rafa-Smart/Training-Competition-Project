export default TransactionItem = ({showDate, transaction, onDelete}) => {
    return <>            <div className="cursor-pointer flex lg:items-center justify-between border-b border-slate-700 py-3 lg:py-4 gap-3 text-lg">
  <div className="flex lg:items-center gap-3">
    <div className="aspect-[1/1] h-[40px] flex items-center justify-center bg-red-200 border-2 border-red-300 rounded-full">
      Icon
    </div>
    <div>
      <div className="flex flex-col lg:flex-row lg:items-center lg:gap-3">
        <div className="font-medium">
          Category
        </div>
        <div className="text-slate-400 text-sm lg:text-[1rem]">
          Wallet name
        </div>
      </div>
      <div className="text-slate-400 text-xs lg:text-sm">Note (optional)</div>
    </div>
  </div>
  <div className="amount font-medium">
    Rp 250.000
  </div>
</div>
</>
}