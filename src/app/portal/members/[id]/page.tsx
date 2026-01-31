"use client";

import React, { useState, useEffect } from "react";
import ProfileHeader from "@/components/admin/members/ProfileHeader";
import FamilyConnections from "@/components/admin/members/FamilyConnections";
import { Member, defaultMember } from "@/types/member";
import { ArrowRight } from "lucide-react";
import Link from "next/link";
import { useParams } from "next/navigation";

// Only for dev demo - normally fetched by ID
const mockMember: Member = {
    ...(defaultMember as Member),
    id: '1',
    label: 'الجد المؤسس',
    gender: 'male',
    status: 'deceased',
    photo: 'https://images.unsplash.com/photo-1544005313-94ddf0286df2?auto=format&fit=crop&q=80&w=200&h=200',
    birthDate: { day: '1', month: '1', year: '1300', type: 'Hijri' },
    deathDate: { day: '1', month: '1', year: '1380', type: 'Hijri' },
    occupation: 'مؤسس العائلة',
    location: 'الرياض',
    bio: 'مؤسس العائلة والجد الأكبر، عرف عنه الحكمة والكرم.',
    relatives: {
        parents: [],
        siblings: [],
        children: [
            { id: '2', label: 'عبدالله', gender: 'male' },
            { id: '3', label: 'محمد', gender: 'male' },
            { id: '7', label: 'علي', gender: 'male' }
        ]
    }
};

export default function MemberProfilePage() {
    const params = useParams();
    const [member, setMember] = useState<Member>(mockMember);

    useEffect(() => {
        // In a real app, fetch member by params.id here
        console.log('Fetching member:', params.id);
        // setMember(fetchedMember);
    }, [params.id]);

    return (
        <div className="min-h-screen bg-[#f8f9fa] pb-20" dir="rtl">
            <div className="max-w-5xl mx-auto px-4 py-8">
                {/* Breadcrumb / Back */}
                <div className="mb-6">
                    <Link href="/portal/admin/tree" className="inline-flex items-center gap-2 text-gray-500 hover:text-[#111814] transition-colors font-bold text-sm">
                        <ArrowRight className="w-4 h-4" />
                        العودة لشجرة العائلة
                    </Link>
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                    {/* Main Column */}
                    <div className="lg:col-span-2 space-y-6">
                        <ProfileHeader member={member} />

                        {/* Bio / History */}
                        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-8">
                            <h3 className="text-lg font-bold text-[#111814] mb-4">السيرة الذاتية</h3>
                            <p className="text-gray-600 leading-relaxed text-sm">
                                {member.bio || 'لا توجد سيرة ذاتية مسجلة.'}
                            </p>
                        </div>
                    </div>

                    {/* Sidebar Column */}
                    <div className="space-y-6">
                        <FamilyConnections member={member} />

                        {/* Meta Info Card */}
                        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6">
                            <h3 className="text-sm font-bold text-gray-400 uppercase tracking-wider mb-4">معلومات السجل</h3>
                            <div className="space-y-3 text-sm">
                                <div className="flex justify-between">
                                    <span className="text-gray-500">تاريخ الإضافة</span>
                                    <span className="font-medium text-[#111814]">1445/01/01</span>
                                </div>
                                <div className="flex justify-between">
                                    <span className="text-gray-500">آخر تعديل</span>
                                    <span className="font-medium text-[#111814]">1445/06/15</span>
                                </div>
                                <div className="flex justify-between">
                                    <span className="text-gray-500">بواسطة</span>
                                    <span className="font-medium text-[#111814]">Admin</span>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
