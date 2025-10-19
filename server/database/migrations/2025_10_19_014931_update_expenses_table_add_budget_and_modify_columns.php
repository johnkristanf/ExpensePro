<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    /**
     * Run the migrations.
     */
    public function up(): void
    {
        // First, drop the old foreign key
        Schema::table('expenses', function (Blueprint $table) {
            $table->dropForeign(['category_id']);
        });

        // Then make all changes
        Schema::table('expenses', function (Blueprint $table) {
            $table->renameColumn('date', 'date_spent');
            
            $table->foreignId('budget_id')
                ->nullable()
                ->constrained('budgets')
                ->nullOnDelete();

            // Make category_id nullable
            $table->foreignId('category_id')
                ->nullable()
                ->change();
        });

        // Finally, re-add the foreign key constraint
        Schema::table('expenses', function (Blueprint $table) {
            $table->foreign('category_id')
                ->references('id')
                ->on('categories')
                ->nullOnDelete();
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::table('expenses', function (Blueprint $table) {
            // Revert column name
            $table->renameColumn('date_spent', 'date');

            // Drop budget_id column and constraint
            $table->dropForeign(['budget_id']);
            $table->dropColumn('budget_id');

            // Drop and re-add category constraint to cascade
            $table->dropForeign(['category_id']);
            $table->foreign('category_id')
                ->references('id')
                ->on('categories')
                ->onDelete('cascade');

            // Make category_id non-nullable again
            $table->integer('category_id')->change();
        });
    }
};
