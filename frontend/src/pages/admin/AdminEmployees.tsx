import { useState } from "react";
import { Plus, Search, MoreHorizontal, ShieldAlert, KeyRound, Ban, CheckCircle2, Trash2, History } from "lucide-react";
import { useEmployees, useUpdateEmployeeStatus, useUpdateEmployeeRole, useResetEmployeePassword, useDeleteEmployee, useCreateEmployee } from "@/hooks/useEmployees";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import html2canvas from 'html2canvas';
import jsPDF from 'jspdf';
import { Copy, Printer, Download } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
  DropdownMenuSeparator,
  DropdownMenuSub,
  DropdownMenuSubContent,
  DropdownMenuSubTrigger,
  DropdownMenuPortal,
} from "@/components/ui/dropdown-menu";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { EmployeeCredentialsModal } from "@/components/ui-custom/EmployeeCredentialsModal";
import { EmptyState } from "@/components/ui-custom/EmptyState";

export default function AdminEmployees() {
  const { data: employees = [], isLoading } = useEmployees();
  const createMutation = useCreateEmployee();
  const statusMutation = useUpdateEmployeeStatus();
  const roleMutation = useUpdateEmployeeRole();
  const resetMutation = useResetEmployeePassword();
  const deleteMutation = useDeleteEmployee();

  const [searchQuery, setSearchQuery] = useState("");
  const [createDialogOpen, setCreateDialogOpen] = useState(false);
  const [credentialsOpen, setCredentialsOpen] = useState(false);
  const [latestCredentials, setLatestCredentials] = useState<any>(null);

  // Form State
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    phone: "",
    address: "",
    department: "",
    role: "Employee",
  });

  const filteredEmployees = employees.filter(e => 
    e.name.toLowerCase().includes(searchQuery.toLowerCase()) || 
    e.email.toLowerCase().includes(searchQuery.toLowerCase()) ||
    (e.employeeId && e.employeeId.toLowerCase().includes(searchQuery.toLowerCase()))
  );

  const handleCreate = (e: React.FormEvent) => {
    e.preventDefault();
    createMutation.mutate(formData, {
      onSuccess: (data) => {
        setCreateDialogOpen(false);
        setLatestCredentials(data.credentials);
        setCredentialsOpen(true);
        setFormData({ name: "", email: "", phone: "", address: "", department: "", role: "Employee" });
      }
    });
  };

  const handleResetPassword = (id: string) => {
    if (confirm("Are you sure you want to reset this employee's password?")) {
      resetMutation.mutate(id, {
        onSuccess: (data) => {
          setLatestCredentials(data.credentials);
          setCredentialsOpen(true);
        }
      });
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Employee Management</h1>
          <p className="text-muted-foreground mt-1">Manage staff accounts, roles, and access credentials.</p>
        </div>
        <Button onClick={() => setCreateDialogOpen(true)} className="w-full sm:w-auto rounded-xl shadow-lg shadow-primary/20 bg-primary min-h-[48px] py-2 px-4">
          <Plus className="mr-2 h-4 w-4" /> Add Employee
        </Button>
      </div>

      <Card className="glass-card border-white/20 shadow-xl overflow-hidden">
        <CardHeader className="pb-4">
          <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
            <CardTitle>Staff Directory</CardTitle>
            <div className="relative w-full md:w-72">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Search by name, email, ID..."
                className="pl-9 w-full rounded-xl bg-background/50 border-white/10 focus-visible:ring-primary/30"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
            </div>
          </div>
        </CardHeader>
        <CardContent className="p-0">
          <div className="hidden md:block">
          <Table>
            <TableHeader className="bg-muted/50">
              <TableRow>
                <TableHead className="pl-6">Employee ID</TableHead>
                <TableHead>Name</TableHead>
                <TableHead>Email</TableHead>
                <TableHead>Role</TableHead>
                <TableHead>Department</TableHead>
                <TableHead>Status</TableHead>
                <TableHead className="text-right pr-6">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {isLoading ? (
                <TableRow>
                  <TableCell colSpan={7} className="text-center py-8 text-muted-foreground">Loading employees...</TableCell>
                </TableRow>
              ) : filteredEmployees.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={7} className="p-8">
                    <EmptyState 
                      icon="👥" 
                      title="No Employees Yet" 
                      description="You haven't added any employees yet, or no employees match your search." 
                      actionLabel="Add Employee" 
                      onAction={() => setCreateDialogOpen(true)} 
                    />
                  </TableCell>
                </TableRow>
              ) : (
                filteredEmployees.map((emp) => (
                  <TableRow key={emp.id} className="group hover:bg-muted/30 transition-colors">
                    <TableCell className="pl-6 font-mono font-medium">{emp.employeeId || "N/A"}</TableCell>
                    <TableCell className="font-semibold">{emp.name}</TableCell>
                    <TableCell className="text-muted-foreground">{emp.email}</TableCell>
                    <TableCell>
                      <Badge variant={emp.role === 'Admin' ? 'default' : emp.role === 'Manager' ? 'secondary' : 'outline'} className="rounded-md">
                        {emp.role}
                      </Badge>
                    </TableCell>
                    <TableCell>{emp.department || "-"}</TableCell>
                    <TableCell>
                      <Badge variant={emp.isActive ? "success" : "destructive"} className="rounded-md flex items-center w-fit gap-1">
                        {emp.isActive ? <CheckCircle2 className="w-3 h-3" /> : <Ban className="w-3 h-3" />}
                        {emp.isActive ? "Active" : "Disabled"}
                      </Badge>
                    </TableCell>
                    <TableCell className="text-right pr-6">
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button variant="ghost" size="icon" className="h-11 w-11 rounded-full opacity-0 group-hover:opacity-100 transition-opacity">
                            <MoreHorizontal className="h-4 w-4" />
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end" className="w-48 rounded-xl shadow-xl">
                          <DropdownMenuItem onClick={() => handleResetPassword(emp.id)}>
                            <KeyRound className="mr-2 h-4 w-4 text-blue-500" /> Reset Password
                          </DropdownMenuItem>
                          
                          <DropdownMenuSub>
                            <DropdownMenuSubTrigger>
                              <ShieldAlert className="mr-2 h-4 w-4 text-purple-500" /> Change Role
                            </DropdownMenuSubTrigger>
                            <DropdownMenuPortal>
                              <DropdownMenuSubContent className="rounded-xl">
                                {["Admin", "Manager", "Employee", "Cashier"].map(role => (
                                  <DropdownMenuItem key={role} onClick={() => roleMutation.mutate({ userId: emp.id, role })}>
                                    {role} {emp.role === role && "✓"}
                                  </DropdownMenuItem>
                                ))}
                              </DropdownMenuSubContent>
                            </DropdownMenuPortal>
                          </DropdownMenuSub>
                          
                          <DropdownMenuSeparator />
                          
                          {emp.isActive ? (
                            <DropdownMenuItem onClick={() => statusMutation.mutate({ userId: emp.id, status: "Disabled" })}>
                              <Ban className="mr-2 h-4 w-4 text-orange-500" /> Disable Account
                            </DropdownMenuItem>
                          ) : (
                            <DropdownMenuItem onClick={() => statusMutation.mutate({ userId: emp.id, status: "Active" })}>
                              <CheckCircle2 className="mr-2 h-4 w-4 text-green-500" /> Enable Account
                            </DropdownMenuItem>
                          )}
                          
                          <DropdownMenuItem onClick={() => {}} disabled>
                            <History className="mr-2 h-4 w-4 text-gray-500" /> View Logins
                          </DropdownMenuItem>
                          
                          <DropdownMenuSeparator />
                          <DropdownMenuItem className="text-red-600 focus:bg-red-500/10 focus:text-red-600" onClick={() => {
                            if (confirm("Are you sure you want to soft delete this employee?")) deleteMutation.mutate(emp.id);
                          }}>
                            <Trash2 className="mr-2 h-4 w-4" /> Delete Employee
                          </DropdownMenuItem>
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
          </div>
          
          <div className="md:hidden space-y-4 p-4">
            {isLoading ? (
              <div className="text-center py-8 text-muted-foreground">Loading employees...</div>
            ) : filteredEmployees.length === 0 ? (
              <EmptyState 
                icon="👥" 
                title="No Employees Yet" 
                description="You haven't added any employees yet, or no employees match your search." 
                actionLabel="Add Employee" 
                onAction={() => setCreateDialogOpen(true)} 
              />
            ) : (
              filteredEmployees.map((emp) => (
                <Card key={emp.id} className="glass-card">
                  <CardContent className="p-4 space-y-3">
                    <div className="flex justify-between items-start">
                      <div>
                        <p className="font-semibold">{emp.name}</p>
                        <p className="text-sm text-muted-foreground">{emp.email}</p>
                      </div>
                      <Badge variant={emp.isActive ? "success" : "destructive"} className="rounded-md">
                        {emp.isActive ? "Active" : "Disabled"}
                      </Badge>
                    </div>
                    <div className="grid grid-cols-2 gap-2 text-sm">
                      <div>
                        <span className="text-muted-foreground block text-xs mb-1">ID</span>
                        <span className="font-mono">{emp.employeeId || "N/A"}</span>
                      </div>
                      <div>
                        <span className="text-muted-foreground block text-xs mb-1">Role</span>
                        <Badge variant={emp.role === 'Admin' ? 'default' : emp.role === 'Manager' ? 'secondary' : 'outline'} className="rounded-md">
                          {emp.role}
                        </Badge>
                      </div>
                      <div className="col-span-2">
                        <span className="text-muted-foreground block text-xs mb-1">Department</span>
                        <span>{emp.department || "-"}</span>
                      </div>
                    </div>
                    <div className="pt-3 mt-3 border-t flex justify-end gap-2">
                      <Button variant="outline" size="sm" onClick={() => handleResetPassword(emp.id)} className="flex-1 min-h-[48px]">
                        <KeyRound className="h-4 w-4 mr-2" /> Reset Pwd
                      </Button>
                      <Button 
                        variant="outline" 
                        size="sm" 
                        className="flex-1 text-destructive hover:bg-destructive/10 hover:text-destructive min-h-[48px]"
                        onClick={() => {
                          if (confirm("Are you sure you want to soft delete this employee?")) deleteMutation.mutate(emp.id);
                        }}
                      >
                        <Trash2 className="h-4 w-4 mr-2" /> Delete
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              ))
            )}
          </div>
        </CardContent>
      </Card>

      {/* Create Employee Dialog */}
      <Dialog open={createDialogOpen} onOpenChange={setCreateDialogOpen}>
        <DialogContent className="w-full h-[100dvh] sm:h-auto sm:max-w-2xl sm:rounded-2xl overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Add New Employee</DialogTitle>
          </DialogHeader>
          <form onSubmit={handleCreate} className="space-y-4 py-4">
            <div className="grid gap-2">
              <Label htmlFor="name">Full Name *</Label>
              <Input id="name" required value={formData.name} onChange={e => setFormData({...formData, name: e.target.value})} className="rounded-xl" />
            </div>
            
            <div className="grid gap-2">
              <Label htmlFor="email">Email Address * (Username)</Label>
              <Input id="email" type="email" required value={formData.email} onChange={e => setFormData({...formData, email: e.target.value})} className="rounded-xl" />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="grid gap-2">
                <Label htmlFor="phone">Phone *</Label>
                <Input id="phone" required value={formData.phone} onChange={e => setFormData({...formData, phone: e.target.value})} className="rounded-xl" />
              </div>
              <div className="grid gap-2">
                <Label htmlFor="role">Role *</Label>
                <Select value={formData.role} onValueChange={v => setFormData({...formData, role: v})}>
                  <SelectTrigger className="rounded-xl"><SelectValue /></SelectTrigger>
                  <SelectContent className="rounded-xl">
                    <SelectItem value="Admin">Admin</SelectItem>
                    <SelectItem value="Manager">Manager</SelectItem>
                    <SelectItem value="Employee">Employee</SelectItem>
                    <SelectItem value="Cashier">Cashier</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="grid gap-2">
                <Label htmlFor="department">Department</Label>
                <Input id="department" value={formData.department} onChange={e => setFormData({...formData, department: e.target.value})} className="rounded-xl" />
              </div>
              <div className="grid gap-2">
                <Label htmlFor="address">Address</Label>
                <Input id="address" value={formData.address} onChange={e => setFormData({...formData, address: e.target.value})} className="rounded-xl" />
              </div>
            </div>

            <div className="flex flex-col sm:flex-row justify-end gap-3 mt-6">
              <Button type="button" variant="outline" onClick={() => setCreateDialogOpen(false)} className="w-full sm:w-auto rounded-xl min-h-[48px] py-2 px-4">Cancel</Button>
              <Button type="submit" disabled={createMutation.isPending} className="w-full sm:w-auto rounded-xl bg-primary min-h-[48px] py-2 px-4">
                {createMutation.isPending ? "Creating..." : "Create Employee"}
              </Button>
            </div>
          </form>
        </DialogContent>
      </Dialog>

      <EmployeeCredentialsModal 
        isOpen={credentialsOpen} 
        onClose={() => setCredentialsOpen(false)} 
        credentials={latestCredentials} 
      />
    </div>
  );
}
