import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import type { IconDefinition } from '@fortawesome/fontawesome-svg-core';

import { cn } from '@/lib/utils';

type FaIconProps = {
    icon: IconDefinition;
    className?: string;
};

function FaIcon({ icon, className }: FaIconProps) {
    return (
        <FontAwesomeIcon
            icon={icon}
            className={cn('size-[1em] shrink-0', className)}
            fixedWidth
        />
    );
}

export { FaIcon };
export type { FaIconProps };
