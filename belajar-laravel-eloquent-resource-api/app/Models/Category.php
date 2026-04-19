<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\HasMany;

class Category extends Model
{
    // protected $table = 'categories';

    // protected $primaryKey = 'id';

    // protected $keyType = 'int';

    // protected $incrementing = true;


    // sat cateory punya banyak produk
    public function products(): HasMany
    {
        return $this->hasMany(Product::class);
    }
}
