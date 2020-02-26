<?php

use Illuminate\Database\Seeder;
use Sdcn\Models\DocumentType;

class DocumentTypesTableSeeder extends Seeder {

    public function run()
    {
        DocumentType::create([
            'name' => 'Goods In Transit'
        ]);

        DocumentType::create([
            'name' => 'Fleet Insurance'
        ]);

        DocumentType::create([
            'name' => 'Other'
        ]);
    }
}