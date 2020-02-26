<?php

namespace Sdcn\Handlers\Events;

use Illuminate\Contracts\Queue\ShouldQueue;
use Illuminate\Queue\InteractsWithQueue;
use Illuminate\Support\Facades\Mail;
use Sdcn\Models\Document;
use Sdcn\Models\Event;
use Sdcn\Models\User;

class DocumentAdded implements ShouldQueue {

	use InteractsWithQueue;

	/**
	  *
	  */
	public function handle(Document $document)
	{

		$admins = User::admins()->get();

		foreach($admins as $user) {

			Event::forceCreate([
				"user_id" => $user->id,
				"name" => "Document Added",
				"description" => "A document has been added for user {$document->user->name_full}",
				"status" => "new",
				"type" => ""
			]);

			Mail::send('emails.teams.document-added', [
			    'user' => $user,
			    'document' => $document
			], function ($message) use ($user)
			{
			    $message
			        ->to($user['email'], $user['name_full'])
			        ->subject('SDCN - A Document has been added');
			});

		}
	}
}
