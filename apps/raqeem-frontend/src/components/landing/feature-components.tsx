import React from "react";
import { Badge } from "@repo/ui";
import { 
  Gavel, 
  CalendarDays, 
  FolderOpen, 
  UserCheck, 
  Clock, 
  Users, 
  FileText 
} from "lucide-react";

export function CasesFeature() {
  return (
    <div className="bg-white rounded-lg border p-6 space-y-4">
      <div className="flex items-center gap-3 mb-4">
        <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center">
          <Gavel className="h-5 w-5 text-blue-600" />
        </div>
        <h3 className="font-semibold text-lg">إدارة القضايا</h3>
      </div>

      <div className="space-y-3">
        <div className="flex items-center justify-between p-3 bg-blue-50 rounded-lg">
          <div className="flex items-center gap-3">
            <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
            <span className="text-sm">دعوى تجارية تونس #2024-001</span>
          </div>
          <Badge variant="default">نشطة</Badge>
        </div>
        <div className="flex items-center justify-between p-3 bg-green-50 rounded-lg">
          <div className="flex items-center gap-3">
            <div className="w-2 h-2 bg-green-500 rounded-full"></div>
            <span className="text-sm">قضية عقارية صفاقس #2024-002</span>
          </div>
          <Badge variant="secondary">مغلقة</Badge>
        </div>
        <div className="flex items-center justify-between p-3 bg-yellow-50 rounded-lg">
          <div className="flex items-center gap-3">
            <div className="w-2 h-2 bg-yellow-500 rounded-full"></div>
            <span className="text-sm">دعوى مدنية سوسة #2024-003</span>
          </div>
          <Badge variant="outline">معلقة</Badge>
        </div>
      </div>

      <div className="pt-4 border-t">
        <div className="flex items-center justify-between text-sm text-gray-600">
          <span>إجمالي القضايا: 24</span>
          <span>نشطة: 8</span>
        </div>
      </div>
    </div>
  );
}

export function CalendarFeature() {
  return (
    <div className="bg-white rounded-lg border p-6 space-y-4">
      <div className="flex items-center gap-3 mb-4">
        <div className="w-10 h-10 bg-green-100 rounded-lg flex items-center justify-center">
          <CalendarDays className="h-5 w-5 text-green-600" />
        </div>
        <h3 className="font-semibold text-lg">المواعيد والجدولة</h3>
      </div>

      <div className="space-y-3">
        <div className="text-center p-4 bg-gray-50 rounded-lg">
          <div className="text-2xl font-bold text-gray-900">15</div>
          <div className="text-sm text-gray-600">ديسمبر 2024</div>
        </div>

        <div className="space-y-2">
          <div className="flex items-center gap-3 p-3 bg-red-50 rounded-lg">
            <Clock className="h-4 w-4 text-red-600" />
            <div className="flex-1">
              <div className="text-sm font-medium">جلسة محكمة الناحية تونس</div>
              <div className="text-xs text-gray-600">10:00 ص - قصر العدالة</div>
            </div>
          </div>
          <div className="flex items-center gap-3 p-3 bg-blue-50 rounded-lg">
            <Users className="h-4 w-4 text-blue-600" />
            <div className="flex-1">
              <div className="text-sm font-medium">لقاء عميل - سيدي بوزيد</div>
              <div className="text-xs text-gray-600">2:00 م - مكتب المحاماة</div>
            </div>
          </div>
          <div className="flex items-center gap-3 p-3 bg-green-50 rounded-lg">
            <FileText className="h-4 w-4 text-green-600" />
            <div className="flex-1">
              <div className="text-sm font-medium">تسليم مذكرة دفاع</div>
              <div className="text-xs text-gray-600">5:00 م - محكمة الاستئناف</div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export function FilesFeature() {
  return (
    <div className="bg-white rounded-lg border p-6 space-y-4">
      <div className="flex items-center gap-3 mb-4">
        <div className="w-10 h-10 bg-purple-100 rounded-lg flex items-center justify-center">
          <FolderOpen className="h-5 w-5 text-purple-600" />
        </div>
        <h3 className="font-semibold text-lg">إدارة الملفات</h3>
      </div>

      <div className="space-y-3">
        <div className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg">
          <FileText className="h-4 w-4 text-blue-600" />
          <div className="flex-1">
            <div className="text-sm font-medium">وكالة خاصة_تونس.pdf</div>
            <div className="text-xs text-gray-600">تم الرفع منذ يومين • 2.4 MB</div>
          </div>
        </div>
        <div className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg">
          <FileText className="h-4 w-4 text-green-600" />
          <div className="flex-1">
            <div className="text-sm font-medium">عريضة افتتاح دعوى.docx</div>
            <div className="text-xs text-gray-600">تم الرفع منذ أسبوع • 1.8 MB</div>
          </div>
        </div>
        <div className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg">
          <FileText className="h-4 w-4 text-red-600" />
          <div className="flex-1">
            <div className="text-sm font-medium">حكم محكمة تونس.pdf</div>
            <div className="text-xs text-gray-600">تم الرفع منذ شهر • 956 KB</div>
          </div>
        </div>
      </div>

      <div className="pt-4 border-t">
        <div className="flex items-center justify-between text-sm text-gray-600">
          <span>المساحة المستخدمة: 15.2 GB</span>
          <span>الملفات: 142</span>
        </div>
      </div>
    </div>
  );
}

export function ClientsFeature() {
  return (
    <div className="bg-white rounded-lg border p-6 space-y-4">
      <div className="flex items-center gap-3 mb-4">
        <div className="w-10 h-10 bg-orange-100 rounded-lg flex items-center justify-center">
          <UserCheck className="h-5 w-5 text-orange-600" />
        </div>
        <h3 className="font-semibold text-lg">إدارة العملاء</h3>
      </div>

      <div className="space-y-3">
        <div className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg">
          <div className="w-8 h-8 bg-blue-500 rounded-full flex items-center justify-center text-white text-sm font-semibold">
            م
          </div>
          <div className="flex-1">
            <div className="text-sm font-medium">محمد الطرابلسي</div>
            <div className="text-xs text-gray-600">آخر تواصل: منذ 3 أيام</div>
          </div>
          <Badge variant="default">نشط</Badge>
        </div>
        <div className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg">
          <div className="w-8 h-8 bg-green-500 rounded-full flex items-center justify-center text-white text-sm font-semibold">
            ل
          </div>
          <div className="flex-1">
            <div className="text-sm font-medium">ليلى بن صالح</div>
            <div className="text-xs text-gray-600">آخر تواصل: منذ أسبوع</div>
          </div>
          <Badge variant="secondary">مكتمل</Badge>
        </div>
        <div className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg">
          <div className="w-8 h-8 bg-purple-500 rounded-full flex items-center justify-center text-white text-sm font-semibold">
            ع
          </div>
          <div className="flex-1">
            <div className="text-sm font-medium">عمر الزويتيني</div>
            <div className="text-xs text-gray-600">آخر تواصل: منذ شهر</div>
          </div>
          <Badge variant="outline">متابعة</Badge>
        </div>
      </div>

      <div className="pt-4 border-t">
        <div className="flex items-center justify-between text-sm text-gray-600">
          <span>إجمالي العملاء: 89</span>
          <span>نشطين: 34</span>
        </div>
      </div>
    </div>
  );
}