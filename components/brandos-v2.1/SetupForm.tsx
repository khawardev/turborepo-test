
'use client'

import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { engagementConfigSchema, EngagementConfigV2 } from '@/lib/brandos-v2.1/schemas';
import { createEngagementAction } from '@/server/brandos-v2.1/actions';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { toast } from 'sonner';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { Plus, Trash2, Wand2 } from 'lucide-react';
import { Separator } from '@/components/ui/separator';
import { DashboardLayoutHeading } from '@/components/stages/ccba/dashboard/shared/DashboardComponents';

export default function SetupForm() {
  const router = useRouter();
  const [activeTab, setActiveTab] = useState("basics");
  const [isSubmitting, setIsSubmitting] = useState(false);

  const form = useForm<any>({
    resolver: zodResolver(engagementConfigSchema) as any,
    defaultValues: {
      details: {
        engagementName: '',
        clientName: '',
        industry: ''
      },
      competitors: [],
      channels: {
        linkedin: { enabled: true, lookbackDays: 365, maxPosts: 200, collectComments: true },
        youtube: { enabled: false, lookbackDays: 365, maxPosts: 200, collectComments: true },
        instagram: { enabled: false, lookbackDays: 365, maxPosts: 200, collectComments: true },
        twitter: { enabled: false, lookbackDays: 365, maxPosts: 200, collectComments: true },
        facebook: { enabled: false, lookbackDays: 365, maxPosts: 200, collectComments: true },
        tiktok: { enabled: false, lookbackDays: 365, maxPosts: 200, collectComments: true },
      }
    }
  });

  const autofill = () => {
    const randomId = Math.floor(Math.random() * 1000);
    const mockCompetitors = [
      { id: crypto.randomUUID(), name: 'Competitor X', website: 'https://compx.com', socials: { linkedin: 'company/compx', twitter: '@compx' } },
      { id: crypto.randomUUID(), name: 'Rival Corp', website: 'https://rival.inc', socials: { linkedin: 'company/rival', instagram: '@rival_official' } }
    ];

    form.setValue('details', {
        engagementName: `Audit Project Alpha ${randomId}`,
        clientName: `Acme Innovations ${randomId}`,
        industry: 'Enterprise Software'
    });
    form.setValue('competitors', mockCompetitors);
    form.setValue('channels.linkedin.enabled', true);
    form.setValue('channels.twitter.enabled', true);
    form.setValue('channels.youtube.enabled', true);
    
    toast.success('Form autofilled with test data');
  };

  const onSubmit = async (data: EngagementConfigV2) => {
    setIsSubmitting(true);
    try {
      const result = await createEngagementAction(data);
      if (result.success) {
        toast.success('Engagement created successfully');
        router.push(`/dashboard/brandos-v2.1/phase-0?engagementId=${result.engagementId}`);
      } else {
        toast.error(result.error || 'Something went wrong');
      }
    } catch (error) {
      toast.error('Failed to submit');
    } finally {
      setIsSubmitting(false);
    }
  };

  const nextTab = (next: string) => setValueTab(next);
  const setValueTab = (val: string) => setActiveTab(val);

  return (
    <div>
      <DashboardLayoutHeading
        title="New Engagement Setup"
        subtitle="Define scope, competitive frame, and analysis parameters."
      />
      <div className="flex justify-end w-full items-end mt-6 ">
        <Button onClick={autofill} variant="outline">
          <Wand2 />
          Autofill
        </Button>
      </div>

      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-8">
        <Tabs value={activeTab} onValueChange={setValueTab} className="w-full">
          <TabsList className="grid w-full grid-cols-3 max-w-[600px]">
            <TabsTrigger value="basics">Basics</TabsTrigger>
            <TabsTrigger value="competitors">Competitive Frame</TabsTrigger>
            <TabsTrigger value="channels">Channels & Scope</TabsTrigger>
          </TabsList>
          
          <TabsContent value="basics" className="space-y-8 animate-in fade-in-50 slide-in-from-bottom-2 pt-6">
            <div className="mb-6">
                <h2 className="text-2xl font-medium mb-2">Engagement Basics</h2>
                <p className="text-muted-foreground">Enter the core details for this analysis engagement.</p>
            </div>
            
            <div className="grid gap-8 max-w-2xl">
                <div className="space-y-3">
                  <Label htmlFor="engagementName" className="text-base">Engagement Name</Label>
                  <Input 
                    id="engagementName" 
                    className="h-12 text-lg"
                    placeholder="e.g. Q4 Brand Audit 2025" 
                    {...form.register('details.engagementName')}
                  />
                  {(form.formState.errors as any).details?.engagementName && (
                    <p className="text-sm text-red-500">{(form.formState.errors as any).details.engagementName.message}</p>
                  )}
                </div>
                <div className="space-y-3">
                  <Label htmlFor="clientName" className="text-base">Client Name</Label>
                  <Input 
                    id="clientName" 
                    className="h-12 text-lg"
                    placeholder="e.g. Acme Corp" 
                    {...form.register('details.clientName')}
                  />
                  {(form.formState.errors as any).details?.clientName && (
                    <p className="text-sm text-red-500">{(form.formState.errors as any).details.clientName.message}</p>
                  )}
                </div>
                <div className="space-y-3">
                  <Label htmlFor="industry" className="text-base">Industry <span className="text-muted-foreground font-normal">(Optional)</span></Label>
                  <Input 
                    id="industry" 
                    className="h-12 text-lg"
                    placeholder="e.g. SaaS, Retail" 
                    {...form.register('details.industry')}
                  />
                </div>
            </div>

            <div className="pt-6">
                <Button type="button" size="lg" onClick={() => nextTab('competitors')}>Next: Competitors</Button>
            </div>
          </TabsContent>

          <TabsContent value="competitors" className="space-y-8 animate-in fade-in-50 slide-in-from-bottom-2">
             <CompetitorSection form={form} />
             <div className="flex gap-4 pt-6">
                <Button type="button" variant="ghost" size="lg" onClick={() => nextTab('basics')}>Back</Button>
                <Button type="button" size="lg" onClick={() => nextTab('channels')}>Next: Channels</Button>
             </div>
          </TabsContent>

          <TabsContent value="channels" className="space-y-8 animate-in fade-in-50 slide-in-from-bottom-2">
            <ChannelSection form={form} />
            <div className="flex gap-4 pt-6">
               <Button type="button" variant="ghost" size="lg" onClick={() => nextTab('competitors')}>Back</Button>
               <Button type="submit" size="lg" disabled={isSubmitting} className="min-w-[150px]">
                 {isSubmitting ? 'Creating...' : 'Start Analysis'}
               </Button>
            </div>
          </TabsContent>
        </Tabs>
      </form>
    </div>
  );
}

