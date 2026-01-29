
export interface CVData {
  fullName: string;
  email: string;
  phone: string;
  summary: string;
  experiences: Experience[];
  education: Education[];
  skills: string[];
  additionalSkills?: string[];
}

export interface Experience {
  company: string;
  role: string;
  location: string;
  period: string;
  description: string[];
}

export interface Education {
  school: string;
  degree: string;
  year: string;
}

export interface MarketInsight {
  jobTitle: string;
  estimatedSalary: string;
  reasoning: string;
  sources: Array<{ title: string; uri: string }>;
}

export interface AnalysisResponse {
  updatedCV: CVData;
  insight: MarketInsight;
}
