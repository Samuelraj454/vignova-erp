import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Copy, Printer, Download } from "lucide-react";
import { toast } from "sonner";
import { useRef } from "react";
import html2canvas from "html2canvas";
import { jsPDF } from "jspdf";

interface Credentials {
  employee_id: string;
  username?: string;
  email?: string;
  temporary_password: string;
}

interface Props {
  isOpen: boolean;
  onClose: () => void;
  credentials: Credentials | null;
}

export function EmployeeCredentialsModal({ isOpen, onClose, credentials }: Props) {
  const printRef = useRef<HTMLDivElement>(null);

  if (!credentials) return null;

  const handleCopy = () => {
    const text = `Vignova CRM Credentials\nEmployee ID: ${credentials.employee_id}\nUsername: ${(credentials.username || credentials.email)}\nTemporary Password: ${credentials.temporary_password}`;
    navigator.clipboard.writeText(text);
    toast.success("Credentials copied to clipboard");
  };

  const handlePrint = () => {
    window.print();
  };

  const handleDownloadPDF = async () => {
    if (!printRef.current) return;
    try {
      const canvas = await html2canvas(printRef.current, { scale: 2 });
      const imgData = canvas.toDataURL("image/png");
      const pdf = new jsPDF();
      const imgProps = pdf.getImageProperties(imgData);
      const pdfWidth = pdf.internal.pageSize.getWidth();
      const pdfHeight = (imgProps.height * pdfWidth) / imgProps.width;
      pdf.addImage(imgData, "PNG", 0, 0, pdfWidth, pdfHeight);
      pdf.save(`Credentials-${credentials.employee_id}.pdf`);
      toast.success("PDF downloaded successfully");
    } catch (err) {
      toast.error("Failed to generate PDF");
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
      <DialogContent className="sm:max-w-md print:shadow-none print:border-none print:w-full">
        <DialogHeader>
          <DialogTitle>Employee Created Successfully</DialogTitle>
          <DialogDescription>
            Please save these credentials immediately. The temporary password will not be shown again.
          </DialogDescription>
        </DialogHeader>

        <div ref={printRef} className="p-6 bg-secondary/20 rounded-xl space-y-4 border border-border print:bg-white print:border-none print:text-black">
          <div className="text-center mb-6">
            <h2 className="text-2xl font-bold tracking-tight">Vignova CRM</h2>
            <p className="text-sm text-muted-foreground print:text-gray-500">Employee Access Credentials</p>
          </div>
          
          <div className="space-y-3">
            <div className="flex justify-between items-center py-2 border-b border-border/50">
              <span className="text-sm font-medium text-muted-foreground print:text-gray-600">Employee ID</span>
              <span className="font-mono font-bold">{credentials.employee_id}</span>
            </div>
            <div className="flex justify-between items-center py-2 border-b border-border/50">
              <span className="text-sm font-medium text-muted-foreground print:text-gray-600">Username</span>
              <span className="font-mono">{(credentials.username || credentials.email)}</span>
            </div>
            <div className="flex justify-between items-center py-2">
              <span className="text-sm font-medium text-muted-foreground print:text-gray-600">Temporary Password</span>
              <span className="font-mono bg-accent/20 px-2 py-1 rounded text-accent-foreground font-bold print:bg-transparent">
                {credentials.temporary_password}
              </span>
            </div>
          </div>
          
          <p className="text-xs text-muted-foreground text-center mt-4 print:text-gray-500">
            * You will be required to change this password on your first login.
          </p>
        </div>

        <div className="flex justify-between gap-2 mt-4 print:hidden">
          <Button variant="outline" className="flex-1 rounded-xl" onClick={handleCopy}>
            <Copy className="w-4 h-4 mr-2" /> Copy
          </Button>
          <Button variant="outline" className="flex-1 rounded-xl" onClick={handlePrint}>
            <Printer className="w-4 h-4 mr-2" /> Print
          </Button>
          <Button className="flex-1 rounded-xl bg-primary" onClick={handleDownloadPDF}>
            <Download className="w-4 h-4 mr-2" /> PDF
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
