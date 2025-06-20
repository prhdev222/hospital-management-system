import { useState } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { Plus, Search, Edit, TestTube, Calendar, TrendingUp, AlertCircle, Printer, FileText } from "lucide-react";
import Sidebar from "@/components/Sidebar";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Badge } from "@/components/ui/badge";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useToast } from "@/hooks/use-toast";
import { apiRequest, queryClient } from "@/lib/queryClient";
import type { Patient, LabResult } from "@/types";

export default function LabResults() {
  const [searchQuery, setSearchQuery] = useState("");
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false);
  const [newResult, setNewResult] = useState({
    patientId: 0,
    testType: "",
    results: {},
    testDate: "",
  });
  const { toast } = useToast();

  // Function to format JSON results as readable text
  const formatLabResultAsText = (result: LabResult & { patient?: Patient }) => {
    let text = `ผลการตรวจทางห้องปฏิบัติการ\n`;
    text += `ประจำวันที่: ${new Date(result.testDate).toLocaleDateString('th-TH')}\n`;
    text += `ผู้ป่วย: ${result.patient?.firstName || ''} ${result.patient?.lastName || ''}\n`;
    text += `HN: ${result.patient?.hn || ''}\n`;
    text += `ประเภทการตรวจ: ${result.testType}\n`;
    text += `\n=== ผลการตรวจ ===\n`;
    
    try {
      const jsonResults = typeof result.results === 'string' 
        ? JSON.parse(result.results) 
        : result.results;
      
      if (typeof jsonResults === 'object' && jsonResults !== null) {
        Object.entries(jsonResults).forEach(([key, value]) => {
          text += `${key}: ${value}\n`;
        });
      } else {
        text += `${jsonResults}\n`;
      }
    } catch (e) {
      text += `${result.results}\n`;
    }
    
    text += `\nสถานะ: ${result.status || 'เสร็จสิ้น'}\n`;
    if (result.notes) {
      text += `หมายเหตุ: ${result.notes}\n`;
    }
    text += `\nวันที่บันทึก: ${new Date(result.createdAt || '').toLocaleDateString('th-TH')}\n`;
    
    return text;
  };

  // Function to print lab result as text
  const printLabResult = (result: LabResult & { patient?: Patient }) => {
    const textContent = formatLabResultAsText(result);
    const printWindow = window.open('', '_blank');
    if (printWindow) {
      printWindow.document.write(`
        <html>
          <head>
            <title>ผลการตรวจ - ${result.patient?.firstName} ${result.patient?.lastName}</title>
            <style>
              body { font-family: 'Sarabun', Arial, sans-serif; margin: 20px; line-height: 1.6; }
              pre { white-space: pre-wrap; font-family: inherit; }
            </style>
          </head>
          <body>
            <pre>${textContent}</pre>
          </body>
        </html>
      `);
      printWindow.document.close();
      printWindow.print();
    }
  };

  // Function to format JSON for display
  const formatJsonForDisplay = (jsonString: string) => {
    try {
      const parsed = typeof jsonString === 'string' ? JSON.parse(jsonString) : jsonString;
      if (typeof parsed === 'object' && parsed !== null) {
        return Object.entries(parsed).map(([key, value]) => (
          <div key={key} className="flex justify-between py-1">
            <span className="font-medium text-gray-700">{key}:</span>
            <span className="text-gray-900">{String(value)}</span>
          </div>
        ));
      }
      return <span>{String(parsed)}</span>;
    } catch (e) {
      return <span>{jsonString}</span>;
    }
  };

  const { data: patients = [] } = useQuery<Patient[]>({
    queryKey: ["/api/patients"],
  });

  const { data: labResults = [] } = useQuery<(LabResult & { patient?: Patient })[]>({
    queryKey: ["/api/lab-results/all"],
    queryFn: async () => {
      const allResults: (LabResult & { patient?: Patient })[] = [];
      for (const patient of patients) {
        const response = await fetch(`/api/patients/${patient.id}/lab-results`);
        if (response.ok) {
          const results = await response.json();
          results.forEach((result: LabResult) => {
            allResults.push({ ...result, patient });
          });
        }
      }
      return allResults.sort((a, b) => new Date(b.testDate).getTime() - new Date(a.testDate).getTime());
    },
    enabled: patients.length > 0,
  });

  const createResultMutation = useMutation({
    mutationFn: async (resultData: typeof newResult) => {
      await apiRequest("POST", "/api/lab-results", resultData);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/lab-results"] });
      setIsAddDialogOpen(false);
      setNewResult({ patientId: 0, testType: "", results: {}, testDate: "" });
      toast({
        title: "สำเร็จ",
        description: "เพิ่มผลการตรวจเรียบร้อยแล้ว",
      });
    },
  });

  const handleAddResult = () => {
    if (newResult.patientId && newResult.testType && newResult.testDate) {
      createResultMutation.mutate(newResult);
    }
  };

  const getTestTypeIcon = (testType: string) => {
    switch (testType.toLowerCase()) {
      case "cbc":
        return <TestTube className="w-4 h-4 text-red-600" />;
      case "chemistry":
      case "bun":
      case "creatinine":
      case "lft":
        return <TestTube className="w-4 h-4 text-blue-600" />;
      case "coagulation":
        return <TestTube className="w-4 h-4 text-purple-600" />;
      case "tumor_marker":
        return <TrendingUp className="w-4 h-4 text-orange-600" />;
      default:
        return <TestTube className="w-4 h-4 text-gray-600" />;
    }
  };

  const getTestTypeName = (testType: string) => {
    const typeMap: Record<string, string> = {
      cbc: "CBC (Complete Blood Count)",
      chemistry: "Chemistry Panel",
      bun: "BUN",
      creatinine: "Creatinine",
      elyte: "Electrolytes",
      lft: "Liver Function Test",
      coagulation: "Coagulation Studies",
      tumor_marker: "Tumor Markers",
      echocardiogram: "Echocardiogram",
      b2microglobulin: "β2-Microglobulin",
      viral_studies: "Viral Studies",
    };
    return typeMap[testType.toLowerCase()] || testType;
  };

  const renderLabValues = (results: any, testType: string) => {
    if (!results || typeof results !== 'object') return null;

    const normalRanges: Record<string, Record<string, string>> = {
      cbc: {
        wbc: "4.0-10.0 × 10³/μL",
        rbc: "4.5-5.5 × 10⁶/μL",
        hgb: "12.0-16.0 g/dL",
        hct: "36-46%",
        plt: "150-450 × 10³/μL",
      },
      chemistry: {
        glucose: "70-100 mg/dL",
        bun: "7-20 mg/dL",
        creatinine: "0.6-1.2 mg/dL",
        sodium: "136-145 mEq/L",
        potassium: "3.5-5.0 mEq/L",
      },
      lft: {
        alt: "10-40 U/L",
        ast: "10-40 U/L",
        bilirubin: "0.2-1.2 mg/dL",
        albumin: "3.5-5.0 g/dL",
      },
    };

    const ranges = normalRanges[testType.toLowerCase()] || {};

    return (
      <div className="grid grid-cols-2 gap-2 text-sm">
        {Object.entries(results).map(([key, value]) => (
          <div key={key} className="flex justify-between">
            <span className="font-medium text-gray-600">{key.toUpperCase()}:</span>
            <div className="text-right">
              <span className="text-gray-900">{String(value)}</span>
              {ranges[key] && (
                <div className="text-xs text-gray-500">({ranges[key]})</div>
              )}
            </div>
          </div>
        ))}
      </div>
    );
  };

  const filteredResults = labResults.filter(result =>
    result.patient?.firstName?.toLowerCase().includes(searchQuery.toLowerCase()) ||
    result.patient?.lastName?.toLowerCase().includes(searchQuery.toLowerCase()) ||
    result.patient?.hn?.toLowerCase().includes(searchQuery.toLowerCase()) ||
    result.testType.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="flex h-screen overflow-hidden bg-medical-gray">
      <Sidebar />
      
      <div className="flex-1 flex flex-col overflow-hidden">
        {/* Header */}
        <header className="bg-white shadow-sm border-b border-gray-200 px-6 py-4">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-2xl font-semibold text-gray-900">
                ผลการตรวจ
              </h2>
              <p className="text-sm text-gray-500">
                จัดการผลการตรวจทางห้องปฏิบัติการและการตรวจต่างๆ
              </p>
            </div>
            <Dialog open={isAddDialogOpen} onOpenChange={setIsAddDialogOpen}>
              <DialogTrigger asChild>
                <Button className="bg-medical-green hover:bg-medical-green/90">
                  <Plus className="w-4 h-4 mr-2" />
                  เพิ่มผลการตรวจ
                </Button>
              </DialogTrigger>
              <DialogContent className="max-w-2xl">
                <DialogHeader>
                  <DialogTitle>เพิ่มผลการตรวจใหม่</DialogTitle>
                </DialogHeader>
                <div className="space-y-4">
                  <div>
                    <Label>ผู้ป่วย</Label>
                    <Select onValueChange={(value) => setNewResult({ ...newResult, patientId: parseInt(value) })}>
                      <SelectTrigger>
                        <SelectValue placeholder="เลือกผู้ป่วย" />
                      </SelectTrigger>
                      <SelectContent>
                        {patients.map((patient) => (
                          <SelectItem key={patient.id} value={patient.id.toString()}>
                            {patient.firstName} {patient.lastName} (HN: {patient.hn})
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>

                  <div>
                    <Label>ประเภทการตรวจ</Label>
                    <Select onValueChange={(value) => setNewResult({ ...newResult, testType: value })}>
                      <SelectTrigger>
                        <SelectValue placeholder="เลือกประเภทการตรวจ" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="cbc">CBC (Complete Blood Count)</SelectItem>
                        <SelectItem value="chemistry">Chemistry Panel</SelectItem>
                        <SelectItem value="lft">Liver Function Test</SelectItem>
                        <SelectItem value="coagulation">Coagulation Studies</SelectItem>
                        <SelectItem value="tumor_marker">Tumor Markers</SelectItem>
                        <SelectItem value="viral_studies">Viral Studies</SelectItem>
                        <SelectItem value="echocardiogram">Echocardiogram</SelectItem>
                        <SelectItem value="b2microglobulin">β2-Microglobulin</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  <div>
                    <Label>วันที่ตรวจ</Label>
                    <Input
                      type="date"
                      value={newResult.testDate}
                      onChange={(e) => setNewResult({ ...newResult, testDate: e.target.value })}
                    />
                  </div>

                  <div>
                    <Label>ผลการตรวจ (JSON Format)</Label>
                    <textarea
                      className="w-full p-3 border rounded-lg"
                      rows={4}
                      placeholder='{"wbc": "5.2", "rbc": "4.8", "hgb": "14.2", "hct": "42", "plt": "280"}'
                      onChange={(e) => {
                        try {
                          const parsed = JSON.parse(e.target.value);
                          setNewResult({ ...newResult, results: parsed });
                        } catch {
                          // Invalid JSON, keep current state
                        }
                      }}
                    />
                  </div>

                  <Button 
                    onClick={handleAddResult}
                    disabled={!newResult.patientId || !newResult.testType || !newResult.testDate || createResultMutation.isPending}
                    className="w-full"
                  >
                    เพิ่มผลการตรวจ
                  </Button>
                </div>
              </DialogContent>
            </Dialog>
          </div>
        </header>

        {/* Content */}
        <main className="flex-1 overflow-y-auto p-6">
          {/* Search */}
          <div className="mb-6">
            <div className="relative max-w-md">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
              <Input
                placeholder="ค้นหาด้วยชื่อผู้ป่วย HN หรือประเภทการตรวจ"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-10"
              />
            </div>
          </div>

          {/* Lab Results List */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {filteredResults.length === 0 ? (
              <div className="col-span-full text-center py-12">
                <p className="text-gray-500">
                  {searchQuery ? "ไม่พบผลการตรวจที่ตรงกับการค้นหา" : "ยังไม่มีผลการตรวจ"}
                </p>
              </div>
            ) : (
              filteredResults.map((result) => (
                <Card key={result.id} className="hover:shadow-md transition-shadow">
                  <CardHeader className="pb-3">
                    <div className="flex items-start justify-between">
                      <div className="flex items-center space-x-3">
                        <div className="p-2 bg-gray-100 rounded-lg">
                          {getTestTypeIcon(result.testType)}
                        </div>
                        <div>
                          <CardTitle className="text-lg">
                            {result.patient?.firstName} {result.patient?.lastName}
                          </CardTitle>
                          <p className="text-sm text-gray-500">
                            HN: {result.patient?.hn} • อายุ {result.patient?.age} ปี
                          </p>
                        </div>
                      </div>
                      <div className="flex items-center space-x-2">
                        <Badge variant="outline" className="text-xs">
                          {new Date(result.testDate).toLocaleDateString('th-TH')}
                        </Badge>
                        <Button size="sm" variant="outline">
                          <Edit className="w-3 h-3" />
                        </Button>
                      </div>
                    </div>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-4">
                      <div className="flex items-center justify-between">
                        <span className="text-sm font-medium text-gray-600">ประเภทการตรวจ:</span>
                        <Badge variant="secondary">{getTestTypeName(result.testType)}</Badge>
                      </div>
                      
                      <div className="border-t border-gray-200 pt-4">
                        <h4 className="text-sm font-medium text-gray-700 mb-3">ผลการตรวจ (JSON):</h4>
                        <div className="bg-gray-50 p-3 rounded-lg border">
                          {formatJsonForDisplay(result.results)}
                        </div>
                      </div>

                      {result.notes && (
                        <div className="pt-3 border-t border-gray-200">
                          <h4 className="text-sm font-medium text-gray-700 mb-2">หมายเหตุ:</h4>
                          <p className="text-sm text-gray-600">{result.notes}</p>
                        </div>
                      )}

                      <div className="pt-3 border-t border-gray-200">
                        <div className="flex space-x-2">
                          <Button 
                            size="sm" 
                            variant="outline" 
                            className="flex-1"
                            onClick={() => printLabResult(result)}
                          >
                            <Printer className="w-3 h-3 mr-1" />
                            พิมพ์ผล
                          </Button>
                          <Dialog>
                            <DialogTrigger asChild>
                              <Button size="sm" variant="outline" className="flex-1">
                                <FileText className="w-3 h-3 mr-1" />
                                ดู JSON
                              </Button>
                            </DialogTrigger>
                            <DialogContent className="max-w-2xl">
                              <DialogHeader>
                                <DialogTitle>ผลการตรวจ JSON - {result.patient?.firstName} {result.patient?.lastName}</DialogTitle>
                              </DialogHeader>
                              <div className="space-y-4">
                                <div>
                                  <Label className="text-sm font-medium">ข้อมูลผู้ป่วย:</Label>
                                  <div className="mt-1 text-sm text-gray-600">
                                    {result.patient?.firstName} {result.patient?.lastName} (HN: {result.patient?.hn})
                                  </div>
                                </div>
                                <div>
                                  <Label className="text-sm font-medium">ประเภทการตรวจ:</Label>
                                  <div className="mt-1 text-sm text-gray-600">{result.testType}</div>
                                </div>
                                <div>
                                  <Label className="text-sm font-medium">วันที่ตรวจ:</Label>
                                  <div className="mt-1 text-sm text-gray-600">
                                    {new Date(result.testDate).toLocaleDateString('th-TH')}
                                  </div>
                                </div>
                                <div>
                                  <Label className="text-sm font-medium">ผลการตรวจ (JSON):</Label>
                                  <pre className="mt-2 p-3 bg-gray-50 rounded-lg border text-sm overflow-auto max-h-64">
                                    {JSON.stringify(
                                      typeof result.results === 'string' 
                                        ? JSON.parse(result.results) 
                                        : result.results, 
                                      null, 
                                      2
                                    )}
                                  </pre>
                                </div>
                                <div className="flex justify-end space-x-2">
                                  <Button 
                                    variant="outline" 
                                    onClick={() => {
                                      navigator.clipboard.writeText(JSON.stringify(
                                        typeof result.results === 'string' 
                                          ? JSON.parse(result.results) 
                                          : result.results, 
                                        null, 
                                        2
                                      ));
                                      toast({
                                        title: "คัดลอกแล้ว",
                                        description: "คัดลอก JSON ไปยังคลิปบอร์ดแล้ว",
                                      });
                                    }}
                                  >
                                    คัดลอก JSON
                                  </Button>
                                  <Button onClick={() => printLabResult(result)}>
                                    <Printer className="w-4 h-4 mr-2" />
                                    พิมพ์เป็น Text
                                  </Button>
                                </div>
                              </div>
                            </DialogContent>
                          </Dialog>
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))
            )}
          </div>
        </main>
      </div>
    </div>
  );
}