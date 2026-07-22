import { useState } from "react";
import { motion } from "framer-motion";
import { Search, Plus, MoreHorizontal, Edit, Trash2 } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { EmptyState } from "@/components/ui-custom/EmptyState";

const INITIAL_CATEGORIES: any[] = [];

export default function AdminCategories() {
  const [categories, setCategories] = useState(INITIAL_CATEGORIES);
  const [searchTerm, setSearchTerm] = useState("");
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [newCategory, setNewCategory] = useState({ name: "", description: "", status: "Active" });

  const filtered = categories.filter(c => 
    c.name.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const handleAddCategory = () => {
    if (!newCategory.name) return;
    const added = {
      id: Math.max(0, ...categories.map(c => c.id)) + 1,
      name: newCategory.name,
      description: newCategory.description,
      itemsCount: 0,
      status: newCategory.status
    };
    setCategories([added, ...categories]);
    setIsModalOpen(false);
    setNewCategory({ name: "", description: "", status: "Active" });
  };

  const handleDelete = (id: number) => {
    setCategories(categories.filter(c => c.id !== id));
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="space-y-6"
    >
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Categories</h1>
          <p className="text-muted-foreground">Manage your product categories</p>
        </div>
        <Button className="rounded-xl min-h-[44px] py-2 px-4" onClick={() => setIsModalOpen(true)}>
          <Plus className="mr-2 h-4 w-4" /> Add Category
        </Button>
      </div>

      <div className="glass-panel p-6 rounded-2xl">
        <div className="flex flex-col md:flex-row gap-4 mb-6">
          <div className="relative flex-1 w-full md:max-w-md">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input 
              placeholder="Search categories..." 
              className="pl-9 bg-background/50 border-border/50 w-full min-h-[48px] md:min-h-[40px]"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
        </div>

        {/* Mobile View */}
        <div className="md:hidden space-y-4">
          {filtered.length === 0 ? (
            <EmptyState icon="🏷️" title="No categories found" description="Create a new category to get started." />
          ) : (
            filtered.map((category) => (
              <div key={category.id} className="bg-background/50 border border-border/50 rounded-xl p-4 flex flex-col gap-4">
                <div>
                  <div className="font-semibold text-lg">{category.name}</div>
                  <div className="text-sm text-muted-foreground">{category.description || "No description"}</div>
                </div>
                <div className="flex justify-between items-center text-sm">
                  <div>
                    <div className="text-muted-foreground">Items</div>
                    <div className="font-medium">{category.itemsCount}</div>
                  </div>
                  <div>
                    <span className={`px-2.5 py-1 rounded-full text-xs font-medium ${
                      category.status === 'Active' ? 'bg-emerald-500/10 text-emerald-500' : 'bg-rose-500/10 text-rose-500'
                    }`}>
                      {category.status}
                    </span>
                  </div>
                </div>
                <div className="flex gap-2 mt-2">
                  <Button variant="outline" className="flex-1 min-h-[48px]">
                    <Edit className="h-4 w-4 mr-2" /> Edit
                  </Button>
                  <Button 
                    variant="outline" 
                    className="flex-1 min-h-[48px] text-destructive hover:bg-destructive/10"
                    onClick={() => handleDelete(category.id)}
                  >
                    <Trash2 className="h-4 w-4 mr-2" /> Delete
                  </Button>
                </div>
              </div>
            ))
          )}
        </div>

        {/* Desktop View */}
        <div className="hidden md:block rounded-xl border border-border/50 overflow-hidden bg-background/50">
          <div className="overflow-x-auto w-full">
            <table className="w-full text-sm text-left">
              <thead className="bg-muted/50 text-muted-foreground font-medium border-b border-border/50">
                <tr>
                  <th className="px-6 py-4">Category Name</th>
                  <th className="px-6 py-4">Description</th>
                  <th className="px-6 py-4">Items Count</th>
                  <th className="px-6 py-4">Status</th>
                  <th className="px-6 py-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody>
                {filtered.length === 0 ? (
                  <tr>
                    <td colSpan={5} className="p-0">
                      <div className="py-10">
                        <EmptyState icon="🏷️" title="No categories found" description="Create a new category to get started." />
                      </div>
                    </td>
                  </tr>
                ) : (
                  filtered.map((category) => (
                    <tr key={category.id} className="border-b border-border/50 hover:bg-muted/20 transition-colors">
                      <td className="px-6 py-4 font-medium whitespace-nowrap">{category.name}</td>
                      <td className="px-6 py-4 text-muted-foreground">{category.description}</td>
                      <td className="px-6 py-4">{category.itemsCount}</td>
                      <td className="px-6 py-4">
                        <span className={`px-2.5 py-1 rounded-full text-xs font-medium ${
                          category.status === 'Active' ? 'bg-emerald-500/10 text-emerald-500' : 'bg-rose-500/10 text-rose-500'
                        }`}>
                          {category.status}
                        </span>
                      </td>
                      <td className="px-6 py-4 text-right">
                        <div className="flex justify-end gap-2">
                          <Button variant="ghost" size="icon" className="h-10 w-10 text-muted-foreground hover:text-primary">
                            <Edit className="h-4 w-4" />
                          </Button>
                          <Button 
                            variant="ghost" 
                            size="icon" 
                            className="h-10 w-10 text-muted-foreground hover:text-destructive"
                            onClick={() => handleDelete(category.id)}
                          >
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </div>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>

      <Dialog open={isModalOpen} onOpenChange={setIsModalOpen}>
        <DialogContent className="w-full h-[100dvh] sm:h-auto sm:max-w-2xl sm:rounded-2xl overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Add New Category</DialogTitle>
          </DialogHeader>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 py-4">
            <div className="space-y-2">
              <Label htmlFor="name">Category Name</Label>
              <Input 
                id="name" 
                placeholder="e.g. Electronics" 
                className="min-h-[48px] md:min-h-[40px]"
                value={newCategory.name}
                onChange={(e) => setNewCategory({...newCategory, name: e.target.value})}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="status">Status</Label>
              <select 
                id="status"
                className="flex min-h-[48px] md:min-h-[40px] w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                value={newCategory.status}
                onChange={(e) => setNewCategory({...newCategory, status: e.target.value})}
              >
                <option value="Active">Active</option>
                <option value="Inactive">Inactive</option>
              </select>
            </div>
            <div className="space-y-2 md:col-span-2">
              <Label htmlFor="desc">Description</Label>
              <Input 
                id="desc" 
                placeholder="Short description..." 
                className="min-h-[48px] md:min-h-[40px]"
                value={newCategory.description}
                onChange={(e) => setNewCategory({...newCategory, description: e.target.value})}
              />
            </div>
          </div>
          <DialogFooter className="flex-col sm:flex-row gap-2 mt-4">
            <Button variant="outline" className="w-full sm:w-auto min-h-[48px] md:min-h-[44px] py-2 px-4" onClick={() => setIsModalOpen(false)}>Cancel</Button>
            <Button className="w-full sm:w-auto min-h-[48px] md:min-h-[44px] py-2 px-4" onClick={handleAddCategory} disabled={!newCategory.name}>Save Category</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </motion.div>
  );
}
