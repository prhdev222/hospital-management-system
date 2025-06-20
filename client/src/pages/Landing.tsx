import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Hospital } from "lucide-react";

export default function Landing() {
  return (
    <div className="min-h-screen bg-medical-gray flex items-center justify-center">
      <Card className="w-full max-w-md mx-4">
        <CardContent className="pt-6 text-center">
          <div className="flex justify-center mb-6">
            <div className="w-16 h-16 bg-medical-blue rounded-xl flex items-center justify-center">
              <Hospital className="w-8 h-8 text-white" />
            </div>
          </div>
          
          <h1 className="text-2xl font-semibold text-gray-900 mb-2">
            โรงพยาบาลสงฆ์
          </h1>
          <p className="text-lg text-gray-600 mb-6">
            ระบบจัดการผู้ป่วยมะเร็งทางโลหิตวิทยา
          </p>
          
          <p className="text-sm text-gray-500 mb-6">
            กรุณาเข้าสู่ระบบเพื่อเข้าใช้งานแดชบอร์ดหอผู้ป่วยเคมีบำบัด
          </p>
          
          <Button 
            onClick={() => window.location.href = '/api/login'}
            className="w-full bg-medical-blue hover:bg-medical-blue/90"
          >
            เข้าสู่ระบบ
          </Button>
        </CardContent>
      </Card>
    </div>
  );
}