function CompetitorSection({ form }: { form: any }) {
  const competitors = form.watch('competitors');

  const addCompetitor = () => {
    const current = form.getValues('competitors');
    form.setValue('competitors', [
      ...current, 
      { id: crypto.randomUUID(), name: '', website: '', socials: {} }
    ]);
  };

  const removeCompetitor = (index: number) => {
    const current = form.getValues('competitors');
    form.setValue('competitors', current.filter((_: any, i: number) => i !== index));
  };

  return (
    <div className="space-y-6">
      <div className="mb-6">
         <h2 className="text-2xl font-medium mb-2">Competitive Frame</h2>
         <p className="text-muted-foreground">Add competitors to analyze against the client.</p>
      </div>

      <div className="grid gap-6">
        {competitors.map((comp: any, index: number) => (
          <div key={comp.id} className="relative p-6 border rounded-xl bg-background/50 hover:bg-accent/5 transition-colors">
            <Button 
                type="button" 
                variant="ghost" 
                size="icon" 
                className="absolute top-4 right-4 text-muted-foreground hover:text-destructive"
                onClick={() => removeCompetitor(index)}
            >
                <Trash2 className="h-5 w-5" />
            </Button>
            <div className="grid md:grid-cols-2 gap-6 mb-6">
              <div className="space-y-2">
                <Label className="text-base">Competitor Name</Label>
                <Input className="h-11" {...form.register(`competitors.${index}.name`)} placeholder="Name" />
              </div>
              <div className="space-y-2">
                <Label className="text-base">Website URL</Label>
                <Input className="h-11" {...form.register(`competitors.${index}.website`)} placeholder="https://" />
              </div>
            </div>

            <div>
                <p className="text-sm font-medium mb-4 text-muted-foreground uppercase tracking-wider">Social Channels</p>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                    <div className="space-y-1.5">
                        <Label className="text-xs text-muted-foreground">LinkedIn</Label>
                        <Input className="h-9" {...form.register(`competitors.${index}.socials.linkedin`)} placeholder="company/..." />
                    </div>
                    <div className="space-y-1.5">
                        <Label className="text-xs text-muted-foreground">Twitter/X</Label>
                        <Input className="h-9" {...form.register(`competitors.${index}.socials.twitter`)} placeholder="@handle" />
                    </div>
                    <div className="space-y-1.5">
                        <Label className="text-xs text-muted-foreground">Instagram</Label>
                        <Input className="h-9" {...form.register(`competitors.${index}.socials.instagram`)} placeholder="@handle" />
                    </div>
                    <div className="space-y-1.5">
                        <Label className="text-xs text-muted-foreground">YouTube</Label>
                        <Input className="h-9" {...form.register(`competitors.${index}.socials.youtube`)} placeholder="@channel" />
                    </div>
                </div>
            </div>
          </div>
        ))}
      </div>
      
      {competitors.length === 0 && (
            <div className="text-center py-12 border-2 border-dashed rounded-xl text-muted-foreground">
                No competitors added yet.
            </div>
      )}
      
      <Button type="button" variant="secondary" size="lg" onClick={addCompetitor} className="w-full h-14 border-dashed border-2 bg-transparent hover:bg-accent">
          <Plus className="mr-2 h-5 w-5" /> Add Competitor
      </Button>
    </div>
  );
}

