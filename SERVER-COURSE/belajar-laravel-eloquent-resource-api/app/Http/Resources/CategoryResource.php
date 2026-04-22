<?php

namespace App\Http\Resources;

use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;

class CategoryResource extends JsonResource
{
    /**
     * Transform the resource into an array.
     *
     * @return array<string, mixed>
     */

    // nah jadi dia itu ada atribut wrap
    // dan kita bisa ganti atribut ini

    // nah jadi ini tuh adalh method yang harus kita ovveride
    // atau secara tidak langung CategoryResoure ini sudah di mixin dengan model
    // Category
    public function toArray(Request $request): array
    {
        // nh jadi gini ketika kitaakses $this
        // maka ktia bisa akses semua atribut yang ada di modenya
        // anh disini ktia juga bisa ganti nama propertynya


        // nah ini tuh akna di wrap oleh atribut yang namanya data
        return [
            'id'=>$this->id,
            'name'=>$this->name,
            "created_at"=>$this->created_at,
            "updated_at"=>$this->updated_at
        ];
    }
}
