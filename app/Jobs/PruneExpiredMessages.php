<?php

namespace App\Jobs;

use App\Models\Message;
use Illuminate\Contracts\Queue\ShouldQueue;
use Illuminate\Foundation\Queue\Queueable;

class PruneExpiredMessages implements ShouldQueue
{
    use Queueable;

    public function handle(): void
    {
        Message::whereNotNull('auto_delete_at')
            ->where('auto_delete_at', '<=', now())
            ->delete();
    }
}
