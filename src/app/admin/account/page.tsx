import AccountForms from "@/components/admin/AccountForms";
import { PageHeader } from "@/components/admin/ui";
import { getCurrentUser } from "@/lib/auth";
import { requireAdmin } from "@/lib/guard";

export const metadata = { title: "Account" };

export default async function AccountAdmin() {
  await requireAdmin();

  const user = await getCurrentUser();
  if (!user) return null;

  return (
    <>
      <PageHeader
        title="Account"
        subtitle="Your sign-in details. Passwords are stored as bcrypt hashes — nobody, including this panel, can read them back."
      />
      <AccountForms user={user} />
    </>
  );
}
