import { useState, useEffect } from 'react';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Plus, Globe } from 'lucide-react';

interface Project {
  id: string;
  name: string;
  domain: string;
  created_at: string;
}

interface ProjectSelectorProps {
  selectedProject: Project | null;
  onProjectSelect: (project: Project) => void;
}

export function ProjectSelector({ selectedProject, onProjectSelect }: ProjectSelectorProps) {
  const [projects, setProjects] = useState<Project[]>([]);
  const [loading, setLoading] = useState(true);
  const [showCreateDialog, setShowCreateDialog] = useState(false);
  const [newProject, setNewProject] = useState({ name: '', domain: '' });
  const { toast } = useToast();

  useEffect(() => {
    loadProjects();
  }, []);

  const loadProjects = async () => {
    const { data, error } = await supabase
      .from('projects')
      .select('*')
      .order('created_at', { ascending: false });

    if (error) {
      toast({
        title: "Failed to load projects",
        description: error.message,
        variant: "destructive",
      });
    } else {
      setProjects(data || []);
      if (data && data.length > 0 && !selectedProject) {
        onProjectSelect(data[0]);
      }
    }
    setLoading(false);
  };

  const createProject = async () => {
    if (!newProject.name || !newProject.domain) {
      toast({
        title: "Missing fields",
        description: "Please enter both project name and domain",
        variant: "destructive",
      });
      return;
    }

    const { data, error } = await supabase
      .from('projects')
      .insert([{
        name: newProject.name,
        domain: newProject.domain,
        user_id: (await supabase.auth.getUser()).data.user?.id
      }])
      .select()
      .single();

    if (error) {
      toast({
        title: "Failed to create project",
        description: error.message,
        variant: "destructive",
      });
    } else {
      toast({
        title: "Project created",
        description: "Your new project has been created successfully",
      });
      setProjects([data, ...projects]);
      onProjectSelect(data);
      setShowCreateDialog(false);
      setNewProject({ name: '', domain: '' });
    }
  };

  if (loading) {
    return <div className="animate-pulse h-10 bg-muted rounded"></div>;
  }

  return (
    <div className="flex items-center gap-4">
      <div className="flex items-center gap-2">
        <Globe className="w-4 h-4 text-muted-foreground" />
        <Select
          value={selectedProject?.id || ''}
          onValueChange={(value) => {
            const project = projects.find(p => p.id === value);
            if (project) onProjectSelect(project);
          }}
        >
          <SelectTrigger className="w-64">
            <SelectValue placeholder="Select a project" />
          </SelectTrigger>
          <SelectContent>
            {projects.map((project) => (
              <SelectItem key={project.id} value={project.id}>
                <div className="flex flex-col items-start">
                  <span className="font-medium">{project.name}</span>
                  <span className="text-xs text-muted-foreground">{project.domain}</span>
                </div>
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      <Dialog open={showCreateDialog} onOpenChange={setShowCreateDialog}>
        <DialogTrigger asChild>
          <Button variant="outline" size="sm">
            <Plus className="w-4 h-4 mr-2" />
            New Project
          </Button>
        </DialogTrigger>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Create New Project</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="project-name">Project Name</Label>
              <Input
                id="project-name"
                placeholder="My Website"
                value={newProject.name}
                onChange={(e) => setNewProject({ ...newProject, name: e.target.value })}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="project-domain">Domain</Label>
              <Input
                id="project-domain"
                placeholder="mywebsite.com"
                value={newProject.domain}
                onChange={(e) => setNewProject({ ...newProject, domain: e.target.value })}
              />
            </div>
            <Button onClick={createProject} className="w-full">
              Create Project
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}