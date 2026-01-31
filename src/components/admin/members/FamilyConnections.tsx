import { Member } from '@/types/member';
import Link from 'next/link';

interface FamilyConnectionsProps {
    member: Member;
}

export default function FamilyConnections({ member }: FamilyConnectionsProps) {
    const renderConnectionCard = (relative: any, role: string) => (
        <Link href={`/portal/members/${relative.id}`} key={relative.id} className="block group">
            <div className="flex items-center gap-3 p-3 rounded-xl border border-gray-100 bg-white hover:border-[#D4AF37] hover:shadow-md transition-all">
                <div className="size-10 rounded-full bg-gray-100 border border-gray-200 overflow-hidden">
                    {/* Placeholder for avatar */}
                    <div className="w-full h-full flex items-center justify-center text-gray-300 text-xs">
                        {relative.label.charAt(0)}
                    </div>
                </div>
                <div>
                    <p className="text-sm font-bold text-[#111814] group-hover:text-[#D4AF37] transition-colors">{relative.label}</p>
                    <p className="text-[10px] text-gray-500">{role}</p>
                </div>
            </div>
        </Link>
    );

    return (
        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6">
            <h3 className="text-lg font-bold text-[#111814] mb-6 flex items-center gap-2">
                الروابط العائلية
                <span className="bg-green-50 text-green-700 text-xs px-2 py-0.5 rounded-full">
                    {/* Total count logic could go here */}
                    عائلة
                </span>
            </h3>

            <div className="space-y-6">
                {/* Parents */}
                {member.relatives?.parents && member.relatives.parents.length > 0 && (
                    <div>
                        <h4 className="text-xs font-bold text-gray-400 mb-3 uppercase tracking-wider">الوالدين</h4>
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
                            {member.relatives.parents.map(p => renderConnectionCard(p, 'والد/ة'))}
                        </div>
                    </div>
                )}

                {/* Siblings */}
                {member.relatives?.siblings && member.relatives.siblings.length > 0 && (
                    <div>
                        <h4 className="text-xs font-bold text-gray-400 mb-3 uppercase tracking-wider">الإخوة والأخوات</h4>
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
                            {member.relatives.siblings.map(sib => renderConnectionCard(sib, (sib.gender === 'female' ? 'أخت' : 'أخ')))}
                        </div>
                    </div>
                )}

                {/* Children */}
                {member.relatives?.children && member.relatives.children.length > 0 && (
                    <div>
                        <h4 className="text-xs font-bold text-gray-400 mb-3 uppercase tracking-wider">الأبناء</h4>
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
                            {member.relatives.children.map(child => renderConnectionCard(child, (child.gender === 'female' ? 'ابنة' : 'ابن')))}
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
}
