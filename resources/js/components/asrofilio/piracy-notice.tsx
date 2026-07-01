import { AlertTriangle } from 'lucide-react';

function PiracyNotice() {
    return (
        <div className="border-t border-border bg-secondary/50 px-4 py-3">
            <div className="mx-auto flex max-w-7xl items-start gap-2 text-xs text-muted-foreground">
                <AlertTriangle className="mt-0.5 size-3.5 shrink-0 text-primary" />
                <p>
                    Asrofilio is for personal reading and study. Only upload books
                    you own or have legal access to. Sharing pirated content is
                    prohibited.
                </p>
            </div>
        </div>
    );
}

export { PiracyNotice };
