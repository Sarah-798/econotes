import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { CheckCircle } from 'lucide-react';

interface FeatureBlockProps {
  title: string;
  subBlocks: string[];
}

export function FeatureBlock({ title, subBlocks }: FeatureBlockProps) {
  return (
    <Card>
      <CardHeader>
        <CardTitle>{title}</CardTitle>
      </CardHeader>
      <CardContent>
        <ul className="space-y-2">
          {subBlocks.map((block) => (
            <li key={block} className="flex items-center gap-2">
              <CheckCircle className="h-4 w-4 text-green-500" />
              <span className="text-sm">{block}</span>
            </li>
          ))}
        </ul>
      </CardContent>
    </Card>
  );
}
