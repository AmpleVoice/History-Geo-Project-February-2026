'use client';
import Link from 'next/link';
import { ArrowRight, Share2, Printer } from 'lucide-react';

export default function AboutPage() {
  const handleShare = async () => {
    if (navigator.share) {
      await navigator.share({
        title: 'حول المشروع - خريطة المقاومات الشعبية',
        url: window.location.href,
      });
    } else {
      await navigator.clipboard.writeText(window.location.href);
      alert('تم نسخ الرابط');
    }
  };

  const handlePrint = () => {
    window.print();
  };

  return (
    <>
      {/* Simple Header */}
      <header className="bg-white border-b border-neutral-200 sticky top-0 z-50">
        <div className="max-w-4xl mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <Link href="/">
              <button className="flex items-center gap-2 px-3 py-2 text-neutral-700 hover:text-neutral-900 hover:bg-neutral-100 rounded-lg transition-colors">
                <ArrowRight className="h-4 w-4" />
                العودة للخريطة
              </button>
            </Link>
            <div className="flex items-center gap-2">
              <button 
                onClick={handleShare}
                className="p-2 text-neutral-700 hover:text-neutral-900 hover:bg-neutral-100 rounded-lg transition-colors"
              >
                <Share2 className="h-4 w-4" />
              </button>
              <button 
                onClick={handlePrint}
                className="p-2 text-neutral-700 hover:text-neutral-900 hover:bg-neutral-100 rounded-lg transition-colors"
              >
                <Printer className="h-4 w-4" />
              </button>
            </div>
          </div>
        </div>
      </header>

      <div className="min-h-screen bg-neutral-50" dir="rtl">
      <div className="max-w-4xl mx-auto px-4 py-12">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-4xl font-bold text-neutral-900 mb-4">
            حول المشروع
          </h1>
          <div className="h-1 w-20 bg-primary-500"></div>
        </div>

        {/* Content */}
        <div className="bg-white rounded-lg shadow-sm p-8 space-y-6">
          <section>
            <h2 className="text-2xl font-bold text-neutral-800 mb-3">
              ما هي خريطة المقاومات الشعبية؟
            </h2>
            <p className="text-neutral-600 leading-relaxed">
              خريطة المقاومات الشعبية هي مشروع رقمي تفاعلي يوثق تاريخ المقاومة الجزائرية ضد الاستعمار الفرنسي من عام 1830 إلى 1954. يهدف المشروع إلى حفظ ذاكرة الثورات والمعارك والقادة الذين ضحوا من أجل حرية الجزائر.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-bold text-neutral-800 mb-3">
              أهداف المشروع
            </h2>
            <ul className="list-disc list-inside space-y-2 text-neutral-600">
              <li>توثيق المقاومات الشعبية في جميع أنحاء الجزائر</li>
              <li>الحفاظ على الذاكرة التاريخية للأجيال القادمة</li>
              <li>توفير منصة تعليمية تفاعلية للباحثين والطلاب</li>
              <li>تسليط الضوء على القادة والأبطال المنسيين</li>
            </ul>
          </section>

          <section>
            <h2 className="text-2xl font-bold text-neutral-800 mb-3">
              الفترة الزمنية
            </h2>
            <p className="text-neutral-600 leading-relaxed">
              يغطي المشروع الفترة من <strong>1830</strong> (بداية الاحتلال الفرنسي) إلى <strong>1954</strong> (اندلاع ثورة التحرير الوطني).
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-bold text-neutral-800 mb-3">
              عن الفريق
            </h2>
            <p className="text-neutral-600 leading-relaxed mb-3">
              هذا المشروع من إنجاز طلاب ثانوية الرياضيات محند مخبي، قسم 2 رياضي 5
            </p>
            <div className="bg-neutral-50 rounded-lg p-4">
              <h3 className="font-semibold text-neutral-700 mb-2">أعضاء المجموعة:</h3>
              <ul className="space-y-1 text-neutral-600">
                <li>• محمد علاء الدين خليفي</li>
                <li>• أيت سعيد طاهر حكيم</li>
                <li>• يايسي أميرة</li>
                <li>• عميروش ياسمين</li>
              </ul>
            </div>
          </section>

          <section className="border-t border-neutral-200 pt-6 mt-6">
            <p className="text-sm text-neutral-500 mb-2">
              تم تطوير هذا المشروع بهدف الحفاظ على الذاكرة الوطنية وتعزيز الوعي التاريخي لدى الأجيال الجديدة.
            </p>
            <p className="text-sm text-neutral-400">
              مشروع تاريخ وجغرافيا • ثانوية الرياضيات محند مخبي
            </p>
          </section>
        </div>
      </div>
      </div>
    </>
  );
}