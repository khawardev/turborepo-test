export type User = {
  user_id: string;
  email: string;
  name: string;
  client_id: string;
};

export type Brand = {
  client_id: string;
  name: string;
  url: string;
  facebook_url?: string;
  linkedin_url?: string;
  x_url?: string;
  youtube_url?: string;
  instagram_url?: string;
  brand_id: string;
};

export type Competitor = {
  name: string;
  url: string;
  facebook_url?: string;
  linkedin_url?: string;
  x_url?: string;
  youtube_url?: string;
  instagram_url?: string;
  competitor_id?: string;
};

export type CrawledContent = {
  content: string;
  SK: string;
  entity_type: string;
  PK: string;
  url: string;
};
