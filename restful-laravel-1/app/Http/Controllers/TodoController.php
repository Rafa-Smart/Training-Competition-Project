<?php

namespace App\Http\Controllers;

use App\Http\Requests\TodoRequest;
use App\Models\Todo;

class TodoController extends Controller
{
    public function store(TodoRequest $request)
    {

        // // disni ktia ingin validasi dulu datanya
        // $request->validate([
        //     'name' => 'required|max:255',
        //     'status' => 'required|in:in_progress, done, cancelled',
        // ]);

        // ga perlu karean kita bisa pake validated dari file requests

        $todo = Todo::create($request->validated());

        // ini buat ngembaliin data yang ada didatabase asli, kan di asinya itu udah ada
        // default nilai dari status yaitu in_progress, tapi kalo engga pake ini
        // nanti statusnya ketika ktia tidak menambahakn di body requestnya
        // maka nanti nulainya akna null, tapi kalo pake refresh maka akan mengembalikan
        // data real dari database
        $todo->refresh();

        return response()->json([
            'data' => $todo,
            // pengen tau aja dapet ga data usernya yang lagi buat data ini
            'user' => $request->user(),
            // dapet yaa
            // {
            //     "data": {
            //         "id": 5,
            //         "name": "werafawqwwa2ewre",
            //         "status": "cancelled",
            //         "created_at": "2025-12-31T06:17:27.000000Z",
            //         "updated_at": "2025-12-31T06:17:27.000000Z"
            //     },
            //     "user": {
            //         "id": 1,
            //         "name": "admin",
            //         "email": "admin@gmail.com",
            //         "email_verified_at": null,
            //         "created_at": "2025-12-31T06:09:00.000000Z",
            //         "updated_at": "2025-12-31T06:09:00.000000Z"
            //     }
            // }
        ], 201);
    }

    // oh jadi gini, di laravel itu sudah di siapkan data erornya
    // jadi kalo disini itu errornya sudah ada dari saannya

    // ini best practicenya
    // nah jadi ketka ktia menggunakan type Todo dan nanti param yang dikirimnya
    // /itu isinya adlah id, maka akna otmatis di cari
    // objek todo berdasarkan id dan jadinya
    // $todo ini adalah objek todo, nah, kalo error maka nanti akan
    // otomatis melempar error / throw error ke ModelNotFoundException
    // yang di tanggap di

    public function update(TodoRequest $todoRequest, Todo $todo)
    {
        $todo->update($todoRequest->validated());

        // nah semua error sudah di lempar ke boostraps -> app.php
        return response()->json([
            'data' => $todo,
            'message' => 'success',
        ], 200);
    }

    // public function update(TodoRequest $request, $id)
    // {

    //     // nh sebenernyya data id yang ada di param itu adalh data objekya

    //     // pertama kita ambil dulu datanya
    //     // nah dengnamenggunakna findOrfail itu artinya ktia menggunakan binding yaitu
    //     // Mengubah nilai parameter URL (ID) menjadi object model secara otomatis sebelum controller dijalankan.
    //     $todo = Todo::findOrFail($id);

    //     // // disini cek dulu jia engga ada
    //     // // karen udah di cek validasinya mah di file TodoRequest
    //     // if ($todo->isEmpty()) {
    //     //     return response()->json([
    //     //         'data' => $todo,
    //     //         'message' => 'todo is not found',
    //     //         'id' => $id,
    //     //     ], 404);
    //     // }

    //     // kita ambil $request dari hsail validasi sebelumnya
    //     // di TodoRequest
    //     $todo = $todo->update($request->validated());

    //     return response()->json([
    //         'data' => $todo,
    //         'message' => 'todo has been updated',
    //         'id' => $id,
    //     ], 200);

    // }

    // atau kiaa juga bisa pake metode binding
    // harus sma ya routeparameternya ddi url route api
    // api ingat harus pake type ya dan sama nama paramnya
    // public function update(TodoRequest $request, Todo $todo)
    // {

    //     // jadi meskipun nanti yang dikirim sebenrnya adalah angka id
    //     // tapi karena kita pake method binding maka nanti bisa lanusng aja update

    //     // kita ambil $request dari hsail validasi sebelumnya
    //     // di TodoRequest

    //     // /return dari update itu adlah true atau false
    //     $todohasil = $todo->update($request->validated());

    //     return response()->json([
    //         'data' => $todohasil,
    //         'message' => 'todo has been updated',
    //         'todo' => $todo,
    //     ], 200);

    //     // tuh lihat haislnya
    //     //         {
    //     //     "data": true,
    //     //     "message": "todo has been updated",
    //     //     "todo": {
    //     //         "id": 3,
    //     //         "name": "rafaqa2",
    //     //         "status": "in_progress",
    //     //         "created_at": "2025-12-30T09:22:43.000000Z",
    //     //         "updated_at": "2025-12-30T10:26:06.000000Z"
    //     //     }
    //     // }

    // }

    public function destroy(Todo $todo)
    {
        $todo->delete();

        return response()->json([
            'message' => 'OK',
        ], 200);
    }

    public function index()
    {
        $todos = Todo::get();

        return response()->json([
            'todos' => $todos,
            "total_todos"=>$todos->count()
        ], 200);
    }

    // ini untuk detail Todo
    // sudah pake binding ya
    // karena prasnya itu sudah objek Todo
    // meskipun yang dikirimnya itu angka id

    public function show(Todo $todo)
    {
        return response()->json([
            'data' => $todo,
        ]);
    }
}
