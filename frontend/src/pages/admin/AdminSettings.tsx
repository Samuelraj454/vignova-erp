import { useState } from "react";
import { motion } from "framer-motion";
import { Save, Store, Palette, Shield, CreditCard, Monitor, Moon, Sun, Lock, UserCheck, Percent, Banknote } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useTheme } from "@/stores/ThemeContext";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { toast } from "sonner";
import { simulateMessage } from "@/lib/simulator";

export default function AdminSettings() {
  const [activeTab, setActiveTab] = useState("general");
  const { theme: themeMode, setTheme: setThemeMode, accentColor, setAccentColor } = useTheme();
  
  const [is2faEnabled, setIs2faEnabled] = useState(false);
  const [is2faModalOpen, setIs2faModalOpen] = useState(false);
  const [twoFaCode, setTwoFaCode] = useState("");
  const [expectedCode, setExpectedCode] = useState("");

  const tabs = [
    { id: "general", label: "General Store", icon: Store },
    { id: "appearance", label: "Appearance", icon: Palette },
    { id: "payment", label: "Payment & Tax", icon: CreditCard },
    { id: "security", label: "Security", icon: Shield },
  ];

  const handleToggle2FA = () => {
    if (is2faEnabled) {
      setIs2faEnabled(false);
      toast.success("Two-Factor Authentication disabled.");
    } else {
      const code = Math.floor(100000 + Math.random() * 900000).toString();
      setExpectedCode(code);
      setIs2faModalOpen(true);
      
      setTimeout(() => {
        simulateMessage("sms", "Vignova Security", `Your Vignova CRM verification code is ${code}. Do not share this with anyone.`);
      }, 1500);
    }
  };

  const handleVerify2FA = () => {
    if (twoFaCode === expectedCode) {
      setIs2faEnabled(true);
      setIs2faModalOpen(false);
      setTwoFaCode("");
      toast.success("Two-Factor Authentication successfully enabled!");
    } else {
      toast.error("Invalid verification code. Please try again.");
    }
  };

  const handleUpdatePassword = async () => {
    if (window.PublicKeyCredential) {
      try {
        const challenge = new Uint8Array(32);
        window.crypto.getRandomValues(challenge);
        
        const userId = new Uint8Array(16);
        window.crypto.getRandomValues(userId);

        await navigator.credentials.create({
          publicKey: {
            challenge: challenge,
            rp: { name: "Vignova CRM" },
            user: {
              id: userId,
              name: "admin@vignova.com",
              displayName: "Admin",
            },
            pubKeyCredParams: [
              { type: "public-key", alg: -7 },
              { type: "public-key", alg: -257 }
            ],
            authenticatorSelection: {
              authenticatorAttachment: "platform",
              userVerification: "required"
            },
            timeout: 60000,
            attestation: "none"
          }
        });
        
        toast.success("Password updated successfully");
      } catch (err) {
        toast.error("Authentication cancelled or failed. Password not updated.");
      }
    } else {
      toast.success("Password updated successfully");
    }
  };

  return (
    <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="space-y-6 max-w-5xl mx-auto">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Settings</h1>
        <p className="text-muted-foreground">Manage your store preferences and configurations</p>
      </div>

      <div className="flex flex-col md:flex-row gap-8 mt-8">
        {/* Settings Sidebar */}
        <div className="w-full md:w-64 space-y-1">
          {tabs.map(tab => {
            const Icon = tab.icon;
            return (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-medium transition-all ${
                  activeTab === tab.id ? "bg-primary text-primary-foreground shadow-md shadow-primary/20" : "text-muted-foreground hover:bg-muted hover:text-foreground"
                }`}
              >
                <Icon className="h-4 w-4" />
                {tab.label}
              </button>
            )
          })}
        </div>

        {/* Settings Content */}
        <div className="flex-1 glass-panel p-6 sm:p-8 rounded-2xl min-h-[400px]">
          {activeTab === "general" && (
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-6">
              <h2 className="text-xl font-semibold border-b border-border/50 pb-4">General Store Information</h2>
              <div className="grid gap-6 sm:grid-cols-2">
                <div className="space-y-2">
                  <Label>Store Name</Label>
                  <Input defaultValue="Vignova CRM" className="bg-background/50" />
                </div>
                <div className="space-y-2">
                  <Label>Contact Email</Label>
                  <Input defaultValue="admin@vignova.com" type="email" className="bg-background/50" />
                </div>
                <div className="space-y-2">
                  <Label>Phone Number</Label>
                  <Input defaultValue="+1 (555) 000-0000" className="bg-background/50" />
                </div>
                <div className="space-y-2">
                  <Label>Store Address</Label>
                  <Input defaultValue="123 Tech Lane, Silicon Valley, CA" className="bg-background/50" />
                </div>
              </div>
              <div className="pt-4 flex justify-end">
                <Button className="rounded-xl" onClick={() => toast.success("Store details saved")}><Save className="mr-2 h-4 w-4" /> Save Changes</Button>
              </div>
            </motion.div>
          )}

          {activeTab === "appearance" && (
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-6">
              <h2 className="text-xl font-semibold border-b border-border/50 pb-4">Appearance Preferences</h2>
              
              <div className="space-y-4">
                <Label className="text-base">Theme Mode</Label>
                <div className="grid grid-cols-3 gap-4">
                  <button onClick={() => setThemeMode("light")} className={`flex flex-col items-center justify-center p-4 rounded-xl border-2 transition-all ${themeMode === "light" ? "border-primary bg-primary/5" : "border-transparent bg-muted/50 hover:bg-muted"}`}>
                    <Sun className="h-6 w-6 mb-2" />
                    <span className="text-sm font-medium">Light</span>
                  </button>
                  <button onClick={() => setThemeMode("dark")} className={`flex flex-col items-center justify-center p-4 rounded-xl border-2 transition-all ${themeMode === "dark" ? "border-primary bg-primary/5" : "border-transparent bg-muted/50 hover:bg-muted"}`}>
                    <Moon className="h-6 w-6 mb-2" />
                    <span className="text-sm font-medium">Dark</span>
                  </button>
                  <button onClick={() => setThemeMode("system")} className={`flex flex-col items-center justify-center p-4 rounded-xl border-2 transition-all ${themeMode === "system" ? "border-primary bg-primary/5" : "border-transparent bg-muted/50 hover:bg-muted"}`}>
                    <Monitor className="h-6 w-6 mb-2" />
                    <span className="text-sm font-medium">System</span>
                  </button>
                </div>
              </div>

              <div className="space-y-4 pt-4">
                <Label className="text-base">Accent Color</Label>
                <div className="flex gap-4">
                  {["blue", "purple", "rose", "emerald", "amber"].map(color => (
                    <button
                      key={color}
                      onClick={() => setAccentColor(color)}
                      className={`h-10 w-10 rounded-full transition-transform hover:scale-110 ${accentColor === color ? "ring-2 ring-offset-2 ring-primary scale-110" : ""}`}
                      style={{ 
                        backgroundColor: 
                          color === 'blue' ? '#3b82f6' : 
                          color === 'purple' ? '#a855f7' : 
                          color === 'rose' ? '#f43f5e' : 
                          color === 'emerald' ? '#10b981' : '#f59e0b'
                      }}
                    />
                  ))}
                </div>
              </div>

              <div className="pt-4 flex justify-end">
                <Button className="rounded-xl" onClick={() => toast.success("Appearance saved")}><Save className="mr-2 h-4 w-4" /> Save Appearance</Button>
              </div>
            </motion.div>
          )}

          {activeTab === "payment" && (
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-6">
              <h2 className="text-xl font-semibold border-b border-border/50 pb-4">Payment & Tax Configuration</h2>
              
              <div className="grid gap-6 sm:grid-cols-2">
                <div className="space-y-2">
                  <Label>Default Currency</Label>
                  <select className="flex h-10 w-full rounded-md border border-input bg-background/50 px-3 py-2 text-sm ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50">
                    <option value="USD">USD (₹)</option>
                    <option value="EUR">EUR (€)</option>
                    <option value="GBP">GBP (£)</option>
                    <option value="INR">INR (₹)</option>
                  </select>
                </div>
                <div className="space-y-2">
                  <Label>Default Tax Rate (%)</Label>
                  <div className="relative">
                    <Percent className="absolute left-3 top-2.5 h-4 w-4 text-muted-foreground" />
                    <Input defaultValue="10" type="number" className="bg-background/50 pl-9" />
                  </div>
                </div>
              </div>

              <div className="space-y-4 pt-4">
                <Label className="text-base">Accepted Payment Methods</Label>
                <div className="space-y-3">
                  <label className="flex items-center gap-3 p-3 rounded-lg border border-border/50 bg-background/30 hover:bg-background/50 cursor-pointer transition-colors">
                    <input type="checkbox" defaultChecked className="h-4 w-4 rounded border-gray-300 text-primary focus:ring-primary" />
                    <Banknote className="h-5 w-5 text-emerald-500" />
                    <span className="font-medium">Cash Payments</span>
                  </label>
                  <label className="flex items-center gap-3 p-3 rounded-lg border border-border/50 bg-background/30 hover:bg-background/50 cursor-pointer transition-colors">
                    <input type="checkbox" defaultChecked className="h-4 w-4 rounded border-gray-300 text-primary focus:ring-primary" />
                    <CreditCard className="h-5 w-5 text-blue-500" />
                    <span className="font-medium">Credit / Debit Cards</span>
                  </label>
                  <label className="flex items-center gap-3 p-3 rounded-lg border border-border/50 bg-background/30 hover:bg-background/50 cursor-pointer transition-colors">
                    <input type="checkbox" defaultChecked className="h-4 w-4 rounded border-gray-300 text-primary focus:ring-primary" />
                    <Store className="h-5 w-5 text-purple-500" />
                    <span className="font-medium">Store Credit</span>
                  </label>
                </div>
              </div>

              <div className="pt-4 flex justify-end">
                <Button className="rounded-xl" onClick={() => toast.success("Payment settings updated")}><Save className="mr-2 h-4 w-4" /> Update Payment Settings</Button>
              </div>
            </motion.div>
          )}

          {activeTab === "security" && (
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-6">
              <h2 className="text-xl font-semibold border-b border-border/50 pb-4">Security Settings</h2>
              
              <div className="space-y-4">
                <h3 className="text-sm font-medium text-muted-foreground uppercase tracking-wider">Change Password</h3>
                <div className="grid gap-4 sm:grid-cols-2">
                  <div className="space-y-2">
                    <Label>Current Password</Label>
                    <div className="relative">
                      <Lock className="absolute left-3 top-2.5 h-4 w-4 text-muted-foreground" />
                      <Input type="password" placeholder="••••••••" className="bg-background/50 pl-9" />
                    </div>
                  </div>
                  <div className="space-y-2 sm:col-start-1">
                    <Label>New Password</Label>
                    <div className="relative">
                      <Lock className="absolute left-3 top-2.5 h-4 w-4 text-muted-foreground" />
                      <Input type="password" placeholder="••••••••" className="bg-background/50 pl-9" />
                    </div>
                  </div>
                  <div className="space-y-2">
                    <Label>Confirm New Password</Label>
                    <div className="relative">
                      <Lock className="absolute left-3 top-2.5 h-4 w-4 text-muted-foreground" />
                      <Input type="password" placeholder="••••••••" className="bg-background/50 pl-9" />
                    </div>
                  </div>
                </div>
                <Button variant="secondary" className="mt-2" onClick={handleUpdatePassword}>Update Password</Button>
              </div>

              <div className="space-y-4 pt-6 border-t border-border/50">
                <h3 className="text-sm font-medium text-muted-foreground uppercase tracking-wider">Advanced Security</h3>
                <div className="flex items-center justify-between p-4 rounded-xl border border-border/50 bg-background/30">
                  <div className="flex items-center gap-3">
                    <div className={`h-10 w-10 rounded-full flex items-center justify-center ${is2faEnabled ? "bg-emerald-500/10" : "bg-primary/10"}`}>
                      <UserCheck className={`h-5 w-5 ${is2faEnabled ? "text-emerald-500" : "text-primary"}`} />
                    </div>
                    <div>
                      <p className="font-medium">Two-Factor Authentication (2FA)</p>
                      <p className="text-sm text-muted-foreground">
                        {is2faEnabled ? "2FA is currently enabled for your account." : "Add an extra layer of security to your account."}
                      </p>
                    </div>
                  </div>
                  <Button 
                    variant={is2faEnabled ? "destructive" : "outline"}
                    onClick={handleToggle2FA}
                  >
                    {is2faEnabled ? "Disable 2FA" : "Enable 2FA"}
                  </Button>
                </div>
              </div>

            </motion.div>
          )}
        </div>
      </div>

      <Dialog open={is2faModalOpen} onOpenChange={setIs2faModalOpen}>
        <DialogContent className="w-[95vw] sm:max-w-md rounded-2xl">
          <DialogHeader>
            <DialogTitle>Enable Two-Factor Authentication</DialogTitle>
          </DialogHeader>
          <div className="flex flex-col items-center justify-center space-y-6 py-4">
            <div className="p-4 bg-primary/10 rounded-full">
              <Shield className="h-12 w-12 text-primary" />
            </div>
            <p className="text-center text-sm text-muted-foreground leading-relaxed px-4">
              We've sent a 6-digit verification code to your registered mobile device. Please enter it below to enable 2FA.
            </p>
            <div className="w-full space-y-3">
              <Label className="text-center block text-muted-foreground">Enter Verification Code</Label>
              <Input 
                value={twoFaCode}
                onChange={(e) => setTwoFaCode(e.target.value)}
                placeholder="000000" 
                className="text-center tracking-[0.5em] font-mono text-2xl h-14 bg-background/50 rounded-xl" 
                maxLength={6} 
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" className="rounded-xl w-full sm:w-auto" onClick={() => setIs2faModalOpen(false)}>Cancel</Button>
            <Button className="rounded-xl w-full sm:w-auto" onClick={handleVerify2FA}>Verify & Enable</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </motion.div>
  );
}
