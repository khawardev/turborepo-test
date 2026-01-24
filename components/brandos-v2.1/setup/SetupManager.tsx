'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { format } from "date-fns";
import { toast } from 'sonner';
import { DateRange } from 'react-day-picker';
import { engagementConfigSchema, EngagementConfigV2 } from '@/lib/brandos-v2.1/schemas';
import { addBrand } from '@/server/actions/brandActions';
import { setGatherCookies } from '@/server/actions/cookieActions';

import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { MdOutlineArrowRight, MdAutoAwesome } from "react-icons/md";
import { Globe, Linkedin, Twitter, Instagram, Youtube, Facebook } from 'lucide-react';
import { FaTiktok } from 'react-icons/fa';

import { CompetitorSection, ChannelSection, SocialInput } from './SetupComponents';

export function SetupManager() {
  const router = useRouter();
  const [activeTab, setActiveTab] = useState("basics");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [socialDateRange, setSocialDateRange] = useState<DateRange | undefined>({
      from: new Date(new Date().setDate(new Date().getDate() - 30)),
      to: new Date()
  });

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
      },
      scrapeSettings: {
        webLimit: 500
      }
    }
  });

  const autofill = () => {
    const mockCompetitors = [
      {
        id: crypto.randomUUID(),
        name: 'George P Johnson',
        website: 'https://www.gpj.com/',
        socials: {
          linkedin: 'https://www.linkedin.com/company/george-p-johnson/',
          twitter: 'https://x.com/GPJExpMktg',
          facebook: 'https://www.facebook.com/experiencegpj/',
          instagram: 'https://www.instagram.com/gpjexperiencemarketing/',
          youtube: 'https://www.youtube.com/user/georgepjohnson',
          tiktok: ''
        }
      },
      {
        id: crypto.randomUUID(),
        name: 'Astound Group',
        website: 'https://astoundgroup.com/',
        socials: {
          linkedin: 'https://www.linkedin.com/company/astoundgroup/',
          twitter: 'https://x.com/ASTOUNDGroup',
          facebook: 'https://www.facebook.com/ASTOUNDGroup/',
          instagram: 'https://www.instagram.com/astoundgroup/',
          youtube: 'https://www.youtube.com/user/astoundmedia',
          tiktok: ''
        }
      },
      {
        id: crypto.randomUUID(),
        name: 'EWI Worldwide',
        website: 'https://www.ewiworldwide.com/',
        socials: {
          linkedin: 'https://www.linkedin.com/company/ewi-worldwide/',
          twitter: '',
          facebook: '',
          instagram: 'https://www.instagram.com/ewiworldwide/',
          youtube: '', 
          tiktok: ''
        }
      },
        {
        id: crypto.randomUUID(),
        name: 'Activate Inc.',
        website: 'https://www.activateexp.com/',
        socials: {
          linkedin: 'https://www.linkedin.com/company/activate-inc-/',
          twitter: '',
          facebook: 'https://www.facebook.com/ActivateInc',
          instagram: 'https://www.instagram.com/activatedetroit/',
          youtube: '',
          tiktok: ''
        }
      },
      {
        id: crypto.randomUUID(),
        name: 'Hamilton Exhibits',
        website: 'https://hamilton-ex.com/',
        socials: {
          linkedin: 'https://www.linkedin.com/company/hamilton-ex/',
          twitter: 'https://x.com/Hamilton_Ex',
          facebook: 'https://www.facebook.com/hamilton.ex',
          instagram: 'https://www.instagram.com/hamilton.ex/',
          youtube: 'https://www.youtube.com/@hamilton-ex',
          tiktok: ''
        }
      },
      {
        id: crypto.randomUUID(),
        name: 'Spiro',
        website: 'https://spiro.com/',
        socials: {
          linkedin: 'https://www.linkedin.com/company/thisisspiro/',
          twitter: '',
          facebook: 'https://www.facebook.com/thisisspiro',
          instagram: 'https://www.instagram.com/thisisspiro/',
          youtube: '',
          tiktok: ''
        }
      },
      {
        id: crypto.randomUUID(),
        name: 'Sparks',
        website: 'https://www.wearesparks.com/',
        socials: {
          linkedin: 'https://www.linkedin.com/company/poweredbysparks/',
          twitter: 'https://x.com/poweredbysparks/',
          facebook: 'https://www.facebook.com/SparksMarketing',
          instagram: 'https://www.instagram.com/poweredbysparks/',
          youtube: 'https://www.youtube.com/user/SparksMktg',
          tiktok: ''
        }
      },
      {
        id: crypto.randomUUID(),
        name: 'Techcom, Inc.',
        website: 'https://www.techcom.com/',
        socials: {
          linkedin: 'https://www.linkedin.com/company/techcom-inc/',
          twitter: 'https://x.com/Techcom_indy',
          facebook: 'https://www.facebook.com/TechcomInc',
          instagram: 'https://www.instagram.com/techcom_inc/',
          youtube: 'https://www.youtube.com/@techcominc',
          tiktok: ''
        }
      },
      {
        id: crypto.randomUUID(),
        name: 'Bluewater Technologies',
        website: 'https://bluewatertech.com/',
        socials: {
          linkedin: 'https://www.linkedin.com/company/bluewater-technologies/',
          twitter: '',
          facebook: 'https://www.facebook.com/bluewatertechnologies',
          instagram: 'https://www.instagram.com/experiencebluewater',
          youtube: '',
          tiktok: ''
        }
      },
      {
        id: crypto.randomUUID(),
        name: 'Steelhead',
        website: 'https://steelheadproductions.com/',
        socials: {
          linkedin: 'https://www.linkedin.com/company/steelhead-productions/',
          twitter: 'https://x.com/ExhibitHappy',
          facebook: 'https://www.facebook.com/Steelhead.Productions/',
          instagram: 'https://www.instagram.com/exhibithappy/',
          youtube: 'https://www.youtube.com/@ExhibitHappy',
          tiktok: ''
        }
      }
    ];

    form.setValue('details', {
      engagementName: `Creative Solutions Group Analysis ${new Date().getFullYear()}`,
      clientName: 'Creative Solutions Group',
      clientWebsite: 'https://csgnow.com/',
      clientSocials: {
        linkedin: 'https://www.linkedin.com/company/creative-solutions-group/',
        twitter: '',
        instagram: 'https://www.instagram.com/csgnow/?hl=en',
        youtube: '',
        facebook: 'https://www.facebook.com/csgnow/',
        tiktok: ''
      },
      industry: 'Experiential Marketing'
    });
    form.setValue('competitors', mockCompetitors);
    
    // Enable all channels
    form.setValue('channels.linkedin.enabled', true);
    form.setValue('channels.instagram.enabled', true);
    form.setValue('channels.facebook.enabled', true);
    
    // Enable channels present in competitors even if main client doesn't use them heavily, to catch competitor data
    form.setValue('channels.twitter.enabled', true);
    form.setValue('channels.youtube.enabled', true);
    
    form.setValue('channels.tiktok.enabled', false);

    toast.success('Form autofilled with Creative Solutions Group data');
  };

  const onSubmit = async (data: EngagementConfigV2) => {
    setIsSubmitting(true);
    try {
      // 1. Create Brand (and Client implicit context)
      // Map form schema to addBrand schema
      
      const brandData = {
          name: data.details.clientName,
          url: data.details.clientWebsite || "",
          pathway: "A", 
          facebook_url: data.details.clientSocials?.facebook || "",
          linkedin_url: data.details.clientSocials?.linkedin || "",
          x_url: data.details.clientSocials?.twitter || "", 
          youtube_url: data.details.clientSocials?.youtube || "",
          instagram_url: data.details.clientSocials?.instagram || "",
          tiktok_url: data.details.clientSocials?.tiktok || "",
          // Map competitors
          competitors: data.competitors.map((comp: any) => ({
              name: comp.name,
              url: comp.website,
              facebook_url: comp.socials?.facebook || "", 
              linkedin_url: comp.socials?.linkedin || "",
              x_url: comp.socials?.twitter || "",
              youtube_url: comp.socials?.youtube || "",
              instagram_url: comp.socials?.instagram || "",
              tiktok_url: comp.socials?.tiktok || ""
          }))
      };

      const brandResult = await addBrand(brandData) as any;

      if (!brandResult.success || !brandResult.data?.brand_id) {
          toast.error(brandResult.message || 'Failed to create brand');
          return;
      }

      const brandId = brandResult.data.brand_id;
      toast.success('Brand created successfully');

      // 3. Redirect to Gather Phase with explicit parameters
      const webLimit = (data as any).scrapeSettings?.webLimit || 500;
      
      const startDate = socialDateRange?.from ? format(socialDateRange.from, 'yyyy-MM-dd') : '';
      const endDate = socialDateRange?.to ? format(socialDateRange.to, 'yyyy-MM-dd') : format(new Date(), 'yyyy-MM-dd');

      if (!startDate) {
          toast.error("Please select a start date for social data capture");
          setIsSubmitting(false);
          return;
      }

      await setGatherCookies({
        brandId,
        startDate,
        endDate,
        webLimit: webLimit.toString()
      });

      const redirectUrl = `/dashboard/brandos-v2.1/gather/collecting/${brandId}?triggerScrape=true&webLimit=${webLimit}&startDate=${startDate}&endDate=${endDate}`;
      window.location.href = redirectUrl;

    } catch (error) {
      console.error(error);
      toast.error('Failed to submit');
    } finally {
      setIsSubmitting(false);
    }
  };

  const nextTab = (next: string) => setValueTab(next);
  const setValueTab = (val: string) => setActiveTab(val);

  return (
    <form onSubmit={form.handleSubmit(onSubmit)} >
    <Tabs value={activeTab} onValueChange={setValueTab} className="w-full">
        <div className='w-full justify-between flex'>
        <TabsList >
            <TabsTrigger value="basics">Basics</TabsTrigger>
            <TabsTrigger value="competitors">Competitive Frame</TabsTrigger>
            <TabsTrigger value="channels">Channels & Scope</TabsTrigger>
        </TabsList>
        <Button type="button" onClick={autofill} variant="outline">
            <MdAutoAwesome />
            Autofill
        </Button>
        </div>
        <TabsContent value="basics" className="space-y-8  pt-6">
        <div className="mb-6">
            <h2 className="text-2xl font-medium mb-2">Engagement Basics</h2>
            <p className="text-muted-foreground">Enter the core details for this analysis engagement.</p>
        </div>

        <div className="grid lg:grid-cols-2 gap-12 ">
            {/* Left Column: Core Info */}
            <div className="space-y-8">
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

            {/* Right Column: Digital Presence */}
            <div className="space-y-8">
            <div className="space-y-3">
                <Label htmlFor="clientWebsite" className="text-base">Client Website</Label>
                <Input
                id="clientWebsite"
                icon={<Globe className="w-4 h-4" />}
                className="h-12 text-lg"
                placeholder="https://client-domain.com"
                {...form.register('details.clientWebsite')}
                />
                {(form.formState.errors as any).details?.clientWebsite && (
                <p className="text-sm text-red-500">{(form.formState.errors as any).details.clientWebsite.message}</p>
                )}
            </div>

              <div className="space-y-4 pt-2">
                <Label htmlFor="clientWebsite" className="text-base">Client Social Channels</Label>
                <div className="grid grid-cols-2 gap-4">
                <SocialInput icon={Linkedin} label="LinkedIn" register={form.register('details.clientSocials.linkedin')} placeholder="company/..." />
                <SocialInput icon={Twitter} label="Twitter/X" register={form.register('details.clientSocials.twitter')} placeholder="@handle" />
                <SocialInput icon={Instagram} label="Instagram" register={form.register('details.clientSocials.instagram')} placeholder="@handle" />
                <SocialInput icon={Youtube} label="YouTube" register={form.register('details.clientSocials.youtube')} placeholder="@channel" />
                <SocialInput icon={Facebook} label="Facebook" register={form.register('details.clientSocials.facebook')} placeholder="page-url" />
                <SocialInput icon={FaTiktok} label="TikTok" register={form.register('details.clientSocials.tiktok')} placeholder="@handle" />
                </div>
            </div>
            </div>
        </div>

        <div className="pt-6 w-full flex justify-end">
            <Button type="button" onClick={() => nextTab('competitors')}>Competitors <MdOutlineArrowRight /></Button>
        </div>
        </TabsContent>

        <TabsContent value="competitors" className="space-y-8  pt-6">
        <CompetitorSection form={form} />
        <div className="flex gap-4 pt-6 w-full justify-end">
            <Button type="button" variant="ghost" onClick={() => nextTab('basics')}>Back</Button>
            <Button type="button" onClick={() => nextTab('channels')}>Channels <MdOutlineArrowRight/></Button>
        </div>
        </TabsContent>

        <TabsContent value="channels" className="space-y-8  pt-6">
        <ChannelSection form={form} socialDateRange={socialDateRange} setSocialDateRange={setSocialDateRange} />
        <div className="flex gap-4 pt-6 w-full justify-end">
            <Button type="button" variant="ghost" onClick={() => nextTab('competitors')}>Back</Button>
            <Button type="submit" disabled={isSubmitting} className="min-w-[150px]">
            {isSubmitting ? 'Creating...' : 'Start Analysis'}
            </Button>
        </div>
        </TabsContent>
    </Tabs>
    </form>
  );
}
