import { router } from '@inertiajs/react';
import { useState } from 'react';
import { toast } from 'sonner';

import { Button } from '@/components/ui/button';
import {
    Dialog,
    DialogContent,
    DialogFooter,
    DialogHeader,
    DialogTitle,
} from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useI18n } from '@/lib/i18n';
import { paths } from '@/lib/paths';
import type { Book } from '@/types/book';

type ScheduleBookModalProps = {
    open: boolean;
    onOpenChange: (open: boolean) => void;
    book: Book;
    userBookId: number;
    defaultDate?: string | null;
};

function ScheduleBookModal({
    open,
    onOpenChange,
    book,
    userBookId,
    defaultDate,
}: ScheduleBookModalProps) {
    const { t } = useI18n();
    const [date, setDate] = useState(
        defaultDate?.slice(0, 10) ??
            new Date().toISOString().slice(0, 10),
    );
    const [saving, setSaving] = useState(false);

    function handleSave() {
        setSaving(true);
        router.patch(
            paths.userBook(userBookId),
            {
                status: 'scheduled',
                scheduled_at: date,
            },
            {
                preserveScroll: true,
                onSuccess: () => {
                    toast.success(t('library_schedule_saved'));
                    onOpenChange(false);
                },
                onFinish: () => setSaving(false),
            },
        );
    }

    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent className="sm:max-w-md">
                <DialogHeader>
                    <DialogTitle className="font-serif">
                        {t('library_schedule')}
                    </DialogTitle>
                </DialogHeader>
                <div className="space-y-4">
                    <p className="text-sm text-muted-foreground line-clamp-2">
                        {book.title}
                    </p>
                    <div className="space-y-2">
                        <Label htmlFor="schedule-date">
                            {t('library_pick_schedule_date')}
                        </Label>
                        <Input
                            id="schedule-date"
                            type="date"
                            value={date}
                            onChange={(event) => setDate(event.target.value)}
                        />
                    </div>
                </div>
                <DialogFooter>
                    <Button
                        variant="outline"
                        onClick={() => onOpenChange(false)}
                    >
                        Cancel
                    </Button>
                    <Button onClick={handleSave} disabled={saving || !date}>
                        {saving ? 'Saving…' : t('library_save_schedule')}
                    </Button>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    );
}

export { ScheduleBookModal };
