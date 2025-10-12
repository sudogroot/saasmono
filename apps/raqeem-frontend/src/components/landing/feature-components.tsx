import React from "react";
import { Badge, Heading, Text } from "@repo/ui";
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
        <Heading level={3} className="font-semibold">إدارة القضايا</Heading>
      </div>

      <div className="space-y-3">
        <div className="flex items-center justify-between p-3 bg-blue-50 rounded-lg">
          <div className="flex items-center gap-3">
            <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
            <Text as="span" size="sm">دعوى تجارية تونس #2024-001</Text>
          </div>
          <Badge variant="default">نشطة</Badge>
        </div>
        <div className="flex items-center justify-between p-3 bg-green-50 rounded-lg">
          <div className="flex items-center gap-3">
            <div className="w-2 h-2 bg-green-500 rounded-full"></div>
            <Text as="span" size="sm">قضية عقارية صفاقس #2024-002</Text>
          </div>
          <Badge variant="secondary">مغلقة</Badge>
        </div>
        <div className="flex items-center justify-between p-3 bg-yellow-50 rounded-lg">
          <div className="flex items-center gap-3">
            <div className="w-2 h-2 bg-yellow-500 rounded-full"></div>
            <Text as="span" size="sm">دعوى مدنية سوسة #2024-003</Text>
          </div>
          <Badge variant="outline">معلقة</Badge>
        </div>
      </div>

      <div className="pt-4 border-t">
        <div className="flex items-center justify-between text-gray-600">
          <Text as="span" size="sm">إجمالي القضايا: 24</Text>
          <Text as="span" size="sm">نشطة: 8</Text>
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
        <Heading level={3} className="font-semibold">المواعيد والجدولة</Heading>
      </div>

      <div className="space-y-3">
        <div className="text-center p-4 bg-gray-50 rounded-lg">
          <Heading level={2} className="font-bold text-gray-900">15</Heading>
          <Text size="sm" className="text-gray-600">ديسمبر 2024</Text>
        </div>

        <div className="space-y-2">
          <div className="flex items-center gap-3 p-3 bg-red-50 rounded-lg">
            <Clock className="h-4 w-4 text-red-600" />
            <div className="flex-1">
              <Text size="sm" className="font-medium">جلسة محكمة الناحية تونس</Text>
              <Text size="xs" className="text-gray-600">10:00 ص - قصر العدالة</Text>
            </div>
          </div>
          <div className="flex items-center gap-3 p-3 bg-blue-50 rounded-lg">
            <Users className="h-4 w-4 text-blue-600" />
            <div className="flex-1">
              <Text size="sm" className="font-medium">لقاء عميل - سيدي بوزيد</Text>
              <Text size="xs" className="text-gray-600">2:00 م - مكتب المحاماة</Text>
            </div>
          </div>
          <div className="flex items-center gap-3 p-3 bg-green-50 rounded-lg">
            <FileText className="h-4 w-4 text-green-600" />
            <div className="flex-1">
              <Text size="sm" className="font-medium">تسليم مذكرة دفاع</Text>
              <Text size="xs" className="text-gray-600">5:00 م - محكمة الاستئناف</Text>
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
        <Heading level={3} className="font-semibold">إدارة الملفات</Heading>
      </div>

      <div className="space-y-3">
        <div className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg">
          <FileText className="h-4 w-4 text-blue-600" />
          <div className="flex-1">
            <Text size="sm" className="font-medium">وكالة خاصة_تونس.pdf</Text>
            <Text size="xs" className="text-gray-600">تم الرفع منذ يومين • 2.4 MB</Text>
          </div>
        </div>
        <div className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg">
          <FileText className="h-4 w-4 text-green-600" />
          <div className="flex-1">
            <Text size="sm" className="font-medium">عريضة افتتاح دعوى.docx</Text>
            <Text size="xs" className="text-gray-600">تم الرفع منذ أسبوع • 1.8 MB</Text>
          </div>
        </div>
        <div className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg">
          <FileText className="h-4 w-4 text-red-600" />
          <div className="flex-1">
            <Text size="sm" className="font-medium">حكم محكمة تونس.pdf</Text>
            <Text size="xs" className="text-gray-600">تم الرفع منذ شهر • 956 KB</Text>
          </div>
        </div>
      </div>

      <div className="pt-4 border-t">
        <div className="flex items-center justify-between text-gray-600">
          <Text as="span" size="sm">المساحة المستخدمة: 15.2 GB</Text>
          <Text as="span" size="sm">الملفات: 142</Text>
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
        <Heading level={3} className="font-semibold">إدارة العملاء</Heading>
      </div>

      <div className="space-y-3">
        <div className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg">
          <div className="w-8 h-8 bg-blue-500 rounded-full flex items-center justify-center text-white text-sm font-semibold">
            م
          </div>
          <div className="flex-1">
            <Text size="sm" className="font-medium">محمد الطرابلسي</Text>
            <Text size="xs" className="text-gray-600">آخر تواصل: منذ 3 أيام</Text>
          </div>
          <Badge variant="default">نشط</Badge>
        </div>
        <div className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg">
          <div className="w-8 h-8 bg-green-500 rounded-full flex items-center justify-center text-white text-sm font-semibold">
            ل
          </div>
          <div className="flex-1">
            <Text size="sm" className="font-medium">ليلى بن صالح</Text>
            <Text size="xs" className="text-gray-600">آخر تواصل: منذ أسبوع</Text>
          </div>
          <Badge variant="secondary">مكتمل</Badge>
        </div>
        <div className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg">
          <div className="w-8 h-8 bg-purple-500 rounded-full flex items-center justify-center text-white text-sm font-semibold">
            ع
          </div>
          <div className="flex-1">
            <Text size="sm" className="font-medium">عمر الزويتيني</Text>
            <Text size="xs" className="text-gray-600">آخر تواصل: منذ شهر</Text>
          </div>
          <Badge variant="outline">متابعة</Badge>
        </div>
      </div>

      <div className="pt-4 border-t">
        <div className="flex items-center justify-between text-gray-600">
          <Text as="span" size="sm">إجمالي العملاء: 89</Text>
          <Text as="span" size="sm">نشطين: 34</Text>
        </div>
      </div>
    </div>
  );
}