"use client";

import Link from "next/link";
import Script from "next/script";
import { Twitter, Mail, ExternalLink, MessageCircle } from "lucide-react";

export function SocialHub() {
    return (
        <section className="bg-[#f0f4f2] py-20 border-t border-[#e5e7eb]">
            <div className="max-w-[1280px] mx-auto px-4 sm:px-10">
                <div className="flex flex-col lg:flex-row gap-12 lg:gap-20">

                    {/* Left: Social Actions */}
                    <div className="flex-1 flex flex-col gap-8 order-2 lg:order-1">
                        <div>
                            <h2 className="text-3xl font-black text-[#111813] mb-4 font-display">تواصل معنا</h2>
                            <p className="text-lg text-gray-600 leading-relaxed font-naskh">
                                نسعد بتواصلكم ومشاركتكم في فعاليات العائلة. يمكنكم الوصول إلينا عبر القنوات الرسمية التالية.
                            </p>
                        </div>

                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                            {/* X (Twitter) Button */}
                            <Link
                                href="https://x.com/H_ibnzaid"
                                target="_blank"
                                className="group flex items-center gap-4 bg-white p-5 rounded-2xl border border-gray-200 hover:border-[#D4AF37] hover:shadow-md transition-all duration-300"
                            >
                                <div className="size-12 rounded-xl bg-black flex items-center justify-center text-white group-hover:scale-110 transition-transform">
                                    <Twitter className="w-6 h-6" fill="currentColor" />
                                </div>
                                <div>
                                    <p className="font-bold text-[#111813] text-lg">منصة X</p>
                                    <p className="text-sm text-gray-500 font-naskh">تابع أخبارنا أولاً بأول</p>
                                </div>
                                <ExternalLink className="w-5 h-5 text-gray-300 mr-auto group-hover:text-[#D4AF37] rtl:rotate-180" />
                            </Link>

                            {/* WhatsApp Button */}
                            <Link
                                href="#"
                                className="group flex items-center gap-4 bg-white p-5 rounded-2xl border border-gray-200 hover:border-[#25D366] hover:shadow-md transition-all duration-300"
                            >
                                <div className="size-12 rounded-xl bg-[#25D366] flex items-center justify-center text-white group-hover:scale-110 transition-transform">
                                    <MessageCircle className="w-6 h-6" fill="currentColor" />
                                </div>
                                <div>
                                    <p className="font-bold text-[#111813] text-lg">واتساب</p>
                                    <p className="text-sm text-gray-500 font-naskh">تواصل مع إدارة المجلس</p>
                                </div>
                                <ExternalLink className="w-5 h-5 text-gray-300 mr-auto group-hover:text-[#25D366] rtl:rotate-180" />
                            </Link>

                            {/* Email Button */}
                            <Link
                                href="mailto:H.ibnzaid@gmail.com"
                                className="group flex items-center gap-4 bg-white p-5 rounded-2xl border border-gray-200 hover:border-primary hover:shadow-md transition-all duration-300 sm:col-span-2"
                            >
                                <div className="size-12 rounded-xl bg-primary flex items-center justify-center text-white group-hover:scale-110 transition-transform">
                                    <Mail className="w-6 h-6" />
                                </div>
                                <div>
                                    <p className="font-bold text-[#111813] text-lg">البريد الإلكتروني</p>
                                    <p className="text-sm text-gray-500 font-naskh">للمراسلات الرسمية والاستفسارات</p>
                                </div>
                                <ExternalLink className="w-5 h-5 text-gray-300 mr-auto group-hover:text-primary rtl:rotate-180" />
                            </Link>
                        </div>
                    </div>

                    {/* Right: Tweet Embed (Timeline) */}
                    <div className="flex-1 order-1 lg:order-2">
                        <div className="bg-white p-6 rounded-3xl border border-gray-200 shadow-sm relative overflow-hidden h-full min-h-[500px]">
                            <div className="absolute top-0 right-0 w-full h-1.5 bg-gradient-to-r from-transparent via-[#D4AF37] to-transparent opacity-50"></div>

                            <div className="h-full flex flex-col justify-center text-center">
                                <a
                                    className="twitter-timeline"
                                    data-width="100%"
                                    data-height="500"
                                    data-dnt="true"
                                    data-theme="light"
                                    href="https://twitter.com/H_ibnzaid?ref_src=twsrc%5Etfw"
                                >
                                    جاري تحميل التغريدات...
                                </a>
                                <Script src="https://platform.twitter.com/widgets.js" strategy="lazyOnload" />
                            </div>
                        </div>
                    </div>

                </div>
            </div>
        </section>
    );
}
