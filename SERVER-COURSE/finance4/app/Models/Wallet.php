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
        $transactions = $this->transactions()->with(['category'])->get();

        $expense = $transactions->where('category.type', 'EXPENSE')->sum('amount');

        $income = $this->transactions()->where('category.type')->sum('amount');

        return $income - $expense;
    }

    public function transactions()
    {
        return $this->hasMany(Transaction::class);
    }
    public function currency(){
        return $this->belongsTo(Category::class);
    }

    public function user(){
        return $this->belongsTo(User::class);
    }
}
