import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';

/**
 * Reusable empty state component with clear messaging and call-to-action
 */
export default function EmptyStateWithAction({
  icon: Icon,
  title,
  description,
  actionLabel,
  onAction,
  actionDisabled = false,
  secondaryActionLabel,
  onSecondaryAction,
  variant = 'default' // 'default' | 'compact'
}) {
  const isCompact = variant === 'compact';

  return (
    <Card>
      <CardContent className={isCompact ? 'py-8 text-center' : 'py-12 text-center'}>
        {Icon && (
          <div className="flex justify-center mb-3">
            <Icon className={`${isCompact ? 'h-10 w-10' : 'h-12 w-12'} text-slate-300`} />
          </div>
        )}
        <h3 className={`${isCompact ? 'text-base' : 'text-lg'} font-semibold text-slate-700 mb-1`}>
          {title}
        </h3>
        {description && (
          <p className={`${isCompact ? 'text-xs' : 'text-sm'} text-slate-500 mb-4 max-w-md mx-auto`}>
            {description}
          </p>
        )}
        {(actionLabel || secondaryActionLabel) && (
          <div className="flex gap-3 justify-center">
            {actionLabel && (
              <Button
                onClick={onAction}
                disabled={actionDisabled}
                className="bg-int-orange hover:bg-[#C46322]"
              >
                {actionLabel}
              </Button>
            )}
            {secondaryActionLabel && (
              <Button
                variant="outline"
                onClick={onSecondaryAction}
              >
                {secondaryActionLabel}
              </Button>
            )}
          </div>
        )}
      </CardContent>
    </Card>
  );
}