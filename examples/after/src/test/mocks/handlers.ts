import { http, HttpResponse } from 'msw';
import type { AnalysisResponse } from '@/features/cv-optimizer/types';

const mockResponse: AnalysisResponse = {
  updatedCV: {
    fullName: 'Jean Dupont',
    email: 'jean.dupont@email.com',
    phone: '+33 6 12 34 56 78',
    location: 'Grenoble, France',
    summary: 'Jeune cadre dynamique avec un Master 2 en Management.',
    experiences: [
      {
        company: 'Flex Cuisine',
        role: 'Adjoint Responsable',
        location: 'Grenoble',
        period: '12/2021 - Présent',
        description: ['Gestion opérationnelle de l\'équipe de 15 personnes.'],
      },
    ],
    education: [
      {
        school: 'Grenoble École de Management',
        degree: 'Master 2 Management',
        year: '2023',
      },
    ],
    skills: ['Management', 'Gestion de projet', 'Leadership'],
  },
  insight: {
    jobTitle: 'Business Unit Manager',
    estimatedSalary: '38 000 - 45 000 € brut/an',
    reasoning: 'Le marché grenoblois valorise les profils Master 2.',
    sources: [{ title: 'Glassdoor Grenoble', uri: 'https://glassdoor.com' }],
  },
};

export const handlers = [
  http.post('*/cv/analyze', () => {
    return HttpResponse.json(mockResponse);
  }),
];
