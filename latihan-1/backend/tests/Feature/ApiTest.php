<?php

namespace Tests\Feature;

use Tests\TestCase;
use App\Models\User;
use App\Models\Post;
use App\Models\Follow;
use App\Models\PostAttachment;
use Illuminate\Http\UploadedFile;
use Illuminate\Support\Facades\Storage;
use Illuminate\Foundation\Testing\RefreshDatabase;

class ApiTest extends TestCase
{
    use RefreshDatabase;

    private $user;
    private $token;
    private $anotherUser;
    private $privateUser;

    protected function setUp(): void
    {
        parent::setUp();
        
        // Setup users for testing
        $this->user = User::create([
            'full_name' => 'John Doe',
            'bio' => 'The best way to predict the future is to create it.',
            'username' => 'john.doe',
            'password' => bcrypt('password123'),
            'is_private' => false,
            'email' => 'john@example.com'
        ]);

        $this->anotherUser = User::create([
            'full_name' => 'Jane Smith',
            'bio' => 'Another bio here',
            'username' => 'jane.smith',
            'password' => bcrypt('password123'),
            'is_private' => false,
            'email' => 'jane@example.com'
        ]);

        $this->privateUser = User::create([
            'full_name' => 'Private User',
            'bio' => 'Private account bio',
            'username' => 'private.user',
            'password' => bcrypt('password123'),
            'is_private' => true,
            'email' => 'private@example.com'
        ]);

        // Generate token for the main user
        $this->token = $this->user->createToken('auth_token')->plainTextToken;
    }

    /** @test */
    public function test_register_success()
    {
        $response = $this->postJson('/api/v1/auth/register', [
            'full_name' => 'Budi Budiman',
            'bio' => 'stop dreaming, start doing',
            'username' => 'budi.budiman',
            'password' => 'password123',
            'is_private' => true
        ]);

        $response->assertStatus(201)
            ->assertJsonStructure([
                'message',
                'token',
                'user' => [
                    'full_name',
                    'bio',
                    'username',
                    'is_private',
                    'id'
                ]
            ])
            ->assertJson([
                'message' => 'Register success'
            ]);
    }

    /** @test */
    public function test_register_validation_errors()
    {
        // Create existing user first
        User::create([
            'username' => 'existing.user',
            'full_name' => 'Existing User',
            'bio' => 'Bio',
            'password' => bcrypt('password123'),
            'email' => 'existing@example.com'
        ]);

        $response = $this->postJson('/api/v1/auth/register', [
            'full_name' => '', // required
            'bio' => '', // required
            'username' => 'existing.user', // not unique
            'password' => '123', // too short
        ]);

        $response->assertStatus(422)
            ->assertJsonStructure([
                'message',
                'errors' => [
                    'full_name',
                    'bio',
                    'username',
                    'password'
                ]
            ]);
    }

    /** @test */
    public function test_login_success()
    {
        $response = $this->postJson('/api/v1/auth/login', [
            'username' => 'john.doe',
            'password' => 'password123'
        ]);

        $response->assertStatus(200)
            ->assertJsonStructure([
                'message',
                'token',
                'user' => [
                    'id',
                    'full_name',
                    'username',
                    'bio',
                    'is_private',
                    'created_at'
                ]
            ])
            ->assertJson([
                'message' => 'Login success'
            ]);
    }

    /** @test */
    public function test_login_wrong_credentials()
    {
        $response = $this->postJson('/api/v1/auth/login', [
            'username' => 'john.doe',
            'password' => 'wrongpassword'
        ]);

        $response->assertStatus(401)
            ->assertJson([
                'message' => 'Wrong username or password'
            ]);
    }

    /** @test */
    public function test_logout_success()
    {
        $response = $this->withHeaders([
            'Authorization' => 'Bearer ' . $this->token
        ])->postJson('/api/v1/auth/logout');

        $response->assertStatus(200)
            ->assertJson([
                'message' => 'logout success'
            ]);
    }

    /** @test */
    public function test_logout_unauthenticated()
    {
        $response = $this->postJson('/api/v1/auth/logout');

        $response->assertStatus(401)
            ->assertJson([
                'message' => 'Unauthenticated.'
            ]);
    }

    /** @test */
    public function test_create_post_success()
    {
        Storage::fake('public');

        $response = $this->withHeaders([
            'Authorization' => 'Bearer ' . $this->token
        ])->post('/api/v1/posts', [
            'caption' => 'Test post caption',
            'attachments' => [
                UploadedFile::fake()->image('post1.jpg'),
                UploadedFile::fake()->image('post2.png')
            ]
        ]);

        $response->assertStatus(201)
            ->assertJson([
                'message' => 'Create post success'
            ]);

        $this->assertDatabaseHas('posts', [
            'caption' => 'Test post caption',
            'user_id' => $this->user->id
        ]);
    }

