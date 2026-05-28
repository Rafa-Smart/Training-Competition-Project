<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class Wallet extends Model
{
    /** @use HasFactory<\Database\Factories\WalletFactory> */
    use HasFactory;
    protected $fillable = ['user_id', 'currency_code','name'];
    protected $appends = ['balance'];
    public function getBalanceAttribute(){
        $transactions = $this->transactions()->with('category');
        $expense = $transactions->where('category.type', 'EXPENSE')->sum('amount');
        $income = $transactions->where("category.type", 'INCOME')->sum('amount');
        return $expense - $income;
    }


    public function transactions(){
        return $this->hasMany(Transaction::class);
    }
}
