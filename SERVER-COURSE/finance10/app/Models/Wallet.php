<?php

namespace App\Models;

use Database\Factories\WalletFactory;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\SoftDeletes;

class Wallet extends Model
{
    /** @use HasFactory<WalletFactory> */
    use HasFactory, SoftDeletes;

    protected $fillable = ['user_id', 'currency_code', 'name'];

    protected $appends = ['balance'];

    public function getBalanceAtributte()
    {
        $transactions = $this->transactions()->with(['wallet', 'category']);

        $income = $transactions->where('category.type', 'INCOME')->sum('amount');
        $expense = $transactions->where('category.type', 'EXPENSE')->sum('amount');

        return $income - $expense;
    }

    public function transactions()
    {
        return $this->hasMany(Transaction::class);
    }
}
