// import Link from "next/link";

// export default function PurchasesHome() {
//   return (
//     <div className="space-y-3">
//       <h1 className="text-xl font-semibold">Purchases</h1>
//       <div className="card p-4 space-y-2">
//         <p className="text-sm opacity-80">
//           Add supplier bills and receive stock into inventory (FIFO layers).
//         </p>
//         <Link href="/admin/purchases/new" className="btn w-fit">
//           + New Purchase
//         </Link>
//       </div>
//       {/* (Future) list recent purchases here */}
//     </div>
//   );
// }

import Link from "next/link";

export default function PurchasesHome() {
  return (
    <div className="space-y-3">
      <h1 className="text-xl font-semibold">Purchases</h1>
      <div className="card p-4 space-y-2">
        <p className="text-sm opacity-80">
          Add supplier bills and receive stock into inventory (FIFO layers).
        </p>
        <Link href="/admin/purchases/new" className="btn w-fit">
          + New Purchase
        </Link>
      </div>
      {/* (Future) list recent purchases here */}
    </div>
  );
}
