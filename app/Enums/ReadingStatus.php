<?php

namespace App\Enums;

enum ReadingStatus: string
{
    case Unread = 'unread';
    case InProgress = 'in_progress';
    case Scheduled = 'scheduled';
    case Completed = 'completed';
}
