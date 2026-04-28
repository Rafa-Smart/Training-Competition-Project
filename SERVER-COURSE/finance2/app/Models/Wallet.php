<?php

namespace App\Models;

use Database\Factories\WalletFactory;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class Wallet extends Model
{
    /** @use HasFactory<WalletFactory> */
    use HasFactory;

    protected $fillable = ['user_id', 'currency_code', 'name'];

    // nah jadi ketiak kita igi ubha si wallet ini ke json
    // lalu secara otomatis dia akn return si balance
    // nah balance ini adlah perhitungan dari income - expense

    protected $append = ['balance'];

    // nah kita kana buat getter untuk si balancenya ini
    // karena ya kalo kolom yang isinya itu adalah haisl dari perhitugan kita butuh accesro aja jadi pas di uhake jsn ketiak response aja baru kita tambahin fielndya secara otomatis

    public function getBalanceAttribute()
    {
        // nah ini adlah fugnsi yagn memang harus di buat ya untuk dapatkan atau memperhituangkan field yang otomatis muncul e tika di bah ke json ini
        // maka disin kita kan buat perhitungnya

        // jadi untuk tipa walet ini dia akna memunculkan balancenya secara otoamatis ya dari cateogry incom dan expense
        // nh di kuranngya itu dari transaksi ya

        // kita with cateory karena di mdel transaksi itu kita punya fungsi caegor ya
        $transactions = $this->transactions()->with(['category'])->get();

        // kita hitugn dulu incomenya
        // jai disni si transactions adalah isinya
        // semua transaksi dari wallet ini berserta keternagna dari cateoryya
        // kara di tabel transacion itu dia punya category_id

        //  kita hitung dulu incomenya
        $income = $transactions->where('category.type', 'INCOME')->sum();

        // nah dia hitung semua transaksi yang kategory nya itu adalah income

        // hitung expense

        $expense = $transactions->where('category.type', 'EXPENSE')->sum;

        return $income - $expense;
    }


    // jida th uh gini kan nanti si balance itu akan muncul ketika si wallet ini di json in misalnya pas di taruh di json response

    // nah ini dari balance itu juga adalah hasil dari perhitungan dari income di kurang dari expense

    public function transactions()
    {
        return $this->hasMany(Transaction::class);
    }

    public function user()
    {
        return $this->belongsTo(User::class);
    }
}
