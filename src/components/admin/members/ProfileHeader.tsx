import { Member } from '@/types/member';
import { Camera, MapPin, Calendar, Briefcase, GraduationCap, Link as LinkIcon, Edit } from 'lucide-react';
import Image from 'next/image';

interface ProfileHeaderProps {
    member: Member;
    onEdit?: () => void;
}

export default function ProfileHeader({ member, onEdit }: ProfileHeaderProps) {
    const isDeceased = member.status === 'deceased';

    return (
        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden relative">
            {/* Cover / Background Pattern */}
            <div className="h-32 bg-gradient-to-r from-[#111814] to-[#1a241e] relative">
                <div className="absolute inset-0 opacity-10 bg-[url('/patterns/islamic.png')]"></div>
            </div>

            <div className="px-8 pb-8">
                <div className="flex justify-between items-start">
                    {/* Avatar & Basic Info */}
                    <div className="flex gap-6 -mt-12 relative z-10">
                        {/* Avatar */}
                        <div className={`
                            w-32 h-32 rounded-2xl border-4 border-white shadow-lg overflow-hidden bg-gray-100 relative
                            ${isDeceased ? 'grayscale' : ''}
                        `}>
                            {member.photo ? (
                                <Image
                                    src={member.photo}
                                    alt={member.label}
                                    fill
                                    className="object-cover"
                                />
                            ) : (
                                <div className="w-full h-full flex items-center justify-center bg-gray-100 text-gray-300">
                                    <Camera className="w-10 h-10" />
                                </div>
                            )}
                        </div>

                        {/* Name & Status */}
                        <div className="mt-14 space-y-1">
                            <h1 className="text-2xl font-bold text-[#111814] flex items-center gap-2">
                                {member.label}
                                {isDeceased && (
                                    <span className="px-2 py-0.5 bg-gray-100 text-gray-500 text-xs rounded-full border border-gray-200">
                                        متوفى
                                    </span>
                                )}
                            </h1>
                            <div className="flex items-center gap-4 text-sm text-gray-500">
                                <span className="flex items-center gap-1">
                                    <MapPin className="w-3.5 h-3.5" />
                                    {member.location || 'الرياض، السعودية'}
                                </span>
                                <span className="flex items-center gap-1">
                                    <Calendar className="w-3.5 h-3.5" />
                                    {member.birthDate?.year || '---'}
                                    {isDeceased && ` - ${member.deathDate?.year || '---'}`}
                                </span>
                            </div>
                        </div>
                    </div>

                    {/* Actions */}
                    <div className="mt-4">
                        <button
                            onClick={onEdit}
                            className="flex items-center gap-2 px-4 py-2 bg-gray-50 hover:bg-gray-100 text-gray-700 rounded-lg text-sm font-bold transition-colors border border-gray-200"
                        >
                            <Edit className="w-4 h-4" />
                            تعديل الملف
                        </button>
                    </div>
                </div>

                {/* Additional Details Grid */}
                <div className="grid grid-cols-3 gap-6 mt-8 pt-8 border-t border-gray-50">
                    <div className="space-y-1">
                        <label className="text-xs font-bold text-gray-400 flex items-center gap-1.5">
                            <Briefcase className="w-3.5 h-3.5" />
                            العمل
                        </label>
                        <p className="text-sm font-semibold text-gray-700">
                            {member.occupation || '---'}
                            {member.company && <span className="text-gray-400 font-normal"> في {member.company}</span>}
                        </p>
                    </div>
                    <div className="space-y-1">
                        <label className="text-xs font-bold text-gray-400 flex items-center gap-1.5">
                            <GraduationCap className="w-3.5 h-3.5" />
                            التعليم
                        </label>
                        <p className="text-sm font-semibold text-gray-700">
                            {member.education || '---'}
                            {member.university && <span className="text-gray-400 font-normal"> - {member.university}</span>}
                        </p>
                    </div>
                    <div className="space-y-1">
                        <label className="text-xs font-bold text-gray-400 flex items-center gap-1.5">
                            <LinkIcon className="w-3.5 h-3.5" />
                            التواصل
                        </label>
                        <div className="flex items-center gap-2">
                            {member.mobile && <span className="text-sm font-medium text-gray-700" dir="ltr">{member.mobile}</span>}
                            {/* Social Icons could go here */}
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
