<?php

namespace App\Concerns;

use App\Models\ActivityLog;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Http\Request;

trait LogsActivity
{
    protected function logActivity(string $action, Model $subject, ?array $properties = null): ActivityLog
    {
        /** @var Request $request */
        $request = request();

        return ActivityLog::create([
            'user_id' => $request->user()?->id,
            'action' => $action,
            'subject_type' => $subject->getMorphClass(),
            'subject_id' => $subject->getKey(),
            'properties' => $properties,
            'ip_address' => $request->ip(),
            'user_agent' => $request->userAgent(),
        ]);
    }

    protected function logCreated(Model $subject, ?array $properties = null): ActivityLog
    {
        return $this->logActivity('created', $subject, $properties);
    }

    protected function logUpdated(Model $subject, ?array $properties = null): ActivityLog
    {
        return $this->logActivity('updated', $subject, $properties);
    }

    protected function logDeleted(Model $subject, ?array $properties = null): ActivityLog
    {
        return $this->logActivity('deleted', $subject, $properties);
    }
}
