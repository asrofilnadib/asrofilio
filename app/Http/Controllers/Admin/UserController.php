<?php

namespace App\Http\Controllers\Admin;

use App\Concerns\LogsActivity;
use App\Enums\UserRole;
use App\Http\Controllers\Controller;
use App\Http\Requests\Admin\StoreUserRequest;
use App\Http\Requests\Admin\UpdateUserRequest;
use App\Models\User;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Hash;
use Inertia\Inertia;
use Inertia\Response;

class UserController extends Controller
{
    use LogsActivity;

    public function index(Request $request): Response
    {
        $this->authorize('viewAny', User::class);

        $users = User::query()
            ->when($request->filled('search'), function ($q) use ($request): void {
                $search = $request->string('search')->toString();
                $q->where('name', 'like', "%{$search}%")
                    ->orWhere('email', 'like', "%{$search}%");
            })
            ->latest()
            ->paginate(15)
            ->withQueryString();

        return Inertia::render('admin/users/index', [
            'users' => $users,
            'filters' => ['search' => $request->string('search')->toString() ?: null],
            'roles' => collect(UserRole::cases())->map(fn (UserRole $role) => [
                'value' => $role->value,
                'label' => ucfirst($role->value),
            ]),
        ]);
    }

    public function create(): RedirectResponse
    {
        $this->authorize('create', User::class);

        return redirect()->route('admin.users.index');
    }

    public function store(StoreUserRequest $request): RedirectResponse
    {
        $this->authorize('create', User::class);

        $user = User::create([
            ...$request->safe()->except('password'),
            'password' => Hash::make($request->string('password')->toString()),
        ]);

        $this->logCreated($user);

        return redirect()->route('admin.users.index')->with('success', 'User created successfully.');
    }

    public function show(User $user): RedirectResponse
    {
        $this->authorize('view', $user);

        return redirect()->route('admin.users.index');
    }

    public function edit(User $user): RedirectResponse
    {
        $this->authorize('update', $user);

        return redirect()->route('admin.users.index');
    }

    public function update(UpdateUserRequest $request, User $user): RedirectResponse
    {
        $this->authorize('update', $user);

        $data = $request->safe()->except('password');

        if ($request->filled('password')) {
            $data['password'] = Hash::make($request->string('password')->toString());
        }

        $user->update($data);
        $this->logUpdated($user);

        return redirect()->route('admin.users.index')->with('success', 'User updated successfully.');
    }

    public function destroy(User $user): RedirectResponse
    {
        $this->authorize('delete', $user);

        $this->logDeleted($user);
        $user->delete();

        return redirect()->route('admin.users.index')->with('success', 'User deleted successfully.');
    }
}
