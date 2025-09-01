-- Create projects table
CREATE TABLE public.projects (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL,
  name TEXT NOT NULL,
  domain TEXT NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create events table
CREATE TABLE public.events (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  project_id UUID NOT NULL REFERENCES public.projects(id) ON DELETE CASCADE,
  event_name TEXT NOT NULL DEFAULT 'pageview',
  url TEXT NOT NULL,
  referrer TEXT,
  country TEXT,
  browser TEXT,
  os TEXT,
  session_id TEXT,
  timestamp TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create ab_tests table
CREATE TABLE public.ab_tests (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  project_id UUID NOT NULL REFERENCES public.projects(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  variant_a TEXT NOT NULL,
  variant_b TEXT NOT NULL,
  status TEXT NOT NULL DEFAULT 'draft' CHECK (status IN ('draft', 'active', 'completed')),
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create heatmap_events table
CREATE TABLE public.heatmap_events (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  project_id UUID NOT NULL REFERENCES public.projects(id) ON DELETE CASCADE,
  page_url TEXT NOT NULL,
  click_x INTEGER,
  click_y INTEGER,
  scroll_depth REAL,
  viewport_width INTEGER,
  viewport_height INTEGER,
  timestamp TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create industry_benchmarks table
CREATE TABLE public.industry_benchmarks (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  industry TEXT NOT NULL,
  avg_conversion REAL NOT NULL DEFAULT 0,
  avg_bounce REAL NOT NULL DEFAULT 0,
  avg_session_duration REAL NOT NULL DEFAULT 0,
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create anomalies table for tracking spikes/drops
CREATE TABLE public.anomalies (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  project_id UUID NOT NULL REFERENCES public.projects(id) ON DELETE CASCADE,
  metric_type TEXT NOT NULL,
  expected_value REAL NOT NULL,
  actual_value REAL NOT NULL,
  severity TEXT NOT NULL CHECK (severity IN ('low', 'medium', 'high')),
  detected_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  is_resolved BOOLEAN DEFAULT FALSE
);

-- Create profiles table for user data
CREATE TABLE public.profiles (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL UNIQUE,
  display_name TEXT,
  email TEXT,
  avatar_url TEXT,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS on all tables
ALTER TABLE public.projects ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.events ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.ab_tests ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.heatmap_events ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.anomalies ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;

-- RLS policies for projects
CREATE POLICY "Users can view their own projects" 
ON public.projects 
FOR SELECT 
USING (auth.uid() = user_id);

CREATE POLICY "Users can create their own projects" 
ON public.projects 
FOR INSERT 
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own projects" 
ON public.projects 
FOR UPDATE 
USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own projects" 
ON public.projects 
FOR DELETE 
USING (auth.uid() = user_id);

-- RLS policies for events (users can view events for their projects)
CREATE POLICY "Users can view events for their projects" 
ON public.events 
FOR SELECT 
USING (project_id IN (SELECT id FROM public.projects WHERE user_id = auth.uid()));

CREATE POLICY "Allow tracking events for any project" 
ON public.events 
FOR INSERT 
WITH CHECK (true); -- Allow anonymous inserts for tracking

-- RLS policies for ab_tests
CREATE POLICY "Users can manage ab_tests for their projects" 
ON public.ab_tests 
FOR ALL 
USING (project_id IN (SELECT id FROM public.projects WHERE user_id = auth.uid()));

-- RLS policies for heatmap_events
CREATE POLICY "Users can view heatmap events for their projects" 
ON public.heatmap_events 
FOR SELECT 
USING (project_id IN (SELECT id FROM public.projects WHERE user_id = auth.uid()));

CREATE POLICY "Allow heatmap tracking for any project" 
ON public.heatmap_events 
FOR INSERT 
WITH CHECK (true); -- Allow anonymous inserts for tracking

-- RLS policies for anomalies
CREATE POLICY "Users can view anomalies for their projects" 
ON public.anomalies 
FOR ALL 
USING (project_id IN (SELECT id FROM public.projects WHERE user_id = auth.uid()));

-- RLS policies for profiles
CREATE POLICY "Users can view their own profile" 
ON public.profiles 
FOR SELECT 
USING (auth.uid() = user_id);

CREATE POLICY "Users can update their own profile" 
ON public.profiles 
FOR UPDATE 
USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own profile" 
ON public.profiles 
FOR INSERT 
WITH CHECK (auth.uid() = user_id);

-- Industry benchmarks are publicly readable
CREATE POLICY "Industry benchmarks are publicly readable" 
ON public.industry_benchmarks 
FOR SELECT 
USING (true);

-- Create function to update timestamps
CREATE OR REPLACE FUNCTION public.update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create triggers for timestamp updates
CREATE TRIGGER update_projects_updated_at
  BEFORE UPDATE ON public.projects
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_profiles_updated_at
  BEFORE UPDATE ON public.profiles
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();

-- Create indexes for better performance
CREATE INDEX idx_events_project_id ON public.events(project_id);
CREATE INDEX idx_events_timestamp ON public.events(timestamp);
CREATE INDEX idx_events_project_timestamp ON public.events(project_id, timestamp);
CREATE INDEX idx_heatmap_project_url ON public.heatmap_events(project_id, page_url);

-- Insert sample industry benchmarks
INSERT INTO public.industry_benchmarks (industry, avg_conversion, avg_bounce, avg_session_duration) VALUES
('E-commerce', 2.35, 47.2, 150),
('SaaS', 3.1, 52.8, 180),
('Blog/Media', 1.2, 68.5, 95),
('Agency', 4.2, 42.1, 210),
('Healthcare', 2.8, 55.3, 165);

-- Enable realtime for live updates
ALTER PUBLICATION supabase_realtime ADD TABLE public.events;
ALTER PUBLICATION supabase_realtime ADD TABLE public.anomalies;