export default function TopNamesList({ data, title, color }: { data: { name: string; count: number }[], title: string, color: string }) {
    if (!data || data.length === 0) return null;

    const maxCount = Math.max(...data.map(d => d.count));

    return (
        <div className="bg-white p-6 rounded-xl border border-gray-100 shadow-sm h-full">
            <h3 className="text-lg font-bold text-[#111814] mb-4">{title}</h3>
            <div className="space-y-4">
                {data.map((item, idx) => (
                    <div key={idx} className="relative">
                        <div className="flex justify-between items-center mb-1 text-sm z-10 relative">
                            <span className="font-bold text-gray-700">{item.name}</span>
                            <span className="font-bold text-gray-900">{item.count}</span>
                        </div>
                        <div className="h-2 w-full bg-gray-50 rounded-full overflow-hidden">
                            <div
                                className={`h-full rounded-full transition-all duration-1000 ${color}`}
                                style={{ width: `${(item.count / maxCount) * 100}%` }}
                            />
                        </div>
                    </div>
                ))}
            </div>
        </div>
    );
}