    /** @test */
    public function test_create_post_validation_errors()
    {
        $response = $this->withHeaders([
            'Authorization' => 'Bearer ' . $this->token
        ])->post('/api/v1/posts', [
            'caption' => '',
            'attachments' => [
                UploadedFile::fake()->create('document.pdf', 100)
            ]
        ]);

        $response->assertStatus(422)
            ->assertJsonStructure([
                'message',
                'errors' => [
                    'caption',
                    'attachments.0'
                ]
            ]);
    }

    /** @test */
    public function test_create_post_unauthenticated()
    {
        $response = $this->postJson('/api/v1/posts', [
            'caption' => 'Test post'
        ]);

        $response->assertStatus(401)
            ->assertJson([
                'message' => 'Unauthenticated.'
            ]);
    }

    /** @test */
    public function test_delete_post_success()
    {
        $post = Post::create([
            'user_id' => $this->user->id,
            'caption' => 'Test post to delete'
        ]);

        $response = $this->withHeaders([
            'Authorization' => 'Bearer ' . $this->token
        ])->deleteJson("/api/v1/posts/{$post->id}");

        $response->assertStatus(204);

        $this->assertSoftDeleted('posts', ['id' => $post->id]);
    }

    /** @test */
    public function test_delete_post_not_found()
    {
        $response = $this->withHeaders([
            'Authorization' => 'Bearer ' . $this->token
        ])->deleteJson('/api/v1/posts/999');

        $response->assertStatus(404)
            ->assertJson([
                'message' => 'Post is not found'
            ]);
    }

    /** @test */
    public function test_delete_another_users_post()
    {
        $post = Post::create([
            'user_id' => $this->anotherUser->id,
            'caption' => 'Another user post'
        ]);

        $response = $this->withHeaders([
            'Authorization' => 'Bearer ' . $this->token
        ])->deleteJson("/api/v1/posts/{$post->id}");

        $response->assertStatus(403)
            ->assertJson([
                'message' => 'fobidden access'
            ]);
    }

    /** @test */
    public function test_get_posts_success()
    {
        // Create posts for users
        $post1 = Post::create([
            'user_id' => $this->user->id,
            'caption' => 'My own post'
        ]);

        // Make user follow another user
        Follow::create([
            'follower_id' => $this->user->id,
            'following_id' => $this->anotherUser->id,
            'status' => 'accepted'
        ]);

        $post2 = Post::create([
            'user_id' => $this->anotherUser->id,
            'caption' => 'Followed user post'
        ]);

        $response = $this->withHeaders([
            'Authorization' => 'Bearer ' . $this->token
        ])->getJson('/api/v1/posts?page=0&size=10');

        $response->assertStatus(200)
            ->assertJsonStructure([
                'size',
                'page',
                'posts' => [
                    '*' => [
                        'id',
                        'caption',
                        'created_at',
                        'user' => [
                            'id',
                            'full_name',
                            'username',
                            'bio',
                            'is_private',
                            'created_at'
                        ],
                        'attachments'
                    ]
                ]
            ]);
    }

    /** @test */
    public function test_get_posts_validation_errors()
    {
        $response = $this->withHeaders([
            'Authorization' => 'Bearer ' . $this->token
        ])->getJson('/api/v1/posts?page=-1&size=invalid');

        $response->assertStatus(422)
            ->assertJsonStructure([
                'message',
                'errors' => [
                    'page',
                    'size'
                ]
            ]);
    }

    /** @test */
    public function test_follow_user_success()
    {
        $response = $this->withHeaders([
            'Authorization' => 'Bearer ' . $this->token
        ])->postJson("/api/v1/users/{$this->anotherUser->username}/follow");

        $response->assertStatus(200)
            ->assertJsonStructure([
                'message',
                'status'
            ])
            ->assertJson([
                'message' => 'Follow success',
                'status' => 'following' // because anotherUser is not private
            ]);

        $this->assertDatabaseHas('follows', [
            'follower_id' => $this->user->id,
            'following_id' => $this->anotherUser->id,
            'status' => 'accepted'
        ]);
    }

