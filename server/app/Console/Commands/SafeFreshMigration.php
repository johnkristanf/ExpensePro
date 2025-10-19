<?php

namespace App\Console\Commands;

use Illuminate\Console\Command;
use Illuminate\Support\Facades\App;
use Illuminate\Support\Facades\Artisan;

class SafeFreshMigration extends Command
{
    /**
     * The name and signature of the console command.
     *
     * @var string
     */
    protected $signature = 'migrate:fresh-safe';

    /**
     * The console command description.
     *
     * @var string
     */
    protected $description = 'Run migrate:fresh with confirmation to prevent accidental production wipe';

    /**
     * Execute the console command.
     */
    public function handle()
    {
        if (App::environment('production')) {
            $this->error('⚠️  You are in the PRODUCTION environment!');
        }

        if ($this->confirm('🚨 This will drop ALL tables and re-run migrations. Continue?', false)) {
            Artisan::call('migrate:fresh', [], $this->output);
            $this->info('✅ migrate:fresh completed successfully!');
        } else {
            $this->warn('❌ Operation cancelled.');
        }

        return 0;
    }
}
