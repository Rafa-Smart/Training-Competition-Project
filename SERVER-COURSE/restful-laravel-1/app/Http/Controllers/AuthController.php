<?php

namespace App\Http\Controllers;

use App\Http\Requests\RegisterRequest;
use App\Models\User;
use Illuminate\Http\Request;
use App\Http\Requests\LoginRequest;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\Hash;

class AuthController extends Controller
{

    public function register(RegisterRequest $registerRequest){
        // $userCount = User::where('email', $registerRequest->email)->count();
        // if($userCount == 1){
        //     response()->json([
        //         'errors'=>'user already exists'
        //     ],400);
        // }

        // gausah karen suahd di atur oleh error UniqueCOntaraint

        $user = User::create($registerRequest->validated());
        return response()->json([
            'message'=>"success",
            "data"=>$user
        ]);
    }


    public function login(LoginRequest $loginRequest)
    {
        $user = User::where('email', $loginRequest->email)->first();

        // jadi kalo engga ada user atau password salah maka
        if (! $user || ! Hash::check($loginRequest->password, $user->password)) {
            return response()->json([
                'errors' => 'data user is not found',
            ]);
        }

        // nah aklo lewat, maka baru kita buatkan tokennya, dan kita kasih ke response
        // tapi untuk ktia kasih ke user itu ahrus dalam bentuk plain
        // meskipun nanti di database sudah di hash, tapi kasihnya yang plain

        // tapi sebelum itu passng dulu ini HasApiTokens di model user
        // ini ktia pake string statis aja


        // nah jadi gni, kita akn ga mau dia bisa login dan punya token di berbagai device yang berbeda
        // maka tiap kali dia login, ktai akna hapus dulu seluruh toknnye dari seluruh devicenya

        $loginRequest->user()->tokens()->delete();

        // baru kita kasih token baru

        return response()->json([
            "success"=>true,
            'token' => $user->createToken($loginRequest->device_name)->plainTextToken,
            "data"=>$user
        ]);
    }

    // public function logout(LoginRequest $loginRequest){

    // jangn pake iut, kanea tiap kali kita pake itu maka nanti laravelnya abca
    // ohh dia pake request yang lgin, makanya nanti dia akan terapkan rulesnya

    // jadi pake reuest aja, nah jadi natni baru bisa pake $request->user()

    public function logout(Request $request){
        // jadi kita bukan hapus data usre
        // tapi kita hanya hapus data token pada user tersebut

        // ini adalah menghapus single token, jadi token yang di semua device itu sama
        // tapi sanctum ini juga dia bisa pake multiple token
        // jadi di banyak device beda beda tokennya
        
        // ini yang multiple
        // $loginRequest->user()->tokens->delete();
        
        // disni ktia akan hapus token yang lagi di gunakan sekarang oleh user
        // /jai ktia dapatkan user token yang sekarnag di gunakan, lalu kita delete 

        // iget ya ktia harusnya engga pake loginRequest
        // jadi nanti aklo kita hapsu nani tetp harus kiirm data body
        // nah jadi untuk dapatkan user() saat ini
        // jangan pake $loginRequest->user() tapi pake Auth::user()

        Auth::user()->currentAccessToken()->delete();
        return response()->json(data: [
            'message'=>"success",

            // kita kasih tau siapa yang yang lagi logout
            // karena ini ktia pake bearer token admin
            // maka nanti muncul admin
            'user'=>Auth::user()
        ]);

    }
}
