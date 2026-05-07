<?php

namespace App\Models;

use Database\Factories\WalletFactory;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class Wallet extends Model
{
    /** @use HasFactory<WalletFactory> */
    use HasFactory;

    protected $fillable = [
        'user_id',
        'currency_code',
        'name',
    ];

    protected $appends = ['balance'];

    public function getBalanceAttribute()
    {
        $transaction = $this->transactions()->with('category')->get();

        $expense = $transaction->where('category.type', 'EXPENSE')->sum('amount');
        $income = $transaction->where('category.type', 'INCOME')->sum('amount');

        return $income - $expense;
    }

    public function transactions()
    {
        return $this->hasMany(Transaction::class);
    }
}
