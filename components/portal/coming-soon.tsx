import { ArrowLeft, Clock3 } from 'lucide-react';
import Link from 'next/link';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';

interface ComingSoonProps {
  title: string;
  description?: string;
  backHref?: string;
  backLabel?: string;
}

export function ComingSoon({
  title,
  description = 'This area is on the roadmap. Coming in the next milestone.',
  backHref = '/portal/dashboard',
  backLabel = 'Back to dashboard',
}: ComingSoonProps) {
  return (
    <div className="mx-auto max-w-[720px] px-4 py-10 sm:px-6 sm:py-14">
      <Card className="p-8 sm:p-10">
        <Badge tone="brand" dot className="mb-5">
          <Clock3 className="h-3 w-3" />
          Coming soon
        </Badge>
        <h1 className="text-h1 text-ink sm:text-[1.75rem] sm:leading-[2.25rem]">{title}</h1>
        <p className="mt-3 text-body text-muted">{description}</p>
        <div className="mt-8">
          <Button asChild variant="secondary" leadingIcon={<ArrowLeft className="h-4 w-4" />}>
            <Link href={backHref}>{backLabel}</Link>
          </Button>
        </div>
      </Card>
    </div>
  );
}
