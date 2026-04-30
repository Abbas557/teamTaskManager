import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { usersApi } from '../../api/endpoints';
import { SelectField } from '../../components/Field';
import { UserRole } from '../../types';

export function UsersPage() {
  const queryClient = useQueryClient();
  const users = useQuery({ queryKey: ['users'], queryFn: usersApi.list });
  const updateRole = useMutation({
    mutationFn: ({ id, role }: { id: string; role: UserRole }) => usersApi.updateRole(id, role),
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: ['users'] });
    },
  });

  return (
    <div className="page">
      <header className="page-header">
        <div>
          <h1>Users</h1>
          <p>Manage global access roles for the workspace.</p>
        </div>
      </header>

      <section className="panel">
        <div className="users-table">
          <div className="table-head">
            <span>Name</span>
            <span>Email</span>
            <span>Role</span>
          </div>

          {users.data?.map((user) => (
            <div className="user-row" key={user.id}>
              <strong>{user.name}</strong>
              <span>{user.email}</span>
              <SelectField
                label="Role"
                value={user.role}
                onChange={(event) => updateRole.mutate({ id: user.id, role: event.target.value as UserRole })}
              >
                <option value="ADMIN">ADMIN</option>
                <option value="MEMBER">MEMBER</option>
              </SelectField>
            </div>
          ))}
        </div>
      </section>
    </div>
  );
}
