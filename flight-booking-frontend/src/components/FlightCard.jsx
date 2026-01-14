import { Link } from "react-router-dom"

export default function FlightCard({ flight }) {
  const price = flight.current_price ?? flight.base_price
  const surge = flight.surge_applied
  return (
    <div className="bg-surface border border-hairline rounded-xl shadow-sm hover:shadow-md transition-shadow">
      <div className="p-4 flex items-start justify-between">
        <div>
          <div className="flex items-center gap-2">
            <span className="px-2 py-1 rounded-full bg-[#222] text-xs">{flight.airline}</span>
            <span className="px-2 py-1 rounded-full bg-[#222] text-xs">{flight.flight_id}</span>
          </div>
          <div className="mt-3 text-sm text-textSecondary">{flight.departure_city} → {flight.arrival_city}</div>
          <div className="mt-1 text-xs text-textSecondary">{flight.departure_time} → {flight.arrival_time}</div>
        </div>
        <div className="text-right">
          {surge ? (
            <div className="text-xs text-primary">Surge +{flight.surge_percentage}%</div>
          ) : null}
          <div className="mt-1">
            {surge ? <span className="text-sm line-through text-textSecondary">₹{Number(flight.base_price).toFixed(2)}</span> : null}
          </div>
          <div className="text-lg font-semibold">₹{Number(price).toFixed(2)}</div>
        </div>
      </div>
      <div className="px-4 pb-4">
        <Link to={`/flights/${flight.id}`} className="w-full inline-flex justify-center items-center px-4 py-2 rounded-lg text-white bg-brandGradient">View</Link>
      </div>
    </div>
  )
}
