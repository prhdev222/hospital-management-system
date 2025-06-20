import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Search, RotateCcw, FileText, FileSpreadsheet } from "lucide-react";
import type { AppointmentWithPatient } from "@/types";

export default function SearchPanel() {
  const [searchQuery, setSearchQuery] = useState("");
  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");
  const [isSearching, setIsSearching] = useState(false);

  const { data: searchResults = [] } = useQuery<AppointmentWithPatient[]>({
    queryKey: ["/api/appointments/date-range", startDate, endDate],
    enabled: isSearching && !!startDate && !!endDate,
    queryFn: async () => {
      const response = await fetch(`/api/appointments/date-range?startDate=${startDate}&endDate=${endDate}`);
      if (!response.ok) throw new Error('Failed to fetch appointments');
      return response.json();
    },
  });

  const handleSearch = () => {
    if (startDate && endDate) {
      setIsSearching(true);
    }
  };

  const handleReset = () => {
    setSearchQuery("");
    setStartDate("");
    setEndDate("");
    setIsSearching(false);
  };

  const handleExportPDF = () => {
    // TODO: Implement PDF export functionality
    console.log("Export individual patient report as PDF");
  };

  const handleExportExcel = () => {
    if (searchResults.length > 0) {
      // Create CSV content for 2-week appointments
      const csvContent = "data:text/csv;charset=utf-8," + 
        "วันที่,เวลา,ชื่อผู้ป่วย,HN,โทรศัพท์,สูตรยา,สถานะ\n" +
        searchResults.map(apt => {
          const date = new Date(apt.appointmentDate).toLocaleDateString('th-TH');
          const time = new Date(apt.appointmentDate).toLocaleTimeString('th-TH', { 
            hour: '2-digit', 
            minute: '2-digit' 
          });
          return `${date},${time},${apt.patient?.firstName} ${apt.patient?.lastName},${apt.patient?.hn},${apt.patient?.phoneNumber || ''},${apt.chemotherapyProtocol || ''},${apt.status}`;
        }).join("\n");

      const encodedUri = encodeURI(csvContent);
      const link = document.createElement("a");
      link.setAttribute("href", encodedUri);
      link.setAttribute("download", `appointments_${startDate}_to_${endDate}.csv`);
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
    }
  };

  const handleRescheduleAppointment = () => {
    // TODO: Implement reschedule functionality
    console.log("Reschedule appointment");
  };

  const handleEditAppointment = () => {
    // TODO: Implement edit appointment functionality
    console.log("Edit appointment data");
  };

  return (
    <div className="bg-white rounded-xl shadow-sm">
      <div className="p-6 border-b border-gray-200">
        <h3 className="text-lg font-semibold text-gray-900">
          <Search className="inline w-5 h-5 text-medical-blue mr-2" />
          ค้นหาและจัดการข้อมูล
        </h3>
      </div>
      
      <div className="p-6 space-y-4">
        {/* Search Form */}
        <div className="space-y-4">
          <div>
            <Label htmlFor="search" className="text-sm font-medium text-gray-700 mb-2">
              ค้นหาผู้ป่วย
            </Label>
            <div className="relative">
              <Input
                id="search"
                type="text"
                placeholder="ค้นหาด้วย HN, ชื่อ, หรือเบอร์โทร"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-10"
              />
              <Search className="absolute left-3 top-3 w-4 h-4 text-gray-400" />
            </div>
          </div>
          
          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label htmlFor="startDate" className="text-sm font-medium text-gray-700 mb-2">
                วันที่เริ่มต้น
              </Label>
              <Input
                id="startDate"
                type="date"
                value={startDate}
                onChange={(e) => setStartDate(e.target.value)}
              />
            </div>
            <div>
              <Label htmlFor="endDate" className="text-sm font-medium text-gray-700 mb-2">
                วันที่สิ้นสุด
              </Label>
              <Input
                id="endDate"
                type="date"
                value={endDate}
                onChange={(e) => setEndDate(e.target.value)}
              />
            </div>
          </div>

          <div className="flex space-x-2">
            <Button 
              onClick={handleSearch}
              className="bg-medical-blue hover:bg-medical-blue/90 flex-1"
              disabled={!startDate || !endDate}
            >
              <Search className="w-4 h-4 mr-2" />
              ค้นหา
            </Button>
            <Button 
              variant="outline"
              onClick={handleReset}
            >
              <RotateCcw className="w-4 h-4 mr-2" />
              รีเซ็ต
            </Button>
          </div>
        </div>

        {/* Search Results */}
        {isSearching && searchResults.length > 0 && (
          <div className="border-t border-gray-200 pt-4">
            <p className="text-sm text-gray-600 mb-2">
              พบ {searchResults.length} รายการในช่วงที่เลือก
            </p>
          </div>
        )}

        {/* Export Options */}
        <div className="border-t border-gray-200 pt-4">
          <h4 className="text-sm font-medium text-gray-700 mb-3">ส่งออกข้อมูล</h4>
          <div className="space-y-2">
            <Button
              variant="outline"
              className="w-full border-red-300 text-red-600 hover:bg-red-50"
              onClick={handleExportPDF}
            >
              <FileText className="w-4 h-4 mr-2" />
              ส่งออกรายงานผู้ป่วยรายคน (PDF)
            </Button>
            <Button
              variant="outline"
              className="w-full border-green-300 text-green-600 hover:bg-green-50"
              onClick={handleExportExcel}
              disabled={!isSearching || searchResults.length === 0}
            >
              <FileSpreadsheet className="w-4 h-4 mr-2" />
              ส่งออกนัดหมาย 2 สัปดาห์ (Excel)
            </Button>
          </div>
        </div>

        {/* Quick Actions */}
        <div className="border-t border-gray-200 pt-4">
          <h4 className="text-sm font-medium text-gray-700 mb-3">การดำเนินการด่วน</h4>
          <div className="space-y-2">
            <Button
              variant="outline"
              className="w-full border-orange-300 text-orange-600 hover:bg-orange-50"
              onClick={handleRescheduleAppointment}
            >
              <Search className="w-4 h-4 mr-2" />
              เลื่อนนัดหมาย
            </Button>
            <Button
              variant="outline"
              className="w-full border-yellow-300 text-yellow-600 hover:bg-yellow-50"
              onClick={handleEditAppointment}
            >
              <FileText className="w-4 h-4 mr-2" />
              แก้ไขข้อมูลนัดหมาย
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}
