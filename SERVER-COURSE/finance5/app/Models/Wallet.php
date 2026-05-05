<?php

namespace App\Models;

use Database\Factories\WalletFactory;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class Wallet extends Model
{
    /** @use HasFactory<WalletFactory> */
    use HasFactory;

    protected $fillable = ['name', 'user_id', 'currency_code'];

    protected $appends = ['balance'];

    public function getBalanceAttribute()
    {

        $transactions = $this->transactions()->with('category')->get();

        $expense = $transactions->where('category.type', 'EXPENSE')->sum('amount');

        $income = $transactions->where('category.type', 'INCOME')->sum('amount');

        $balance = $income - $expense;

        return $balance;
    }

    public function currency()
    {
        return $this->belongsTo(Currency::class);
    }

    public function user()
    {
        return $this->belongsTo(User::class);
    }

    public function transactions()
    {
        return $this->hasMany(Transaction::class);
    }
}
