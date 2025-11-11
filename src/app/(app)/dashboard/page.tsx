"use client";

import { FeatureBlock } from '@/components/feature-block';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';

const features = [
  {
    title: 'User Input',
    subBlocks: ['Note Entry', 'Accessibility Features'],
  },
  {
    title: 'Preprocessing and Organisation',
    subBlocks: ['Text Processing', 'Organisation', 'Accessibility Apply'],
  },
  {
    title: 'Analysis and Impact Tracking',
    subBlocks: ['Content Analysis', 'Environmental Impact'],
  },
  {
    title: 'Storage and Security',
    subBlocks: ['Secure Storage', 'Retrieval System'],
  },
  {
    title: 'User Dashboard and Feedback',
    subBlocks: ['Visual Dashboard', 'Personalised Insights'],
  },
];

export default function DashboardPage() {
  return (
    <div className="p-4 md:p-6">
      <h1 className="text-3xl font-bold font-headline mb-6 text-primary">Application Features</h1>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {features.map((feature) => (
          <FeatureBlock key={feature.title} title={feature.title} subBlocks={feature.subBlocks} />
        ))}
      </div>
    </div>
  );
}
