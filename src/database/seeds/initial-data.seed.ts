import { DataSource } from 'typeorm';
import { Role } from '../../entities/role.entity';
import { Permission } from '../../entities/permission.entity';
import { Account, AccountType } from '../../entities/account.entity';
import { Category } from '../../entities/category.entity';

export async function seedInitialData(dataSource: DataSource) {
  const roleRepository = dataSource.getRepository(Role);
  const permissionRepository = dataSource.getRepository(Permission);
  const accountRepository = dataSource.getRepository(Account);
  const categoryRepository = dataSource.getRepository(Category);

  // Create Permissions
  const permissions = [
    { resource: 'transaction', action: 'create' },
    { resource: 'transaction', action: 'read' },
    { resource: 'transaction', action: 'update' },
    { resource: 'transaction', action: 'delete' },
    { resource: 'approval', action: 'create' },
    { resource: 'approval', action: 'read' },
    { resource: 'approval', action: 'approve' },
    { resource: 'payroll', action: 'create' },
    { resource: 'payroll', action: 'read' },
    { resource: 'payroll', action: 'approve' },
    { resource: 'account', action: 'create' },
    { resource: 'account', action: 'read' },
    { resource: 'account', action: 'update' },
    { resource: 'account', action: 'delete' },
    { resource: 'report', action: 'read' },
    { resource: 'recurring_payment', action: 'create' },
    { resource: 'recurring_payment', action: 'read' },
    { resource: 'recurring_payment', action: 'update' },
    { resource: 'recurring_payment', action: 'delete' },
  ];

  const savedPermissions = [];
  for (const perm of permissions) {
    let permission = await permissionRepository.findOne({
      where: { name: `${perm.resource}:${perm.action}` },
    });

    if (!permission) {
      permission = permissionRepository.create({
        name: `${perm.resource}:${perm.action}`,
        description: `${perm.action} ${perm.resource}`,
        resource: perm.resource,
        action: perm.action,
      });
      permission = await permissionRepository.save(permission);
    }
    savedPermissions.push(permission);
  }

  // Create Roles
  const adminRole = roleRepository.create({
    name: 'admin',
    description: 'Administrator with full access',
    permissions: savedPermissions,
  });

  const accountantRole = roleRepository.create({
    name: 'accountant',
    description: 'Accountant with transaction and account access',
    permissions: savedPermissions.filter(
      (p) =>
        p.resource === 'transaction' ||
        p.resource === 'account' ||
        p.resource === 'report',
    ),
  });

  const directorRole = roleRepository.create({
    name: 'director',
    description: 'Director with approval rights',
    permissions: savedPermissions.filter(
      (p) => p.action === 'approve' || p.action === 'read',
    ),
  });

  await roleRepository.save([adminRole, accountantRole, directorRole]);

  // Create Default Accounts
  const defaultAccounts = [
    { code: '1010', name: 'Cash', type: AccountType.ASSET },
    { code: '1020', name: 'Bank Account', type: AccountType.ASSET },
    { code: '2010', name: 'Accounts Payable', type: AccountType.LIABILITY },
    { code: '3010', name: 'Capital', type: AccountType.EQUITY },
    { code: '4010', name: 'Revenue', type: AccountType.REVENUE },
    { code: '5010', name: 'Operating Expenses', type: AccountType.EXPENSE },
  ];

  for (const acc of defaultAccounts) {
    let account = await accountRepository.findOne({ where: { code: acc.code } });
    if (!account) {
      account = accountRepository.create(acc);
      await accountRepository.save(account);
    }
  }

  // Create Default Categories
  const defaultCategories = [
    { name: 'Salary', type: 'expense', code: 'SAL' },
    { name: 'Rent', type: 'expense', code: 'RENT' },
    { name: 'Utilities', type: 'expense', code: 'UTIL' },
    { name: 'Sales', type: 'income', code: 'SALE' },
    { name: 'Services', type: 'income', code: 'SERV' },
  ];

  for (const cat of defaultCategories) {
    let category = await categoryRepository.findOne({ where: { code: cat.code } });
    if (!category) {
      category = categoryRepository.create(cat);
      await categoryRepository.save(category);
    }
  }

  console.log('✅ Initial data seeded successfully');
}