    /** @test */
    public function test_follow_private_user_success()
    {
        $response = $this->withHeaders([
            'Authorization' => 'Bearer ' . $this->token
        ])->postJson("/api/v1/users/{$this->privateUser->username}/follow");

        $response->assertStatus(200)
            ->assertJson([
                'message' => 'Follow success',
                'status' => 'requested' // because privateUser is private
            ]);

        $this->assertDatabaseHas('follows', [
            'follower_id' => $this->user->id,
            'following_id' => $this->privateUser->id,
            'status' => 'pending'
        ]);
    }

    /** @test */
    public function test_follow_user_not_found()
    {
        $response = $this->withHeaders([
            'Authorization' => 'Bearer ' . $this->token
        ])->postJson('/api/v1/users/nonexistent/follow');

        $response->assertStatus(404)
            ->assertJson([
                'message' => 'User is not found'
            ]);
    }

    /** @test */
    public function test_follow_own_account()
    {
        $response = $this->withHeaders([
            'Authorization' => 'Bearer ' . $this->token
        ])->postJson("/api/v1/users/{$this->user->username}/follow");

        $response->assertStatus(422)
            ->assertJson([
                'message' => 'You are not allowed to follow yourself'
            ]);
    }

    /** @test */
    public function test_follow_already_followed()
    {
        // First follow
        Follow::create([
            'follower_id' => $this->user->id,
            'following_id' => $this->anotherUser->id,
            'status' => 'accepted'
        ]);

        // Try to follow again
        $response = $this->withHeaders([
            'Authorization' => 'Bearer ' . $this->token
        ])->postJson("/api/v1/users/{$this->anotherUser->username}/follow");

        $response->assertStatus(422)
            ->assertJsonStructure([
                'message',
                'status'
            ]);
    }

    /** @test */
    public function test_unfollow_success()
    {
        // First follow
        Follow::create([
            'follower_id' => $this->user->id,
            'following_id' => $this->anotherUser->id,
            'status' => 'accepted'
        ]);

        $response = $this->withHeaders([
            'Authorization' => 'Bearer ' . $this->token
        ])->deleteJson("/api/v1/users/{$this->anotherUser->username}/unfollow");

        $response->assertStatus(204);

        $this->assertDatabaseMissing('follows', [
            'follower_id' => $this->user->id,
            'following_id' => $this->anotherUser->id
        ]);
    }

    /** @test */
    public function test_unfollow_not_following()
    {
        $response = $this->withHeaders([
            'Authorization' => 'Bearer ' . $this->token
        ])->deleteJson("/api/v1/users/{$this->anotherUser->username}/unfollow");

        $response->assertStatus(422)
            ->assertJson([
                'message' => 'You are not following the user'
            ]);
    }

    /** @test */
    public function test_get_following_users()
    {
        // Create follow relationships
        Follow::create([
            'follower_id' => $this->user->id,
            'following_id' => $this->anotherUser->id,
            'status' => 'accepted'
        ]);

        Follow::create([
            'follower_id' => $this->user->id,
            'following_id' => $this->privateUser->id,
            'status' => 'pending'
        ]);

        $response = $this->withHeaders([
            'Authorization' => 'Bearer ' . $this->token
        ])->getJson('/api/v1/following');

        $response->assertStatus(200)
            ->assertJsonStructure([
                'following' => [
                    '*' => [
                        'id',
                        'full_name',
                        'username',
                        'bio',
                        'is_private',
                        'created_at',
                        'is_requested'
                    ]
                ]
            ]);
    }

    /** @test */
    public function test_accept_follow_request_success()
    {
        // Create a pending follow request
        Follow::create([
            'follower_id' => $this->anotherUser->id,
            'following_id' => $this->user->id,
            'status' => 'pending'
        ]);

        $response = $this->withHeaders([
            'Authorization' => 'Bearer ' . $this->token
        ])->putJson("/api/v1/users/{$this->anotherUser->username}/accept");

        $response->assertStatus(200)
            ->assertJson([
                'message' => 'Follow request accepted'
            ]);

        $this->assertDatabaseHas('follows', [
            'follower_id' => $this->anotherUser->id,
            'following_id' => $this->user->id,
            'status' => 'accepted'
        ]);
    }

    /** @test */
    public function test_accept_follow_request_already_accepted()
    {
        // Create an already accepted follow
        Follow::create([
            'follower_id' => $this->anotherUser->id,
            'following_id' => $this->user->id,
            'status' => 'accepted'
        ]);

        $response = $this->withHeaders([
            'Authorization' => 'Bearer ' . $this->token
        ])->putJson("/api/v1/users/{$this->anotherUser->username}/accept");

        $response->assertStatus(422)
            ->assertJson([
                'message' => 'Follow request is already accepted'
            ]);
    }

