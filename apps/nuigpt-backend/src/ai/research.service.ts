import { Injectable } from '@nestjs/common';

@Injectable()
export class ResearchService {
  async search(query: string) {
    const response = await fetch('https://api.tavily.com/search', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        api_key: process.env.TAVILY_API_KEY,
        query,
        search_depth: 'advanced',
        max_results: 5,
      }),
    });

    const data = await response.json();
    return data.results;
  }
}
