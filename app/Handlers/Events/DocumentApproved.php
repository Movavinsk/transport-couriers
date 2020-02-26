<?php

namespace Sdcn\Handlers\Events;

use Illuminate\Contracts\Queue\ShouldQueue;
use Illuminate\Queue\InteractsWithQueue;
use Illuminate\Support\Facades\Mail;
use Sdcn\Models\Document;
use Sdcn\Models\Event;

class DocumentApproved implements ShouldQueue {

    use InteractsWithQueue;

    /**
      *
      */
    public function handle(Document $document)
    {

        $user = $document->team->primaryMember;

        Event::forceCreate([
            "user_id" => $user->id,
            "name" => "Document Approved",
            "description" => "A document for user {$document->user->name_full} has been approved.",
            "status" => "new",
            "type" => ""
        ]);

        Mail::send('emails.teams.document-approved', [
            'user' => $user
        ], function ($message) use ($user)
        {
            $message
                ->to($user['email'], $user['name_full'])
                ->subject('SDCN - A Document has been approved');
        });


    }
}
