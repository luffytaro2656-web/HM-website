import React, { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { PATIENTS } from "@/mocks/patients";
import { DOCTORS } from "@/mocks/doctors";
import { LAB_ORDERS, LabTestParameter, uploadLabResults, releaseLabResults } from "@/mocks/lab";
import { toast } from "sonner";
import { ShieldCheck, FileText, CheckCircle2, AlertCircle, Trash2, Plus, Printer, ShieldAlert } from "lucide-react";

interface ResultUploaderProps {
  onSuccess?: () => void;
}

export function ResultUploader({ onSuccess }: ResultUploaderProps) {
  const [selectedOrderId, setSelectedOrderId] = useState("");
  
  // Parameter builder states
  const [paramName, setParamName] = useState("");
  const [paramValue, setParamValue] = useState("");
  const [paramRange, setParamRange] = useState("");
  const [paramUnit, setParamUnit] = useState("");
  const [paramStatus, setParamStatus] = useState<"Normal" | "High" | "Low">("Normal");
  
  const [parameters, setParameters] = useState<LabTestParameter[]>([]);
  const [techName, setTechName] = useState("Sarah Jenkins");
  const [pdfAttached, setPdfAttached] = useState(false);
  const [verifierName, setVerifierName] = useState("Chief Pathologist Dr. Bose");

  // Get orders that need results uploaded or released
  const activeOrders = LAB_ORDERS.filter(
    (o) => o.status === "In Processing" || o.status === "Sample Collected" || o.status === "Resulted"
  );

  const activeOrder = LAB_ORDERS.find((o) => o.id === selectedOrderId);
  const patient = activeOrder ? PATIENTS.find((p) => p.id === activeOrder.patientId) : null;
  const doctor = activeOrder ? DOCTORS.find((d) => d.id === activeOrder.doctorId) : null;

  // Initialize parameters when order is selected
  const handleSelectOrder = (orderId: string) => {
    setSelectedOrderId(orderId);
    const order = LAB_ORDERS.find((o) => o.id === orderId);
    if (order && order.parameters) {
      setParameters(order.parameters);
      if (order.technicianName) setTechName(order.technicianName);
      if (order.pdfAttached) setPdfAttached(order.pdfAttached);
    } else {
      setParameters([]);
    }
  };

  const handleAddParameter = () => {
    if (!paramName || !paramValue) {
      toast.error("Parameter name and value are required");
      return;
    }
    const newParam: LabTestParameter = {
      name: paramName,
      value: paramValue,
      referenceRange: paramRange || "N/A",
      unit: paramUnit || "",
      status: paramStatus
    };
    setParameters([...parameters, newParam]);
    
    // Clear param states
    setParamName("");
    setParamValue("");
    setParamRange("");
    setParamUnit("");
  };

  const handleRemoveParameter = (index: number) => {
    setParameters(parameters.filter((_, idx) => idx !== index));
  };

  const handleSaveResults = () => {
    if (!selectedOrderId) return;
    if (parameters.length === 0) {
      toast.error("Please add at least one test parameter result");
      return;
    }

    const order = uploadLabResults(selectedOrderId, parameters, techName, pdfAttached);
    if (order) {
      toast.success("Results Recorded!", {
        description: `Lab values saved for order ${order.id}. Status changed to "Resulted". Pending medical verification.`,
      });
      if (onSuccess) onSuccess();
    }
  };

  const handleVerifyAndRelease = () => {
    if (!selectedOrderId) return;
    if (parameters.length === 0) {
      toast.error("Please add and save test parameters first");
      return;
    }

    // Auto-save first
    uploadLabResults(selectedOrderId, parameters, techName, pdfAttached);

    // Release
    const order = releaseLabResults(selectedOrderId, verifierName);
    if (order) {
      toast.success("Results Released!", {
        description: `Lab test ${order.id} has been signed off and released to the doctor and patient portal.`,
      });
      
      // Clear selection
      setSelectedOrderId("");
      setParameters([]);
      
      if (onSuccess) onSuccess();
    }
  };

  const handlePrint = () => {
    const printContent = document.getElementById("lab-report-printable");
    if (!printContent) return;

    const printWindow = window.open("about:blank", `_blank`, `left=100,top=100,width=800,height=900`);
    if (printWindow) {
      printWindow.document.write(`
        <html>
          <head>
            <title>HMS Diagnostic Lab Report</title>
            <style>
              body { font-family: 'Inter', sans-serif; padding: 40px; color: #333; }
              .header { text-align: center; border-bottom: 2px solid #0284c7; padding-bottom: 20px; margin-bottom: 30px; }
              .header h1 { margin: 0; color: #0369a1; font-size: 24px; }
              .header p { margin: 5px 0 0 0; font-size: 11px; color: #666; text-transform: uppercase; letter-spacing: 1px; }
              .section { border: 1px solid #e2e8f0; border-radius: 8px; padding: 15px; background: #f8fafc; margin-bottom: 25px; }
              .section h3 { margin-top: 0; border-bottom: 1px solid #e2e8f0; padding-bottom: 6px; font-size: 12px; color: #1e293b; text-transform: uppercase; }
              .grid { display: grid; grid-template-columns: 1fr 1fr; gap: 15px; font-size: 13px; }
              table { w-100: 100%; border-collapse: collapse; margin-top: 20px; font-size: 13px; width: 100%; }
              th { background: #f1f5f9; padding: 10px; text-align: left; font-weight: bold; border-bottom: 2px solid #e2e8f0; }
              td { padding: 10px; border-bottom: 1px solid #e2e8f0; }
              .status-High { color: #dc2626; font-weight: bold; }
              .status-Low { color: #d97706; font-weight: bold; }
              .footer { text-align: center; margin-top: 50px; font-size: 11px; color: #94a3b8; border-top: 1px solid #e2e8f0; padding-top: 20px; }
            </style>
          </head>
          <body>
            ${printContent.innerHTML}
            <script>
              window.onload = function() {
                window.print();
                setTimeout(function() { window.close(); }, 500);
              };
            </script>
          </body>
        </html>
      `);
      printWindow.document.close();
    }
  };

  return (
    <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
      {/* Parameter Entry & Configuration */}
      <div className="lg:col-span-7 space-y-4">
        <Card className="border border-border">
          <CardHeader className="p-4 pb-2">
            <CardTitle className="text-sm font-bold flex items-center gap-1.5">
              <FileText className="size-4 text-primary" />
              Structured Lab Value Entry
            </CardTitle>
            <CardDescription className="text-xs">
              Select an active test order, fill in key parameters, and sign off the report.
            </CardDescription>
          </CardHeader>
          <CardContent className="p-4 space-y-4">
            <div className="space-y-1.5">
              <Label className="text-xs font-semibold">Select Active Test Order</Label>
              <Select value={selectedOrderId} onValueChange={handleSelectOrder}>
                <SelectTrigger className="h-9 text-xs">
                  <SelectValue placeholder="Select active order..." />
                </SelectTrigger>
                <SelectContent className="max-h-[200px]">
                  {activeOrders.map((o) => {
                    const pat = PATIENTS.find((p) => p.id === o.patientId);
                    return (
                      <SelectItem key={o.id} value={o.id}>
                        {o.id} — {pat?.name} ({o.testType}) [{o.status}]
                      </SelectItem>
                    );
                  })}
                </SelectContent>
              </Select>
            </div>

            {activeOrder && (
              <div className="space-y-4 animate-fadeIn">
                {/* Parameter inputs builder */}
                <div className="border border-border rounded-xl p-4 bg-accent/20 space-y-3">
                  <h3 className="text-xs font-bold text-primary uppercase tracking-wider">Add Lab Parameter</h3>
                  <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                    <div className="space-y-1">
                      <Label className="text-[10px] font-semibold">Parameter Name</Label>
                      <Input
                        placeholder="e.g. Hemoglobin"
                        className="text-xs h-8"
                        value={paramName}
                        onChange={(e) => setParamName(e.target.value)}
                      />
                    </div>
                    <div className="space-y-1">
                      <Label className="text-[10px] font-semibold">Observed Value</Label>
                      <Input
                        placeholder="e.g. 13.8"
                        className="text-xs h-8"
                        value={paramValue}
                        onChange={(e) => setParamValue(e.target.value)}
                      />
                    </div>
                    <div className="space-y-1">
                      <Label className="text-[10px] font-semibold">Reference Range</Label>
                      <Input
                        placeholder="e.g. 12.0 - 16.0"
                        className="text-xs h-8"
                        value={paramRange}
                        onChange={(e) => setParamRange(e.target.value)}
                      />
                    </div>
                    <div className="space-y-1">
                      <Label className="text-[10px] font-semibold">Unit of Measure</Label>
                      <Input
                        placeholder="e.g. g/dL"
                        className="text-xs h-8"
                        value={paramUnit}
                        onChange={(e) => setParamUnit(e.target.value)}
                      />
                    </div>
                    <div className="space-y-1">
                      <Label className="text-[10px] font-semibold">Evaluation Status</Label>
                      <Select value={paramStatus} onValueChange={(v: any) => setParamStatus(v)}>
                        <SelectTrigger className="h-8 text-xs">
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="Normal">Normal</SelectItem>
                          <SelectItem value="High">High</SelectItem>
                          <SelectItem value="Low">Low</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                    <div className="flex items-end">
                      <Button
                        type="button"
                        onClick={handleAddParameter}
                        className="w-full h-8 text-xs gap-1"
                      >
                        <Plus className="size-3.5" />
                        Add Metric
                      </Button>
                    </div>
                  </div>
                </div>

                {/* Parameters table */}
                <div className="border border-border rounded-xl bg-card overflow-hidden">
                  <table className="w-full text-left border-collapse text-xs">
                    <thead>
                      <tr className="bg-accent/20 border-b border-border text-[10px] font-semibold text-muted-foreground uppercase">
                        <th className="p-2.5 pl-3">Parameter</th>
                        <th className="p-2.5">Value</th>
                        <th className="p-2.5">Ref Range</th>
                        <th className="p-2.5">Unit</th>
                        <th className="p-2.5">Evaluation</th>
                        <th className="p-2.5 pr-3 text-right">Delete</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-border">
                      {parameters.length > 0 ? (
                        parameters.map((param, index) => (
                          <tr key={index} className="hover:bg-accent/5">
                            <td className="p-2.5 pl-3 font-semibold">{param.name}</td>
                            <td className="p-2.5 font-medium">{param.value}</td>
                            <td className="p-2.5 text-muted-foreground">{param.referenceRange}</td>
                            <td className="p-2.5 font-mono">{param.unit}</td>
                            <td className="p-2.5">
                              <Badge
                                variant="outline"
                                className={`text-[9px] h-4.5 font-semibold ${
                                  param.status === "Normal"
                                    ? "bg-emerald-500/10 text-emerald-600 border-emerald-500/20"
                                    : param.status === "High"
                                    ? "bg-red-500/10 text-red-600 border-red-500/20"
                                    : "bg-amber-500/10 text-amber-600 border-amber-500/20"
                                }`}
                              >
                                {param.status}
                              </Badge>
                            </td>
                            <td className="p-2.5 pr-3 text-right">
                              <button
                                type="button"
                                onClick={() => handleRemoveParameter(index)}
                                className="text-red-500 hover:text-red-700 transition-colors"
                              >
                                <Trash2 className="size-3.5" />
                              </button>
                            </td>
                          </tr>
                        ))
                      ) : (
                        <tr>
                          <td colSpan={6} className="p-6 text-center text-muted-foreground italic">
                            No parameter values entered yet. Add metrics above.
                          </td>
                        </tr>
                      )}
                    </tbody>
                  </table>
                </div>

                {/* Sign off and verification credentials */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 border-t border-border pt-4">
                  <div className="space-y-1">
                    <Label className="text-xs font-semibold">Testing Lab Technician</Label>
                    <Input
                      className="text-xs h-9"
                      value={techName}
                      onChange={(e) => setTechName(e.target.value)}
                    />
                  </div>
                  <div className="space-y-1">
                    <Label className="text-xs font-semibold">Authorizing Verifier / Pathologist</Label>
                    <Input
                      className="text-xs h-9"
                      value={verifierName}
                      onChange={(e) => setVerifierName(e.target.value)}
                    />
                  </div>
                </div>

                {/* Action Buttons */}
                <div className="flex flex-wrap items-center gap-2 pt-2 justify-end">
                  <Button variant="outline" onClick={handleSaveResults} className="text-xs">
                    Save Draft Results
                  </Button>
                  <Button onClick={handleVerifyAndRelease} className="text-xs bg-emerald-600 hover:bg-emerald-700 text-white gap-1">
                    <ShieldCheck className="size-4" />
                    Verify & Release Report
                  </Button>
                </div>
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Laboratory Report Printable Preview */}
      <div className="lg:col-span-5">
        {activeOrder && parameters.length > 0 ? (
          <Card className="border border-border">
            <CardHeader className="p-4 pb-2 bg-sky-500/5 border-b border-border flex flex-row items-center justify-between">
              <div>
                <CardTitle className="text-sm font-bold flex items-center gap-1">
                  <FileText className="size-4 text-sky-600" />
                  Report preview
                </CardTitle>
                <CardDescription className="text-[10px]">
                  Real-time generated lab report.
                </CardDescription>
              </div>
              <Button size="sm" variant="outline" onClick={handlePrint} className="h-8 text-xs gap-1">
                <Printer className="size-3.5" />
                Print
              </Button>
            </CardHeader>
            <CardContent className="p-4">
              <div id="lab-report-printable" className="p-3 bg-white text-slate-800 rounded-lg border border-slate-200">
                <div className="header text-center border-b-2 border-sky-600 pb-3 mb-3">
                  <h1 className="text-base font-bold text-sky-950 uppercase tracking-wide">
                    HMS Diagnostic Laboratories
                  </h1>
                  <p className="text-[8px] text-slate-500 font-medium">
                    ISO 9001:2015 Accredited Pathology Reference Center
                  </p>
                </div>

                <div className="space-y-3 text-xs">
                  {/* Patient Info */}
                  <div className="border border-slate-200 rounded-md p-2 bg-slate-50/50">
                    <h3 className="font-bold text-slate-700 text-[9px] uppercase border-b border-slate-200 pb-1 mb-1.5">
                      Patient Profile & Demographics
                    </h3>
                    <div className="grid grid-cols-2 gap-1.5 text-[9px]">
                      <div><strong className="text-slate-500">Name:</strong> {patient?.name}</div>
                      <div><strong className="text-slate-500">UHID ID:</strong> {patient?.id}</div>
                      <div><strong className="text-slate-500">Age/Gender:</strong> {patient?.age} Yrs / {patient?.gender}</div>
                      <div><strong className="text-slate-500">Order ID:</strong> {activeOrder.id}</div>
                    </div>
                  </div>

                  {/* Order Info */}
                  <div className="border border-slate-200 rounded-md p-2 bg-slate-50/50">
                    <h3 className="font-bold text-slate-700 text-[9px] uppercase border-b border-slate-200 pb-1 mb-1.5">
                      Request Details
                    </h3>
                    <div className="grid grid-cols-2 gap-1.5 text-[9px]">
                      <div><strong className="text-slate-500">Test Profile:</strong> {activeOrder.testType}</div>
                      <div><strong className="text-slate-500">Urgency:</strong> {activeOrder.urgency}</div>
                      <div><strong className="text-slate-500">Ordering Dr:</strong> Dr. {doctor?.name}</div>
                      <div><strong className="text-slate-500">Specimen:</strong> {activeOrder.sampleType || "Blood"}</div>
                    </div>
                  </div>

                  {/* Findings Table */}
                  <table className="w-full text-left border-collapse text-[10px] mt-2">
                    <thead>
                      <tr className="bg-slate-100 border-b border-slate-300">
                        <th className="p-1.5 font-bold">Investigation Parameter</th>
                        <th className="p-1.5 font-bold">Value</th>
                        <th className="p-1.5 font-bold">Ref Range</th>
                        <th className="p-1.5 font-bold">Unit</th>
                        <th className="p-1.5 font-bold">Alert</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-200">
                      {parameters.map((param, pIdx) => (
                        <tr key={pIdx}>
                          <td className="p-1.5 font-semibold text-slate-900">{param.name}</td>
                          <td className="p-1.5 font-bold text-slate-800">{param.value}</td>
                          <td className="p-1.5 text-slate-500">{param.referenceRange}</td>
                          <td className="p-1.5 font-mono text-slate-600">{param.unit}</td>
                          <td className="p-1.5">
                            <span className={`font-bold uppercase text-[9px] ${
                              param.status === "High"
                                ? "status-High"
                                : param.status === "Low"
                                ? "status-Low"
                                : "text-slate-400"
                            }`}>
                              {param.status === "Normal" ? "" : param.status}
                            </span>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>

                <div className="mt-4 pt-3 border-t border-slate-200 flex justify-between text-[8px] text-slate-400">
                  <div>
                    <strong>Tested By:</strong> {techName} <br />
                    <span>Lab Technician</span>
                  </div>
                  <div className="text-right">
                    <strong>Authorized By:</strong> {verifierName} <br />
                    <span>Consultant Pathologist</span>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        ) : (
          <Card className="border border-dashed border-border flex flex-col items-center justify-center p-8 text-center text-muted-foreground h-[350px]">
            <Printer className="size-10 text-muted-foreground/30 mb-2" />
            <p className="text-xs font-semibold">No Active Report Generated</p>
            <p className="text-[10px] max-w-[200px] mt-1">
              Select an active test order and add parameter values to build the certificate here.
            </p>
          </Card>
        )}
      </div>
    </div>
  );
}
