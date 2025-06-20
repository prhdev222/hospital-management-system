import Sidebar from "@/components/Sidebar";
import RoleDemo from "@/components/RoleDemo";

export default function RoleDemoPage() {
  return (
    <div className="flex h-screen overflow-hidden bg-medical-gray">
      <Sidebar />
      
      <div className="flex-1 flex flex-col overflow-hidden">
        {/* Header */}
        <header className="bg-white shadow-sm border-b border-gray-200 px-6 py-4">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-2xl font-semibold text-gray-900">
                ตัวอย่างสิทธิ์การเข้าถึง
              </h2>
              <p className="text-sm text-gray-500">
                เปรียบเทียบความแตกต่างของสิทธิ์การเข้าถึงแต่ละบทบาท
              </p>
            </div>
          </div>
        </header>

        {/* Content */}
        <main className="flex-1 overflow-y-auto">
          <RoleDemo />
        </main>
      </div>
    </div>
  );
}