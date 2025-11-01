"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { zodResolver } from "@hookform/resolvers/zod";
import { useFieldArray, useForm } from "react-hook-form";
import { z } from "zod";
import { Button } from "@/components/ui/button";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { toast } from "sonner";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Spinner } from "@/components/shared/spinner";
import { Plus, Trash2, Upload } from "lucide-react";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Checkbox } from "@/components/ui/checkbox";

const bamSchema = z.object({
  name: z.string().min(1, "BAM name is required"),
  aiModel: z.string().min(1, "AI Model is required"),
  brand: z.object({
    name: z.string().min(1, "Brand name is required"),
    url: z.string().url("Invalid URL"),
  }),
  competitors: z.array(
    z.object({
      name: z.string().min(1, "Competitor name is required"),
      url: z.string().url("Invalid URL"),
    })
  ),
  files: z.any(),
  instructions: z.string().optional(),
  executionMode: z.enum([
    "interactive",
    "independent",
    "sequential",
  ]),
  selectedAgents: z.array(z.string()).optional(),
});

type BamFormValues = z.infer<typeof bamSchema>;

const defaultValues: Partial<BamFormValues> = {
  name: "",
  aiModel: "",
  brand: { name: "", url: "" },
  competitors: [],
  executionMode: "interactive",
  selectedAgents: [],
};

const aiModels = ["GPT-4", "Claude 3", "Gemini Pro"];
const agents = [
    { id: "agent1", name: "Brand Perception" },
    { id: "agent2", name: "Social Media Audit" },
    { id: "agent3", name: "Website Audit" },
    { id: "agent4", name: "Earned Media Analysis" },
    { id: "agent5", name: "Synthesized Report" },
];