function ChannelSection({ form }: { form: any }) {
  const channels = ['linkedin', 'youtube', 'instagram', 'twitter', 'facebook', 'tiktok'];
  
  return (
    <div className="space-y-8">
      <div className="mb-6">
        <h2 className="text-2xl font-medium mb-2">Channels & Scope</h2>
        <p className="text-muted-foreground">Configure which channels to scrape and analyze.</p>
      </div>

      <div className="grid gap-0 divide-y">
        {channels.map((channel) => (
          <div key={channel} className="py-6 first:pt-0">
             <div className="flex items-start justify-between mb-4">
                 <Label className="text-xl capitalize font-medium">{channel}</Label>
                 <Switch 
                    className="scale-110"
                    checked={form.watch(`channels.${channel}.enabled`)}
                    onCheckedChange={(c) => form.setValue(`channels.${channel}.enabled`, c)}
                 />
             </div>
             
             {form.watch(`channels.${channel}.enabled`) && (
                 <div className="grid grid-cols-1 md:grid-cols-3 gap-6 animate-in fade-in-0 slide-in-from-top-1 bg-muted/30 p-4 rounded-lg">
                      <div className="space-y-2">
                        <Label className="text-sm text-muted-foreground">Lookback (Days)</Label>
                        <Input 
                            type="number" 
                            className="h-10"
                            {...form.register(`channels.${channel}.lookbackDays`, { valueAsNumber: true })} 
                        />
                      </div>
                      <div className="space-y-2">
                        <Label className="text-sm text-muted-foreground">Max Posts</Label>
                        <Input 
                            type="number" 
                            className="h-10"
                            {...form.register(`channels.${channel}.maxPosts`, { valueAsNumber: true })} 
                        />
                      </div>
                      <div className="flex flex-col justify-end pb-2">
                         <div className="flex items-center gap-3">
                            <Switch 
                                id={`comments-${channel}`}
                                checked={form.watch(`channels.${channel}.collectComments`)}
                                onCheckedChange={(c) => form.setValue(`channels.${channel}.collectComments`, c)}
                            />
                            <Label htmlFor={`comments-${channel}`} className="font-normal cursor-pointer">Collect Comments</Label>
                         </div>
                      </div>
                 </div>
             )}
          </div>
        ))}
      </div>
    </div>
  );
}
