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
        Schema::create('currencies', function (Blueprint $table) {
            $table->id();
            $table->string('name');
            $table->string('symbol');
            // $table->string('code');
            // itu salah ya
            // $table->string('code')->unique();
            // harus gini soanya kita itu pake code sebagai foreign key di wallet
            // dan dia itu bukan sebuah id jadinya harus pake unuuq ya
            $table->string('code')->unique();
            $table->timestamps();
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('table_currencies');
    }
};
