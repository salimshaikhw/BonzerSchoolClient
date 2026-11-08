/** Role names exactly as the API issues them (see TestGuide "Fixed roles"). */
export const Roles = {
  SuperAdmin: 'SuperAdmin',
  GroupAdmin: 'GroupAdmin',
  BranchAdmin: 'BranchAdmin',
  Principal: 'Principal',
  VicePrincipal: 'VicePrincipal',
  Hod: 'Hod',
  Teacher: 'Teacher',
  ClassTeacher: 'ClassTeacher',
  SportsTeacher: 'SportsTeacher',
  Accountant: 'Accountant',
  Librarian: 'Librarian',
  Parent: 'Parent',
  Student: 'Student',
} as const;

export type Role = (typeof Roles)[keyof typeof Roles];

/** Mirrors the API's RoleGroups so the UI hides what the server would refuse (the server still decides). */
export const RoleGroups = {
  Platform: [Roles.SuperAdmin],
  SchoolSetup: [Roles.GroupAdmin, Roles.BranchAdmin],
  AcademicLeadership: [Roles.GroupAdmin, Roles.BranchAdmin, Roles.Principal, Roles.VicePrincipal, Roles.Hod],
  StudentAdmission: [Roles.GroupAdmin, Roles.BranchAdmin, Roles.Principal, Roles.VicePrincipal, Roles.ClassTeacher],
} as const satisfies Record<string, readonly Role[]>;