export default function NewBamForm() {
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(false);

  const form = useForm<BamFormValues>({
    resolver: zodResolver(bamSchema),
    defaultValues,
    mode: "onChange",
  });

  const { fields, append, remove } = useFieldArray({
    name: "competitors",
    control: form.control,
  });

  async function onSubmit(data: BamFormValues) {
    setIsLoading(true);
    console.log(data);
    // Simulate API call
    await new Promise((resolve) => setTimeout(resolve, 1000));
    setIsLoading(false);
    toast.success("BAM has been created successfully 🎉");
    router.push("/bam/bam-3"); // Redirect to a sample execution page
  }

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-8">
        <Card>
          <CardHeader>
            <CardTitle>BAM Details</CardTitle>
            <CardDescription>Provide a name for your BAM.</CardDescription>
          </CardHeader>
          <CardContent>
            <FormField
              control={form.control}
              name="name"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>BAM Name</FormLabel>
                  <FormControl>
                    <Input placeholder="e.g., Q4 Competitive Analysis" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>AI Model</CardTitle>
            <CardDescription>Select the AI model to use.</CardDescription>
          </CardHeader>
          <CardContent>
            <FormField
              control={form.control}
              name="aiModel"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Select AI Model</FormLabel>
                  <Select
                    onValueChange={field.onChange}
                    defaultValue={field.value}
                  >
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue placeholder="Select a model" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      {aiModels.map((model) => (
                        <SelectItem key={model} value={model}>
                          {model}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )}
            />
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Brand and Competitors</CardTitle>
            <CardDescription>
              Select or enter details for the brand and its competitors.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
                <h4 className="font-medium">Brand</h4>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <FormField
                    control={form.control}
                    name="brand.name"
                    render={({ field }) => (
                        <FormItem>
                        <FormLabel>Brand Name</FormLabel>
                        <FormControl>
                            <Input placeholder="Acme Inc." {...field} />
                        </FormControl>
                        <FormMessage />
                        </FormItem>
                    )}
                    />
                    <FormField
                    control={form.control}
                    name="brand.url"
                    render={({ field }) => (
                        <FormItem>
                        <FormLabel>Website URL</FormLabel>
                        <FormControl>
                            <Input placeholder="https://acme.com" {...field} />
                        </FormControl>
                        <FormMessage />
                        </FormItem>
                    )}
                    />
                </div>
            </div>
            <div className="space-y-2">
                <div className="flex justify-between items-center">
                    <h4 className="font-medium">Competitors</h4>
                    <Button type="button" variant="outline" size="sm" onClick={() => append({ name: "", url: "" })}>
                        <Plus className="h-4 w-4 mr-2" /> Add Competitor
                    </Button>
                </div>
                <div className="space-y-4">
                {fields.map((field, index) => (
                    <div key={field.id} className="flex items-end gap-4 p-4 border rounded-md">
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 flex-1">
                            <FormField
                            control={form.control}
                            name={`competitors.${index}.name`}
                            render={({ field }) => (
                                <FormItem>
                                <FormLabel>Competitor Name</FormLabel>
                                <FormControl>
                                    <Input placeholder="Vercel" {...field} />
                                </FormControl>
                                <FormMessage />
                                </FormItem>
                            )}
                            />
                            <FormField
                            control={form.control}
                            name={`competitors.${index}.url`}
                            render={({ field }) => (
                                <FormItem>
                                <FormLabel>Website URL</FormLabel>
                                <FormControl>
                                    <Input placeholder="https://vercel.com" {...field} />
                                </FormControl>
                                <FormMessage />
                                </FormItem>
                            )}
                            />
                        </div>
                        <Button type="button" variant="destructive" size="icon" onClick={() => remove(index)}>
                            <Trash2 className="h-4 w-4" />
                        </Button>
                    </div>
                ))}
                </div>
            </div>
          </CardContent>
        </Card>

        <Card>
            <CardHeader>
                <CardTitle>Upload Files</CardTitle>
                <CardDescription>Upload relevant files (PDF, DOCX, TXT, etc.).</CardDescription>
            </CardHeader>
            <CardContent>
                <div className="border-2 border-dashed border-muted rounded-md p-8 text-center">
                    <Upload className="mx-auto h-12 w-12 text-muted-foreground" />
                    <p className="mt-4 text-sm text-muted-foreground">Drag and drop files here, or click to browse.</p>
                    <Button type="button" variant="outline" className="mt-4">Browse Files</Button>
                </div>
            </CardContent>
        </Card>

        <Card>
            <CardHeader>
                <CardTitle>Custom Instructions</CardTitle>
                <CardDescription>Provide any custom instructions for the agents.</CardDescription>
            </CardHeader>
            <CardContent>
                <FormField
                    control={form.control}
                    name="instructions"
                    render={({ field }) => (
                        <FormItem>
                        <FormLabel>Instructions</FormLabel>
                        <FormControl>
                            <Textarea placeholder="e.g., Focus on social media presence in the last quarter." {...field} />
                        </FormControl>
                        <FormMessage />
                        </FormItem>
                    )}
                />
            </CardContent>
        </Card>

        <Card>
            <CardHeader>
                <CardTitle>Execution Configuration</CardTitle>
                <CardDescription>Choose how you want to run the agents.</CardDescription>
            </CardHeader>
            <CardContent>
                <FormField
                    control={form.control}
                    name="executionMode"
                    render={({ field }) => (
                        <FormItem className="space-y-3">
                            <FormLabel>Execution Mode</FormLabel>
                            <FormControl>
                                <RadioGroup
                                onValueChange={field.onChange}
                                defaultValue={field.value}
                                className="flex flex-col space-y-1"
                                >
                                <FormItem className="flex items-center space-x-3 space-y-0">
                                    <FormControl>
                                    <RadioGroupItem value="interactive" />
                                    </FormControl>
                                    <FormLabel className="font-normal">
                                    Interactive Step by Step
                                    </FormLabel>
                                </FormItem>
                                <FormItem className="flex items-center space-x-3 space-y-0">
                                    <FormControl>
                                    <RadioGroupItem value="independent" />
                                    </FormControl>
                                    <FormLabel className="font-normal">
                                    Run Selected Agent Independently
                                    </FormLabel>
                                </FormItem>
                                <FormItem className="flex items-center space-x-3 space-y-0">
                                    <FormControl>
                                    <RadioGroupItem value="sequential" />
                                    </FormControl>
                                    <FormLabel className="font-normal">
                                    Run full Pipeline Sequentially
                                    </FormLabel>
                                </FormItem>
                                </RadioGroup>
                            </FormControl>
                            <FormMessage />
                        </FormItem>
                    )}
                />
                {form.watch("executionMode") === "independent" && (
                    <div className="pt-4">
                        <h4 className="font-medium">Select Agents</h4>
                        <FormField
                            control={form.control}
                            name="selectedAgents"
                            render={() => (
                                <FormItem>
                                    {agents.map((agent) => (
                                        <FormField
                                        key={agent.id}
                                        control={form.control}
                                        name="selectedAgents"
                                        render={({ field }) => {
                                            return (
                                            <FormItem
                                                key={agent.id}
                                                className="flex flex-row items-start space-x-3 space-y-0 mt-2"
                                            >
                                                <FormControl>
                                                <Checkbox
                                                    checked={field.value?.includes(agent.id)}
                                                    onCheckedChange={(checked) => {
                                                    return checked
                                                        ? field.onChange([...(field.value || []), agent.id])
                                                        : field.onChange(
                                                            field.value?.filter(
                                                            (value) => value !== agent.id
                                                            )
                                                        );
                                                    }}
                                                />
                                                </FormControl>
                                                <FormLabel className="font-normal">
                                                {agent.name}
                                                </FormLabel>
                                            </FormItem>
                                            );
                                        }}
                                        />
                                    ))}
                                </FormItem>
                            )}
                        />
                    </div>
                )}
            </CardContent>
        </Card>

        <Button type="submit" disabled={isLoading}>
          {isLoading && <Spinner />}
          Create and Execute BAM
        </Button>
      </form>
    </Form>
  );
}
