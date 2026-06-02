import { createClient } from '@/lib/supabase/server';
import { redirect } from 'next/navigation';
import { NotificationsContent } from '@/components/notifications/notifications-content';

export const dynamic = 'force-dynamic';


export default async function NotificationsPage() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) redirect('/auth/login');

  const { data: notifications } = await supabase
    .from('notifications')
    .select('*')
    .eq('user_id', user.id)
    .order('sent_at', { ascending: false })
    .limit(50);

  // Mark all as read
  await supabase
    .from('notifications')
    .update({ is_read: true })
    .eq('user_id', user.id)
    .eq('is_read', false);

  return <NotificationsContent notifications={notifications ?? []} />;
}
