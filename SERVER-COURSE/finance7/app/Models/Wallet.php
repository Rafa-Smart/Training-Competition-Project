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
        // $expense = $this->transactions()->with('category')->where('category.type', "EXPENSE")->sum('amount');
        // $income = $this->transactions()->with('category')->where('category.type', "INCOME")->sum('amount');

        // atua bisa juga gini yang aplng baugs
        $expense = $this->transactions()->whereHas('category', function ($category) {
            return $category->where('type', 'EXPENSE');
        })->sum('amount');
        $income = $this->transactions()->whereHas('category', function ($category) {
            return $category->where('type', 'INCOME');
        })->sum('amount');

        return $income - $expense;
    }

    public function user()
    {
        $this->belongsTo(User::class);
    }

    public function transactions()
    {
        return $this->hasMany(Transaction::class);
    }
}