    /** @test */
    public function test_accept_follow_request_user_not_following()
    {
        $response = $this->withHeaders([
            'Authorization' => 'Bearer ' . $this->token
        ])->putJson("/api/v1/users/{$this->anotherUser->username}/accept");

        $response->assertStatus(422)
            ->assertJson([
                'message' => 'The user is not following you'
            ]);
    }

    /** @test */
    public function test_get_followers_other_user()
    {
        // Create followers for anotherUser
        Follow::create([
            'follower_id' => $this->user->id,
            'following_id' => $this->anotherUser->id,
            'status' => 'accepted'
        ]);

        $response = $this->withHeaders([
            'Authorization' => 'Bearer ' . $this->token
        ])->getJson("/api/v1/users/{$this->anotherUser->username}/followers");

        $response->assertStatus(200)
            ->assertJsonStructure([
                'followers' => [
                    '*' => [
                        'id',
                        'full_name',
                        'username',
                        'bio',
                        'is_private',
                        'created_at',
                        'is_requested'
                    ]
                ]
            ]);
    }

    /** @test */
    public function test_get_users_not_followed()
    {
        // User follows anotherUser
        Follow::create([
            'follower_id' => $this->user->id,
            'following_id' => $this->anotherUser->id,
            'status' => 'accepted'
        ]);

        $response = $this->withHeaders([
            'Authorization' => 'Bearer ' . $this->token
        ])->getJson('/api/v1/users');

        $response->assertStatus(200)
            ->assertJsonStructure([
                'users' => [
                    '*' => [
                        'id',
                        'full_name',
                        'username',
                        'bio',
                        'is_private',
                        'created_at',
                        'updated_at'
                    ]
                ]
            ]);

        // Should not include user themselves or anotherUser
        $users = $response->json('users');
        $userIds = collect($users)->pluck('id')->toArray();
        
        $this->assertNotContains($this->user->id, $userIds);
        $this->assertNotContains($this->anotherUser->id, $userIds);
    }

    /** @test */
    public function test_get_detail_user_own_account()
    {
        // Create some posts for the user
        $post = Post::create([
            'user_id' => $this->user->id,
            'caption' => 'My post'
        ]);

        PostAttachment::create([
            'post_id' => $post->id,
            'storage_path' => 'posts/test.jpg'
        ]);

        $response = $this->withHeaders([
            'Authorization' => 'Bearer ' . $this->token
        ])->getJson("/api/v1/users/{$this->user->username}");

        $response->assertStatus(200)
            ->assertJsonStructure([
                'id',
                'full_name',
                'username',
                'bio',
                'is_private',
                'created_at',
                'is_your_account',
                'following_status',
                'posts_count',
                'followers_count',
                'following_count',
                'posts'
            ])
            ->assertJson([
                'is_your_account' => true,
                'following_status' => 'your-account'
            ]);
    }

    /** @test */
    public function test_get_detail_user_public_account_following()
    {
        // User follows anotherUser
        Follow::create([
            'follower_id' => $this->user->id,
            'following_id' => $this->anotherUser->id,
            'status' => 'accepted'
        ]);

        // Create posts for anotherUser
        $post = Post::create([
            'user_id' => $this->anotherUser->id,
            'caption' => 'Another user post'
        ]);

        $response = $this->withHeaders([
            'Authorization' => 'Bearer ' . $this->token
        ])->getJson("/api/v1/users/{$this->anotherUser->username}");

        $response->assertStatus(200)
            ->assertJson([
                'is_your_account' => false,
                'following_status' => 'following'
            ])
            ->assertJsonStructure([
                'posts' // Should show posts since user is following
            ]);
    }

    /** @test */
    public function test_get_detail_user_private_account_not_following()
    {
        $response = $this->withHeaders([
            'Authorization' => 'Bearer ' . $this->token
        ])->getJson("/api/v1/users/{$this->privateUser->username}");

        $response->assertStatus(200)
            ->assertJson([
                'is_your_account' => false,
                'following_status' => 'not-following'
            ]);

        $responseData = $response->json();
        $this->assertArrayNotHasKey('posts', $responseData); // Should hide posts
    }

    /** @test */
    public function test_get_detail_user_not_found()
    {
        $response = $this->withHeaders([
            'Authorization' => 'Bearer ' . $this->token
        ])->getJson('/api/v1/users/nonexistentuser');

        $response->assertStatus(404)
            ->assertJson([
                'message' => 'User is not found'
            ]);
    }
}