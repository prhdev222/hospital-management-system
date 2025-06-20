import { useState } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Link, Edit, FileText, Pill, ShieldX, BookOpen, ExternalLink } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { apiRequest, queryClient } from "@/lib/queryClient";
import type { DocumentLink } from "@/types";

export default function DocumentLinks() {
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false);
  const [newLink, setNewLink] = useState({
    title: "",
    url: "",
    category: "",
  });
  const { toast } = useToast();

  const { data: documentLinks = [] } = useQuery<DocumentLink[]>({
    queryKey: ["/api/document-links"],
  });

  const addLinkMutation = useMutation({
    mutationFn: async (linkData: typeof newLink) => {
      await apiRequest("POST", "/api/document-links", linkData);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/document-links"] });
      setIsAddDialogOpen(false);
      setNewLink({ title: "", url: "", category: "" });
      toast({
        title: "สำเร็จ",
        description: "เพิ่มลิงก์เอกสารเรียบร้อยแล้ว",
      });
    },
  });

  const handleAddLink = () => {
    if (newLink.title && newLink.url && newLink.category) {
      addLinkMutation.mutate(newLink);
    }
  };

  const getCategoryIcon = (category: string) => {
    switch (category) {
      case "standing_order":
        return <FileText className="w-4 h-4 text-medical-blue" />;
      case "drug_info":
        return <Pill className="w-4 h-4 text-medical-green" />;
      case "patient_care":
        return <ShieldX className="w-4 h-4 text-yellow-600" />;
      case "guidelines":
        return <BookOpen className="w-4 h-4 text-purple-600" />;
      default:
        return <FileText className="w-4 h-4 text-gray-600" />;
    }
  };

  const getCategoryColor = (category: string) => {
    switch (category) {
      case "standing_order":
        return "bg-blue-100 group-hover:bg-blue-200";
      case "drug_info":
        return "bg-green-100 group-hover:bg-green-200";
      case "patient_care":
        return "bg-yellow-100 group-hover:bg-yellow-200";
      case "guidelines":
        return "bg-purple-100 group-hover:bg-purple-200";
      default:
        return "bg-gray-100 group-hover:bg-gray-200";
    }
  };

  // Group links by category
  const groupedLinks = documentLinks.reduce((acc, link) => {
    if (!acc[link.category]) {
      acc[link.category] = [];
    }
    acc[link.category].push(link);
    return acc;
  }, {} as Record<string, DocumentLink[]>);

  return (
    <div className="bg-white rounded-xl shadow-sm">
      <div className="p-6 border-b border-gray-200">
        <div className="flex items-center justify-between">
          <h3 className="text-lg font-semibold text-gray-900">
            <Link className="inline w-5 h-5 text-medical-blue mr-2" />
            เอกสารและแนวทาง
          </h3>
          <Dialog open={isAddDialogOpen} onOpenChange={setIsAddDialogOpen}>
            <DialogTrigger asChild>
              <Button size="sm" variant="outline">
                <Edit className="w-3 h-3" />
              </Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>เพิ่มลิงก์เอกสาร</DialogTitle>
              </DialogHeader>
              <div className="space-y-4">
                <div>
                  <Label htmlFor="title">ชื่อเอกสาร</Label>
                  <Input
                    id="title"
                    value={newLink.title}
                    onChange={(e) => setNewLink({ ...newLink, title: e.target.value })}
                    placeholder="เช่น Standing Order สูตรยาเคมีบำบัด"
                  />
                </div>
                <div>
                  <Label htmlFor="url">URL</Label>
                  <Input
                    id="url"
                    value={newLink.url}
                    onChange={(e) => setNewLink({ ...newLink, url: e.target.value })}
                    placeholder="https://drive.google.com/..."
                  />
                </div>
                <div>
                  <Label htmlFor="category">หมวดหมู่</Label>
                  <Select onValueChange={(value) => setNewLink({ ...newLink, category: value })}>
                    <SelectTrigger>
                      <SelectValue placeholder="เลือกหมวดหมู่" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="standing_order">Standing Order</SelectItem>
                      <SelectItem value="drug_info">ข้อมูลยา</SelectItem>
                      <SelectItem value="patient_care">การดูแลผู้ป่วย</SelectItem>
                      <SelectItem value="guidelines">แนวทางการรักษา</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <Button 
                  onClick={handleAddLink}
                  disabled={!newLink.title || !newLink.url || !newLink.category || addLinkMutation.isPending}
                  className="w-full"
                >
                  เพิ่มลิงก์
                </Button>
              </div>
            </DialogContent>
          </Dialog>
        </div>
      </div>
      
      <div className="p-6 space-y-3 max-h-96 overflow-y-auto">
        {documentLinks.length === 0 ? (
          <p className="text-gray-500 text-center py-8">ยังไม่มีลิงก์เอกสาร</p>
        ) : (
          documentLinks.map((link) => (
            <a
              key={link.id}
              href={link.url}
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center space-x-3 p-3 rounded-lg hover:bg-gray-50 transition-colors group"
            >
              <div className={`w-8 h-8 rounded-lg flex items-center justify-center transition-colors ${getCategoryColor(link.category)}`}>
                {getCategoryIcon(link.category)}
              </div>
              <div className="flex-1">
                <p className="text-sm font-medium text-gray-900">{link.title}</p>
                <p className="text-xs text-gray-500">Google Drive</p>
              </div>
              <ExternalLink className="w-4 h-4 text-gray-400 group-hover:text-medical-blue transition-colors" />
            </a>
          ))
        )}


      </div>
    </div>
  );
}
